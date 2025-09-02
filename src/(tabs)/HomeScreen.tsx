import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image,
  Animated,
  PermissionsAndroid,
  Platform,
  ToastAndroid,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import { ScrollView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  LINE_HEIGHT,
  RADIUS,
  SHADOW,
  SPACING,
  TEXT_SIZE,
  THEAMCOLOR,
  THEAMFONTFAMILY,
} from '../../assets/theam/theam';

import ImagePath from '../constants/ImagePath';
import { useAuth } from '../context/authcontext';
import CabMap from '../Components/common/CabMap';
import GooglePlacesAutocompleteComponent from '../Components/common/GooglePlacesAutocompleteComponent';
import { getCurrentLocationWithAddress } from '../utils/tools/locationServices';
import apiUtils from '../utils/apiUtils';
import { fetchRideDetails, RideStatus } from '../screens/rideScreens/BookRideScreen';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const { width, height } = Dimensions.get('screen');
const GOOGLE_MAPS_APIKEY = process.env.MAPS_API_KEY || ''; // Ensure this is set in your .env file

const HomeScreen = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation<any>();
  const { getCurrentUser }: any = useAuth();

  const [location, setLocation] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savedDestinations, setSavedDestinations] = useState<any[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const [saving, setSaving] = useState(false);
  const [activeRide, setActiveRide] = useState<any>(null);

  const handlePlaceSelect = async (place: any) => {
    if (!place?.latitude || !place?.longitude) return;

    setSaving(true);
    setSelectedPlace(place);
    try {
      const response: any = await apiUtils.post('/api/location', {
        label: place.address,
        address: place.address,
        coordinates: [place.latitude, place.longitude],
        description: place.address,
      });

      ToastAndroid.show(
        response?.success ? 'Location saved!' : 'Save failed',
        ToastAndroid.SHORT
      );
    } catch (error) {
      ToastAndroid.show('Error saving location', ToastAndroid.SHORT);
    } finally {
      setSaving(false);
    }
  };

  const handleGetSaveLocation = async () => {
    try {
      const response: any = await apiUtils.get('/api/location');
      if (response?.success && Array.isArray(response?.data)) {
        setSavedDestinations(response.data);
      } else {
        setSavedDestinations([]);
        ToastAndroid.show('Failed to fetch saved locations', ToastAndroid.SHORT);
      }
    } catch {
      setSavedDestinations([]);
      ToastAndroid.show('Error fetching saved locations', ToastAndroid.SHORT);
    }
  };

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          await getCurrentLocationWithAddress(setLocation, setIsLoading);
        }
      } else {
        await getCurrentLocationWithAddress(setLocation, setIsLoading);
      }
    } catch {
      ToastAndroid.show('Location permission denied', ToastAndroid.SHORT);
    }
  };

  const loadUser = async () => {
    try {
      const userString = await AsyncStorage.getItem('user');
      const isUser = await getCurrentUser?.('');
      if (userString && isUser) {
        setUser(JSON.parse(userString));
      }
    } catch {
      ToastAndroid.show('Failed to load user', ToastAndroid.SHORT);
    }
  };

  const fetchRide = async () => {
    try {
      const response: any = await apiUtils.get('/api/ride/active/ride');
      if (response?.success && response.data) {
        setActiveRide(response.data);
      } else {
        setActiveRide(null);
      }
    } catch {
      setActiveRide(null);
      ToastAndroid.show('Failed to fetch rides', ToastAndroid.SHORT);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        setIsLoading(true);
        await requestLocationPermission();
        await getCurrentLocationWithAddress(setLocation, setIsLoading);
        await loadUser();
        await handleGetSaveLocation();
        await fetchRide();
      } catch {
        ToastAndroid.show('Initialization failed', ToastAndroid.SHORT);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initialize();

    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();

    return () => {
      isMounted = false;
      shimmerAnim.setValue(0);
    };
  }, [isFocused]);

  const renderSavedDestination = ({ item, index }: { item: any; index: number }) => (
    <>
      <TouchableOpacity style={styles.savedDestination}>
        <View>
          <Text numberOfLines={1} style={styles.savedLabel}>{item.label}</Text>
          <Text numberOfLines={1} style={styles.savedAddress}>{item.address}</Text>
        </View>
        <Icon name="chevron-right" size={TEXT_SIZE.h1} color={THEAMCOLOR.SecondaryGray} />
      </TouchableOpacity>
      {index < savedDestinations.length - 1 && <View style={styles.lineHr} />}
    </>
  );

  const handleActiveRideNavigation = async () => {
    if (!activeRide) return;

    const status = await fetchRideDetails(setActiveRide);
    const pickupLocation = {
      address: activeRide.pickup?.address,
      coordinates: activeRide.pickup?.coordinates,
    };

    const dropLocation = {
      address: activeRide.drops?.[0]?.address,
      coordinates: activeRide.drops?.[0]?.coordinates,
    };

    const selectedRide = activeRide.vehicleType;
    const selectedPayment = activeRide.paymentMode;

    switch (status) {
      case RideStatus.REQUESTED:
        navigation.navigate('BookRideScreen', {
          pickupLocation,
          dropLocation,
          vehicleType: selectedRide,
          paymentMethod: selectedPayment,
          ride: activeRide,
        });
        break;

      case RideStatus.ACCEPTED:
        navigation.navigate('DriverApprochScreen', { ride: activeRide });
        break;

      case RideStatus.ONGOING:
        navigation.navigate('InRideScreen', { ride: activeRide });
        break;

      case RideStatus.COMPLETED:
        navigation.navigate('AfterRideScreen', { ride: activeRide });
        break;

      default:
        ToastAndroid.show(
          'Ride is not accepted yet. Please wait for the driver.',
          ToastAndroid.SHORT
        );
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={styles.headerContainer}>
            <View style={{ width: 50 }}>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => navigation.openDrawer()}
              >
                <Entypo name="dots-three-horizontal" size={20} />
              </TouchableOpacity>
            </View>
            <View style={styles.header}>
              <Text style={styles.headerText}>{user?.name ?? 'Your Name'}</Text>
              <View style={styles.locationRow}>
                <Image source={ImagePath.pin} style={styles.pinIcon} />
                <Text numberOfLines={1} style={styles.subHeaderText}>
                  {location?.address?.locality && location?.address?.city
                    ? `${location.address.locality}, ${location.address.city}`
                    : 'Unknown location'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.bottomSheet}>
            {/* <GooglePlacesAutocompleteComponent onSelect={handlePlaceSelect} currentLocation={location} /> */}
            <View style={styles.container2}>

              <GooglePlacesAutocomplete
                placeholder="Where to?"
                fetchDetails={true}
                debounce={200}
                enablePoweredByContainer={false}
                nearbyPlacesAPI="GooglePlacesSearch"
                minLength={2}
                timeout={10000}
                keyboardShouldPersistTaps="handled"
                listViewDisplayed="auto"
                keepResultsAfterBlur={false}
                currentLocation={false}
                currentLocationLabel="Current location"
                enableHighAccuracyLocation={true}
                onFail={(error) => console.warn('Google Places Autocomplete failed', error)}
                onNotFound={() => console.log('No results found')}
                onTimeout={() => console.warn('Google Places request timeout')}
                predefinedPlaces={[]}
                predefinedPlacesAlwaysVisible={false}
                styles={{
                  textInputContainer: {
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 10,
                    paddingHorizontal: 20,
                    backgroundColor: '#fff'
                  },
                  textInput: {
                    backgroundColor: '#fff',
                    fontWeight: '600',
                    fontSize: 16,
                    marginTop: 5,
                    width: '100%',
                    fontFamily: 'JakartaSans-Medium',
                    color: '#000',
                  },
                  listView: {
                    backgroundColor: 'white',
                    borderRadius: 10,
                  },
                }}
                query={{
                  key: GOOGLE_MAPS_APIKEY,
                  language: 'en',
                  types: 'geocode',
                }}
                // onPress={(data, details = null) => {
                //     if (!details?.geometry?.location) {
                //         console.warn('Missing geometry details!');
                //         return;
                //     }

                //     handlePress({
                //         latitude: details.geometry.location.lat,
                //         longitude: details.geometry.location.lng,
                //         address: data.description,
                //     });
                // }}
                onPress={(data, details = null) => {
                  // console.log(data, details)
                  if (!details?.geometry?.location) return;
                  const place = {
                    address: data.description,
                    latitude: details.geometry.location.lat,
                    longitude: details.geometry.location.lng,
                  };
                  console.log(location)
                  const picup = {
                    address: (location?.address?.landmark ?? location?.address?.locality) + "," + location?.address?.city + ", " + location?.address?.state + "," + location?.address?.pincode,
                    coordinates: { latitude: location?.latitude, longitude: location.longitude },
                  }
                  const drop = {
                    address: data?.description,
                    coordinates: { latitude: details.geometry.location.lat, longitude: details.geometry.location.lng },
                  }
                  handlePlaceSelect(place);
                  navigation.navigate('RideSelectionScreen', { drop, picup })
                }}
                GooglePlacesSearchQuery={{
                  rankby: 'distance',
                  radius: 1000,
                }}
                renderLeftButton={() => (
                  <View style={styles.iconWrapper}>
                    <Image
                      source={ImagePath.route} // ✅ Replace with your actual path/icon
                      style={{ width: 24, height: 24 }}
                      resizeMode="contain"
                    />
                  </View>
                )}
                textInputProps={{
                  placeholderTextColor: 'gray',
                  placeholder: 'Where do you want to go?',
                }}
              />
            </View>

            <View style={{ height: height * 0.55, borderRadius: 10, marginTop: 10, overflow: 'hidden' }}>
              <CabMap
                pickupCoords={
                  selectedPlace?.latitude && selectedPlace?.longitude
                    ? {
                      latitude: selectedPlace.latitude,
                      longitude: selectedPlace.longitude,
                    }
                    : null
                }
              />
            </View>

            {activeRide && activeRide?.status !== RideStatus.COMPLETED && (
              <TouchableOpacity onPress={handleActiveRideNavigation}>
                <View style={styles.rideCard}>
                  <View style={styles.headerRow}>
                    <View style={styles.vehicleRow}>
                      <Image source={ImagePath.auto} style={styles.vehicleImage} />
                      <Text style={styles.vehicleText}>{activeRide.vehicleType?.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.statusText}>{activeRide.status?.toUpperCase()}</Text>
                  </View>

                  <View style={styles.timelineSection}>
                    <View style={styles.timeline}>
                      <View style={styles.circle} />
                      <View style={styles.line} />
                      <View style={[styles.circle, { backgroundColor: '#06b700ff' }]} />
                    </View>
                    <View style={styles.addressSection}>
                      <Text numberOfLines={1} style={styles.addressText}>
                        {activeRide.pickup?.address ?? 'Pickup not available'}
                      </Text>
                      <Text numberOfLines={1} style={styles.addressText}>
                        {activeRide.drops?.[0]?.address ?? 'Drop not available'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.bottomRow}>
                    <Text style={styles.pinBox}>PIN: {activeRide.pin}</Text>
                    <Text style={styles.priceText}>Fare: ₹{activeRide?.fare?.toFixed(2) ?? '0.00'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}

            <View style={styles.savedDestinationsContainer}>
              <View style={styles.savedHeader}>
                <Text style={styles.sectionTitle}>Saved Destinations</Text>
              </View>
              {savedDestinations.length === 0 ? (
                <Text style={{ textAlign: 'center' }}>No Saved Locations</Text>
              ) : (
                <FlatList
                  data={savedDestinations}
                  renderItem={renderSavedDestination}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  style={{ backgroundColor: '#fff', padding: 5, borderRadius: 15 }}
                />
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffffff' },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  menuButton: {
    borderRadius: 100,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'lightgray',
    height: 40,
    width: 40,
  },
  header: { padding: SPACING.sm },
  headerText: {
    fontFamily: THEAMFONTFAMILY.LatoRegular,
    fontSize: TEXT_SIZE.body,
    lineHeight: LINE_HEIGHT.h3,
    color: THEAMCOLOR.PureBlack,
  },
  subHeaderText: {
    fontFamily: THEAMFONTFAMILY.NunitoRegular,
    fontSize: TEXT_SIZE.small,
    lineHeight: LINE_HEIGHT.small,
    color: THEAMCOLOR.SecondaryGray,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  pinIcon: { width: 10, height: 15, resizeMode: 'contain' },
  bottomSheet: {
    flex: 1,
    backgroundColor: THEAMCOLOR.PureWhite,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginTop: -RADIUS.xl,
  },
  sectionTitle: {
    fontFamily: THEAMFONTFAMILY.LatoRegular,
    fontSize: TEXT_SIZE.body,
    fontWeight: '600',
    lineHeight: LINE_HEIGHT.h2,
    color: THEAMCOLOR.PureBlack,
    marginVertical: SPACING.sm,
  },
  savedDestinationsContainer: {
    flex: 1,
    marginBottom: 30,
  },
  savedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  savedDestination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    padding: 15,
  },
  savedLabel: {
    fontFamily: THEAMFONTFAMILY.LatoRegular,
    fontSize: TEXT_SIZE.body,
    lineHeight: LINE_HEIGHT.body,
    color: THEAMCOLOR.PrimaryGreen,
  },
  savedAddress: {
    fontFamily: THEAMFONTFAMILY.NunitoRegular,
    fontSize: TEXT_SIZE.small,
    lineHeight: LINE_HEIGHT.body,
    color: THEAMCOLOR.SecondaryGray,
  },
  lineHr: {
    alignSelf: 'center',
    width: width * 0.87,
    height: 1,
    borderStyle: 'dashed',
    borderBottomWidth: 1,
    borderBottomColor: THEAMCOLOR.SecondaryGray,
  },
  rideCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 5,
    marginVertical: 12,
    ...SHADOW.light,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleImage: {
    width: 45,
    height: 45,
    resizeMode: 'contain',
    marginRight: 8,
  },
  vehicleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  timelineSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  timeline: {
    width: 20,
    alignItems: 'center',
  },
  circle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#c45959ff',
  },
  line: {
    width: 2,
    height: 28,
    backgroundColor: '#ccc',
    marginVertical: 2,
  },
  addressSection: {
    flex: 1,
    paddingLeft: 12,
  },
  addressText: {
    fontSize: 12,
    color: '#222',
    fontWeight: '400',
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pinBox: {
    backgroundColor: '#ffffffff',
    color: THEAMCOLOR.PrimaryGreen,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontWeight: '600',
    fontSize: 14,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5
  },
  selectedPlaceContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  loader: {
    position: 'absolute',
    right: 16,
    top: 12,
  },
  container2: {
    width: '100%',
    // height:250,
    borderWidth: 1,
    borderColor: '#f0eeeeff',
    borderRadius: 10
  },
});

export default HomeScreen;
