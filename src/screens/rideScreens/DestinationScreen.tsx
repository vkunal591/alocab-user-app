import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView, Image, Modal } from 'react-native';
import React, { useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { LINE_HEIGHT, SPACING, TEXT_SIZE, THEAMCOLOR, THEAMFONTFAMILY } from '../../assets/theam/theam';
import BackButton from '../../Components/common/BackButton';
import ImagePath from '../../constants/ImagePath';
import Icon from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');

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

const DestinationScreen = () => {
  const navigation: any = useNavigation();
  const [pickupLocation, setPickupLocation] = useState({
    address: '223, A Pocket, Dwarka, New Delhi',
    coordinates: { latitude: 28.5916, longitude: 77.0460 },
  });
  const [dropLocation, setDropLocation] = useState<any>(null);
  const [showSavedDestinations, setShowSavedDestinations] = useState(false);
  const [locationType, setLocationType] = useState(null); // New state to track pickup or drop-off
  const [mapRegion, setMapRegion] = useState({
    latitude: 28.6139,
    longitude: 77.2090,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [selectedPin, setSelectedPin] = useState(null);

  // Simulate geocoding (replace with actual API like Google Maps Geocoding)
  const getAddressFromCoordinates = async (latitude, longitude) => {
    // Placeholder: In a real app, use a geocoding API
    return `Selected Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  };

  const handleMapPress = async (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSelectedPin({ latitude, longitude });
    const address = await getAddressFromCoordinates(latitude, longitude);
    setDropLocation({ address, coordinates: { latitude, longitude } });
  };

  const handleSelectLocation = (destination) => {
    const newLocation = {
      address: destination.address,
      coordinates: { latitude: destination.coordinates.lat, longitude: destination.coordinates.lng },
    };
    if (locationType === 'pickup') {
      setPickupLocation(newLocation);
    } else if (locationType === 'drop') {
      setDropLocation(newLocation);
      setSelectedPin(newLocation.coordinates);
    }
    setMapRegion({
      latitude: destination.coordinates.lat,
      longitude: destination.coordinates.lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    setShowSavedDestinations(false);
    setLocationType(null);
  };

  const openSavedDestinations = (type) => {
    setLocationType(type);
    setShowSavedDestinations(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <BackButton />
        <Text style={styles.headerTitle}>Destination</Text>
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={mapRegion}
          onPress={handleMapPress}
        >
          {pickupLocation && (
            <Marker
              coordinate={pickupLocation.coordinates}
              title="Pickup"
              description={pickupLocation.address}
              pinColor="green"
            />
          )}
          {selectedPin && (
            <Marker
              coordinate={selectedPin}
              title="Drop-off"
              description={dropLocation?.address || 'Selected Location'}
              pinColor="red"
            />
          )}
        </MapView>
      </View>

      {/* Map Selection Button */}
      <View style={styles.mapButtonContainer}>
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => openSavedDestinations('drop')}
        >
          <Image source={ImagePath.geolocation} style={styles.mapIcon} />
          <Text style={styles.mapButtonText}>Select From Saved Locations</Text>
        </TouchableOpacity>
      </View>

      {/* Path Display */}
      <View style={styles.pathRow}>
        <View style={styles.iconColumn}>
          <View style={styles.greenCircle} />
          <LinearGradient colors={['#00FF00', '#FF0000']} style={styles.verticalLine} />
          <View style={styles.redCircle} />
        </View>
        <View style={styles.textColumn}>
          <TouchableOpacity onPress={() => openSavedDestinations('pickup')}>
            <Text style={styles.location} numberOfLines={2} ellipsizeMode="tail">
              {pickupLocation?.address || 'Select Pickup Location'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openSavedDestinations('drop')}>
            <Text style={styles.location} numberOfLines={2} ellipsizeMode="tail">
              {dropLocation?.address || 'Drop Location'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Saved Destinations Modal */}
      <Modal
        visible={showSavedDestinations}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowSavedDestinations(false);
          setLocationType(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
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
                      style={[styles.rideIcon, { tintColor: THEAMCOLOR.SecondaryGray }]}
                    />
                    <View style={styles.locationTextContainer}>
                      <Text style={styles.locationText}>{destination.label}</Text>
                      <Text style={styles.locationSubText}>{destination.address}</Text>
                    </View>
                  </View>
                  <Icon name="bookmark" size={TEXT_SIZE.h1} color={THEAMCOLOR.SecondaryGray} />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowSavedDestinations(false);
                setLocationType(null);
              }}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DestinationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEAMCOLOR.SecondarySmokeWhite,
  },
  headerContainer: {
    backgroundColor: '#fff',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerTitle: {
    fontSize: TEXT_SIZE.h2,
    fontFamily: THEAMFONTFAMILY.NunitoBold,
    color: THEAMCOLOR.PureBlack,
    textAlign: 'center',
  },
  mapContainer: {
    height: 300,
    marginVertical: SPACING.md,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapButtonContainer: {
    marginVertical: SPACING.md,
    alignItems: 'center',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 19,
    width: width * 0.45,
  },
  mapIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginRight: SPACING.xs,
  },
  mapButtonText: {
    fontSize: TEXT_SIZE.small,
    fontFamily: THEAMFONTFAMILY.NunitoRegular,
    color: THEAMCOLOR.PureBlack,
  },
  pathRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: SPACING.md,
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  iconColumn: {
    alignItems: 'center',
    marginRight: SPACING.sm,
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
    marginVertical: SPACING.xs,
  },
  textColumn: {
    flex: 1,
    justifyContent: 'space-between',
    height: 60,
  },
  location: {
    fontSize: TEXT_SIZE.small,
    fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    color: THEAMCOLOR.PureBlack,
    lineHeight: LINE_HEIGHT.body,
    marginVertical: SPACING.xs,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.lg,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: TEXT_SIZE.h2,
    fontFamily: THEAMFONTFAMILY.NunitoBold,
    color: THEAMCOLOR.PureBlack,
    marginBottom: SPACING.md,
  },
  savedDestinationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: THEAMCOLOR.SecondaryGray,
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 10,
  },
  rideIcon: {
    width: 22,
    height: 22,
    marginRight: SPACING.lg,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationText: {
    fontFamily: THEAMFONTFAMILY.LatoBold,
    fontSize: TEXT_SIZE.body,
    lineHeight: LINE_HEIGHT.body,
    color: THEAMCOLOR.PureBlack,
  },
  locationSubText: {
    fontFamily: THEAMFONTFAMILY.NunitoRegular,
    fontSize: TEXT_SIZE.small,
    lineHeight: LINE_HEIGHT.body,
    color: THEAMCOLOR.SecondaryGray,
    marginTop: SPACING.xs,
  },
  closeButton: {
    marginTop: SPACING.md,
    backgroundColor: THEAMCOLOR.PrimaryGreen,
    paddingVertical: SPACING.sm,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: TEXT_SIZE.body,
    fontFamily: THEAMFONTFAMILY.NunitoBold,
    color: '#fff',
  },
});