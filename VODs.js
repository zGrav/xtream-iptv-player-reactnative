import React, { Component } from 'react';
import { ActivityIndicator, Alert, AsyncStorage, Button, StyleSheet, Text, ScrollView, View } from 'react-native';
import { ListItem, SearchBar } from 'react-native-elements';

import Toast, { DURATION } from 'react-native-easy-toast';

import getCategories from './api/getCategories';
import getVODs from './api/getVODs';

import getLocalizedString from './utils/getLocalizedString';

import SegmentedButton from './utils/segmentedButton';

let categoriesAndVODs = [];

let categoriesLeft = 0;
let VODsFetched = 0;

let loadingVODsFromCategories = true;

let menuItems = [];
let listItems = [];
let filteredList = [];
let weAreSearching = false;

let activityIndicator = <ActivityIndicator animating hidesWhenStopped size='large' />;
let activityIndicatorText = <Text>{getLocalizedString('vod.activityIndicatorText', null, [categoriesLeft, VODsFetched])}</Text>;

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

class VODScreen extends Component {
	async componentWillMount() {
		this.clearOnEmpty();

		const VODArray = await AsyncStorage.getItem('@IPTVPlayer:VODArray');
		if (VODArray && VODArray.length > 0) {
			categoriesAndVODs = JSON.parse(VODArray);

			categoriesAndVODs.forEach((c) => {
				menuItems.push({ text: c.category_name, data: [] });

				c.VODs.forEach((vod) => {
					menuItems[menuItems.length - 1].data.push(vod);
				});
			});

			menuItems.sort(function(a, b) { return a.text > b.text; });

			if (menuItems.length) {
				this.onCategoryButton(null, 0);
			}

			loadingVODsFromCategories = false;

			this.forceUpdate();

			return;
		}

		const {
			url, username, password, buttonIndex,
		} = this.props.navigation.state.params;

		await getCategories(url, username, password, buttonIndex)
			.then((r) => {
				categoriesAndVODs.push(...r);

				/* eslint-disable no-return-assign */
				categoriesAndVODs.forEach((o, i, a) => a[i].VODs = []);
				/* eslint-enable no-return-assign */
			});

		categoriesLeft = categoriesAndVODs.length;

		/* eslint-disable no-restricted-syntax, guard-for-in, no-await-in-loop */
		for (const category in categoriesAndVODs) {
			await sleep(1500);
			categoriesAndVODs[category].VODs = await getVODs(url, username, password, categoriesAndVODs[category].category_id);

			categoriesLeft--;

			VODsFetched += categoriesAndVODs[category].VODs.length;

			activityIndicatorText = <Text>{getLocalizedString('vod.activityIndicatorText', null, [categoriesLeft, VODsFetched])}</Text>;

			this.forceUpdate();
		}

		for (const category in categoriesAndVODs) {
			if (!categoriesAndVODs[category].VODs.length) {
				categoriesAndVODs[category] = null;
			}
		}
		/* eslint-disable no-restricted-syntax, guard-for-in, no-await-in-loop */

		categoriesAndVODs = categoriesAndVODs.filter(x => x);

		try {
			await AsyncStorage.setItem('@IPTVPlayer:VODArray', JSON.stringify(categoriesAndVODs));
		} catch (error) {
			throw new Error(error);
		}

		categoriesAndVODs.forEach((c) => {
			menuItems.push({ text: c.category_name, data: [] });

			c.VODs.forEach((vod) => {
				menuItems[menuItems.length - 1].data.push(vod);
			});
		});

		menuItems.sort(function(a, b) { return a.text > b.text; });

		if (menuItems.length) {
			this.onCategoryButton(null, 0);
		}

		loadingVODsFromCategories = false;

		activityIndicator = null;
		activityIndicatorText = null;

		this.forceUpdate();
	}

	render() {
		if (loadingVODsFromCategories) {
			return (
				<ScrollView contentContainerStyle={styles.activityContainer}>
					{activityIndicator}
					{activityIndicatorText}
				</ScrollView>
			);
		}

		if (!categoriesAndVODs.length) {
			Alert.alert(
				getLocalizedString('vod.noCategoriesError'),
				getLocalizedString('vod.noCategoriesErrorDesc'),
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
						onChangeText={text => this.searchForVODs(text)}
						placeholder={getLocalizedString('live.searchPlaceholder')}
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

		menuItems[index].data.forEach((vod) => {
			let vodItem = null;

			if (!vod.name.length) {
				return;
			}

			if (vod.name.charAt(0) !== '(' && !isLetterOrNumber(vod.name.charAt(0))) {
				vodItem = <Button key={vod.stream_id} disabled onPress={() => {}} style={styles.listItem} title={vod.name} />;

				listItems.push(vodItem);

				return;
			}

			vodItem = vod.stream_icon.startsWith('http') || vod.stream_icon.startsWith('https') ? (
				<ListItem
					key={vod.stream_id}
					avatar={{ uri: vod.stream_icon }}
					containerStyle={{ borderBottomWidth: 0 }}
					onPress={() => this.props.navigation.navigate('VODChannel', {
						url, username, password, vod,
					})}
					roundAvatar
					title={vod.name} />
			) : (
				<ListItem
					key={vod.stream_id}
					containerStyle={{ borderBottomWidth: 0 }}
					onPress={() => this.props.navigation.navigate('VODChannel', {
						url, username, password, vod,
					})}
					roundAvatar
					title={vod.name} />
			);

			listItems.push(vodItem);
		});

		this.forceUpdate();
	}

	clearOnEmpty() {
		categoriesAndVODs = [];

		categoriesLeft = 0;
		VODsFetched = 0;

		loadingVODsFromCategories = true;

		menuItems = [];
		listItems = [];
		filteredList = [];
		weAreSearching = false;

		activityIndicator = <ActivityIndicator animating hidesWhenStopped size='large' />;
		activityIndicatorText = <Text>{getLocalizedString('vod.activityIndicatorText', null, [categoriesLeft, VODsFetched])}</Text>;

		return this;
	}

	searchForVODs(getText) {
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

			this.toast.show(getLocalizedString('vod.filterVODsNotFound'), DURATION.LENGTH_LONG);

			this.forceUpdate();

			return;
		}

		weAreSearching = true;

		filteredList.sort(function(a, b) { return a.title > b.title; });

		this.forceUpdate();
	}
}

export default VODScreen;
