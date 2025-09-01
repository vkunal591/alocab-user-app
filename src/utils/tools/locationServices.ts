import Geolocation from '@react-native-community/geolocation';
import {
    PermissionsAndroid,
    Platform,
    Alert,
    Linking,
    ToastAndroid,
} from 'react-native';
import {
    request,
    PERMISSIONS,
    RESULTS,
} from 'react-native-permissions';
import Geocoder from 'react-native-geocoding';
import apiUtils from '../apiUtils';

// Initialize Geocoder
Geocoder.init(`${process.env.MAPS_API_KEY}`);

// ✅ Request Permission
async function requestLocationPermission() {
    try {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Location Permission Required',
                    message: 'We need your precise location to continue.',
                    buttonPositive: 'OK',
                    buttonNegative: 'Cancel',
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } else {
            const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
            return result === RESULTS.GRANTED;
        }
    } catch (error) {
        console.error('Permission Request Error:', error);
        return false;
    }
}

// ✅ Check if location services are enabled
function checkIfLocationEnabled() {
    return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
            () => resolve(true),
            (error) => {
                console.log('checkIfLocationEnabled error:', error);
                if (error.code === 2) resolve(false); // Location services disabled
                else reject(error);
            },
            {
                enableHighAccuracy: false,
                timeout: 30000,
                maximumAge: 10000,
                distanceFilter: 0,
            }
        );
    });
}

// ✅ Show alert to enable location
function promptEnableLocationServices() {
    return new Promise((resolve) => {
        Alert.alert(
            'Location Services Disabled',
            'Please enable GPS/location from settings to continue.',
            [
                {
                    text: 'Ok',
                    onPress: () => {
                        // Platform.OS === 'ios'
                        //     ? Linking.openURL('App-Prefs:Privacy&path=LOCATION')
                        //     : Linking.openSettings();
                        resolve(false);
                    },
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => resolve(false),
                },
            ]
        );
    });
}

// ✅ Extract city, state, etc. from Geocoder result
function extractLocationDetails(components: any[]) {
    const getComponent = (types: string[]) =>
        components?.find((c: any) => types.every((t) => c.types.includes(t)))?.long_name || '';

    return {
        city: getComponent(['locality']) || getComponent(['administrative_area_level_2']),
        state: getComponent(['administrative_area_level_1']),
        country: getComponent(['country']),
        pincode: getComponent(['postal_code']),
        landmark: getComponent(['point_of_interest']) || getComponent(['premise']),
        locality:
            getComponent(['sublocality']) ||
            getComponent(['sublocality_level_1']) ||
            getComponent(['neighborhood']),
    };
}

export const updateLocation = async (data: any, setLoading: any) => {
    try {

        setLoading(true)
        // Build payload dynamically
        const payload: any = {};
        console.log(data, "kdlkdsjflkdsjflj")
        if (data?.latitude !== undefined && data?.longitude !== undefined) {
            payload.location = {
                type: "Point",
                coordinates: [data.latitude, data.longitude],
            };
        }

        if (data?.fcmToken) {
            payload.fcmToken = data.fcmToken;
        }


        const res: any = await apiUtils.put('/api/passenger', payload);
        if (!res?.success) throw new Error(res?.message || 'Failed to update status');
        return res;
    } catch (error: any) {
        ToastAndroid.show(error.message || 'Failed to update status', ToastAndroid.SHORT);
    } finally {
        setLoading(false);
    }
};

// ✅ MAIN FUNCTION
export async function getCurrentLocationWithAddress(
    set: (location: any) => void,
    setLoading: (location: any) => void,
): Promise<any | null> {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
        Alert.alert('Permission Denied', 'Location permission is required to proceed.');
        return null;
    }

    try {
        const isLocationEnabled = await checkIfLocationEnabled();
        if (!isLocationEnabled) {
            await promptEnableLocationServices();
            return null;
        }
    } catch (error) {
        console.error('Location Enable Check Error:', error);
        Alert.alert('Error', 'Unable to verify location services.');
        return null;
    }

    return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                console.log('📍 Coordinates:', latitude, longitude);

                try {
                    const geoResponse = await Geocoder.from(latitude, longitude);
                    if (!geoResponse.results?.[0]?.address_components) {
                        throw new Error('No address components found');
                    }

                    const addressComponents = geoResponse.results[0].address_components;
                    const locationDetails = extractLocationDetails(addressComponents);
                    console.log('✅ Location Details:', locationDetails);

                    const { landmark, locality, ...rest } = locationDetails;

                    const address = {
                        address: [landmark, locality].filter(Boolean).join(', '),
                        ...rest,
                    };

                    const fullLocation: any = {
                        address: [
                            {
                                latitude,
                                longitude,
                                ...address,
                            },
                        ],
                    };
                    console.log(latitude, longitude, locationDetails)
                    // Update local state
                    set({
                        latitude,
                        longitude,
                        address: locationDetails,
                    });

                    // Update Redux store
                    updateLocation({ latitude, longitude }, setLoading);

                    // ✅ Return the resolved address
                    resolve({
                        latitude,
                        longitude,
                        address: locationDetails,
                    });
                } catch (error) {
                    console.error('❌ Geocoding Error:', error);
                    Alert.alert('Error', 'Unable to retrieve address from location.');
                    reject(null);
                }
            },
            (error) => {
                console.error('❌ Location Error:', error);
                handleLocationError(error);
                reject(null);
            },
            {
                enableHighAccuracy: false,
                timeout: 30000,
                maximumAge: 10000,
                distanceFilter: 0,
            }
        );
    });
}


// ✅ Handle location-related errors
function handleLocationError(error: any) {
    switch (error.code) {
        case 1:
            Alert.alert('Permission Denied', 'Please allow location access in settings.');
            break;
        case 2:
            Alert.alert('Location Unavailable', 'Please ensure location services are enabled.');
            break;
        case 3:
            Alert.alert(
                'Location Timeout',
                'Location request timed out. Try again in an open area or enable High Accuracy mode.'
            );
            break;
        default:
            Alert.alert('Error', 'Could not fetch your location. Please try again.');
            break;
    }
}