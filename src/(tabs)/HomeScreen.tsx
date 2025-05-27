import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Dimensions, Image } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import { LINE_HEIGHT, RADIUS, SHADOW, SPACING, TEXT_SIZE, THEAMCOLOR, THEAMFONTFAMILY } from '../assets/theam/theam';
import { useNavigation } from '@react-navigation/native';
import ImagePath from '../constants/ImagePath';
import { ScrollView } from 'react-native-gesture-handler';
import { AsyncStorage } from 'react-native';


const { width, height } = Dimensions.get('screen');

export interface Location {
  address: string;
  coordinates: [number, number]; // [longitude, latitude]
}

export interface RouteDetails {
  pickup: Location;
  drops: Location[];
  vehicleType: string; // Type of vehicle for the ride
}


const rideOptions = [
  { id: 'auto', name: 'Auto', image: ImagePath.auto },
  // { id: '2', name: 'Alo Black', image: ImagePath.car1 },
  // { id: '3', name: 'Alo Pool', image: ImagePath.car2 },
  // { id: '4', name: 'Alo Moto', image: ImagePath.car3 },
  // { id: '4', name: 'Alo Moto', image: ImagePath.car4 },
];

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

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const [user, setUser] = useState<any>();
  const initialRegion = {
    latitude: 28.6139, // Coordinates for Connaught Place, New Delhi
    longitude: 77.2090,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  const routeCoordinates = [
    { latitude: 28.6139, longitude: 77.2090 }, // Starting point (Karail Singh Stadium)
    { latitude: 28.6239, longitude: 77.2190 }, // End point (near Connaught Place)
  ];

  const renderRideOption = ({ item }: { item: { id: string; name: string; image: string } }) => (
    <TouchableOpacity onPress={() => navigation.navigate('RideSelectionScreen')}>
      <View style={styles.rideOption}>
        <Image source={item.image || ImagePath.auto} style={styles.rideImage} />
        <Text style={styles.rideText}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSavedDestination = ({ item, index }: { item: { id: string; label: string; address: string }, index: number }) => (
    <>
      <TouchableOpacity style={styles.savedDestination}>
        <View>
          <Text style={styles.savedLabel}>{item.label}</Text>
          <Text style={styles.savedAddress}>{item.address}</Text>
        </View>
        <Icon name="chevron-right" size={TEXT_SIZE.h1} color={THEAMCOLOR.SecondaryGray} />
      </TouchableOpacity>
      {/* Only show lineHr if it's not the last item */}
      {index < savedDestinations.length - 1 && <View style={styles.lineHr} />}
    </>
  );

  useEffect(() => {
    const userData = async () => {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        setUser(user);
      }
    };
    userData();
  }, []);


  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView>
        <View style={styles.headerContainer}>
          <View style={{ width: 50, height: 'auto' }}>
            <TouchableOpacity style={{ borderRadius: '100%', borderWidth: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderColor: 'lightgray', height: 40, width: 40, }} onPress={() => navigation.openDrawer()}>
              <Entypo name="dots-three-horizontal" size={20} />
            </TouchableOpacity>
          </View>
          <View style={styles.header}>
            <Text style={styles.headerText}>Hello, Welcome {user?.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Image source={ImagePath.pin} style={{ width: 10, height: 15, resizeMode: 'contain' }} />
              <Text style={styles.subHeaderText}>223, A Pocket, Dwarka, New Delhi</Text>
            </View>
          </View>
        </View>
        {/* Map View */}
        <View style={styles.mapContainer}>
          <MapView style={styles.map} initialRegion={initialRegion}>
            <Marker coordinate={routeCoordinates[0]} pinColor={THEAMCOLOR.PrimaryRed} />
            <Marker coordinate={routeCoordinates[1]} pinColor={THEAMCOLOR.PrimaryGreen} />
            <Polyline coordinates={routeCoordinates} strokeColor={THEAMCOLOR.PrimaryGreen} strokeWidth={4} />
          </MapView>
        </View>



        {/* Bottom Sheet */}
        <View style={styles.bottomSheet}>
          {/* Search Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputRow}>
              <Icon name="search" size={TEXT_SIZE.h1} color={THEAMCOLOR.SecondaryGray} />
              <TextInput
                placeholder="Where you want to go?"
                placeholderTextColor={THEAMCOLOR.SecondaryGray}
                style={styles.input}
              />
            </View>
            {savedDestinations.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() =>
                  navigation.navigate('DestinationScreen', {
                    destination: {
                      label: item.label,
                      address: item.address,
                      coordinates: item.coordinates,
                    },
                  })
                }
              >
                <View style={styles.locationRow}>
                  <Image
                    source={ImagePath.rideHistory}
                    style={{ tintColor: THEAMCOLOR.SecondaryGray }}
                  />
                  <Text style={styles.locationText}>{item.address}</Text>
                  <Icon
                    name="chevron-right"
                    size={TEXT_SIZE.h2}
                    color={THEAMCOLOR.SecondaryGray}
                  />
                </View>
              </TouchableOpacity>
            ))}


          </View>

          {/* Ride Options */}
          <Text style={styles.sectionTitle}>Ride the way you want</Text>
          <FlatList
            data={rideOptions}
            renderItem={renderRideOption}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rideOptionsList}
          />

          {/* Saved Destinations */}
          <View style={styles.savedDestinationsContainer}>
            <View style={styles.savedHeader}>
              <Text style={styles.sectionTitle}>Saved Destinations</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={savedDestinations}
              renderItem={renderSavedDestination}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              style={{ backgroundColor: '#fff', padding: 5, borderRadius: 15 }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEAMCOLOR.SecondarySmokeWhite,
  },
  mapContainer: {
    height: height * 0.4,
    width: '95%',
    padding: 5,
    borderRadius: 15,
    marginHorizontal: 'auto',
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  headerContainer: {
    height: height * 0.11,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  header: {

    backgroundColor: THEAMCOLOR.Transparent,
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
    backgroundColor: THEAMCOLOR.SecondaryWhite,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginTop: -RADIUS.xl,
  },
  inputContainer: {
    backgroundColor: THEAMCOLOR.PureWhite,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    ...SHADOW.light,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEAMCOLOR.BorderGray,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  input: {
    flex: 1,
    fontFamily: THEAMFONTFAMILY.LatoRegular,
    fontSize: TEXT_SIZE.body,
    lineHeight: LINE_HEIGHT.body,
    color: THEAMCOLOR.PureBlack,
    paddingVertical: SPACING.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,

  },
  lineHr: {
    marginHorizontal: 'auto',
    width: width * 0.87,
    height: 1,
    borderStyle: 'dashed',
    borderBottomWidth: 1,
    borderBottomColor: THEAMCOLOR.SecondaryGray,
  },
  locationText: {
    flex: 1,
    fontFamily: THEAMFONTFAMILY.NunitoRegular,
    fontSize: TEXT_SIZE.small,
    lineHeight: LINE_HEIGHT.body,
    color: THEAMCOLOR.PureBlack,
    marginLeft: SPACING.sm,
  },
  priceText: {
    fontFamily: THEAMFONTFAMILY.LatoRegular,
    fontSize: TEXT_SIZE.body,
    lineHeight: LINE_HEIGHT.body,
    color: THEAMCOLOR.PureBlack,
    marginRight: SPACING.sm,
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
    width: 70, height: 60, resizeMode: 'contain',
    marginBottom: 5,
  },
  rideImagePlaceholder: {
    width: 70,
    height: 70,
    backgroundColor: THEAMCOLOR.LightGray,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.xs,
  },
  rideText: {
    fontFamily: THEAMFONTFAMILY.LatoRegular,
    fontSize: TEXT_SIZE.small,
    lineHeight: LINE_HEIGHT.small,
    color: THEAMCOLOR.PureBlack,
  },
  savedDestinationsContainer: {
    flex: 1,
    marginBottom: 30
  },
  savedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAllText: {
    fontFamily: THEAMFONTFAMILY.NunitoRegular,
    fontSize: TEXT_SIZE.small,
    lineHeight: LINE_HEIGHT.small,
    color: THEAMCOLOR.SecondaryGray,
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
    width: 60,
  },
  savedAddress: {
    flex: 1,
    fontFamily: THEAMFONTFAMILY.NunitoRegular,
    fontSize: TEXT_SIZE.small,
    lineHeight: LINE_HEIGHT.body,
    color: THEAMCOLOR.SecondaryGray,
  },
});

export default HomeScreen;