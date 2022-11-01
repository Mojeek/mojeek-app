import React, {Component} from 'react';

import {
	ActivityIndicator,
	Button,
	FlatList,
	Image,
	Linking,
	Platform,
	RefreshControl,
	SafeAreaView,
	ScrollView,
	Share,
	StyleSheet,
	Text,
	View
} from 'react-native';

import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import { SearchBar } from 'react-native-elements';

import { WebView } from 'react-native-webview';

import { Directions, PanGestureHandler, State } from "react-native-gesture-handler";

const COLOURS = {
	black: '#111',
	green: '#7ABB3B',
	dark_green: '#599E2D',
	error: '#D52929',
	off_white: '#F7F8F6'
};

const STYLES = StyleSheet.create({
	a: {
		color: '#1368E5'
	},
	center: {
		textAlign: 'center'
	},
	img: {
		width: 80,
		height: 80
	},
	loading: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		alignItems: 'center',
		justifyContent: 'center'
	}
});

function decode(str)
{
	const Entities = require('html-entities').AllHtmlEntities;

	const entities = new Entities();

	return entities.decode(str);
}

function fmt_commas(val)
{
	if (!val)
		return;

	while (/(\d+)(\d{3})/.test(val))
		val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');

	return val;
}

function trim_to_sentences(str, num_sentences, more_text = '...')
{
	let sentences = str.match(/[^\.!\?]+[\.!\?]+/g);
	if (sentences) {
		if (sentences.length >= num_sentences && sentences.length > num_sentences)
			return sentences.slice(0, num_sentences).join(" ") + more_text;
	}
	return str;
}

function trim_sentences_by_max_len(str, max_len)
{
    let out = trim_to_sentences(str, 1);
    let len = out.length;
    let n = 2;
    max_len = (max_len > str.length) ? str.length : max_len;
    while (len < max_len && len < max_len) {
        let new_out = trim_to_sentences(str, n);
        if (new_out.length > max_len)
        	return out;

        out = new_out;
        len = new_out.length;
        n++;
    }
    return out;
}

function trim_str(str, max_len = 100)
{
	if (str.length < max_len)
		return str;

	return str.substr(0, max_len) + '...';
}

class WebViewScreen extends Component
{
	static navigationOptions = ({ navigation }) => {
		return {
			title: trim_str(navigation.getParam('uri', 'View Website'), 30),
			headerTitleStyle: {
				fontSize: 12,
			},
		};
	};

	constructor(props) {
		super(props);
		this.state = this.props.navigation.state.params;
	}

	render() {
		return (
			<WebView
				incognito={true}
				originWhitelist={['*']}
				source={{ uri: this.state.uri }}
				allowsBackForwardNavigationGestures={true}
				startInLoadingState={true}
				userAgent={'mojeek-app'}
				useWebKit={true}
				// onNavigationStateChange={alert(this.state.uri)}
			/>
		);
	}
}

class HomeScreen extends Component
{
	static navigationOptions = {
		headerStyle: {height: 0}
	};

	constructor(props) {
		super(props)
		this.state = {
			loading: true,
			refreshing: false,
			last_news_refresh_time: Date.now(),
			meta: {start: 0, end: 0, timer: -1},
			s: 1,
			t: 10,
			q: '',
			error: null,
			results: [],
			results_end_reached: false,
			latest_news: []
		}
	}

	componentDidMount() {
		const { navigation } = this.props;
		this.focusListener = navigation.addListener('didFocus', () => {
			this.get_latest_news();
		});
	}

	get_latest_news = () => {
		const url = 'https://www.mojeek.com/api/news?user_ip=self&platform=' + Platform.OS;


		fetch(url, {
			headers: new Headers({
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'User-agent': 'mojeek-app'
			}),
		})
		.then(res => res.json())
		.then(res => {
			if (res.status === "200") {
				this.setState({
					latest_news: res.response.news || [],
					last_news_refresh_time: Date.now()
				});
			}
			this.setState({
				refreshing: false,
				loading: false,
			})
		})
		.catch(error => {
			this.setState({ error, loading: false });
		});
	}

	perform_search = () => {
		this.setState({
			loading: true
		}, () => { this.props.navigation.navigate('Search', this.state) });
	};

	_onRefresh = () => {
		/* prevent refreshing more often than every 10 seconds */
		if (Date.now() - 10000 > this.state.last_news_refresh_time) {
			this.setState({
				refreshing: true
			}, () => { this.get_latest_news() });
		}
	}

