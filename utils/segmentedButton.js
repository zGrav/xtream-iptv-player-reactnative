import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactNative, { StyleSheet, Text, View, Animated, ScrollView, Dimensions, TouchableOpacity } from 'react-native';

const screen = Dimensions.get('window');

const styles = StyleSheet.create({
	scrollOuter: {
		// width: 40
	},
	navBar: {
		width: screen.width,
		flexDirection: 'column',
	},

	navItem: {
		marginLeft: 5,
		marginRight: 5,
		paddingTop: 10,
		paddingBottom: 10,
		paddingLeft: 7,
		paddingRight: 7,
		alignItems: 'center',
		height: 45,
	},
	navItemText: {
		marginTop: 6,
		fontSize: 13,
	},
	activeBottom: {
		position: 'absolute',
		left: 0,
		bottom: 1,
		marginTop: 2,

	},
	activeBottomLine: {
		borderBottomWidth: 1,
	},
});

const activeTinyColor = '#00afa5';
const tinyColor = '#434343';

const bottomAdded = -15;

export default class SegmentedButton extends Component {
	static propTypes = {
		items: PropTypes.array.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			activeIndex: this.props.activeIndex || 0,
			x: new Animated.Value(0),
			abWidth: new Animated.Value(0),
		};
	}

	componentDidMount() {
		const $this = this;
		
		if (!$this.props.items || !$this.props.items.length) {
			return null;
		}

		return $this;
	}

	render() {
		const $this = this;

		const navItems = $this.props.items;

		if (!navItems || !navItems.length) {
			return null;
		}

		const activeItemIndex = $this.state.activeIndex;

		const doms = navItems.map(function(item, index) {
			const key = `segment_${index}`;
			let label;

			if (typeof item === 'string') {
				label = item;
			} else {
				label = item.text;
			}

			if (activeItemIndex === index) {
				return (
					<TouchableOpacity key={key} ref={index} style={[styles.navItem, { marginBottom: 1.5 }]} >
						<Text style={[styles.navItemText, { color: activeTinyColor }]}>{label}</Text>
					</TouchableOpacity>
				);
			}
			return (
				<TouchableOpacity
					key={key}
					ref={index}
					onPress={e => $this._onSegmentBtnPress(e, index)}
					style={[styles.navItem, {}]}>
					<Text style={[styles.navItemText, { color: tinyColor }]}>{label}</Text>
				</TouchableOpacity>
			);

		});
		return (
			<View onLayout={this.onLayout.bind(this)} style={[styles.scrollOuter, { alignItems: 'flex-start', justifyContent: 'center' }, $this.props.style]}>
				<ScrollView
					ref='scrollView'
					automaticallyAdjustContentInsets={false}
					directionalLockEnabled
					horizontal
					showsHorizontalScrollIndicator={false}>
					{doms}
					<Animated.View
						ref='activeBottom'
						style={[styles.activeBottom, styles.activeBottomLine, { borderColor: activeTinyColor },
							{
								width: $this.state.abWidth,
								transform: [{ translateX: $this.state.x }],
							}]} />
				</ScrollView>
			</View>
		);
	}

		_firstLayout = true;

		onLayout() {
			const $this = this;

			if (!$this._firstLayout) {
				return;
			}

			$this._firstLayout = false;

			$this.refs[0].measureLayout(
				ReactNative.findNodeHandle($this.refs.scrollView),
				(ox, oy, width, height, pageX, pageY) => {
					Animated.parallel([
						Animated.spring(
							$this.state.abWidth,
							{
								toValue: width + bottomAdded,
								friction: 7,
							}
						),
						Animated.spring(
							$this.state.x,
							{
								toValue: ox - bottomAdded / 2,
								friction: 7,
							}
						),
					]).start();

				}
			);
		}

		_onSegmentBtnPress(e, index) {
			const $this = this;

			$this.setState({
				activeIndex: index,
			});

			const item = $this.refs[index];

			item.measureLayout(
				ReactNative.findNodeHandle($this.refs.scrollView),
				(ox, oy, width, height, pageX, pageY) => {

					Animated.parallel([
						Animated.spring(
							$this.state.abWidth,
							{
								toValue: width + bottomAdded,
								friction: 7,
							}
						),
						Animated.spring(
							$this.state.x,
							{
								toValue: ox - bottomAdded / 2,
								friction: 7,
							}
						),
					]).start();
				}
			);

			$this.props.onSegmentBtnPress(e, index);
		}

		getActiveIndex() {
			const $this = this;

			return $this.state.activeIndex;
		}

}
