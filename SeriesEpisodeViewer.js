import React, { Component } from 'react';
import { Linking, Platform, StyleSheet, ScrollView, Text } from 'react-native';
import { Button, Card } from 'react-native-elements';

import { play } from 'react-native-vlc-player';

import { ConfirmDialog } from 'react-native-simple-dialogs';

import getLocalizedString from './utils/getLocalizedString';


const colors = {
	deepSkyBlue: '#03A9F4',
};

const styles = StyleSheet.create({
	activityContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	text: {
		marginBottom: 10,
		fontSize: 16,
	},
	button: {
		borderRadius: 0,
		marginLeft: 0,
		marginRight: 0,
		marginBottom: 0,
	},
});

class SeriesEpisodePicker extends Component {
	/* eslint-disable react/sort-comp */
	state = {
		dialogVisible: false,
	};
	/* eslint-enable react/sort-comp */

	render() {

		const {
			url, username, password, s,
		} = this.props.navigation.state.params;

		const card = s.info.movie_image ? (
			<Card image={{ uri: s.info.movie_image }} imageProps={{ resizeMode: 'contain' }} title={s.title}>
				{s.info.name.length ? <Text>Name:{s.info.name}</Text> : null}
				{s.info.plot.length ? <Text>Plot: {s.info.plot}</Text> : null}
				{s.info.releasedate.length ? <Text>Release Date: {s.info.releasedate}</Text> : null}
				{s.info.rating.length ? <Text>Rating: {s.info.rating}</Text> : null}
				<Button
					backgroundColor={colors.deepSkyBlue}
					buttonStyle={styles.button}
					icon={{ name: 'eye', type: 'font-awesome' }}
					onPress={() => this.viewNow(url, username, password, s)}
					title={getLocalizedString('liveChannel.viewNow')} />
			</Card>
		) : (
			<Card title={s.title}>
				{s.info.name.length ? <Text>Name:{s.info.name}</Text> : null}
				{s.info.plot.length ? <Text>Plot: {s.info.plot}</Text> : null}
				{s.info.releasedate.length ? <Text>Release Date: {s.info.releasedate}</Text> : null}
				{s.info.rating.length ? <Text>Rating: {s.info.rating}</Text> : null}
				<Button
					backgroundColor={colors.deepSkyBlue}
					buttonStyle={styles.button}
					icon={{ name: 'eye', type: 'font-awesome' }}
					onPress={() => this.viewNow(url, username, password, s)}
					title={getLocalizedString('liveChannel.viewNow')} />
			</Card>
		);

		if (this.state.dialogVisible) {
			const message = getLocalizedString('liveChannel.message');
			return (
				<ConfirmDialog
					message={message}
					negativeButton={{
						onPress: () => {
							this.setState({ dialogVisible: false });

							if (Platform.OS === 'android') {
								play(url + '/series/' + username + '/' + password + '/' + s.id + '.' + s.container_extension);
							} else if (Platform.OS === 'ios') {
								this.props.navigation.navigate('PlayeriOS', { uri: url + '/series/' + username + '/' + password + '/' + s.id + '.' + s.container_extension });
							} else {
								throw new Error('Platform not recognized: ' + Platform.OS);
							}
						},
						title: getLocalizedString('liveChannel.no'),
					}}
					onTouchOutside={() => this.setState({ dialogVisible: false })}
					positiveButton={{
						onPress: () => {
							this.setState({ dialogVisible: false });

							if (Platform.OS === 'android') {
								Linking.openURL(url + '/series/' + username + '/' + password + '/' + s.id + '.' + s.container_extension);
							} else if (Platform.OS === 'ios') {
								Linking.openURL('vlc-x-callback://x-callback-url/stream?url=' + url + '/series/' + username + '/' + password + '/' + s.id + '.' + s.container_extension);
							} else {
								throw new Error('Platform not recognized: ' + Platform.OS);
							}
						},
						title: getLocalizedString('liveChannel.yes'),
					}}
					title={getLocalizedString('liveChannel.title')}
					visible={this.state.dialogVisible} />
			);
		}

		return (
			<ScrollView>
				{card}
			</ScrollView>
		);
	}

	viewNow(url, username, password, ch) {
		if (Platform.OS === 'android' || Platform.OS === 'ios') {
			this.setState({ dialogVisible: true });
		} else {
			throw new Error('Platform not recognized: ' + Platform.OS);
		}

		return this;
	}
}

export default SeriesEpisodePicker;
