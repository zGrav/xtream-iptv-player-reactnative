import React, { Component } from 'react';
import { Alert, AsyncStorage, Image, NetInfo, StyleSheet, TextInput, ScrollView } from 'react-native';
import { Button } from 'react-native-elements';

import Toast, { DURATION } from 'react-native-easy-toast';

import Login from './api/login';

import getLocalizedString from './utils/getLocalizedString';

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	textInputStyle: {
		width: 200,
		height: 45,
	},
	image: {
		height: 125,
		width: 125,
	},
});

function handleFirstConnectivityChange(connectionInfo) {
	const { type } = connectionInfo;

	if (type !== 'wifi' && type !== 'wimax') {
		Alert.alert(
			getLocalizedString('login.wifiWarning'),
			getLocalizedString('login.wifiWarningDesc'),
			[
				{ text: 'OK' },
			],
			{ cancelable: false }
		);
	}

	NetInfo.removeEventListener(
		'connectionChange',
		handleFirstConnectivityChange
	);
}

let tmpUrl = null;

export default class App extends Component {
	/* eslint-disable react/sort-comp */
	state = {
		url: '',
		username: '',
		password: '',
	};
	/* eslint-enable react/sort-comp */

	/* eslint-disable react/no-did-mount-set-state */
	async componentDidMount() {
		try {
			const url = await AsyncStorage.getItem('@IPTVPlayer:url');
			if (url !== null) {
				this.setState({ url });
				tmpUrl = url;
			}

			const username = await AsyncStorage.getItem('@IPTVPlayer:username');
			if (username !== null) {
				this.setState({ username });
			}

			const password = await AsyncStorage.getItem('@IPTVPlayer:password');
			if (password !== null) {
				this.setState({ password });
			}
		} catch (error) {
			throw new Error(error);
		}

		NetInfo.addEventListener(
			'connectionChange',
			handleFirstConnectivityChange
		);
	}

	/* eslint-enable react/no-did-mount-set-state */

	async checkFields() {
		const { url, username, password } = this.state;

		if (!url) {
			this.toast.show(getLocalizedString('login.toastEmptyURL'), DURATION.LENGTH_LONG);
			return;
		}
		if (!url.startsWith('http') || url.startsWith('https')) {
			this.toast.show(getLocalizedString('login.toastInvalidURL'), DURATION.LENGTH_LONG);
			return;
		}

		if (!username) {
			this.toast.show(getLocalizedString('login.toastUsername'), DURATION.LENGTH_LONG);
			return;
		}

		if (!password) {
			this.toast.show(getLocalizedString('login.toastPassword'), DURATION.LENGTH_LONG);
			return;
		}

		try {
			if (tmpUrl !== url) {
				await AsyncStorage.removeItem('@IPTVPlayer:LiveArray');
				await AsyncStorage.removeItem('@IPTVPlayer:VODArray');
			}

			await AsyncStorage.setItem('@IPTVPlayer:url', url);
			await AsyncStorage.setItem('@IPTVPlayer:username', username);
			await AsyncStorage.setItem('@IPTVPlayer:password', password);
		} catch (error) {
			throw new Error(error);
		}

		const loginReply = await Login(url, username, password);

		if (loginReply.user_info.auth === 1) {
			const { navigate } = this.props.navigation;

			navigate('Account', {
				url, username, password, user_info: loginReply.user_info,
			});
		} else {
			this.toast.show(getLocalizedString('login.toastError'), DURATION.LENGTH_LONG);
		}
	}

	render() {
		const { url, username, password } = this.state;

		return (
			<ScrollView contentContainerStyle={styles.container}>
				<Image
					resizeMode='contain'
					source={require('./common/z_1_250.png')}
					style={styles.image} />
				<TextInput
					autoCapitalize='none'
					autoCorrect={false}
					onChangeText={urlText => this.setState({ url: urlText })}
					placeholder={getLocalizedString('login.placeholderURL')}
					style={styles.textInputStyle}
					value={url} />
				<TextInput
					autoCapitalize='none'
					autoCorrect={false}
					onChangeText={usernameText => this.setState({ username: usernameText })}
					placeholder={getLocalizedString('login.placeholderUsername')}
					style={styles.textInputStyle}
					value={username} />
				<TextInput
					autoCapitalize='none'
					autoCorrect={false}
					onChangeText={passwordText => this.setState({ password: passwordText })}
					placeholder={getLocalizedString('login.placeholderPassword')}
					secureTextEntry
					style={styles.textInputStyle}
					value={password} />
				<Button
					icon={{ name: 'key', type: 'font-awesome' }}
					large
					onPress={() => this.checkFields()}
					title={getLocalizedString('login.loginButton')} />
				<Toast ref={(c) => { this.toast = c; }} />
			</ScrollView>
		);
	}
}
