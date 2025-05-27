import { Dimensions, StyleSheet, Text, TouchableOpacity, View, ScrollView, Image, Modal, ToastAndroid } from 'react-native';
import React, { useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { THEAMCOLOR, THEAMFONTFAMILY } from '../../assets/theam/theam';
import BackButton from '../../Components/common/BackButton';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import ImagePath from '../../constants/ImagePath';
import { RouteDetails } from '../../(tabs)/HomeScreen';
import apiUtils from '../../utils/apiUtils';
import Icon from 'react-native-vector-icons/Feather';

const { width, height } = Dimensions.get('screen');

const savedDestinations = [
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

const RideSelectionScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const scrollViewRef = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [locationType, setLocationType] = useState(null); // To track pickup or drop-off selection
  const [selectedRide, setSelectedRide] = useState('auto');
  const [selectedPayment, setSelectedPayment] = useState('Cash');
  const [pickupLocation, setPickupLocation] = useState(
    route.params?.pickupLocation || {
      address: '223, A Pocket, Dwarka, New Delhi',
      coordinates: { latitude: 28.6119, longitude: 77.2190 },
    }
  );
  const [dropLocation, setDropLocation] = useState(
    route.params?.dropLocation || {
      address: 'E 99, Kamla Nagar, Delhi',
      coordinates: { latitude: 28.6319, longitude: 77.2290 },
    }
  );

  const rideOptions = [
    { type: 'auto', eta: '4 min away', dropTime: '3:44', price: 122, icon: ImagePath.auto },
    // Add other ride options as needed
  ];

  const paymentOptions = [
    { id: 'cash', label: 'Cash', icon: ImagePath.money },
    { id: 'online', label: 'Online', icon: ImagePath.upi },
    // { id: 'PhonePay', label: 'PhonePay', icon: ImagePath.phonepay },
    // { id: 'GPay', label: 'GPay', icon: ImagePath.gpay },
    // { id: 'Wallet', label: 'Wallet', icon: ImagePath.wallet2 },
    // { id: 'Card', label: 'Card', icon: ImagePath.card },
  ];

  const selectedPaymentIcon = paymentOptions.find((option) => option.id === selectedPayment)?.icon || ImagePath.money;

  const handleSelectLocation = (destination) => {
    const newLocation = {
      address: destination.address,
      coordinates: { latitude: destination.coordinates.lat, longitude: destination.coordinates.lng },
    };
    if (locationType === 'pickup') {
      setPickupLocation(newLocation);
    } else if (locationType === 'drop') {
      setDropLocation(newLocation);
    }
    setModalVisible(false);
    setLocationType(null);
  };

  const openSavedDestinations = (type) => {
    setLocationType(type);
    setModalVisible(true);
  };

  const handleBookRide = async () => {
    try {
      // Validate inputs before making API call
      if (!selectedRide || !selectedPayment || !pickupLocation || !dropLocation) {
        throw new Error('Please fill in all required fields');
      }

      console.log('vehicleType:', selectedRide, 'paymentMode:', selectedPayment, 'pickup:', pickupLocation, 'drops:', dropLocation);

      const bookRidePayload = {
        vehicleType: selectedRide,
        paymentMode: selectedPayment.toLowerCase(),
        pickup: {
          address: pickupLocation.address,
          coordinates: [
            pickupLocation.coordinates.latitude,
            pickupLocation.coordinates.longitude,
          ],
        },
        drops: [{
          address: dropLocation.address,
          coordinates: [
            dropLocation.coordinates.latitude,
            dropLocation.coordinates.longitude,
          ],
        }],
      };

      const response: any = await apiUtils.post('/api/ride', bookRidePayload);
      console.log('API Response:', response);
      if (response?.success) {
        ToastAndroid.show('Ride booked successfully!', ToastAndroid.SHORT);

        navigation.navigate('BookRideScreen', {
          pickupLocation,
          dropLocation,
          vehicleType: selectedRide,
          paymentMethod: selectedPayment,
        });
      } else {
       ToastAndroid.show(response?.message || 'Failed to book ride',ToastAndroid.SHORT);
      }
    } catch (error:any) {
      console.error('Error booking ride:', error);
      // Type guard for error handling
      const errorMessage = error.message
      ToastAndroid.show(errorMessage, ToastAndroid.LONG)
      navigation.navigate('BookRideScreen');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        style={styles.map}
        region={{
          latitude: (pickupLocation.coordinates.latitude + dropLocation.coordinates.latitude) / 2,
          longitude: (pickupLocation.coordinates.longitude + dropLocation.coordinates.longitude) / 2,
          latitudeDelta: Math.abs(pickupLocation.coordinates.latitude - dropLocation.coordinates.latitude) * 2 || 0.05,
          longitudeDelta: Math.abs(pickupLocation.coordinates.longitude - dropLocation.coordinates.longitude) * 2 || 0.05,
        }}
      >
        <Marker coordinate={pickupLocation.coordinates} pinColor="green" title="Pickup" description={pickupLocation.address} />
        <Marker coordinate={dropLocation.coordinates} pinColor="red" title="Drop-off" description={dropLocation.address} />
        <Polyline coordinates={[pickupLocation.coordinates, dropLocation.coordinates]} strokeColor="#00FF00" strokeWidth={3} />
      </MapView>
      <BackButton />
      <View style={styles.spacer} />
      <View style={styles.bottomContainer}>
        <View style={styles.pathRow}>
          <View style={styles.iconColumn}>
            <View style={styles.greenCircle} />
            <LinearGradient colors={['#00FF00', '#FF0000']} style={styles.verticalLine} />
            <View style={styles.redCircle} />
          </View>
          <View style={styles.textColumn}>
            <TouchableOpacity onPress={() => openSavedDestinations('pickup')}>
              <Text style={styles.location} numberOfLines={2} ellipsizeMode="tail">
                {pickupLocation.address}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openSavedDestinations('drop')}>
              <Text style={styles.location} numberOfLines={2} ellipsizeMode="tail">
                {dropLocation.address}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.optionsRow}>
          {/* <TouchableOpacity style={styles.optionButton}>
            <Image source={ImagePath.calender} style={styles.optionIcon} />
            <Text style={styles.optionText}>Schedule for later</Text>
            <Ionicons name="chevron-forward" size={20} color="#000" />
          </TouchableOpacity> */}
          <TouchableOpacity style={styles.optionButton} onPress={() => setModalVisible(true)}>
            <Image source={selectedPaymentIcon} style={styles.optionIcon} />
            <Text style={styles.optionText}>{selectedPayment}</Text>
            <Ionicons name="chevron-forward" size={20} color="#000" />
          </TouchableOpacity>
        </View>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {rideOptions.map((ride, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.rideOption, selectedRide === ride.type && styles.selectedRideOption]}
              onPress={() => setSelectedRide(ride.type)}
            >
              <Image source={ride.icon} style={styles.rideIcon} />
              <View style={styles.rideDetails}>
                <Text style={styles.rideType}>{ride.type}</Text>
                <Text style={styles.rideInfo}>{ride.eta} • Drop time {ride.dropTime}</Text>
              </View>
              <Text style={styles.ridePrice}>₹{ride.price}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookRide}>
          <Text style={styles.bookButtonText}>Book Ride</Text>
        </TouchableOpacity>
      </View>
      {/* Payment Method Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible && locationType === null}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.modalTitle}>Select your payment method</Text>
            </View>
            {paymentOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.radioOption}
                onPress={() => {
                  setSelectedPayment(option.id);
                  setModalVisible(false);
                }}
              >
                <View style={styles.radioContent}>
                  <Image source={option.icon} style={styles.radioIcon} />
                  <Text style={styles.radioText}>{option.label}</Text>
                </View>
                <View style={styles.radioCircle}>
                  {selectedPayment === option.id && <View style={styles.radioSelected} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
      {/* Saved Destinations Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible && locationType !== null}
        onRequestClose={() => {
          setModalVisible(false);
          setLocationType(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setModalVisible(false);
                setLocationType(null);
              }}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {locationType === 'pickup' ? 'Select Pickup Location' : 'Select Drop-off Location'}
            </Text>
            <ScrollView>
              {savedDestinations.map((destination) => (
                <TouchableOpacity
                  key={destination.id}
                  style={styles.savedDestinationItem}
                  onPress={() => handleSelectLocation(destination)}
                >
                  <View style={styles.locationContent}>
                    <Image
                      source={ImagePath.rideHistory}
                      style={[styles.radioIcon, { tintColor: THEAMCOLOR.SecondaryGray }]}
                    />
                    <View style={styles.locationTextContainer}>
                      <Text style={styles.radioText}>{destination.label}</Text>
                      <Text style={styles.locationSubText}>{destination.address}</Text>
                    </View>
                  </View>
                  <Icon name="bookmark" size={18} color={THEAMCOLOR.SecondaryGray} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default RideSelectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: width,
    height: height * 0.35,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: -1,
  },
  spacer: {
    height: height * 0.3,
    backgroundColor: 'transparent',
  },
  bottomContainer: {
    height: height * 0.6,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  pathRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 15,
    marginTop: -40,
    marginHorizontal: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  iconColumn: {
    alignItems: 'center',
    marginRight: 10,
  },
  greenCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'green',
  },
  redCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'red',
  },
  verticalLine: {
    width: 2,
    height: 30,
    marginVertical: 2,
  },
  textColumn: {
    justifyContent: 'space-between',
    height: 60,
    flex: 1,
  },
  location: {
    fontSize: 12,
    color: '#333',
    marginVertical: 2,
    fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 15,
    marginBottom: 15,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    flex: 1,
  },
  optionIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  optionText: {
    fontSize: 11,
    color: '#000',
    marginHorizontal: 5,
    flex: 1,
    fontFamily: THEAMFONTFAMILY.LatoRegular,
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  rideOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    marginHorizontal: 5,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  selectedRideOption: {
    borderColor: THEAMCOLOR.PrimaryGreen,
    marginHorizontal: 15,
    borderWidth: 2,
  },
  rideIcon: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  rideDetails: {
    flex: 1,
  },
  rideType: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    fontFamily: THEAMFONTFAMILY.LatoBold,
  },
  rideInfo: {
    fontSize: 12,
    color: '#666',
    fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
  },
  ridePrice: {
    fontSize: 13,
    fontWeight: '500',
    color: THEAMCOLOR.PrimaryGreen,
    fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
  },
  bookButton: {
    backgroundColor: THEAMCOLOR.PrimaryGreen,
    paddingVertical: 15,
    marginHorizontal: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: THEAMFONTFAMILY.LatoRegular,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'flex-start',
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    fontFamily: THEAMFONTFAMILY.LatoRegular,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    width: '100%',
  },
  radioContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  radioIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  radioText: {
    fontSize: 12,
    color: '#333',
    fontFamily: THEAMFONTFAMILY.LatoBold,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEAMCOLOR.PrimaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: THEAMCOLOR.PrimaryGreen,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 15,
  },
  savedDestinationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEAMCOLOR.SecondaryGray,
    flex: 1,
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
  },
  locationTextContainer: {
    // flex: 1,
    width: '80%',
  },
  locationSubText: {
    fontFamily: THEAMFONTFAMILY.NunitoRegular,
    fontSize: 12,
    color: THEAMCOLOR.SecondaryGray,
    marginTop: 5,
  },
});