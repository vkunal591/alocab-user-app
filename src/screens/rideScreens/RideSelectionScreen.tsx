import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  Image,
  ToastAndroid,
  Animated,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImagePath from '../../constants/ImagePath';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import apiUtils from '../../utils/apiUtils';
import Icon from 'react-native-vector-icons/Ionicons';
import { TextInput } from 'react-native';

const { width, height } = Dimensions.get('screen');
const COLLAPSED_HEIGHT = 160;
const EXPANDED_HEIGHT = height * 0.45;

const THEAMCOLOR = {
  PrimaryGreen: '#4CAF50',
  PrimaryRed: '#FF3D00',
};

// Mock reverse geocoding
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  return new Promise((resolve) =>
    setTimeout(() => resolve(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`), 500)
  );
}

const RideSelectionScreen = () => {
  const navigation: any = useNavigation();
  const isFocused = useIsFocused();
  const route: any = useRoute();

  const picup = route.params?.picup;
  const drop = route.params?.drop;

  const [pickupLocation, setPickupLocation] = useState({
    address: picup?.address ?? 'Initial Pickup',
    coordinates: picup?.coordinates ?? { latitude: 28.61, longitude: 77.2 },
  });

  const [dropLocation, setDropLocation] = useState({
    address: drop?.address ?? 'Initial Drop',
    coordinates: drop?.coordinates ?? { latitude: 28.625, longitude: 77.215 },
  });
  const [locationSaveModal, setLocationSaveModal] = useState(false)
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [locationType, setLocationType] = useState<'pickup' | 'drop' | null>(null);
  const [selectedRide, setSelectedRide] = useState<'auto'>('auto');
  const [selectedPayment, setSelectedPayment] = useState<'cash' | 'online'>('cash');
  const [savedDestinations, setSavedDestinations] = useState<any[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [fareData, setFareData] = useState<{
    fare: string;
    distance_km: string;
    duration_min: string;
    vehicleType: string;
  } | null>(null);
  const [loadingFare, setLoadingFare] = useState(false);
  const [label, setLabel] = useState('');

  const mapRef = useRef<MapView>(null);
  const maxTranslateY = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
  const pan = useRef(new Animated.Value(maxTranslateY)).current;
  const [isExpanded, setIsExpanded] = useState(false);


  const handleSaveLabel = async () => {
    if (!label.trim()) {
      ToastAndroid.show("Please enter a valid label", ToastAndroid.SHORT);
      return;
    }
    const locaion = locationType === 'drop' ? dropLocation : pickupLocation
    const payload = {
      label: label.trim(),
      address: locaion?.address,
      coordinates: {
        latitude: locaion.coordinates.latitude,
        longitude: locaion.coordinates.longitude,
      },
      description: 'User-saved location',
      status: 'active',
    };

    try {
      // Replace this with your real endpoint
      const response: any = await apiUtils.post(`/api/location`, payload);
      console.log(response, payload)
      if (response?.success) {
        ToastAndroid.show("Location saved successfully", ToastAndroid.SHORT);
        setLabel('');
        setLocationSaveModal(false);
        // Optionally update local state/UI
        handleGetSaveLocation(); // e.g., refetch updated list
      } else {
        ToastAndroid.show("Failed to save location", ToastAndroid.SHORT);
      }
    } catch (error) {
      // console.error("Save Location Error:", error);
      ToastAndroid.show("An error occurred", ToastAndroid.SHORT);
    }
  };


  const fetchFare = async (vehicleType: string) => {
    if (!pickupLocation || !dropLocation) return;
    setLoadingFare(true);
    try {
      const response: any = await apiUtils.post('/api/fare/farebydistance', {
        pickup: pickupLocation.coordinates,
        drop: dropLocation.coordinates,
        vehicleType,
      });
      console.log(response)
      if (response) {
        setFareData({
          fare: Number(response.fare)?.toFixed(2) ?? '0.00',
          distance_km: response.distance_km,
          duration_min: response.duration_min,
          vehicleType: response.vehicleType ?? vehicleType,
        });
      } else {
        ToastAndroid.show(response?.error || 'Failed to calculate fare', ToastAndroid.SHORT);
      }
    } catch {
      ToastAndroid.show('Error fetching fare', ToastAndroid.SHORT);
    } finally {
      setLoadingFare(false);
    }
  };

  const handleGetSaveLocation = async () => {
    setIsLoadingSaved(true);
    try {
      const response: any = await apiUtils.get('/api/location');
      if (response?.success && Array.isArray(response.data)) {
        setSavedDestinations(response.data);
      } else {
        ToastAndroid.show('Failed to fetch saved locations', ToastAndroid.SHORT);
      }
    } catch {
      ToastAndroid.show('Error fetching saved locations', ToastAndroid.SHORT);
    } finally {
      setIsLoadingSaved(false);
    }
  };

  const handleDragMarker = async (
    type: 'pickup' | 'drop',
    coord: { latitude: number; longitude: number }
  ) => {
    const addr = await reverseGeocode(coord.latitude, coord.longitude);
    const updated = { address: addr, coordinates: coord };
    type === 'pickup' ? setPickupLocation(updated) : setDropLocation(updated);
  };

  const handleSelectLocation = (loc: any) => {
    if (locationType === 'pickup') setPickupLocation(loc);
    else if (locationType === 'drop') setDropLocation(loc);
    setModalVisible(false);
  };

  const handleBookRide = async () => {
    try {
      if (!selectedRide || !selectedPayment || !pickupLocation || !dropLocation) {
        throw new Error('Please fill in all required fields');
      }

      const bookRidePayload = {
        vehicleType: selectedRide,
        paymentMode: selectedPayment,
        pickup: {
          address: pickupLocation.address,
          coordinates: [
            pickupLocation.coordinates.latitude,
            pickupLocation.coordinates.longitude,
          ],
        },
        drops: [
          {
            address: dropLocation.address,
            coordinates: [
              dropLocation.coordinates.latitude,
              dropLocation.coordinates.longitude,
            ],
          },
        ],
      };

      const response: any = await apiUtils.post('/api/ride', bookRidePayload);
      if (response?.success) {
        ToastAndroid.show('Ride booked successfully!', ToastAndroid.SHORT);
        navigation.replace('BookRideScreen', {
          pickupLocation,
          dropLocation,
          vehicleType: selectedRide,
          paymentMethod: selectedPayment,
          ride: response.ride,
        });
      } else {
        ToastAndroid.show(response?.message || 'Failed to book ride', ToastAndroid.SHORT);
      }
    } catch (error: any) {
      ToastAndroid.show(error.message || 'Booking failed', ToastAndroid.LONG);
    }
  };

  const toggleBottomSheet = () => {
    const toValue = isExpanded ? maxTranslateY : 0;
    Animated.timing(pan, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsExpanded(!isExpanded));
  };

  const rideOptions = [{ type: 'auto', eta: '3 min', price: 120, icon: ImagePath.auto }];
  const paymentIcon = selectedPayment === 'cash' ? ImagePath.money : ImagePath.upi;

  useEffect(() => {
    if (pickupLocation && dropLocation && selectedRide) {
      fetchFare(selectedRide);
    }
  }, [pickupLocation, dropLocation, selectedRide]);

  useEffect(() => {
    if (isFocused) handleGetSaveLocation();
  }, [isFocused]);

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: pickupLocation.coordinates.latitude,
          longitude: pickupLocation.coordinates.longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }}
      >
        <Marker
          coordinate={pickupLocation.coordinates}
          pinColor="green"
          draggable
          onDragEnd={(e) => handleDragMarker('pickup', e.nativeEvent.coordinate)}
        />
        <Marker
          coordinate={dropLocation.coordinates}
          pinColor="red"
          draggable
          onDragEnd={(e) => handleDragMarker('drop', e.nativeEvent.coordinate)}
        />
        <MapViewDirections
          origin={pickupLocation.coordinates}
          destination={dropLocation.coordinates}
          apikey={`${process.env.MAPS_API_KEY}`}
          strokeWidth={4}
          strokeColor={THEAMCOLOR.PrimaryGreen}
          onReady={(result) => {
            mapRef.current?.fitToCoordinates(result.coordinates, {
              edgePadding: { top: 100, bottom: 100, left: 50, right: 50 },
              animated: true,
            });

            const leg = result?.legs?.[0];
            if (leg) {
              setPickupLocation({
                address: leg.start_address || pickupLocation.address,
                coordinates: {
                  latitude: leg.start_location?.lat ?? pickupLocation.coordinates.latitude,
                  longitude: leg.start_location?.lng ?? pickupLocation.coordinates.longitude,
                },
              });
              setDropLocation({
                address: leg.end_address || dropLocation.address,
                coordinates: {
                  latitude: leg.end_location?.lat ?? dropLocation.coordinates.latitude,
                  longitude: leg.end_location?.lng ?? dropLocation.coordinates.longitude,
                },
              });
            }

            setDistance(result.distance ?? null);
            setDuration(result.duration ?? null);
          }}
        />
      </MapView>

      {(distance !== null && duration !== null) && (
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Icon name="location-outline" size={18} />
            <Text style={styles.detailsText}>{distance.toFixed(2)} km</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="timer-outline" size={18} />
            <Text style={styles.detailsText}>{Math.ceil(duration)} mins</Text>
          </View>
        </View>
      )}

      <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: pan }] }]}>
        <TouchableOpacity onPress={toggleBottomSheet} style={styles.dragHeader} activeOpacity={0.7}>
          <View style={styles.dragHandle} />
        </TouchableOpacity>

        <View style={styles.iconColumn}>
          <View style={styles.greenCircle} />
          <LinearGradient
            colors={[THEAMCOLOR.PrimaryGreen, THEAMCOLOR.PrimaryRed]}
            style={styles.verticalLine}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
          <View style={styles.redCircle} />
        </View>

        <View style={styles.textInputs}>
          <TouchableOpacity
            style={styles.inputBox}
            onPress={() => {
              setLocationType('pickup');
              setModalVisible(true);
            }}
          >
            <Text style={{ width: width * .7 }} numberOfLines={1}>{pickupLocation.address}</Text>
            <TouchableOpacity style={{ padding: 5 }} onPress={() => {
              setLocationSaveModal(!locationSaveModal)
              setLocationType('pickup');

            }}>
              <Icon name='bookmark' size={22} color={THEAMCOLOR.PrimaryGreen} style={{ marginRight: 20, marginLeft: 10 }} />
            </TouchableOpacity>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.inputBox}
            onPress={() => {
              setLocationType('drop');
              setModalVisible(true);
            }}
          >
            <Text style={{ width: width * 0.7 }} numberOfLines={1}>{dropLocation.address}</Text>
            <TouchableOpacity style={{ padding: 5 }} onPress={() => {
              setLocationSaveModal(!locationSaveModal);
              setLocationType('drop');
            }
            }>
              <Icon name='bookmark' size={22} color={THEAMCOLOR.PrimaryGreen} style={{ marginRight: 20, marginLeft: 10 }} />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        <View style={styles.rideOptionsRow}>
          {rideOptions.map((ride) => (
            <TouchableOpacity
              key={ride.type}
              onPress={() => {
                setSelectedRide(ride.type as any);
                fetchFare(ride.type);
              }}
              style={[
                styles.rideOption,
                selectedRide === ride.type && styles.rideOptionSelected,
              ]}
            >
              <Image source={ride.icon} style={styles.rideIcon} />
              <Text style={styles.rideFareText}>₹{fareData?.fare ?? '0.00'}</Text>
              <Text style={styles.rideEtaText}>
                {loadingFare ? 'Loading...' : fareData ? `${fareData.duration_min} min, ${fareData.distance_km} km` : ride.eta}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.paymentSection}>
          <TouchableOpacity
            style={styles.paymentButton}
            onPress={() => setSelectedPayment((prev) => (prev === 'cash' ? 'online' : 'cash'))}
          >
            <Image source={paymentIcon} style={styles.paymentIcon} />
            <Text>{selectedPayment.toUpperCase()}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bookButton} onPress={handleBookRide}>
            <Text style={styles.bookText}>Book Ride</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {locationType === 'pickup' ? 'Pickup Location' : 'Drop Location'}
            </Text>
            {savedDestinations.map((dest) => (
              <TouchableOpacity
                key={dest.id}
                style={styles.modalItem}
                onPress={() => handleSelectLocation(dest)}
              >
                <Text style={styles.modalLabel}>{dest.label}</Text>
                <Text>{dest.address}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalClose}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


      <Modal
        visible={locationSaveModal}
        transparent
        animationType="fade"
        onRequestClose={() => setLocationSaveModal(false)}
      >
        <View style={styles.overlayBackground}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {locationType === 'pickup' ? 'Save Pickup Location' : 'Save Drop Location'}
            </Text>

            <TextInput
              placeholder="Enter label (e.g., Home, Office)"
              placeholderTextColor="#aaa"
              value={label}
              onChangeText={setLabel}
              style={styles.input}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setLocationSaveModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveLabel}
              >
                <Text style={[styles.buttonText, { color: '#fff' }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView >
  );
};

export default RideSelectionScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: EXPANDED_HEIGHT,
    bottom: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    elevation: 10,
  },
  dragHeader: { padding: 10 },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    borderRadius: 3,
  },
  iconColumn: {
    position: 'absolute',
    top: 50,
    left: 26,
    alignItems: 'center',
  },
  greenCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEAMCOLOR.PrimaryGreen,
  },
  verticalLine: {
    width: 2,
    height: 50,
    marginVertical: 4,
  },
  redCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEAMCOLOR.PrimaryRed,
  },
  textInputs: {
    marginLeft: 40,
    marginBottom: 10,
  },
  inputBox: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 6,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rideOptionsRow: {
    marginVertical: 10,
    flexDirection: 'row',
  },
  rideOption: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    alignItems: 'center',
    width: 120,
  },
  rideOptionSelected: {
    borderColor: THEAMCOLOR.PrimaryGreen,
    backgroundColor: '#e0f2f1',
  },
  rideIcon: { width: 50, height: 50, resizeMode: 'contain' },
  rideFareText: { fontWeight: 'bold', color: THEAMCOLOR.PrimaryGreen },
  rideEtaText: { fontSize: 11, fontWeight: 'bold', marginTop: 4 },
  paymentSection: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, paddingTop: 10,
    borderTopWidth: 1, borderColor: '#ecebeb',
  },
  paymentButton: {
    flexDirection: 'row', alignItems: 'center',
  },
  paymentIcon: { width: 24, height: 24, marginRight: 8 },
  bookButton: {
    backgroundColor: THEAMCOLOR.PrimaryGreen, paddingHorizontal: 30, paddingVertical: 10, borderRadius: 8,
  },
  bookText: { color: 'white', fontWeight: 'bold' },
  modalOverlay: {
    flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContainer: {
    backgroundColor: 'white', padding: 20, borderTopLeftRadius: 16, borderTopRightRadius: 16,
  },
  modalTitle: { fontWeight: 'bold', fontSize: 18, marginBottom: 15 },
  modalItem: { marginBottom: 15 },
  modalLabel: { fontWeight: 'bold' },
  modalClose: {
    marginTop: 12, textAlign: 'center', color: THEAMCOLOR.PrimaryGreen,
  },
  detailsContainer: {
    position: 'absolute', top: 50, left: 10, backgroundColor: '#ffffffee',
    borderRadius: 20, padding: 10, flexDirection: 'row', gap: 20, elevation: 4,
  },
  detailRow: {
    flexDirection: 'row', alignItems: 'center', marginRight: 16,
  },
  detailsText: {
    marginLeft: 5, fontWeight: '600',
  },
  overlayBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    marginBottom: 20,
    color: '#000',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f2f2f2',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
