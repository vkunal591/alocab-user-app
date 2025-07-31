import { Dimensions, StyleSheet, Text, TouchableOpacity, View, ToastAndroid, Modal, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { THEAMCOLOR, THEAMFONTFAMILY } from '../../../assets/theam/theam';
import BackButton from '../../Components/common/BackButton';
import { CurrentRenderContext, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import ImagePath from '../../constants/ImagePath';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiUtils from '../../utils/apiUtils';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('screen');

export interface Coordinates {
    [0]: number; // latitude
    [1]: number; // longitude
}
interface Location {
    address: string;
    coordinates: [number, number];
}

interface User {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
    status: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

interface Vehicle {
    type: string;
    number: string;
    model: string;
    color: string;
}

interface Documents {
    license: string;
    registration: string;
}

interface DriverLocation {
    type: string;
    coordinates: [number, number];
}

interface Driver {
    vehicle: Vehicle;
    documents: Documents;
    location: DriverLocation;
    _id: string;
    name: string;
    phoneNumber: string;
    email: string;
    isMobileVerified: boolean;
    kycVerified: boolean;
    approvalStatus: string;
    status: string;
    rating: number;
    earnings: number;
    ridesCompleted: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
    commissionPercentage: number;
}

export interface RideDetails {
    pickup: Location;
    _id: string;
    user: User;
    drops: Location[];
    status: string;
    isPinVerified: boolean;
    pin: number;
    vehicleType: string;
    penaltyAmount: number;
    paymentMode: string;
    promoCode: string | null;
    promoCodeDetails: any | null;
    createdAt: string;
    updatedAt: string;
    __v: number;
    distance: string;
    driver: Driver;
    fare: number;
    startedAt: string;
}

export enum RideStatus {
    ONGOING = 'ongoing',
    REJECTED = 'rejected',
    ACCEPTED = 'accepted',
    REQUESTED = 'requested',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}


export const rideStatusColors: Record<RideStatus, string> = {
    [RideStatus.ONGOING]: '#FFE58F',     // Light Yellow
    [RideStatus.REJECTED]: '#FF4D4F',    // Red
    [RideStatus.ACCEPTED]: '#91D5FF',    // Blue
    [RideStatus.REQUESTED]: '#D3ADF7',   // Purple
    [RideStatus.COMPLETED]: '#52C41A',   // Green
    [RideStatus.CANCELLED]: '#BFBFBF'    // Gray
};



const BookRideScreen = () => {
    const navigation = useNavigation<any>();
    const [rideDetails, setRideDetails] = useState<RideDetails | null>(null);
    const [selectedReason, setSelectedReason] = useState<string>('');
    const [isReasonModalVisible, setIsReasonModalVisible] = useState(false);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

    const cancelReasons = [
        { id: '1', label: 'Driver not available' },
        { id: '2', label: 'Driver is late' },
        { id: '3', label: 'Plans changed unexpectedly' },
        { id: '4', label: 'Other' },
    ];

    const pickup = { latitude: 28.6119, longitude: 77.2190 };
    const dropoff = { latitude: 28.6319, longitude: 77.2290 };

    const isRideCancellable = rideDetails?.status === RideStatus.REQUESTED || rideDetails?.status === RideStatus.ACCEPTED;

    const fetchRideDetails = async () => {
        try {
            const response: any = await apiUtils.get('/api/ride/detail');
            if (response?.success) {
                setRideDetails(response.ride);
                console.log('Ride details fetched:', response.ride);
                return response?.ride?.status;
            } else {
                ToastAndroid.show(response?.message || 'Failed to fetch ride details', ToastAndroid.SHORT);
                return null;
            }
        } catch (error: any) {
            ToastAndroid.show(error.message || 'Error fetching ride details', ToastAndroid.LONG);
            return null;
        }
    };
    useEffect(() => {
        const getRideDetails = async () => {
            await fetchRideDetails();
        };
        getRideDetails();
    }, []);

    const handleCancelInitiate = async () => {
        const status = await fetchRideDetails();
        if (status !== RideStatus.REQUESTED && status !== RideStatus.ACCEPTED) {
            ToastAndroid.show('Ride cannot be cancelled at this time', ToastAndroid.SHORT);
            return;
        }
        setIsReasonModalVisible(true);
    };

    const handleReasonSelect = (reason: string) => {
        setSelectedReason(reason);
        setIsReasonModalVisible(false);
        setIsConfirmModalVisible(true);
    };

    const handleCancelConfirm = async () => {
        if (!rideDetails?._id) {
            ToastAndroid.show('No active ride found', ToastAndroid.SHORT);
            return;
        }

        try {
            const payload = {
                cancelledBy: 'user',
                reason: selectedReason,
            };

            const response: any = await apiUtils.post(`/api/ride/cancel/${rideDetails._id}`, payload);
            if (response?.success) {
                ToastAndroid.show('Ride cancelled successfully', ToastAndroid.SHORT);
                navigation.navigate('HomeScreen');
            } else {
                ToastAndroid.show(response?.message || 'Failed to cancel ride', ToastAndroid.SHORT);
            }
        } catch (error: any) {
            ToastAndroid.show(error.message || 'Error cancelling ride', ToastAndroid.LONG);
        } finally {
            setIsConfirmModalVisible(false);
            setSelectedReason('');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 28.6219,
                    longitude: 77.2240,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
            >
                <Marker coordinate={pickup} pinColor="red" />
                <Marker coordinate={dropoff} pinColor="green" />
                <Polyline coordinates={[pickup, dropoff]} strokeColor="#00FF00" strokeWidth={3} />
            </MapView>
            <BackButton />
            <View style={styles.spacer} />
            <View style={styles.bottomContainer}>
                <TouchableOpacity style={styles.rideOption}>
                    <Image source={ImagePath.auto} style={styles.rideIcon} />
                    <View style={styles.rideDetails}>
                        <Text style={styles.rideType}>{rideDetails?.vehicleType?.toUpperCase()}</Text>
                        <Text
                            style={[
                                styles.rideInfo,
                                { backgroundColor: rideStatusColors[rideDetails?.status] }
                            ]}
                        >
                            {rideDetails?.status?.charAt(0).toUpperCase() + rideDetails?.status?.slice(1)}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.ridePrice}>₹ NA</Text>
                        <Text style={styles.ridePrice}> {rideDetails?.paymentMode?.charAt(0).toUpperCase() + rideDetails?.paymentMode?.slice(1)}</Text>
                    </View>
                </TouchableOpacity>
                <View style={styles.optionsRow}>
                    <Text style={styles.optionText}>Location Details</Text>
                    <View style={styles.distanceContainer}>
                        <Image source={ImagePath.location} style={styles.optionIcon} />
                        <Text style={styles.optionText}>5.4 Km</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.pathRow} onPress={async () => {
                    const status = fetchRideDetails();

                    RideStatus?.ACCEPTED === await status ? navigation.navigate('DriverApprochScreen') : (RideStatus?.ONGOING === await status ? navigation.navigate('InRideScreen') : ToastAndroid.show('Ride is not accepted, Please wait for the driver to accept the ride', ToastAndroid.SHORT));
                }}>
                    <View style={styles.iconColumn}>
                        <View style={styles.greenCircle} />
                        <LinearGradient colors={['#00FF00', '#FF0000']} style={styles.verticalLine} />
                        <View style={styles.redCircle} />
                    </View>
                    <View style={styles.textColumn}>
                        <Text style={styles.location}>{rideDetails?.pickup?.address}</Text>
                        <Text style={styles.location}>{rideDetails?.drops[0]?.address}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.bookButton, !isRideCancellable && { opacity: 0.5 }]}
                    onPress={handleCancelInitiate}
                    disabled={!isRideCancellable}
                >
                    <Text style={styles.bookButtonText}>Cancel Ride</Text>
                </TouchableOpacity>
            </View>

            {/* Reason Selection Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isReasonModalVisible}
                onRequestClose={() => setIsReasonModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setIsReasonModalVisible(false)}
                        >
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Select Cancellation Reason</Text>
                        {cancelReasons.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                style={styles.radioOption}
                                onPress={() => handleReasonSelect(option.label)}
                            >
                                <Text style={styles.radioText}>{option.label}</Text>
                                <View style={styles.radioCircle}>
                                    {selectedReason === option.label && <View style={styles.radioSelected} />}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>

            {/* Confirmation Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isConfirmModalVisible}
                onRequestClose={() => setIsConfirmModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setIsConfirmModalVisible(false)}
                        >
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Confirm Cancellation</Text>
                        <Text style={styles.radioText}>Are you sure you want to cancel the ride?</Text>
                        <Text style={styles.radioText}>Reason: {selectedReason}</Text>
                        <View style={styles.confirmButtonContainer}>
                            <TouchableOpacity
                                style={[styles.cancelButton, { flex: 1, marginRight: 5 }]}
                                onPress={() => setIsConfirmModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>No</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.confirmButton, { flex: 1, marginLeft: 5 }]}
                                onPress={handleCancelConfirm}
                            >
                                <Text style={styles.bookButtonText}>Yes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default BookRideScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    map: {
        width,
        height: height * 0.55,
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: -1,
    },
    spacer: {
        height: height * 0.55,
        backgroundColor: 'transparent',
    },
    bottomContainer: {
        height: height * 0.55,
        backgroundColor: '#fff',
        paddingTop: 10,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    pathRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 15,
        padding: 15,
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
    distanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionIcon: {
        width: 15,
        height: 15,
        resizeMode: 'contain',
    },
    optionText: {
        fontSize: 13,
        color: '#000',
        marginHorizontal: 5,
        fontFamily: THEAMFONTFAMILY.LatoRegular,
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
    rideIcon: {
        width: 40,
        height: 40,
        marginRight: 10,
        resizeMode: 'contain',
    },
    rideDetails: {
        flex: 1,
    },
    rideType: {
        fontSize: 13,
        fontWeight: '500',
        color: '#333',
        fontFamily: THEAMFONTFAMILY.LatoRegular,
    },
    rideInfo: {
        fontSize: 11,
        color: '#333',
        fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
        paddingHorizontal: 10,
        paddingVertical: 1,
        borderRadius: 12,
        textAlign: 'center',
        alignSelf: 'flex-start',
        textTransform: 'none', // We're handling capitalization in code
        marginTop: 5,
    },


    ridePrice: {
        fontSize: 13,
        fontWeight: '500',
        color: THEAMCOLOR.PrimaryGreen,
        fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    },
    bookButton: {
        backgroundColor: THEAMCOLOR.PrimaryGreen,
        paddingVertical: 13,
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
    cancelButton: {
        backgroundColor: THEAMCOLOR.SecondarySmokeWhite,
        paddingVertical: 10,
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
    confirmButton: {
        backgroundColor: THEAMCOLOR.PrimaryGreen,
        paddingVertical: 10,
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
    cancelButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: THEAMCOLOR.SecondaryBlack,
        fontFamily: THEAMFONTFAMILY.LatoRegular,
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
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
        fontFamily: THEAMFONTFAMILY.LatoRegular,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    radioText: {
        fontSize: 14,
        color: '#333',
        fontFamily: THEAMFONTFAMILY.LatoRegular,
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
        top: 15,
        right: 15,
    },
    confirmButtonContainer: {
        flexDirection: 'row',
        marginTop: 20,
    },
});