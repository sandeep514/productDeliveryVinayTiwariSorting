import { ToastAndroid } from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import apiClient from './client';

export const CheckConnectivity = () => {
	return new Promise((resolve, reject) => {
		NetInfo.fetch().then(state => {
			if (state.isConnected == true || state.isConnected == 'true') {
				resolve('true');
			} else {
				alert('no internet connection');
				return false;
				reject();
			}
		});
	})
};

export const showToast = (message) => {
	ToastAndroid.showWithGravityAndOffset(message, ToastAndroid.LONG, ToastAndroid.BOTTOM, 0, 20);
};

export const generateRandString = () => {
	return (Math.random() * (9999 - 1) + 1).toFixed(0);
}

export const postRequest = (url , data) => {
	return new Promise((resolve, reject) => {
		CheckConnectivity().then((res) => {
			if (res == "true") {
				apiClient.post(url,data).then((response) => {

					if (response.data.status == true || response.data.status == "success") {
						resolve(response);
					} else {
						reject(response.data.error);
					}
				});
			}
		})
	});
};

export const getRequest = (url) => {
	return new Promise((resolve, reject) => {
		CheckConnectivity().then((res) => {
			apiClient.get(url).then((response) => {
				if (response.data.status == true || response.data.status == "success") {
					resolve(response);
				} else {
					reject(response.data.error);
				}
			});
		});

	});
};