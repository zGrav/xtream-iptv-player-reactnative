import {
	StackNavigator,
} from 'react-navigation';

import LoginScreen from './Login';
import AccountScreen from './Account';
import LiveScreen from './Live';
import LiveChannelScreen from './LiveChannel';
import LiveChannelFullEPGScreen from './LiveChannelFullEPG';
import PlayeriOS from './PlayeriOS';
import VODScreen from './VODs';
import VODChannelScreen from './VODChannel';
import SeriesScreen from './Series';
import SeriesEpisodePickerScreen from './SeriesEpisodePicker';
import SeriesEpisodeViewerScreen from './SeriesEpisodeViewer';

const App = StackNavigator({
	Login: {
		screen: LoginScreen,
		navigationOptions: {
			headerLeft: null,
			gesturesEnabled: false,
		},
	},
	Account: {
		screen: AccountScreen,
		navigationOptions: {
			headerLeft: null,
			gesturesEnabled: false,
		},
	},
	Live: {
		screen: LiveScreen,
	},
	LiveChannel: {
		screen: LiveChannelScreen,
	},
	LiveChannelFullEPG: {
		screen: LiveChannelFullEPGScreen,
	},
	PlayeriOS: {
		screen: PlayeriOS,
	},
	VODs: {
		screen: VODScreen,
	},
	VODChannel: {
		screen: VODChannelScreen,
	},
	Series: {
		screen: SeriesScreen,
	},
	SeriesEpisodePicker: {
		screen: SeriesEpisodePickerScreen,
	},
	SeriesEpisodeViewer: {
		screen: SeriesEpisodeViewerScreen,
	},
});

export default App;
