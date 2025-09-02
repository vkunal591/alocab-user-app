import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Image,
    Animated,
    ToastAndroid,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import LinearGradient from 'react-native-linear-gradient';
import CabMap from '../../Components/common/CabMap';
import BackButton from '../../Components/common/BackButton';
import { THEAMCOLOR, THEAMFONTFAMILY } from '../../../assets/theam/theam';
import ImagePath from '../../constants/ImagePath';
import { fetchRideDetails, RideStatus } from './BookRideScreen';

const { width, height } = Dimensions.get('screen');

interface RideDetails {
    _id: string;
    pickup: {
        address: string;
        coordinates: [number, number];
    };
    drops: Array<{
        address: string;
        coordinates: [number, number];
    }>;
    fare: number;
    distance: string;
    duration: number;
    vehicleType: string;
    paymentMode: string;
    driver: {
        name: string;
        rating: number;
        phoneNumber: string;
        vehicle: {
            type: string;
            model: string;
            number: string;
        };
        location: {
            coordinates: [number, number];
        };
    };
    eta?: string;
}

const DriverApproachScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const ride: RideDetails = route.params?.ride;
    const [rideDetails, setRideDetails] = useState<RideDetails | null>(ride ?? null);
    const [isLoading, setIsLoading] = useState(!ride);
    const slideAnim = useRef(new Animated.Value(height * 0.65)).current; // Start with card partially visible
    const fadeAnim = useRef(new Animated.Value(0)).current; // For content fade-in
    const [isCardOpen, setIsCardOpen] = useState(false);

    // Toggle slide animation for bottom card
    const toggleSlide = () => {
        Animated.parallel([
            Animated.spring(slideAnim, {
                toValue: isCardOpen ? height * 0.65 : height * 0.25,
                tension: 80,
                friction: 12,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: isCardOpen ? 0 : 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => setIsCardOpen(!isCardOpen));
    };

    
    // Handle ride data loading
    useEffect(() => {
        if (ride) {
            setRideDetails({
                ...ride,
                eta: `${Math.ceil(ride.duration)} mins`, // Derive ETA from duration
            });
            setIsLoading(false);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            setTimeout(() => {
                setIsLoading(false);
                if (!ride) {
                    ToastAndroid.show('No ride details available', ToastAndroid.LONG);
                }
            }, 1000);
        }
    }, [ride]);

    // Handle profile press
    const handleProfilePress = () => {
        ToastAndroid.show('Viewing driver profile', ToastAndroid.SHORT);
    };

    // Handle call driver
    const handleCallDriver = () => {
        ToastAndroid.show(`Calling ${rideDetails?.driver?.name}...`, ToastAndroid.SHORT);
        // Implement actual call functionality using Linking if needed
    };

    const makeCall = () => {
        const phone = rideDetails?.driver?.phoneNumber;
        if (!phone) {
            return ToastAndroid.show('No phone number available', ToastAndroid.SHORT);
        }
        Linking.openURL(`tel:${phone}`);
    };

    // Handle cancel ride with confirmation
    const handleCancelRide = () => {
        Alert.alert(
            'Cancel Ride',
            'Are you sure you want to cancel this ride?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes',
                    onPress: () => {
                        ToastAndroid.show('Ride cancelled', ToastAndroid.SHORT);
                        navigation.goBack();
                    },
                },
            ],
            { cancelable: true }
        );
    };

    // Loading state
    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={THEAMCOLOR.PrimaryGreen} />
                    <Text style={styles.loaderText}>Loading ride details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Error state
    if (!rideDetails) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loaderContainer}>
                    <Text style={styles.errorText}>Failed to load ride details.</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => navigation.goBack()}
                        accessibilityLabel="Go back"
                    >
                        <Text style={styles.retryButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Back Button */}
            <BackButton />

            {/* Map Component */}
            <CabMap
                pickupCoords={{
                    latitude: rideDetails?.pickup?.coordinates?.[0] ?? 0,
                    longitude: rideDetails?.pickup?.coordinates?.[1] ?? 0,
                }}
                dropCoords={{
                    latitude: rideDetails?.drops?.[0]?.coordinates?.[0] ?? 0,
                    longitude: rideDetails?.drops?.[0]?.coordinates?.[1] ?? 0,
                }}
            // driverCoords={{
            //     latitude: rideDetails?.driver?.location?.coordinates?.[0] ?? 0,
            //     longitude: rideDetails?.driver?.location?.coordinates?.[1] ?? 0,
            // }}
            />

            {/* Bottom Card */}
            <Animated.View style={[styles.bottomCard, { transform: [{ translateY: slideAnim }] }]}>
                <LinearGradient
                    colors={[THEAMCOLOR.PureWhite, THEAMCOLOR.SecondarySmokeWhite]}
                    style={styles.gradient}
                >
                    {/* Notch for sliding */}
                    <TouchableOpacity
                        style={styles.notch}
                        onPress={toggleSlide}
                        accessibilityLabel={isCardOpen ? 'Collapse card' : 'Expand card'}
                    >
                        <View style={styles.notchBar} />
                    </TouchableOpacity>

                    {/* Card Content */}
                    <Animated.View style={[styles.cardContent,]}>
                        {/* Collapsed State Content */}
                        <View style={styles.collapsedContent}>
                            <Text numberOfLines={1} style={[styles.vehicleText, { color: THEAMCOLOR.PrimaryGreen, position: 'absolute', top: 0, right: 0, fontWeight: 600, fontSize: 12, }]}>
                                OTP : {rideDetails.pin}
                            </Text>
                            <View style={styles.driverInfo}>
                                <Image
                                    source={ImagePath.Profile} // Replace with actual driver image
                                    style={styles.driverAvatar}
                                    accessibilityLabel="Driver avatar"
                                />
                                <View style={styles.driverDetails}>
                                    <Text style={styles.driverName}>{rideDetails?.driver?.name}</Text>
                                    <Text style={styles.driverRating}>
                                        {rideDetails?.driver?.rating > 0
                                            ? `★ ${rideDetails?.driver?.rating.toFixed(1)}`
                                            : 'New Driver'}
                                    </Text>
                                    <Text numberOfLines={1} style={styles.vehicleText}>
                                        {rideDetails?.driver?.vehicle?.model} • {rideDetails?.driver?.vehicle?.number}
                                    </Text>
                                </View>
                                <View style={styles.actions}>
                                    <TouchableOpacity style={styles.callBtn} onPress={makeCall}>
                                        <Ionicons size={20} name="call-outline" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.msgBtn} onPress={() => navigation.navigate('ChatScreen',{ride:rideDetails})}>
                                        <MaterialCommunityIcons size={20} name="message-processing-outline" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>


                        {/* Trip Status */}
                        <Text style={styles.etaText}>
                            Driver is {rideDetails?.eta} away • {rideDetails?.distance} km
                        </Text>

                        {/* Trip Details */}
                        <View style={styles.tripDetails}>
                            <View style={styles.detailRow}>
                                <Ionicons name="location-outline" size={20} color={THEAMCOLOR.PrimaryGreen} />
                                <View style={styles.detailTextContainer}>
                                    <Text style={styles.detailLabel}>Pickup</Text>
                                    <Text numberOfLines={1} ellipsizeMode='tail' style={styles.detailText}>{rideDetails?.pickup?.address}</Text>
                                </View>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="flag-outline" size={20} color={THEAMCOLOR.PrimaryGreen} />
                                <View style={styles.detailTextContainer}>
                                    <Text style={styles.detailLabel}>Drop-off</Text>
                                    <Text numberOfLines={1} ellipsizeMode='tail' style={styles.detailText}>{rideDetails?.drops[0]?.address}</Text>
                                </View>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="cash-outline" size={20} color={THEAMCOLOR.PrimaryGreen} />
                                <View style={styles.detailTextContainer}>
                                    <Text style={styles.detailLabel}>Fare ({rideDetails?.paymentMode})</Text>
                                    <Text style={styles.detailText}>₹{Number(rideDetails?.fare).toFixed(2)}</Text>
                                </View>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="time-outline" size={20} color={THEAMCOLOR.PrimaryGreen} />
                                <View style={styles.detailTextContainer}>
                                    <Text style={styles.detailLabel}>Distance & Duration</Text>
                                    <Text style={styles.detailText}>
                                        {rideDetails?.distance} km • {rideDetails?.eta}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.actionBtn}
                                // onPress={handleCallDriver}
                                activeOpacity={0.8}
                                accessibilityLabel="Call driver"
                                onPress={async () => {
                                    const status = await fetchRideDetails(setRideDetails);
                                    RideStatus?.ONGOING === await status ? navigation.navigate('InRideScreen', { ride: rideDetails }) : (RideStatus?.COMPLETED === await status ? navigation.navigate('AfterRideScreen', { ride: rideDetails }) : ToastAndroid.show('Ride is not started, Please wait for the driver to start the ride', ToastAndroid.SHORT));

                                }}>
                                {/* <Ionicons name="call-outline" size={20} color="#fff" /> */}
                                <Text style={styles.actionBtnText}>Continue Ride</Text>
                            </TouchableOpacity>
                            {/* <TouchableOpacity
                                style={[styles.actionBtn, styles.cancelBtn]}
                                onPress={handleCancelRide}
                                activeOpacity={0.8}
                                accessibilityLabel="Cancel ride"
                            >
                                <Ionicons name="close-outline" size={20} color="#fff" />
                                <Text style={styles.actionBtnText}>Cancel Ride</Text>
                            </TouchableOpacity> */}
                        </View>
                    </Animated.View>
                </LinearGradient>
            </Animated.View>
        </SafeAreaView>
    );
};

