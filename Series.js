import React, { Component } from 'react';
import { ActivityIndicator, Alert, AsyncStorage, Button, StyleSheet, Text, ScrollView, View } from 'react-native';
import { ListItem, SearchBar } from 'react-native-elements';

import Toast, { DURATION } from 'react-native-easy-toast';

import getCategories from './api/getCategories';
import { getSeriesCategories, getSeries } from './api/getSeries';

import getLocalizedString from './utils/getLocalizedString';

import SegmentedButton from './utils/segmentedButton';

let categoriesAndSeries = [];

let categoriesLeft = 0;
let seriesFetched = 0;
let episodesFetched = 0;

let loadingSeriesFromCategories = true;

let menuItems = [];
let listItems = [];
let filteredList = [];
let weAreSearching = false;

let activityIndicator = <ActivityIndicator animating hidesWhenStopped size='large' />;
let activityIndicatorText = <Text>{getLocalizedString('series.activityIndicatorText', null, [categoriesLeft, seriesFetched, episodesFetched])}</Text>;

const colors = {
	black: '#fff',
	gray: '#d3d3d3',
};

const styles = StyleSheet.create({
	activityContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	listContainer: {
		flex: 1,
	},
	sectionHeader: {
		paddingTop: 2,
		paddingLeft: 10,
		paddingRight: 10,
		paddingBottom: 2,
		fontSize: 26,
		fontWeight: 'bold',
		backgroundColor: colors.black,
	},
	listItem: {
		padding: 10,
		fontSize: 20,
		height: 44,
	},
});

