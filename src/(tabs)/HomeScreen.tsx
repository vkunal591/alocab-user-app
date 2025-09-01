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

const { width, height } = Dimensions.get('screen');

export interface Location {
  address: string;
  coordinates: [number, number];
}

export interface RouteDetails {
  pickup: Location;
  drops: Location[];
  vehicleType: string;
}

const rideOptions = [
  { id: 'auto', name: 'Auto', image: ImagePath.auto },
];

const savedDestinationsLocal = [
  {
    id: '1',
    label: 'Home',
    address: '223, A Pocket, Dwarka, New Delhi',
    coordinates: { lat: 28.5916, lng: 77.0460 },
  },
  {
    id: '2',
    label: 'Work',
    address: 'E 89, Kamla Nagar, Delhi',
    coordinates: { lat: 28.6863, lng: 77.2089 },
  },
  {
    id: '3',
    label: 'Gym',
    address: '12, Rajouri Garden, New Delhi',
    coordinates: { lat: 28.6425, lng: 77.1225 },
  },
  {
    id: '4',
    label: "Friend's Place",
    address: '55, Saket, New Delhi',
    coordinates: { lat: 28.5286, lng: 77.2204 },
  },
  {
    id: '5',
    label: "Parents' House",
    address: '103, Rohini Sector 9, New Delhi',
    coordinates: { lat: 28.7294, lng: 77.1276 },
  },
  {
    id: '6',
    label: 'Mall',
    address: '3rd Floor, Select Citywalk, Saket, New Delhi',
    coordinates: { lat: 28.5273, lng: 77.2195 },
  },
];