export default DriverApproachScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEAMCOLOR.SecondarySmokeWhite,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
        fontFamily: THEAMFONTFAMILY.PoppinsRegular,
    },
    errorText: {
        fontSize: 16,
        color: '#d32f2f',
        fontFamily: THEAMFONTFAMILY.PoppinsRegular,
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: THEAMCOLOR.PrimaryGreen,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
    },
    retryButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        fontFamily: THEAMFONTFAMILY.PoppinsBold,
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 10,
    },
    bottomCard: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: width,
        height: height * 0.83,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    gradient: {
        flex: 1,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
    },
    notch: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 12,
    },
    notchBar: {
        width: 50,
        height: 5,
        backgroundColor: '#ccc',
        borderRadius: 2.5,
    },
    cardContent: {
        paddingHorizontal: 20,
        flex: 1,
        borderBottomWidth: 1,
        borderBottomColor: 'gray'
    },
    collapsedContent: {
        alignItems: 'center',
        // paddingVertical: 10,
    },
    driverInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    driverAvatar: {
        width: 50,
        height: 50,
        borderRadius: 30,
        marginRight: 15,
        backgroundColor: '#fff',
        // borderWidth: 1,
        overflow: 'hidden'
    },
    driverDetails: {
        flex: 1,
    },
    driverName: {
        fontSize: 13,
        fontWeight: '400',
        color: THEAMCOLOR.PrimaryGreen,
        fontFamily: THEAMFONTFAMILY.PoppinsBold,
    },
    driverRating: {
        fontSize: 11,
        color: '#666',
        fontFamily: THEAMFONTFAMILY.PoppinsRegular,
    },
    vehicleText: {
        fontSize: 11,
        color: '#666',
        fontFamily: THEAMFONTFAMILY.PoppinsRegular,
    },
    etaText: {
        fontSize: 14,
        fontWeight: '500',
        color: THEAMCOLOR.PrimaryGreen,
        textAlign: 'center',
        marginVertical: 10,
        fontFamily: THEAMFONTFAMILY.PoppinsMedium,
    },
    tripDetails: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 15,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    detailTextContainer: {
        flex: 1,
        marginLeft: 10,
    },
    detailLabel: {
        fontSize: 11,
        color: '#999',
        fontFamily: THEAMFONTFAMILY.PoppinsRegular,
    },
    detailText: {
        fontSize: 12,
        color: '#333',
        fontFamily: THEAMFONTFAMILY.PoppinsRegular,
        marginTop: 2,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width: width * 0.25,
        marginTop: 16,
    },
    callBtn: {
        backgroundColor: THEAMCOLOR?.PureWhite,
        borderWidth: 1,
        borderColor: 'gray',
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40,
        borderRadius: 22,
    },
    msgBtn: {
        backgroundColor: THEAMCOLOR?.PureWhite,
        borderWidth: 1,
        borderColor: 'gray',
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40,
        borderRadius: 22,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: THEAMCOLOR.PrimaryGreen,
        paddingVertical: 12,
        borderRadius: 12,
        marginHorizontal: 5,
    },
    actionBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        marginLeft: 5,
        fontFamily: THEAMFONTFAMILY.PoppinsBold,
    },
    cancelBtn: {
        backgroundColor: '#d32f2f',
    },
});