	render = () => {
		return (
			<SafeAreaView style={{backgroundColor: 'white'}}>
				<ScrollView
					contentInsetAdjustmentBehavior="automatic"
					keyboardDismissMode='on-drag'
					endFillColor='white'
					refreshControl={
						<RefreshControl
							refreshing={this.state.refreshing}
							onRefresh={this._onRefresh}
						/>
					}
				>
					<View style={{
						flex: 1,
						justifyContent: 'center',
						alignItems: 'center',
					}}>
						<View style={{
							flex: 1,
							justifyContent: 'center',
							height: 100
						}}>
							<Image
								style={{ width: 160, height: 48 }}
								source={ require('./logo.png') }
							/>
						</View>
						<View style={{
							width: 300,
							textAlign: 'center'
						}}>
							<SearchBar
								placeholder="No Tracking, Just Search..."
								placeholderTextColor={COLOURS.green}
								value={this.state.q}
								onChangeText={(q) => this.setState({q})}
								onEndEditing={() => this.perform_search()}
								containerStyle={{backgroundColor: 'white', padding: 0, margin: 0, borderWidth:1, borderLeftColor:COLOURS.dark_green, borderRightColor:COLOURS.dark_green, borderBottomColor:COLOURS.dark_green, borderTopColor:COLOURS.dark_green}}
								inputContainerStyle={{backgroundColor: 'white'}}
								inputStyle={{backgroundColor: 'white', color: COLOURS.dark_green}}
								returnKeyType='search'
								autoCapitalize='none'
								autoFocus={true}
							/>
						</View>
					</View>

					{ this.state.latest_news.length > 0 &&
					<View style={{
						backgroundColor: 'white',
						width: 300,
						marginLeft: 'auto',
						marginRight: 'auto',
					}}>
						<Text style={{
							marginTop: '10%',
							marginBottom: '4%',
							height: 20
						}}>Latest News:</Text>
						<FlatList
							contentContainerStyle={{
								flexGrow: 1,
								justifyContent: 'space-between'
							}}
							data={this.state.latest_news}
							extraData={this.state}
							renderItem={({ item }) => (
								<View style={{marginBottom: '4%'}}>
									<Text h1
										  style={STYLES.a}
										  // onPress={() => Linking.openURL(item.u)}
										  onPress={() => {
											  this.setState({
												  uri: item.u
											  }, () => { this.props.navigation.navigate('WebView', this.state) });
										  }}
									>
										{decode(item.t)}
									</Text>
									<Text h2
										  style={{lineHeight: 18, fontSize: 12}}
									>
										{trim_sentences_by_max_len(decode(item.s), 200)}
									</Text>
									<Text h4
										  style={{color: '#539923', fontSize: 12, marginBottom: '4%'}}
									>
										Source: {decode(item.st)}
									</Text>
								</View>
							)}
							keyExtractor={(item, index) => index.toString()}
						/>
						<View style={{height: 50}}>
							<Text
								style={[STYLES.a, STYLES.center]}
								onPress={() => Linking.openURL("https://www.mojeek.com/news")}>View more news at mojeek.com</Text>
						</View>
					</View>
					}
				</ScrollView>
			</SafeAreaView>
		);
	}
}

class SearchResult extends Component
{
	constructor(props) {
		super(props);
		this.state = this.props.screenProps.navigation.state.params;
		this.navigation = this.props.screenProps.navigation;
		this.item = this.props.screenProps.item;
	}

	show_share_opts = async (url, title) => {
		try {
			const result = await Share.share({
				message: decode(title) + ' - ' + url
			}, {
				subject: 'I found a website that I thought you might like'
			});
		} catch (error) {
			alert(error.message);
		}
	}

	render = () => {
		return (
			<View style={{marginTop: 0, marginBottom: 10, maxWidth: 450, paddingRight: 10}}>
				<Text h1
					  style={STYLES.a}
					  onPress={() => {
						  this.setState({
							  uri: this.item.url
						  }, () => { this.navigation.navigate('WebView', this.state) });
					  }}
					  onLongPress={() => this.show_share_opts(this.item.url, this.item.title)}
				>
					{decode(this.item.title)}
				</Text>
				<Text h4
					  style={{color: '#539923', fontSize: 12}}
				>
					{this.item.url}
				</Text>
				<Text h2
					  style={{lineHeight: 18, fontSize: 12}}
				>
					{decode(this.item.desc)}
				</Text>
			</View>
		);
	}
}

