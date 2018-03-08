import React, { Component } from 'react';
import { ActivityIndicator, Linking, Platform, StyleSheet, Text, ScrollView } from 'react-native';
import { Button, Card, Divider } from 'react-native-elements';

import getEPG from './api/getEPG';

import timeConverter from './utils/timeConverter';

import { play } from 'react-native-vlc-player';

import { ConfirmDialog } from 'react-native-simple-dialogs';

import getLocalizedString from './utils/getLocalizedString';

let loadingChannelEPG = true;

let activityIndicator = <ActivityIndicator animating hidesWhenStopped size='large' />;
let activityIndicatorText = <Text>{getLocalizedString('liveChannel.activityIndicatorText')}</Text>;

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

let EPG = [];

const base64 = require('base-64');

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

class LiveChannel extends Component {
	/* eslint-disable react/sort-comp */
	state = {
		dialogVisible: false,
	};
	/* eslint-enable react/sort-comp */

	async componentWillMount() {
		const {
			url, username, password, ch,
		} = this.props.navigation.state.params;

		EPG = await getEPG(url, username, password, ch.stream_id);

		loadingChannelEPG = false;

		activityIndicator = null;
		activityIndicatorText = null;

		this.forceUpdate();
	}

	render() {
		if (loadingChannelEPG) {
			return (
				<ScrollView contentContainerStyle={styles.activityContainer}>
					{activityIndicator}
					{activityIndicatorText}
				</ScrollView>
			);
		}

		const {
			url, username, password, ch,
		} = this.props.navigation.state.params;

		let noEPG = null;
		let EPGTitle = null;
		let EPGDescription = null;
		let EPGStart = null;
		let EPGEnd = null;

		if (!EPG.epg_listings.length) {
			noEPG = (
				<Text style={styles.text}>{getLocalizedString('liveChannel.epgNotFound')}</Text>
			);
		} else {
			EPGTitle = (
				<Text style={styles.text}>{getLocalizedString('liveChannel.epgTitle')} {utf8Decode(base64.decode(EPG.epg_listings[0].title))}</Text>
			);
			EPGDescription = (
				<Text style={styles.text}>{getLocalizedString('liveChannel.epgDesc')} {utf8Decode(base64.decode(EPG.epg_listings[0].description))}</Text>
			);
			EPGStart = (
				<Text style={styles.text}>{getLocalizedString('liveChannel.epgStartTime')} {timeConverter(EPG.epg_listings[0].start_timestamp)}</Text>
			);
			EPGEnd = (
				<Text style={styles.text}>{getLocalizedString('liveChannel.epgEndTime')} {timeConverter(EPG.epg_listings[0].stop_timestamp)}</Text>
			);
		}

		const card = ch.stream_icon ? (
			<Card image={{ uri: ch.stream_icon }} imageProps={{ resizeMode: 'contain' }} title={ch.name}>
				{noEPG}
				{EPGTitle}
				{EPGDescription}
				{EPGStart}
				{EPGEnd}
				<Button
					backgroundColor={colors.deepSkyBlue}
					buttonStyle={styles.button}
					icon={{ name: 'list-alt', type: 'font-awesome' }}
					onPress={() => this.props.navigation.navigate('LiveChannelFullEPG', {
						url, username, password, ch,
					})}
					title={getLocalizedString('liveChannel.fullEPG')} />
				<Divider style={{ backgroundColor: '#ffffff' }} />
				<Button
					backgroundColor={colors.deepSkyBlue}
					buttonStyle={styles.button}
					icon={{ name: 'eye', type: 'font-awesome' }}
					onPress={() => this.viewNow(url, username, password, ch)}
					title={getLocalizedString('liveChannel.viewNow')} />
			</Card>
		) : (
			<Card title={ch.name}>
				{noEPG}
				{EPGTitle}
				{EPGDescription}
				{EPGStart}
				{EPGEnd}
				<Button
					backgroundColor={colors.deepSkyBlue}
					buttonStyle={styles.button}
					icon={{ name: 'list-alt', type: 'font-awesome' }}
					onPress={() => this.props.navigation.navigate('LiveChannelFullEPG', {
						url, username, password, ch,
					})}
					title={getLocalizedString('liveChannel.fullEPG')} />
				<Divider style={{ backgroundColor: '#ffffff' }} />
				<Button
					backgroundColor={colors.deepSkyBlue}
					buttonStyle={styles.button}
					icon={{ name: 'eye', type: 'font-awesome' }}
					onPress={() => this.viewNow(url, username, password, ch)}
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
								play(url + '/live/' + username + '/' + password + '/' + ch.stream_id + '.ts');
							} else if (Platform.OS === 'ios') {
								this.props.navigation.navigate('PlayeriOS', { uri: url + '/live/' + username + '/' + password + '/' + ch.stream_id + '.ts' });
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
								Linking.openURL(url + '/live/' + username + '/' + password + '/' + ch.stream_id + '.ts');
							} else if (Platform.OS === 'ios') {
								Linking.openURL('vlc-x-callback://x-callback-url/stream?url=' + url + '/live/' + username + '/' + password + '/' + ch.stream_id + '.ts');
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

export default LiveChannel;
