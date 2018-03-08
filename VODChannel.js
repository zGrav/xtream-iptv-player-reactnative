import React, { Component } from 'react';
import { ActivityIndicator, Linking, Platform, StyleSheet, Text, ScrollView } from 'react-native';
import { Button, Card } from 'react-native-elements';

import getVODInfo from './api/getVODInfo';

import { play } from 'react-native-vlc-player';

import { ConfirmDialog } from 'react-native-simple-dialogs';

import getLocalizedString from './utils/getLocalizedString';

let loadingVODInfo = true;

let activityIndicator = <ActivityIndicator animating hidesWhenStopped size='large' />;
let activityIndicatorText = <Text>{getLocalizedString('VODChannel.activityIndicatorText')}</Text>;

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

let Info = [];

function utf8Decode(utf8String) {
	if (typeof utf8String !== 'string') throw new TypeError('parameter ‘utf8String’ is not a string');

	const unicodeString = utf8String.replace(
		/[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g,
		function(c) {
			const cc = ((c.charCodeAt(0) & 0x0f) << 12) | ((c.charCodeAt(1) & 0x3f) << 6) | ( c.charCodeAt(2) & 0x3f);
			return String.fromCharCode(cc);
		}).replace(
		/[\u00c0-\u00df][\u0080-\u00bf]/g,
		function(c) {
			const cc = (c.charCodeAt(0) & 0x1f) << 6 | c.charCodeAt(1) & 0x3f;
			return String.fromCharCode(cc);
		});
	return unicodeString;
}

class VODChannel extends Component {
	/* eslint-disable react/sort-comp */
	state = {
		dialogVisible: false,
	};
	/* eslint-enable react/sort-comp */

	async componentWillMount() {
		const {
			url, username, password, vod,
		} = this.props.navigation.state.params;

		Info = await getVODInfo(url, username, password, vod.stream_id);

		loadingVODInfo = false;

		activityIndicator = null;
		activityIndicatorText = null;

		this.forceUpdate();
	}

	render() {
		if (loadingVODInfo) {
			return (
				<ScrollView contentContainerStyle={styles.activityContainer}>
					{activityIndicator}
					{activityIndicatorText}
				</ScrollView>
			);
		}

		const {
			url, username, password, vod
		} = this.props.navigation.state.params;

		const card = vod.stream_icon ? (
			<Card image={{ uri: vod.stream_icon }} imageProps={{ resizeMode: 'contain' }} title={vod.name}>
				{ Info.info.plot ? <Text>{getLocalizedString('vodChannel.plot')} {utf8Decode(Info.info.plot) + '\r\n'}</Text> : null }
				{ Info.info.cast ? <Text>{getLocalizedString('vodChannel.cast')} {utf8Decode(Info.info.cast) + '\r\n'}</Text> : null }
				{ Info.info.genre ? <Text>{getLocalizedString('vodChannel.genre')} {utf8Decode(Info.info.genre) + '\r\n'}</Text> : null }
				{ Info.info.rating ? <Text>{getLocalizedString('vodChannel.rating')} {utf8Decode(Info.info.rating)} / 10 {'\r\n'}</Text> : null }
				{ Info.info.director ? <Text>{getLocalizedString('vodChannel.director')} {utf8Decode(Info.info.director) + '\r\n'}</Text> : null }
				{ Info.info.releasedate ? <Text>{getLocalizedString('vodChannel.releasedate')} {utf8Decode(Info.info.releasedate) + '\r\n'}</Text> : null }
				{ Info.info.duration ? <Text>{getLocalizedString('vodChannel.duration')} {utf8Decode(Info.info.duration) + '\r\n'}</Text> : null }
				<Button
					backgroundColor={colors.deepSkyBlue}
					buttonStyle={styles.button}
					icon={{ name: 'eye', type: 'font-awesome' }}
					onPress={() => this.viewNow(url, username, password, vod)}
					title={getLocalizedString('vodChannel.viewNow')} />
			</Card>
		) : (
			<Card title={vod.name}>
				{ Info.info.plot ? <Text>{getLocalizedString('vodChannel.plot')} {utf8Decode(Info.info.plot) + '\r\n'}</Text> : null }
				{ Info.info.cast ? <Text>{getLocalizedString('vodChannel.cast')} {utf8Decode(Info.info.cast) + '\r\n'}</Text> : null }
				{ Info.info.genre ? <Text>{getLocalizedString('vodChannel.genre')} {utf8Decode(Info.info.genre) + '\r\n'}</Text> : null }
				{ Info.info.rating ? <Text>{getLocalizedString('vodChannel.rating')} {utf8Decode(Info.info.rating)} / 10 {'\r\n'}</Text> : null }
				{ Info.info.director ? <Text>{getLocalizedString('vodChannel.director')} {utf8Decode(Info.info.director) + '\r\n'}</Text> : null }
				{ Info.info.releasedate ? <Text>{getLocalizedString('vodChannel.releasedate')} {utf8Decode(Info.info.releasedate) + '\r\n'}</Text> : null }
				{ Info.info.duration ? <Text>{getLocalizedString('vodChannel.duration')} {utf8Decode(Info.info.duration) + '\r\n'}</Text> : null }
				<Button
					backgroundColor={colors.deepSkyBlue}
					buttonStyle={styles.button}
					icon={{ name: 'eye', type: 'font-awesome' }}
					onPress={() => this.viewNow(url, username, password, vod)}
					title={getLocalizedString('vodChannel.viewNow')} />
			</Card>
		);

		if (this.state.dialogVisible) {
			const message = getLocalizedString('vodChannel.message');
			return (
				<ConfirmDialog
					message={message}
					negativeButton={{
						onPress: () => {
							this.setState({ dialogVisible: false });

							if (Platform.OS === 'android') {
								play(url + '/movie/' + username + '/' + password + '/' + vod.stream_id + '.' + vod.container_extension);
							} else if (Platform.OS === 'ios') {
								this.props.navigation.navigate('PlayeriOS', { uri: url + '/movie/' + username + '/' + password + '/' + vod.stream_id + '.' + vod.container_extension });
							} else {
								throw new Error('Platform not recognized: ' + Platform.OS);
							}
						},
						title: getLocalizedString('vodChannel.no'),
					}}
					onTouchOutside={() => this.setState({ dialogVisible: false })}
					positiveButton={{
						onPress: () => {
							this.setState({ dialogVisible: false });

							if (Platform.OS === 'android') {
								Linking.openURL(url + '/movie/' + username + '/' + password + '/' + vod.stream_id + '.' + vod.container_extension);
							} else if (Platform.OS === 'ios') {
								Linking.openURL('vlc-x-callback://x-callback-url/stream?url=' + url + '/movie/' + username + '/' + password + '/' + vod.stream_id + '.' + vod.container_extension);
							} else {
								throw new Error('Platform not recognized: ' + Platform.OS);
							}
						},
						title: getLocalizedString('vodChannel.yes'),
					}}
					title={getLocalizedString('vodChannel.title')}
					visible={this.state.dialogVisible} />
			);
		}

		return (
			<ScrollView>
				{card}
			</ScrollView>
		);
	}

	viewNow(url, username, password, vod) {
		if (Platform.OS === 'android' || Platform.OS === 'ios') {
			this.setState({ dialogVisible: true });
		} else {
			throw new Error('Platform not recognized: ' + Platform.OS);
		}

		return this;
	}
}

export default VODChannel;