class SearchScreen extends Component
{
	static navigationOptions = {
		title: 'Search results',
	};

	constructor(props) {
		super(props);
		this.state = {
			...this.props.navigation.state.params,
			uri: ''
		};
	}

	getInitialState() {
		return {
			loading: true
		}
	}

	componentDidMount() {
		return this.get_results(false);
	}

	pin_results = (res) => {
		if (res.response.status !== 'OK')
			return;

		let meta = {};
		if (this.state.meta.timer !== -1)
			meta = this.state.meta;
		else
			meta = res.response.head;

		if ((res.response.head.start + res.response.head.return) < res.response.head.results)
			meta.end = res.response.head.start + res.response.head.return - 1;
		else
			meta.end = res.response.head.results;

		if (meta.end === 0)
			meta.start = 0;

		this.setState(prevState => ({
			meta: meta,
			results: Object.keys(prevState.results).length > 0 ? [...prevState.results, ...res.response.results] : res.response.results,
			error: res.response.status !== 'OK' ? true : false,
			results_end_reached: (res.response.head.results === 0),
			loading: false,
			last_result_reached: (res.response.results.length < this.state.t) ? true: false
		}));

		return;
	};

	fetch_results = () => {
		let { q, s, t } = this.state;
		let url = 'https://www.mojeek.com/search';
		q = q.replace(/ /g, '+');
		url += `?platform=${Platform.OS}&s=${s}&t=${t}&fmt=json&q=${q}`;

		fetch(url, {
			headers: new Headers({
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'User-agent': 'mojeek-app'
			}),
		})
		.then(res => res.json())
		.then(res => {
			this.pin_results(res);
		})
		.catch(error => {
			this.setState({ error: true, loading: false });
		});
	};

	get_results = (new_search) => {
		if (this.state.q === '') {
			this.setState({
				loading: false
			}, () => {
				this.props.navigation.navigate('Home', this.state)
			});
			return;
		}

		if (new_search)
			this.setState({s:1});

		this.setState({
			loading: true,
			meta: {start: 0, end: 0, timer: -1},
			results: [],
		}, () => { this.fetch_results() });
	};

	render_loader = () => {
		if (!this.state.loading || this.state.error)
			return null;

		return (
			<View style={STYLES.loading}>
				<ActivityIndicator
					style={{ color: '#000' }}
				/></View>
		);
	};

	serps_load_prev = () => {
		if (this.state.loading)
			return null;

		if (this.state.meta.results < this.state.t)
			return null;

		if (this.state.s <= 1)
			return null;

		this.setState({
			s: this.state.s - this.state.t,
		}, () => { this.get_results() });
	};

	serps_load_next = () => {
		if (this.state.loading)
			return null;

		if (this.state.meta.results < this.state.t)
			return null;

		this.setState({
			s: this.state.s + this.state.t
		}, () => { this.get_results() });
	};

	swipe_paginate_serps = (e) => {
		let {nativeEvent} = e;
		if (nativeEvent.state === State.END) {
			if (nativeEvent.translationX < 0)
				this.serps_load_next();
			else
				this.serps_load_prev();
		}
	};

