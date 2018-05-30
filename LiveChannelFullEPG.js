import React, { Component } from 'react';
import { ActivityIndicator, StyleSheet, Text, ScrollView } from 'react-native';
import { ListItem } from 'react-native-elements';

import getFullEPG from './api/getFullEPG';

import timeConverter from './utils/timeConverter';

import getLocalizedString from './utils/getLocalizedString';

let loadingChannelEPG = true;

let activityIndicator = <ActivityIndicator animating hidesWhenStopped size='large' />;
let activityIndicatorText = <Text>{getLocalizedString('liveChannel.activityIndicatorText')}</Text>;


const styles = StyleSheet.create({
	activityContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
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

class LiveChannelFullEPG extends Component {
	async componentWillMount() {
		const {
			url, username, password, ch,
		} = this.props.navigation.state.params;

		EPG = await getFullEPG(url, username, password, ch.stream_id);

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

		const fullEPG = [];

		EPG.epg_listings.forEach((e) => {
			let title = utf8Decode(base64.decode(e.title));
			title += '\r\n';
			title += utf8Decode(base64.decode(e.description));

			let subtitle = timeConverter(e.start_timestamp, true);
			subtitle += '\r\n';
			subtitle += timeConverter(e.stop_timestamp, true);

			if (e.start_timestamp < Math.floor(Date.now() / 1000)) {
				return;
			}

			fullEPG.push(
				<ListItem key={e.id} hideChevron subtitle={subtitle} subtitleNumberOfLines={2} title={title} titleNumberOfLines={2} />
			);
		});

		return (
			<ScrollView>
				{fullEPG}
			</ScrollView>
		);
	}
}

export default LiveChannelFullEPG;
