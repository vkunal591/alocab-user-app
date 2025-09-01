import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useNavigation } from '@react-navigation/native';
import ImagePath from '../../constants/ImagePath';

const GOOGLE_MAPS_APIKEY = process.env.MAPS_API_KEY || ''; // Ensure this is set in your .env file

interface Props {
    onSelect: (place: { address: string; latitude: number; longitude: number }) => void;
    currentLocation?: any
}
const GooglePlacesAutocompleteComponent: React.FC<Props> = ({ onSelect, currentLocation }) => {
    const [loading, setLoading] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState<{
        latitude: number;
        longitude: number;
        address: string;
    } | null>(null);

    const navigation: any = useNavigation();

    const handlePress = (place: { latitude: number; longitude: number; address: string }) => {
        setSelectedPlace(place);
        // Optionally navigate or use this location
        console.log('Selected place:', place);
    };

    return (
        <View style={styles.container}>
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
                    console.log(currentLocation)
                    const picup = {
                        address: (currentLocation?.address?.landmark ?? currentLocation?.address?.locality) + "," + currentLocation?.address?.city + ", " + currentLocation?.address?.state + "," + currentLocation?.address?.pincode,
                        coordinates: { latitude: currentLocation?.latitude, longitude: currentLocation.longitude },
                    }
                    const drop = {
                        address: data?.description,
                        coordinates: { latitude: details.geometry.location.lat, longitude: details.geometry.location.lng },
                    }
                    onSelect(place);
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

            {/* {selectedPlace && (
                <View style={styles.selectedPlaceContainer}>
                    <Text>Selected Address:</Text>
                    <Text>{selectedPlace.address}</Text>
                </View>
            )} */}
            {loading && (
                <ActivityIndicator style={styles.loader} size="small" color="#000" />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#f0eeeeff',
        borderRadius: 10
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
});

export default GooglePlacesAutocompleteComponent;
