import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	Animated,
	Image,
	StyleSheet,
	Text,
	Platform,
	Easing,
	View,
	Dimensions,
	FlatList,
	Pressable,
	ActivityIndicator,
	LogBox,
} from 'react-native';
import SortableList from 'react-native-sortable-list';
import { fontSize15, fontSize20, grayColor, primaryColor, windowWidth } from './Components/style';
import { getRequest, postRequest, showToast } from './Rest/apiService';

const window = Dimensions.get('window');

const data = {
	0: {
		image: 'https://placekitten.com/200/240',
		text: 'Chloe',
	},
	1: {
		image: 'https://placekitten.com/200/201',
		text: 'Jasper',
	},
	2: {
		image: 'https://placekitten.com/200/202',
		text: 'Pepper',
	},
	3: {
		image: 'https://placekitten.com/200/203',
		text: 'Oscar',
	},
	4: {
		image: 'https://placekitten.com/200/204',
		text: 'Dusty',
	},
	5: {
		image: 'https://placekitten.com/200/205',
		text: 'Spooky',
	},
	6: {
		image: 'https://placekitten.com/200/210',
		text: 'Kiki',
	},
	7: {
		image: 'https://placekitten.com/200/215',
		text: 'Smokey',
	},
	8: {
		image: 'https://placekitten.com/200/220',
		text: 'Gizmo',
	},
	9: {
		image: 'https://placekitten.com/220/239',
		text: 'Kitty',
	},
};

function Row(props) {
	const { active, data } = props;
	const activeAnim = useRef(new Animated.Value(0));
	
	useEffect(() => {
		Animated.timing(activeAnim.current, {
			duration: 300,
			easing: Easing.bounce,
			toValue: Number(active),
			useNativeDriver: false
		}).start();
	}, []);

	return (
		<Animated.View style={[styles.row]}>
			<Text style={styles.text}>{data.name}</Text>
		</Animated.View>
	);
}

