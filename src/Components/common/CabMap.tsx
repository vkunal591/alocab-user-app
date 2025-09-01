import React, { useEffect, useState, useRef } from 'react';
import MapView, { Marker, AnimatedRegion, PROVIDER_GOOGLE } from 'react-native-maps';
import {
  StyleSheet,
  Dimensions,
  Platform,
  PermissionsAndroid,
  ToastAndroid,
  View,
  TouchableOpacity,
  Text,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import MapViewDirections from 'react-native-maps-directions';
import Icon from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import ImagePath from '../../constants/ImagePath';

const { width, height } = Dimensions.get('window');
const GOOGLE_MAPS_APIKEY = `${process.env.MAPS_API_KEY}`;

interface Props {
  pickupCoords?: { latitude: number; longitude: number } | null;
  dropCoords?: { latitude: number; longitude: number } | null;
  rideActive?: boolean;
  isOnline?: boolean;
  rideStart?: boolean;
}

const CabMap: React.FC<Props> = ({
  pickupCoords,
  dropCoords,
  rideActive = true,
  isOnline = false,
  rideStart = true,
}) => {
  const mapRef = useRef<MapView>(null);
  const locationInterval = useRef<NodeJS.Timeout | null>(null);
  const [rideMode, setRideMode] = useState(rideStart);
  const [currentCoords, setCurrentCoords] = useState<{ latitude: number; longitude: number } | null>(pickupCoords ?? null);
  const [driverMarker, setDriverMarker] = useState<AnimatedRegion | null | any>(null);
  const [markerRotation, setMarkerRotation] = useState(0);
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [newPickupCoords, setNewPickupCoords] = useState(dropCoords);

  // Request location permission
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        fetchCurrentLocation();
      } else {
        ToastAndroid.show('Location permission denied', ToastAndroid.SHORT);
      }
    } else {
      fetchCurrentLocation();
    }
  };

  // Fetch current location of the user
  const fetchCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { latitude, longitude };
        console.log(newLocation)
        if (!driverMarker) {
          const newRegion = new AnimatedRegion({
            latitude,
            longitude,
            latitudeDelta: rideMode ? 0.001 : 0.01,
            longitudeDelta: rideMode ? 0.001 : 0.01,
          });
          setDriverMarker(newRegion);
        }
        else {
          const rotation = calculateBearing(currentCoords, newLocation);
          setMarkerRotation(rotation);
          setCurrentCoords(newLocation);

          if (driverMarker?.timing) {
            driverMarker.timing({
              latitude,
              longitude,
              duration: 1000,
              useNativeDriver: false,
            }).start();
          }
        }

        mapRef.current?.animateToRegion(
          {
            ...newLocation,
            latitudeDelta: rideMode ? 0.001 : 0.01,
            longitudeDelta: rideMode ? 0.001 : 0.01,
          },
          1000
        );

      },
      (error) => {
        ToastAndroid.show(`Location error: ${error.message}`, ToastAndroid.SHORT);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // Calculate bearing angle between two coordinates
  const calculateBearing = (
    start: { latitude: number; longitude: number },
    end: { latitude: number; longitude: number }
  ) => {
    const lat1 = (start.latitude * Math.PI) / 180;
    const lon1 = (start.longitude * Math.PI) / 180;
    const lat2 = (end.latitude * Math.PI) / 180;
    const lon2 = (end.longitude * Math.PI) / 180;

    const dLon = lon2 - lon1;
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    let brng = Math.atan2(y, x);
    brng = (brng * 180) / Math.PI;
    return (brng + 360) % 360;
  };

  // Watch for location permission and location updates
  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (rideMode) {
      fetchCurrentLocation();
      locationInterval.current = setInterval(fetchCurrentLocation, 5000);
    } else {
      if (locationInterval.current) {
        clearInterval(locationInterval.current);
        locationInterval.current = null;
      }
    }

    return () => {
      if (locationInterval.current) {
        clearInterval(locationInterval.current);
      }
    };
  }, [rideMode]);

  // Handle zoom in/out
  const handleZoom = (zoomIn: boolean) => {
    if (!mapRef.current || !currentCoords) return;

    const region = {
      latitude: currentCoords.latitude,
      longitude: currentCoords.longitude,
      latitudeDelta: zoomIn ? 0.005 : 0.02,
      longitudeDelta: zoomIn ? 0.005 : 0.02,
    };

    mapRef.current.animateToRegion(region, 500);
  };

  // Handle the drag of the marker
  const handleDragEnd = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setNewPickupCoords({ latitude, longitude });
    setDragging(false);
  };

  // Handle the marker drag start
  const handleDragStart = () => {
    setDragging(true);
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        provider={PROVIDER_GOOGLE}
        ref={mapRef}
        style={styles.map}
        showsUserLocation={!rideStart}
        followsUserLocation={rideStart}
        showsMyLocationButton={!rideStart}
      >
        {/* Draggable Marker for Pickup */}
        {newPickupCoords && (
          <Marker
            coordinate={newPickupCoords}
            title="Pickup Location"
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />
        )}

        {/* Driver's Location Marker */}
        {rideStart && driverMarker && (
          <Marker.Animated
            coordinate={driverMarker}
            anchor={{ x: 0.5, y: 0.5 }}
            rotation={markerRotation}
            flat
            image={ImagePath.Rides}
          />
        )}

        {/* Directions to Pickup */}
        {currentCoords && newPickupCoords && (
          <MapViewDirections
            origin={currentCoords}
            destination={newPickupCoords}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={4}
            strokeColor="green"
            onReady={(result) => {
              setDistance(result?.distance ?? null);
              setDuration(result?.duration ?? null);
            }}
            onError={() => {
              ToastAndroid.show('Directions error', ToastAndroid.SHORT);
            }}
          />
        )}
      </MapView>

      {/* Distance and Duration Information */}
      {rideActive && distance !== null && duration !== null && (
        <View style={styles.detailsContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="location-outline" size={18} />
            <Text style={styles.detailsText}>{distance.toFixed(2)} km</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="timer-outline" size={18} />
            <Text style={styles.detailsText}>{Math.ceil(duration)} mins</Text>
          </View>
        </View>
      )}

      {/* Zoom Controls */}
      <View style={styles.zoomControls}>
        <TouchableOpacity onPress={() => handleZoom(true)} style={styles.zoomButton}>
          <Icon name="add" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleZoom(false)} style={styles.zoomButton}>
          <Icon name="remove" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={fetchCurrentLocation} style={styles.currentLocationBtn}>
          <Icon name="locate" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setRideMode(prev => {
              ToastAndroid.show("Ride mode " + (!prev ? "enabled" : "disabled"), ToastAndroid.SHORT);
              return !prev;
            });
          }}
          style={styles.currentLocationBtn}
        >
          <Entypo name="direction" size={22} color="#fff" />
        </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    width,
    height,
  },
  detailsContainer: {
    position: 'absolute',
    top: 50,
    left: 10,
    backgroundColor: '#ffffffee',
    borderRadius: 20,
    padding: 10,
    flexDirection: 'row',
    gap: 20,
    elevation: 4,
  },
  detailsText: {
    marginLeft: 5,
    fontWeight: '600',
  },
  zoomControls: {
    position: 'absolute',
    right: 10,
    top: height * 0.15,
    alignItems: 'center',
  },
  zoomButton: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 8,
    marginBottom: 10,
    elevation: 4,
  },
  currentLocationBtn: {
    backgroundColor: '#000',
    borderRadius: 25,
    padding: 10,
    marginTop: 10,
    elevation: 4,
  },
});

export default CabMap;