const HomeScreen = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation<any>();
  const { getCurrentUser }: any = useAuth();
  const [location, setLocation] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [savedDestinations, setSavedDestinations] = useState<any>(null);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const [saving, setSaving] = useState(false);
  const [activeRide, setActiveRide] = useState<any>(null)

  const handlePlaceSelect = async (place: any) => {
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
    } catch {
      ToastAndroid.show('Error saving location', ToastAndroid.SHORT);
    } finally {
      setSaving(false);
    }
  };

  const handleGetSaveLocation = async () => {
    setIsLoading(true);
    try {
      const response: any = await apiUtils.get('/api/location');
      if (response?.success) {
        setSavedDestinations(response?.data); // Uncomment when API is ready
      } else {
        ToastAndroid.show('Failed to fetch saved locations', ToastAndroid.SHORT);
      }
    } catch {
      ToastAndroid.show('Error fetching saved locations', ToastAndroid.SHORT);
    } finally {
      setSaving(false);
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
      const isUser = await getCurrentUser('');
      if (userString && isUser) {
        setUser(JSON.parse(userString));
      }
    } catch {
      ToastAndroid.show('Failed to load user', ToastAndroid.SHORT);
    }
  };
  const fetchRide = async (isRiding = false) => {
    try {
      const url = "/api/ride/active/ride"
      const response: any = await apiUtils.get(url);
      console.log(response)
      if (response.success && response.data) {
        setActiveRide(response.data);
      } else {
        setActiveRide(null)
      }
    } catch (error) {
      console.log(error)
      ToastAndroid.show('Failed to fetch rides', ToastAndroid.SHORT);
      setActiveRide(null)
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
        await fetchRide()
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

  useEffect(() => {
    console.log(selectedPlace)

  }, [setSelectedPlace])


  const renderRideOption = ({ item }: { item: { id: string; name: string; image: string } }) => (
    <TouchableOpacity onPress={() => navigation.navigate('RideSelectionScreen')}>
      <View style={styles.rideOption}>
        <Image source={item.image || ImagePath.auto} style={styles.rideImage} />
        <Text style={styles.rideText}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView>
          <View style={styles.headerContainer}>
            <View style={{ width: 50 }}>
              <TouchableOpacity
                style={{
                  borderRadius: 100,
                  borderWidth: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderColor: 'lightgray',
                  height: 40,
                  width: 40,
                }}
                onPress={() => navigation.openDrawer()}
              >
                <Entypo name="dots-three-horizontal" size={20} />
              </TouchableOpacity>
            </View>
            <View style={styles.header}>
              <Text style={styles.headerText}>{user?.name ?? "Your Name"}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Image source={ImagePath.pin} style={{ width: 10, height: 15, resizeMode: 'contain' }} />
                <Text
                  numberOfLines={1}
                  style={styles.subHeaderText}
                >
                  {location?.address?.locality && location?.address?.city
                    ? `${location.address.locality}, ${location.address.city}`
                    : 'Unknown location'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.bottomSheet}>
            <GooglePlacesAutocompleteComponent onSelect={handlePlaceSelect} currentLocation={location} />

            <View style={{ height: height * 0.55, borderRadius: 10, marginTop: 10, overflow: 'hidden' }}>
              <CabMap
                pickupCoords={
                  selectedPlace?.longitude && selectedPlace?.latitude
                    ? {
                      latitude: selectedPlace.latitude,
                      longitude: selectedPlace.longitude,
                    }
                    : null
                }
              />
            </View>

            {/* <Text style={styles.sectionTitle}>Ride the way you want</Text>
            <FlatList
              data={rideOptions}
              renderItem={renderRideOption}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.rideOptionsList}
            /> */}

            {activeRide && activeRide?.status !== RideStatus.COMPLETED && (
              <TouchableOpacity
                onPress={async () => {
                  const pickupLocation = {
                    address: activeRide.pickup.address,
                    coordinates: activeRide.pickup.coordinates,
                  };

                  const dropLocation = {
                    address: activeRide.drops[0]?.address,
                    coordinates: activeRide.drops[0]?.coordinates,
                  };

                  const selectedRide = activeRide.vehicleType;
                  const selectedPayment = activeRide.paymentMode;
                  const status = await fetchRideDetails(setActiveRide); // Make sure to await this
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
                        'Ride is not accepted, Please wait for the driver to accept the ride',
                        ToastAndroid.SHORT
                      );
                      break;
                  }

                }}
              >
                <View style={styles.rideCard}>
                  {/* Header with vehicle and PIN */}
                  <View style={styles.headerRow}>
                    <View style={styles.vehicleRow}>
                      <Image source={ImagePath.auto} style={styles.vehicleImage} />
                      <Text style={styles.vehicleText}>{activeRide.vehicleType.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.statusText}>{activeRide.status.toUpperCase()}</Text>
                  </View>

                  {/* Timeline Section */}
                  <View style={styles.timelineSection}>
                    {/* Vertical Dots & Line */}
                    <View style={styles.timeline}>
                      <View style={styles.circle} />
                      <View style={styles.line} />
                      <View style={[styles.circle, { backgroundColor: '#06b700ff' }]} />
                    </View>

                    {/* Address Info */}
                    <View style={styles.addressSection}>
                      <Text numberOfLines={1} style={styles.addressText}>{activeRide.pickup.address}</Text>

                      <Text numberOfLines={1} style={styles.addressText}>{activeRide.drops[0]?.address}</Text>
                    </View>
                  </View>

                  {/* Bottom Row */}
                  <View style={styles.bottomRow}>
                    <Text style={styles.pinBox}>PIN: {activeRide.pin}</Text>

                    <Text style={styles.priceText}>Fare: ₹{activeRide?.fare}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}



            <View style={styles.savedDestinationsContainer}>
              <View style={styles.savedHeader}>
                <Text style={styles.sectionTitle}>Saved Destinations</Text>
              </View>
              {savedDestinations?.length === 0 ? <Text style={{ textAlign: 'center' }}>No Saved Location</Text> :
                < FlatList
                  data={savedDestinations}
                  renderItem={renderSavedDestination}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  style={{ backgroundColor: '#fff', padding: 5, borderRadius: 15 }}
                />}
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  header: {
    padding: SPACING.sm,
  },
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
  rideOptionsList: {
    paddingVertical: SPACING.sm,
  },
  rideOption: {
    alignItems: 'center',
    marginRight: SPACING.md,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    ...SHADOW.light,
  },
  rideImage: {
    width: 70,
    height: 60,
    resizeMode: 'contain',
    marginBottom: 5,
  },
  rideText: {
    fontFamily: THEAMFONTFAMILY.LatoRegular,
    fontSize: TEXT_SIZE.small,
    lineHeight: LINE_HEIGHT.small,
    color: THEAMCOLOR.PureBlack,
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
    width: '100%',
  },
  savedAddress: {
    flex: 1,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 5,
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
  pinBox: {
    backgroundColor: '#ffffffff',
    color: THEAMCOLOR.PrimaryGreen,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontWeight: 'semibold',
    fontSize: 14,
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
  label: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
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
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'semibold',
    color: '#000',
  },
});


export default HomeScreen;