const App = () => {
	const [ buyers , setBuyers ] = useState({});
	const [ selectedBuyer , setSelectedBuyers ] = useState();
	const [ weekDays , setWeekDays ] = useState({});
	const [ processedData , setProcessedData ] = useState({});
	const [ selectedWeek , setSelectedWeek ] = useState({});
	const [ weekBuyers , setWeekBuyers ] = useState(data);
	const [ selectedWeekDayId , setSelectedWeekDayId ] = useState();
	const [ loader , setLoader ] = useState(false);
	const [ LoadingBuyerList , setLoadingBuyerList ] = useState(false);
	
	useEffect( () => {
		LogBox.ignoreLogs(['Animated: `useNativeDriver` was not specified.']);

		getRequest('get-all-routes').then((res) => {
			setSelectedBuyers(res.data.data[0].routno);
			setBuyers(res.data.data);
			setSelectedWeekDayId(res.data.data[0].id);
			getBuyersFromWeekDay(res.data.data[0].id);

		}).catch((err) => {

		})
	} , [])

	const updateAsFlatlist = (data) => {
		let myData = [];
		return new Promise((resolve , reject) => {
			for(let i = 0; i < data.length; i++ ){
				let k = data[i] ;
				myData.push({k});
				if( i == (data.length - 1) ){
					resolve(myData)
				}
			}
		});
	}
	
	const getBuyersFromWeekDay = (selecteWeekId) => {
		setSelectedWeekDayId(selecteWeekId)

		setLoadingBuyerList(true)
		getRequest('get-buyer-priortity-by-driver/12/'+selecteWeekId).then((res) => {
			setWeekBuyers(res.data.data);
			setTimeout(() => {
				setLoadingBuyerList(false)
			} , 1000)
		}).catch((err) => {

		})
	}

	const postUpdateBuyerPriority = (postedData) => {
		var updatedData = {};
		updatedData['priorities'] = postedData;
		updatedData['routeId'] = selectedWeekDayId;
		updatedData['driverId'] = 12;
		return new Promise((resolve , reject) => {
			postRequest('/update/priorities/sorting' , updatedData).then((res) => {

				resolve(res)
			}).catch((err) => {
				reject(err)
			})	
		});
	}
	
	const renderRow = useCallback(({ data, active }) => {
		return <Row data={data} active={active} />;
	}, []);

	const renderItemWeeks = ({ item }) => (
		<Pressable onPress={() => { setSelectedBuyers(item.routno); return getBuyersFromWeekDay(item.id)}} style={[{borderRadius: 10,marginBottom:10,marginRight: 10,borderColor: '#000',borderWidth: 1} , (selectedBuyer == item.routno) ? {backgroundColor: '#000'} : ''  ]}>
			<View style={ [{}]}>
				<Text style={[(selectedBuyer == item.routno) ? {color: '#fff'} : '' , {paddingHorizontal: 10,paddingVertical: 10},fontSize15]}>{item.routno}</Text>
			</View>
		</Pressable>
	);

	const updateNewPriority = (newOrder) =>{
		let myNewOrderedArray = [];
		return new Promise((resolve , reject) => {
			for (let i = 0; i < newOrder.length; i++) {
				myNewOrderedArray.push({'buyerId' : weekBuyers[newOrder[i]].id,'newOrderId' :i });
				if( i == (newOrder.length - 1)){
					resolve(myNewOrderedArray);
				}
			}
		});
	}

	return (
		<View style={styles.container}>
			{(loader == true)?
				<View  style={{height: '100%',width: '100%',justifyContent: 'center',position: 'absolute',backgroundColor: '#000',zIndex: 999,margin: 0 , padding: 0,opacity: 0.3}}>
				</View>
			:
				null
			}
			{(loader == true)?
				<View style={{height: '100%',width: '100%',position: 'absolute',justifyContent: 'center',zIndex: 9999}}>
					<ActivityIndicator size="large" color="#000" />
					<Text style={{textAlign: 'center',fontSize: 24,fontWeight: 'bold'}}>Please Wait</Text>
				</View>
			:
				null
			}
			
			<Text style={styles.title}></Text>
			<View style={{height: '100%'}}>
				<View style={{height: 100}}>
					<FlatList
						data={buyers}
						renderItem={renderItemWeeks}
						keyExtractor={item => item.id}
						showsHorizontalScrollIndicator={false}
						numColumns={((windowWidth > 500 ) ? 7: 4 )}	
					/>
				</View>
				
				<View style={{height: '80%'}}>
					{(LoadingBuyerList)?
						<View>
							<ActivityIndicator size="large" color="red" />
						</View>
					:
						null
					}
					

					<SortableList
						style={styles.list}
						contentContainerStyle={styles.contentContainer}
						data={weekBuyers}
						renderRow={renderRow}
						useNativeDriver={false}
						onReleaseRow={(key , currentOrder) => {
							setLoader(true)
							updateNewPriority(currentOrder).then((res) => {
								postUpdateBuyerPriority(res).then((result) => {
									console.log("kjnk");
									showToast('Sorted Complete')
									setLoader(false)
								}).catch((err) => {
									console.log(err)
									console.log("kjnkerfer");

									setLoader(false)
								})
								setTimeout(() => {
									setLoader(false)
								} , 3000)

							} , (err) => {

							});
						}} 
						onActivateRow= {(buyer) => {
							// console.log(buyer);
						}}
					/>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#eee',
		...Platform.select({
			ios: {
				paddingTop: 20,
			},
		}),
	},
	title: {
		fontSize: 20,
		paddingVertical: 20,
		color: '#999999',
	},
	list: {
		flex: 1,
	},
	contentContainer: {
		width: window.width,
		...Platform.select({
			ios: {
				paddingHorizontal: 30,
			},
			android: {
				paddingHorizontal: 0,
			},
		}),
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fff',
		padding: 10,
		height: 80,
		flex: 1,
		marginTop: 7,
		marginBottom: 12,
		borderRadius: 4,
		...Platform.select({
			ios: {
				width: window.width - 30 * 2,
				shadowColor: 'rgba(0,0,0,0.2)',
				shadowOpacity: 1,
				shadowOffset: { height: 2, width: 2 },
				shadowRadius: 2,
			},
			android: {
				width: window.width - 30 * 2,
				elevation: 0,
				marginHorizontal: 30,
			},
		}),
	},
	image: {
		width: 50,
		height: 50,
		marginRight: 30,
		borderRadius: 25,
	},
	text: {
		fontSize: 24,
		color: '#222222',
	},
});

export default App;