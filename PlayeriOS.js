import React, { Component } from 'react';
import {
	AppState,
	StyleSheet,
	View,
	Dimensions,
	TouchableOpacity,
} from 'react-native';
import VLCPlayer from 'react-native-vlcplayer';
import * as Progress from 'react-native-progress';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Bars } from 'react-native-loader';
import Orientation from 'react-native-orientation';

const playerDefaultHeight = Dimensions.get('window').width;
const playerDefaultWidth = Dimensions.get('window').height;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		backgroundColor: '#000000',
	},
	vlcplayer: {
		width: playerDefaultWidth,
		height: playerDefaultHeight,
		backgroundColor: 'black',
	},
	buttonBox: {
		position: 'absolute',
		top: -(playerDefaultHeight),
		alignItems: 'center',
		justifyContent: 'center',
		width: playerDefaultWidth,
		height: playerDefaultHeight,
	},
});

export default class PlayeriOS extends Component {

	constructor(props) {
		super(props);
		this.state = {
			appState: AppState.currentState,
			progress: 0,
			paused: true,
			playButtonColor: 'rgba(255,255,255,1)',
			loadingColor: 'rgba(255,255,255,0)',
			buttonSize: 70,
			progressWidth: playerDefaultWidth,
		};

		if (this.props.buttonSize) {
			this.state.buttonSize = this.props.buttonSize;
		}
	}

	componentDidMount() {
		AppState.addEventListener('change', this._handleAppStateChange);
	}

	componentWillUnmount() {
		AppState.removeEventListener('change', this._handleAppStateChange);
		Orientation.lockToPortrait();
		Orientation.unlockAllOrientations();
	}

	_handleAppStateChange = (nextAppState) => {
		if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
			// console.log('App has come to the foreground!')
		} else {
			const { goBack } = this.props.navigation;
			goBack();
		}

		this.setState({ appState: nextAppState });
	}

	render() {
		const defaultControlsView = this.defaultControlsView();

		return (
			<View style={styles.container}>
				<VLCPlayer
					ref='vlcplayer'
					onBuffering={this.onBuffering.bind(this)}
					onEnded={this.onEnded.bind(this)}
					onPaused={this.onPaused.bind(this)}
					onPlaying={this.onPlaying.bind(this)}
					onProgress={this.onProgress.bind(this)}
					onStopped={this.onEnded.bind(this)}
					paused={this.state.paused}
					source={{ uri: this.props.navigation.state.params.uri, initOptions: ['--codec=avcodec'] }}
					style={[styles.vlcplayer]} />
				{defaultControlsView}
			</View>
		);
	}

	pause() {
		if (!this.state.paused) { return; }
		Orientation.lockToLandscape();
		this.setState({ paused: !this.state.paused });
	}

	onPlaying(event) {
		this.setState({ loadingColor: 'rgba(255,255,255,0)' });
		this.setState({ playButtonColor: 'rgba(255,255,255,0)' });
	}

	onPaused(event) {
		this.setState({ loadingColor: 'rgba(255,255,255,0)' });
		this.setState({ playButtonColor: 'rgba(255,255,255,1)' });
	}

	onBuffering(event) {
		this.setState({ playButtonColor: 'rgba(255,255,255,0)' });
		this.setState({ loadingColor: 'rgba(255,255,255,1)' });
	}

	defaultControlsView() {
		return (
			<View>
				<View style={[styles.buttonBox, { backgroundColor: 'rgba(0,0,0,0)' }]}>
					<Bars color={this.state.loadingColor} size={10} />
				</View>
				<TouchableOpacity activeOpacity={1} onPress={this.pause.bind(this)} style={[styles.buttonBox]}>
					<Icon.Button backgroundColor='rgba(0,0,0,0)' color={this.state.playButtonColor} name='play-circle-o' onPress={this.pause.bind(this)} size={this.state.buttonSize} />
				</TouchableOpacity>
				<Progress.Bar ref='progress' borderRadius={0} borderWidth={0} color='rgba(255,0,0,1)' height={3} progress={this.state.progress} width={this.state.progressWidth} />
			</View>
		);
	}

	onProgress(event) {
		this.setState({ progress: event.position });
		this.setState({ loadingColor: 'rgba(255,255,255,0)' });
	}

	onEnded(event) {
		this.setState({ progress: 1 });
		this.setState({ playButtonColor: 'rgba(255,255,255,1)' });
	}
}