function isLetterOrNumber(c) {
	if (/^\d/.test(c)) {
		return true;
	}

	return c.toLowerCase() !== c.toUpperCase();
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

class SeriesScreen extends Component {
	async componentWillMount() {
		this.clearOnEmpty();

		const seriesArray = await AsyncStorage.getItem('@IPTVPlayer:seriesArray');
		if (seriesArray && seriesArray.length > 0) {
			categoriesAndSeries = JSON.parse(seriesArray);

			categoriesAndSeries.forEach((c) => {
				menuItems.push({ text: c.category_name, data: [] });

				c.Series.forEach((serie) => {
					menuItems[menuItems.length - 1].data.push(serie);
				});
			});

			menuItems.sort(function(a, b) { return a.text > b.text; });

			if (menuItems.length) {
				this.onCategoryButton(null, 0);
			}

			loadingSeriesFromCategories = false;

			this.forceUpdate();

			return;
		}

		const {
			url, username, password, buttonIndex,
		} = this.props.navigation.state.params;

		await getCategories(url, username, password, buttonIndex)
			.then((r) => {
				categoriesAndSeries.push(...r);

				/* eslint-disable no-return-assign */
				categoriesAndSeries.forEach((o, i, a) => a[i].Series = []);
				/* eslint-enable no-return-assign */
			});

		categoriesLeft = categoriesAndSeries.length;

		/* eslint-disable no-restricted-syntax, guard-for-in, no-await-in-loop */
		for (const category in categoriesAndSeries) {
			await sleep(1500);
			categoriesAndSeries[category].Series = await getSeriesCategories(url, username, password, categoriesAndSeries[category].category_id);

			categoriesLeft--;

			if (categoriesAndSeries[category].Series.length > 0) {
				categoriesAndSeries[category].Series.forEach((s) => { s.episodes = []; });
			}

			seriesFetched += categoriesAndSeries[category].Series.length;

			activityIndicatorText = <Text>{getLocalizedString('series.activityIndicatorText', null, [categoriesLeft, seriesFetched, episodesFetched])}</Text>;

			this.forceUpdate();
		}

		for (const category in categoriesAndSeries) {
			if (!categoriesAndSeries[category].Series.length) {
				categoriesAndSeries[category] = null;
			} else {
				for (const serie in categoriesAndSeries[category].Series) {
					categoriesAndSeries[category].Series[serie].episodesRaw = await getSeries(url, username, password, categoriesAndSeries[category].Series[serie].series_id);
					categoriesAndSeries[category].Series[serie].episodesRaw = categoriesAndSeries[category].Series[serie].episodesRaw.episodes;
					categoriesAndSeries[category].Series[serie].episodes = [];

					/* eslint-disable no-loop-func */
					for (const key in categoriesAndSeries[category].Series[serie].episodesRaw) {
						const value = categoriesAndSeries[category].Series[serie].episodesRaw[key];
						value.map(v => categoriesAndSeries[category].Series[serie].episodes.push(v));
					}

					episodesFetched += categoriesAndSeries[category].Series[serie].episodes.length;

					activityIndicatorText = <Text>{getLocalizedString('series.activityIndicatorText', null, [categoriesLeft, seriesFetched, episodesFetched])}</Text>;

					this.forceUpdate();
				}
			}
		}

		/* eslint-disable no-restricted-syntax, guard-for-in, no-await-in-loop */

		categoriesAndSeries = categoriesAndSeries.filter(x => x);

		try {
			await AsyncStorage.setItem('@IPTVPlayer:seriesArray', JSON.stringify(categoriesAndSeries));
		} catch (error) {
			throw new Error(error);
		}

		categoriesAndSeries.forEach((c) => {
			menuItems.push({ text: c.category_name, data: [] });

			c.Series.forEach((serie) => {
				menuItems[menuItems.length - 1].data.push(serie);
			});
		});

		menuItems.sort(function(a, b) { return a.text > b.text; });

		if (menuItems.length) {
			this.onCategoryButton(null, 0);
		}

		loadingSeriesFromCategories = false;

		activityIndicator = null;
		activityIndicatorText = null;

		this.forceUpdate();
	}

	render() {
		if (loadingSeriesFromCategories) {
			return (
				<ScrollView contentContainerStyle={styles.activityContainer}>
					{activityIndicator}
					{activityIndicatorText}
				</ScrollView>
			);
		}

		if (!categoriesAndSeries.length) {
			Alert.alert(
				getLocalizedString('series.noCategoriesError'),
				getLocalizedString('series.noCategoriesErrorDesc'),
				[
					{ text: 'OK', onPress: () => this.props.navigation.navigate('Account', this.props.navigation.state.params) },
				],
				{ cancelable: false }
			);
		}

		return (
			<ScrollView contentContainerStyle={styles.listContainer}>
				<SegmentedButton
					items={menuItems}
					onSegmentBtnPress={(btn, index) => this.onCategoryButton(btn, index)} />
				<View>
					<SearchBar
						ref={(search) => { this.search = search; }}
						onChangeText={text => this.searchForSeries(text)}
						placeholder={getLocalizedString('series.searchPlaceholder')}
						round />
				</View>
				<ScrollView>
					{weAreSearching ? filteredList : listItems}
				</ScrollView>
				<Toast ref={(c) => { this.toast = c; }} />
			</ScrollView>
		);
	}

	onCategoryButton(btn, index) {
		const { url, username, password } = this.props.navigation.state.params;

		weAreSearching = false;
		filteredList = [];
		if (this.search) {
			this.search.clearText();
		}

		listItems = [];

		menuItems[index].data.forEach((serie) => {
			let serieItem = null;

			if (!serie.name.length) {
				return;
			}

			if (serie.name.charAt(0) !== '(' && !isLetterOrNumber(serie.name.charAt(0))) {
				serieItem = <Button key={serie.num} disabled onPress={() => {}} style={styles.listItem} title={serie.name} />;

				listItems.push(serieItem);

				return;
			}

			serieItem = serie.cover.startsWith('http') || serie.cover.startsWith('https') ? (
				<ListItem
					key={serie.num}
					avatar={{ uri: serie.cover }}
					containerStyle={{ borderBottomWidth: 0 }}
					onPress={() => this.props.navigation.navigate('SeriesEpisodePicker', {
						url, username, password, serie,
					})}
					roundAvatar
					title={serie.name} />
			) : (
				<ListItem
					key={serie.num}
					containerStyle={{ borderBottomWidth: 0 }}
					onPress={() => this.props.navigation.navigate('SeriesEpisodePicker', {
						url, username, password, serie,
					})}
					roundAvatar
					title={serie.name} />
			);

			listItems.push(serieItem);
		});

		this.forceUpdate();
	}

	clearOnEmpty() {
		categoriesAndSeries = [];

		categoriesLeft = 0;
		seriesFetched = 0;
		episodesFetched = 0;

		loadingSeriesFromCategories = true;

		menuItems = [];
		listItems = [];
		filteredList = [];
		weAreSearching = false;

		activityIndicator = <ActivityIndicator animating hidesWhenStopped size='large' />;
		activityIndicatorText = <Text>{getLocalizedString('series.activityIndicatorText', null, [categoriesLeft, seriesFetched, episodesFetched])}</Text>;

		return this;
	}

	searchForSeries(getText) {
		filteredList = [];

		const text = getText.toLowerCase();

		if (!text || text === '') {
			weAreSearching = false;

			this.forceUpdate();

			return;
		}

		filteredList = listItems.filter((item) => {
			return item.props.title.toLowerCase().match(text);
		});

		if (!filteredList.length) {
			weAreSearching = false;

			this.toast.show(getLocalizedString('series.filterSeriesNotFound'), DURATION.LENGTH_LONG);

			this.forceUpdate();

			return;
		}

		weAreSearching = true;

		filteredList.sort(function(a, b) { return a.title > b.title; });

		this.forceUpdate();
	}
}

export default SeriesScreen;
