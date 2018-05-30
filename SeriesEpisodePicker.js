import React, { Component } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { ListItem } from 'react-native-elements';

const styles = StyleSheet.create({
	listContainer: {
		flex: 1,
	},
});

class SeriesEpisodePickerScreen extends Component {
	render() {
		const { url, username, password, serie } = this.props.navigation.state.params;

		const listItems = [];

		serie.episodes.forEach((s) => {
			let serieItem = null;

			if (!s.title.length) {
				return;
			}

			serieItem = s.info.movie_image.startsWith('http') || s.info.movie_image.startsWith('https') ? (
				<ListItem
					key={s.id}
					avatar={{ uri: s.info.movie_image }}
					containerStyle={{ borderBottomWidth: 0 }}
					onPress={() => this.props.navigation.navigate('SeriesEpisodeViewer', {
						url, username, password, s,
					})}
					roundAvatar
					title={s.title} />
			) : (
				<ListItem
					key={s.id}
					containerStyle={{ borderBottomWidth: 0 }}
					onPress={() => this.props.navigation.navigate('SeriesEpisodeViewer', {
						url, username, password, s,
					})}
					roundAvatar
					title={s.title} />
			);

			listItems.push(serieItem);
		});

		return (
			<ScrollView contentContainerStyle={styles.listContainer}>
				<ScrollView>
					{listItems}
				</ScrollView>
			</ScrollView>
		);
	}
}

export default SeriesEpisodePickerScreen;
