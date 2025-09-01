import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ScrollView,
    ToastAndroid,
    SafeAreaView,
    TextInput,
    ActivityIndicator,
    Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { THEAMCOLOR, THEAMFONTFAMILY } from '../../../assets/theam/theam';
import CabMap from '../../Components/common/CabMap';
import BackButton from '../../Components/common/BackButton';
import apiUtils from '../../utils/apiUtils';
import ImagePath from '../../constants/ImagePath';

const { width, height } = Dimensions.get('screen');

export enum RideStatus {
    ONGOING = 'ongoing',
    REJECTED = 'rejected',
    ACCEPTED = 'accepted',
    REQUESTED = 'requested',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

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
    status: RideStatus;
    pin: number;
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

const InRideScreen = () => {
    const navigation = useNavigation<any>();
    const [rideDetails, setRideDetails] = useState<RideDetails | null>(null);
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [helpModalVisible, setHelpModalVisible] = useState(false);
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const slideAnim = useRef(new Animated.Value(height * 0.31)).current; // Start with card partially visible
    const fadeAnim = useRef(new Animated.Value(0)).current; // For content fade-in
    const [isCardOpen, setIsCardOpen] = useState(false);

    // Sample ride data from provided JSON
    const sampleRideData: RideDetails = {
        _id: '68b57480d64e9e9c9eefde78',
        pickup: {
            address: 'I -5, opp. metro pillar 331, Kailash Park, Basai Dara pur, Kirti Nagar, Delhi, 110015, India',
            coordinates: [28.654971, 77.13715859999999],
        },
        drops: [
            {
                address: '9926.AHATA THAKUR DASS. SARAI ROHILLA NEW ROHTAK ROAD NEW DELHI, Railway Officers Colony, Karol Bagh, Delhi, 110005, India',
                coordinates: [28.6625333, 77.1852154],
            },
        ],
        fare: 87.19,
        distance: '5.7',
        duration: 18.1,
        vehicleType: 'auto',
        paymentMode: 'cash',
        status: RideStatus.ACCEPTED, // Toggle to COMPLETED for review testing
        pin: 991085,
        driver: {
            name: 'Kunal Verma',
            rating: 0,
            phoneNumber: '+916299477707',
            vehicle: {
                type: 'auto',
                model: 'Toyota',
                number: 'Dl28a2839',
            },
            location: {
                coordinates: [28.6546705, 77.1361942],
            },
        },
        eta: '18 mins',
    };

    // Toggle slide animation for bottom card
    const toggleSlide = () => {
        Animated.parallel([
            Animated.spring(slideAnim, {
                toValue: isCardOpen ? height * 0.31 : height * 0.15,
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

    // Fetch ride details
    const fetchRideDetails = async (setRideDetailsCallback?: (ride: RideDetails) => void) => {
        try {
            const res: any = await apiUtils.get('/api/ride/active/ride');
            const response = res?.data
            console.log(response)
            if (res?.success) {
                const updatedRide = {
                    ...response,
                    eta: `${Math.ceil(response?.duration)} mins`,
                };
                setRideDetailsCallback?.(updatedRide);
                setRideDetails(updatedRide);
                setIsLoading(false);
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
                return response.status;
            } else {
                ToastAndroid.show(response?.message || 'Failed to fetch ride details', ToastAndroid.SHORT);
                setIsLoading(false);
                return null;
            }
        } catch (error: any) {
            ToastAndroid.show(error.message || 'Error fetching ride details', ToastAndroid.LONG);
            setIsLoading(false);
            return null;
        }
    };

    useEffect(() => {
        // Simulate fetching data with sample data
        setTimeout(() => {
            setRideDetails(sampleRideData);
            setIsLoading(false);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }, 1000);
        // Uncomment to use actual API call
        // fetchRideDetails();
    }, []);

    // Handle action buttons
    const makeCall = () => {
        ToastAndroid.show(`Calling ${rideDetails?.driver.name}...`, ToastAndroid.SHORT);
        // Implement actual call: Linking.openURL(`tel:${rideDetails?.driver.phoneNumber}`);
    };

    const handleShareRide = () => {
        ToastAndroid.show('Sharing ride details...', ToastAndroid.SHORT);
        // Implement sharing logic
    };

    const handleHelpOption = (option: string) => {
        ToastAndroid.show(`Selected: ${option}`, ToastAndroid.SHORT);
        setHelpModalVisible(false);
    };

    const handleCancelRide = () => {
        ToastAndroid.show('Ride cancelled', ToastAndroid.SHORT);
        navigation.goBack();
    };

    const handleSubmitReview = () => {
        if (rating === 0) {
            ToastAndroid.show('Please select a rating', ToastAndroid.SHORT);
            return;
        }
        ToastAndroid.show('Review submitted!', ToastAndroid.SHORT);
        setReviewModalVisible(false);
        setRating(0);
        setReviewText('');
        // Implement API call to submit review
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
            <BackButton />
            <CabMap
                style={styles.map}
                pickupCoords={{
                    latitude: rideDetails.pickup.coordinates[0],
                    longitude: rideDetails.pickup.coordinates[1],
                }}
                dropCoords={{
                    latitude: rideDetails.drops[0].coordinates[0],
                    longitude: rideDetails.drops[0].coordinates[1],
                }}
                driverCoords={{
                    latitude: rideDetails.driver.location.coordinates[0],
                    longitude: rideDetails.driver.location.coordinates[1],
                }}
            />

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
                    <Animated.View style={[styles.cardContent]}>
                        {/* Collapsed State Content */}
                        <View style={styles.collapsedContent}>
                            <View style={styles.driverInfo}>
                                <Image
                                    source={ImagePath.Profile} // Replace with actual driver image
                                    style={styles.driverAvatar}
                                    accessibilityLabel="Driver avatar"
                                />
                                <View style={styles.driverDetails}>
                                    <Text style={styles.driverName}>{rideDetails.driver.name}</Text>
                                    <Text style={styles.driverRating}>
                                        {rideDetails.driver.rating > 0 ? `★ ${rideDetails.driver.rating.toFixed(1)}` : 'New Driver'}
                                    </Text>
                                    <Text numberOfLines={1} style={styles.vehicleText}>
                                        {rideDetails.driver.vehicle.model} • {rideDetails.driver.vehicle.number}
                                    </Text>
                                </View>
                                <View style={styles.actions}>
                                    <TouchableOpacity
                                        style={styles.shareBtn}
                                        onPress={handleShareRide}
                                        accessibilityLabel="Share ride"
                                    >
                                        <Ionicons size={20} name="share-outline" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.alertBtn}
                                        onPress={() => setHelpModalVisible(true)}
                                        accessibilityLabel="Need help"
                                    >
                                        <MaterialCommunityIcons size={20} name="alert-rhombus" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>


                        {/* Trip Status */}
                        <Text style={styles.etaText}>
                            Trip in progress • {rideDetails.eta} to destination • {rideDetails.distance} km
                        </Text>

                        {/* Trip Details */}
                        {/* <View style={styles.tripDetails}>
                            <View style={styles.detailRow}>
                                <Ionicons name="location-outline" size={20} color={THEAMCOLOR.PrimaryGreen} />
                                <View style={styles.detailTextContainer}>
                                    <Text style={styles.detailLabel}>Pickup</Text>
                                    <Text numberOfLines={1} ellipsizeMode="tail" style={styles.detailText}>
                                        {rideDetails.pickup.address}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="flag-outline" size={20} color={THEAMCOLOR.PrimaryGreen} />
                                <View style={styles.detailTextContainer}>
                                    <Text style={styles.detailLabel}>Drop-off</Text>
                                    <Text numberOfLines={1} ellipsizeMode="tail" style={styles.detailText}>
                                        {rideDetails.drops[0].address}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="cash-outline" size={20} color={THEAMCOLOR.PrimaryGreen} />
                                <View style={styles.detailTextContainer}>
                                    <Text style={styles.detailLabel}>Fare ({rideDetails.paymentMode})</Text>
                                    <Text style={styles.detailText}>₹{rideDetails.fare.toFixed(2)}</Text>
                                </View>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="time-outline" size={20} color={THEAMCOLOR.PrimaryGreen} />
                                <View style={styles.detailTextContainer}>
                                    <Text style={styles.detailLabel}>Distance & Duration</Text>
                                    <Text style={styles.detailText}>
                                        {rideDetails.distance} km • {rideDetails.eta}
                                    </Text>
                                </View>
                            </View>
                        </View> */}

                        {/* Action Buttons */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.actionBtn}
                                onPress={async () => {
                                    const status = fetchRideDetails(setRideDetails);
                                    RideStatus?.COMPLETED === await status ? navigation.navigate('AfterRideScreen', { ride: rideDetails }) : ToastAndroid.show('Ride is not completed, Please wait for the driver to accept the ride', ToastAndroid.SHORT);

                                }}
                                activeOpacity={0.8}
                                accessibilityLabel="Add review"
                            >
                                <Text style={styles.actionBtnText}>Finish Ride</Text>
                            </TouchableOpacity>

                        </View>

                    </Animated.View>
                </LinearGradient>
            </Animated.View >

            {/* Review Modal */}
            < Modal
                animationType="slide"
                transparent={true}
                visible={reviewModalVisible}
                onRequestClose={() => setReviewModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setReviewModalVisible(false)}
                            accessibilityLabel="Close review modal"
                        >
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Rate Your Ride</Text>
                        <View style={styles.ratingContainer}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity
                                    key={star}
                                    onPress={() => setRating(star)}
                                    accessibilityLabel={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                >
                                    <MaterialIcons
                                        name={star <= rating ? 'star' : 'star-border'}
                                        size={32}
                                        color={star <= rating ? '#FFB700' : '#ccc'}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TextInput
                            style={styles.reviewInput}
                            placeholder="Share your feedback (optional)"
                            value={reviewText}
                            onChangeText={setReviewText}
                            multiline
                            maxLength={200}
                            accessibilityLabel="Review feedback input"
                        />
                        <TouchableOpacity
                            style={styles.submitReviewButton}
                            onPress={handleSubmitReview}
                            accessibilityLabel="Submit review"
                        >
                            <Text style={styles.submitReviewButtonText}>Submit Review</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ Modal>

            {/* Help Modal */}
            < Modal
                animationType="slide"
                transparent={true}
                visible={helpModalVisible}
                onRequestClose={() => setHelpModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setHelpModalVisible(false)}
                            accessibilityLabel="Close help modal"
                        >
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                        <View style={styles.titleContainer}>
                            <MaterialCommunityIcons name="alert-rhombus" size={24} color="red" />
                            <Text style={styles.modalTitle}>Need Help?</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => handleHelpOption('Call our support for help')}
                        >
                            <View style={styles.optionContainer}>
                                <MaterialCommunityIcons name="phone-outline" size={16} color="#333" style={styles.optionIcon} />
                                <Text style={styles.modalOptionText}>Call our support for help</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => handleHelpOption('Call your emergency contact')}
                        >
                            <View style={styles.optionContainer}>
                                <MaterialCommunityIcons name="contacts" size={16} color="#333" style={styles.optionIcon} />
                                <Text style={styles.modalOptionText}>Call your emergency contact</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => handleHelpOption('Call Police for help')}
                        >
                            <View style={styles.optionContainer}>
                                <MaterialCommunityIcons name="police-badge" size={16} color="#333" style={styles.optionIcon} />
                                <Text style={styles.modalOptionText}>Call Police for help</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => handleHelpOption('Report crash')}
                        >
                            <View style={styles.optionContainer}>
                                <MaterialCommunityIcons name="car-brake-alert" size={16} color="#333" style={styles.optionIcon} />
                                <Text style={styles.modalOptionText}>Report crash</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </ Modal>
        </SafeAreaView >
    );
};

export default InRideScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEAMCOLOR.SecondarySmokeWhite,
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 10,
    },
    map: {
        width,
        height: height * 0.4,
    },
    bottomCard: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width,
        height: height * 0.45,
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
    },
    collapsedContent: {
        alignItems: 'center',
        paddingVertical: 10,
        paddingBottom: 0
    },
    driverInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    driverAvatar: {
        width: 50,
        height: 50,
        borderRadius: 30,
        marginRight: 15,
        backgroundColor: '#fff',
    },
    driverDetails: {
        flex: 1,
    },
    driverName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        fontFamily: THEAMFONTFAMILY.NunitoBold || 'Nunito-Bold',
    },
    driverRating: {
        fontSize: 11,
        color: '#666',
        fontFamily: THEAMFONTFAMILY.NunitoRegular || 'Nunito-Regular',
        marginVertical: 2,
    },
    vehicleText: {
        fontSize: 11,
        color: '#666',
        fontFamily: THEAMFONTFAMILY.NunitoRegular || 'Nunito-Regular',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10
        // width: width * 0.35,
    },
    callBtn: {
        backgroundColor: THEAMCOLOR?.SecondaryWhite,
        borderWidth: 1,
        borderColor: 'gray',
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    msgBtn: {
        backgroundColor: THEAMCOLOR?.SecondaryWhite,
        borderWidth: 1,
        borderColor: 'gray',
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    shareBtn: {
        backgroundColor: THEAMCOLOR?.SecondaryWhite,
        borderWidth: 1,
        borderColor: 'gray',
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    alertBtn: {
        backgroundColor: THEAMCOLOR?.SecondaryWhite,
        borderWidth: 1,
        borderColor: 'gray',
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    etaText: {
        fontSize: 14,
        fontWeight: '500',
        color: THEAMCOLOR.PrimaryGreen,
        textAlign: 'center',
        marginBottom: 10,
        fontFamily: THEAMFONTFAMILY.NunitoMedium || 'Nunito-Medium',
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
        fontSize: 13,
        color: '#999',
        fontFamily: THEAMFONTFAMILY.NunitoRegular || 'Nunito-Regular',
    },
    detailText: {
        fontSize: 14,
        color: '#333',
        fontFamily: THEAMFONTFAMILY.NunitoRegular || 'Nunito-Regular',
        marginTop: 2,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
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
        fontFamily: THEAMFONTFAMILY.NunitoBold || 'Nunito-Bold',
    },
    cancelBtn: {
        backgroundColor: '#d32f2f',
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
        fontFamily: THEAMFONTFAMILY.NunitoRegular || 'Nunito-Regular',
    },
    errorText: {
        fontSize: 16,
        color: '#d32f2f',
        fontFamily: THEAMFONTFAMILY.NunitoRegular || 'Nunito-Regular',
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
        fontFamily: THEAMFONTFAMILY.NunitoBold || 'Nunito-Bold',
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        fontFamily: THEAMFONTFAMILY.NunitoBold || 'Nunito-Bold',
        marginBottom: 10,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    modalOption: {
        paddingVertical: 12,
        width: '100%',
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionIcon: {
        marginRight: 10,
        borderWidth: 1,
        borderColor: THEAMCOLOR.SecondaryGray,
        borderRadius: 20,
        width: 30,
        height: 30,
        padding: 6,
    },
    modalOptionText: {
        fontSize: 14,
        color: '#333',
        fontFamily: THEAMFONTFAMILY.NunitoRegular || 'Nunito-Regular',
    },
    closeButton: {
        position: 'absolute',
        top: 15,
        right: 15,
    },
    ratingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 15,
    },
    reviewInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        width: '100%',
        height: 100,
        textAlignVertical: 'top',
        fontFamily: THEAMFONTFAMILY.NunitoRegular || 'Nunito-Regular',
        marginBottom: 15,
    },
    submitReviewButton: {
        backgroundColor: THEAMCOLOR.PrimaryGreen,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        width: '100%',
    },
    submitReviewButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        fontFamily: THEAMFONTFAMILY.NunitoBold || 'Nunito-Bold',
    },
});