	render_pagination_btns = () => {
		if (this.state.error || this.state.results.length === 0)
			return null;

		return (
			<View style={{position:'absolute', bottom: 0, left: 0, width: '100%'}}>
				<View style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'center', height: 50, padding: 5, backgroundColor: COLOURS.green}}>
					<Button
						style={{flex: 1}}
						onPress={this.serps_load_prev}
						title="&lt; Prev"
						color={(Platform.OS === 'ios') ? COLOURS.off_white : COLOURS.dark_green}
						accessibilityLabel="Previous results"
						disabled={this.state.s < (this.state.t + 1)}
					/>
					<Text style={{flex:1, textAlign:'center', color: COLOURS.off_white}}>Page {Math.ceil(this.state.s/this.state.t)}</Text>
					<Button
						style={{flex: 1}}
						onPress={this.serps_load_next}
						title="Next &gt;"
						color={(Platform.OS === 'ios') ? COLOURS.off_white : COLOURS.dark_green}
						accessibilityLabel="Next results"
						disabled={(this.state.s + this.state.t) > this.state.meta.results - this.state.meta.more}
					/>
				</View>
			</View>
		);
	};

	render_end_reached_msg = () => {
		if (this.state.results_end_reached && this.state.results.length > 0)
			return (<Text>No more results</Text>);

		if (this.state.results_end_reached)
			return (<Text>No results for {this.state.meta.query}</Text>);
	};

	render_results_cnt = () => {
		if (this.state.error)
			return null;

		let results_cnt = fmt_commas(this.state.meta.results) || 0;
		let end = (this.state.meta.start + this.state.meta.return - 1) || 0;
		if (end < 0)
			end = 0;

		return (<View style={{height: 43, top: 12}}>
				{ !this.state.loading ?
					<Text h1>Results {this.state.meta.start} to {end} of {results_cnt}</Text> : null
				}
			</View>
		);
	};

	render_results = () => {
		if (this.state.error) {
			let url = `https://www.mojeek.com/search?q=${this.state.q}`
			return (<View style={{marginTop: '5%', marginBottom: 100}}>
				<Text>There was an error, please try again later.</Text>
				<Text style={{marginTop: '5%'}}>You can try a search on Mojeek directly at:</Text>
				<Text h1
					  style={STYLES.a}
					  onPress={() => Linking.openURL(url)}
				>
					{url}
				</Text>
			</View>);
		}

		if (this.state.results.length === 0)
			return null;

		return (
			<PanGestureHandler
				onHandlerStateChange={this.swipe_paginate_serps}
				minDist={50}
				direction={Directions.RIGHT | Directions.LEFT}
			>
				<ScrollView
					style={{flex: 1}}
					keyboardDismissMode='on-drag'
					showsVerticalScrollIndicator={true}
					directionalLockEnabled={true}
					pinchGestureEnabled={false}
				>
					<FlatList
						style={{marginBottom: 20}}
						data={this.state.results}
						keyExtractor={(item, index) => index.toString()}
						renderItem={({item}) => <SearchResult screenProps={{ item: item, navigation: this.props.navigation }} />}
					/>
					{(!this.state.loading && this.state.last_result_reached) ? <Text>No more results.</Text> : null}
				</ScrollView>
			</PanGestureHandler>
		)
	};

	render = () => {
		return (
			<View style={{backgroundColor: 'white'}}>
				<SafeAreaView>
					<View style={{ padding: 20, height: '100%'}}>
						<View style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
							<SearchBar
								placeholder="No Tracking, Just Search..."
								placeholderTextColor={COLOURS.green}
								value={this.state.q}
								onChangeText={(q) => this.setState({q})}
								onEndEditing={() => this.get_results(true)}
								containerStyle={{backgroundColor: 'white', padding: 0, margin: 0, borderWidth:1, borderLeftColor:COLOURS.dark_green, borderRightColor:COLOURS.dark_green, borderBottomColor:COLOURS.dark_green, borderTopColor:COLOURS.dark_green}}
								inputContainerStyle={{backgroundColor: 'white'}}
								inputStyle={{backgroundColor: 'white', color: COLOURS.dark_green}}
								returnKeyType='search'
								autoCapitalize='none'
							/>
							{ this.render_loader() }
							{ this.render_results_cnt() }
							{ this.render_end_reached_msg() }
							{ this.render_results() }
						</View>
					</View>
				</SafeAreaView>
				{ this.render_pagination_btns() }
			</View>
		);
	}
}

const MainNavigation = createStackNavigator(
	{
		Home: {screen: HomeScreen},
		Search: {screen: SearchScreen},
		WebView: {screen: WebViewScreen}
	},
	{
		defaultNavigationOptions: {
			cardStyle: {opacity: 1, backgroundColor: 'transparent'},
			headerStyle: {
				backgroundColor: COLOURS.green,
			},
			headerTintColor: COLOURS.off_white,
		},
		initialRouteName: 'Home',
		screenOptions: {
			header: ({scene, previous, navigation}) => {
				const {options} = scene.descriptor;
				const title =
					options.headerTitle !== undefined
						? options.headerTitle
						: options.title !== undefined
						? options.title
						: scene.route.name;

				return (
					<MyHeader
						title={title}
						leftButton={
							previous ? <MyBackButton onPress={navigation.goBack}/> : undefined
						}
						style={options.headerStyle}
						headerTintColor={COLOURS.green}
					/>
				);
			}
		}
	},
);

const AppContainer = createAppContainer(MainNavigation);

export default class App extends Component {
	render = () => {
		return (
			<AppContainer />
		);
	}
}
