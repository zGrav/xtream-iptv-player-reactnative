import React, { Component } from 'react';
import { Alert, AsyncStorage, StyleSheet, Text, ScrollView } from 'react-native';
import { Button, ButtonGroup, Card, Icon } from 'react-native-elements';

import timeConverter from './utils/timeConverter';

import getLocalizedString from './utils/getLocalizedString';

const color = {
	black: '#000',
	lightBlue: '#68a0cf',
	transparent: 'transparent',
};

const styles = StyleSheet.create({
	accountInfo: {
		fontSize: 16,
		marginBottom: 10,
	},
});

class Account extends Component {
	/* eslint-disable react/sort-comp */
	static navigationOptions = ({ navigation }) => {
		const { state } = navigation;
		const { signOutButton } = 'params' in state && state.params;

		return {
			headerRight: signOutButton && signOutButton(),
		};
	}
	/* eslint-enable react/sort-comp */

	componentWillMount() {
		const signOutButton = (
			<Button
				onPress={() => this.cleanAndExit()}
				title={getLocalizedString('account.signOutButton')} />
		);

		this.props.navigation.setParams({ signOutButton: () => signOutButton });
	}

	cleanAndExit = async() => {
		await AsyncStorage.removeItem('@IPTVPlayer:LiveArray');
		await AsyncStorage.removeItem('@IPTVPlayer:VODArray');
		this.props.navigation.navigate('Login');
	}

	buttonPressed(buttonIndex) {
		const {
			url, username, password, user_info,
		} = this.props.navigation.state.params;

		if (user_info.status === 'Expired') {
			Alert.alert(
				getLocalizedString('account.expiredError'),
				getLocalizedString('account.expiredErrorDesc'),
				[
					{ text: 'OK' },
				],
				{ cancelable: false }
			);

			return;
		}

		if (parseInt(user_info.active_cons) >= parseInt(user_info.max_connections)) {
			Alert.alert(
				getLocalizedString('account.activeConsError'),
				getLocalizedString('account.activeConsErrorDesc'),
				[
					{ text: 'OK' },
				],
				{ cancelable: false }
			);

			return;
		}

		if (buttonIndex === 0) {
			this.props.navigation.navigate('Live',
				{
					url, username, password, buttonIndex, user_info,
				});
		} else if (buttonIndex === 1) {
			this.props.navigation.navigate('VODs',
				{
					url, username, password, buttonIndex, user_info,
				});
		} else if (buttonIndex === 2) {
			this.props.navigation.navigate('Series',
				{
					url, username, password, buttonIndex, user_info,
				});
		}
	}

	render() {
		const { user_info } = this.props.navigation.state.params;

		const checkForMessage = user_info.message ? <Text selectable={false} style={styles.accountInfo}> {getLocalizedString('account.message')} {user_info.message} </Text> : null;

		const liveButton = () => <Icon name='television' type='font-awesome' />;
		const vodButton = () => <Icon name='video-camera' type='font-awesome' />;
		const seriesButton = () => <Icon name='film' type='font-awesome' />;
		const buttons = [{ element: liveButton }, { element: vodButton }, { element: seriesButton } ];

		return (
			<ScrollView>
				<ButtonGroup
					buttons={buttons}
					containerStyle={{ backgroundColor: color.transparent, borderColor: color.black }}
					innerBorderStyle={{ color: color.black }}
					onPress={buttonIndex => this.buttonPressed(buttonIndex)} />

				<Card title={getLocalizedString('account.mainAccountInfo')}>
					<Text selectable={false} style={styles.accountInfo} >{getLocalizedString('account.mainAccountInfoUsername')}  {user_info.username}</Text>
					<Text selectable={false} style={styles.accountInfo} >{getLocalizedString('account.mainAccountInfoExpires')}  {timeConverter(user_info.exp_date)}</Text>
					<Text selectable={false} style={styles.accountInfo} >{getLocalizedString('account.mainAccountInfoStatus')}  {user_info.status}</Text>
					{checkForMessage}
				</Card>
				<Card title={getLocalizedString('account.miscAccountInfo')}>
					<Text selectable={false} style={styles.accountInfo} >{getLocalizedString('account.miscAccountInfoCreated')}  {timeConverter(user_info.created_at)}</Text>
					<Text selectable={false} style={styles.accountInfo} >{getLocalizedString('account.miscAccountInfoTrial')}  {user_info.is_trial === '0' ? 'No' : 'Yes'}</Text>
					<Text selectable={false} style={styles.accountInfo} >{getLocalizedString('account.miscAccountInfoActiveConns')}  {user_info.active_cons}</Text>
					<Text selectable={false} style={styles.accountInfo} >{getLocalizedString('account.miscAccountInfoMaxConns')}  {user_info.max_connections}</Text>
				</Card>
			</ScrollView>
		);
	}
}

export default Account;
