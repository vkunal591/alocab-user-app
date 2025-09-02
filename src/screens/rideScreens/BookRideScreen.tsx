import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ToastAndroid,
    Modal,
    Image,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { THEAMCOLOR, THEAMFONTFAMILY } from '../../../assets/theam/theam';
import ImagePath from '../../constants/ImagePath';
import apiUtils from '../../utils/apiUtils';
import CabMap from '../../Components/common/CabMap';
import BackButton from '../../Components/common/BackButton';

const { width, height } = Dimensions.get('screen');

export interface Coordinates {
    [0]: number;
    [1]: number;
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
    CANCELLED = 'cancelled',
}

export const rideStatusColors: Record<RideStatus, string> = {
    [RideStatus.ONGOING]: '#FFE58F',
    [RideStatus.REJECTED]: '#FF4D4F',
    [RideStatus.ACCEPTED]: '#91D5FF',
    [RideStatus.REQUESTED]: '#D3ADF7',
    [RideStatus.COMPLETED]: '#52C41A',
    [RideStatus.CANCELLED]: '#BFBFBF',
};

export const fetchRideDetails = async (setRideDetails: any) => {
    try {
        const response: any = await apiUtils.get('/api/ride/active/ride');
        console.log(response)
        if (response?.success) {
            setRideDetails(response.data);
            return response?.data?.status;
        } else {
            ToastAndroid.show(response?.message || 'Failed to fetch ride', ToastAndroid.SHORT);
            return null;
        }
    } catch (error: any) {
        ToastAndroid.show(error.message || 'Error fetching ride', ToastAndroid.LONG);
        return null;
    }
};

const fetchRideDetailData = async (setRideDetails: any) => {
    try {
        const response: any = await apiUtils.get('/api/ride/active/ride');
        console.log(response)
        if (response?.success) {
            setRideDetails(response.data);
            return response?.data;
        } else {
            ToastAndroid.show(response?.message || 'Failed to fetch ride', ToastAndroid.SHORT);
            return null;
        }
    } catch (error: any) {
        ToastAndroid.show(error.message || 'Error fetching ride', ToastAndroid.LONG);
        return null;
    }
};

const BookRideScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<RouteProp<any>>();

    const ride = route.params?.ride;
    const pickupLocation = route.params?.pickupLocation;
    const dropLocation = route.params?.dropLocation;
    const vehicleTypeParam = route.params?.vehicleType;
    const paymentMethodParam = route.params?.paymentMethod;
    console.log(ride)
    const [rideDetails, setRideDetails] = useState<RideDetails | null>(null);
    const [selectedReason, setSelectedReason] = useState<string>('');
    const [isReasonModalVisible, setIsReasonModalVisible] = useState(false);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

    const isRideCancellable =
        rideDetails?.status === RideStatus.REQUESTED || rideDetails?.status === RideStatus.ACCEPTED;

    const cancelReasons = [
        { id: '1', label: 'Driver not available' },
        { id: '2', label: 'Driver is late' },
        { id: '3', label: 'Plans changed unexpectedly' },
        { id: '4', label: 'Other' },
    ];

    useEffect(() => {
        if (pickupLocation && dropLocation && vehicleTypeParam && paymentMethodParam) {
            const dynamicRide: RideDetails = {
                _id: 'temp-id',
                user: {} as any,
                pickup: pickupLocation,
                drops: [dropLocation],
                status: RideStatus.REQUESTED,
                isPinVerified: false,
                pin: 0,
                vehicleType: vehicleTypeParam,
                penaltyAmount: 0,
                paymentMode: paymentMethodParam,
                promoCode: null,
                promoCodeDetails: null,
                createdAt: '',
                updatedAt: '',
                __v: 0,
                distance: ride?.distance ?? 'NA',
                driver: {} as any,
                fare: ride?.fare?.toFixed(2) ?? 0,
                startedAt: '',
            };
            setRideDetails(dynamicRide);
        } else {
            fetchRideDetails(setRideDetails);
        }
    }, []);

    const handleCancelInitiate = async () => {
        const status = await fetchRideDetails(setRideDetails);
        if (status !== RideStatus.REQUESTED && status !== RideStatus.ACCEPTED) {
            ToastAndroid.show('Ride cannot be cancelled now', ToastAndroid.SHORT);
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
        if (!rideDetails?._id || rideDetails._id === 'temp-id') {
            ToastAndroid.show('Cannot cancel this ride.', ToastAndroid.SHORT);
            return;
        }

        try {
            const payload = {
                cancelledBy: 'user',
                reason: selectedReason,
            };

            const response: any = await apiUtils.post(`/api/ride/cancel/${rideDetails._id}`, payload);

            if (response?.success) {
                ToastAndroid.show('Ride cancelled', ToastAndroid.SHORT);
                navigation.navigate('HomeScreen');
            } else {
                ToastAndroid.show(response?.message || 'Cancel failed', ToastAndroid.SHORT);
            }
        } catch (error: any) {
            console.log(error);
            ToastAndroid.show(error.message || 'Error cancelling', ToastAndroid.LONG);
        } finally {
            setIsConfirmModalVisible(false);
            setSelectedReason('');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <CabMap
                pickupCoords={
                    rideDetails?.pickup?.coordinates
                        ? {
                            latitude: rideDetails.pickup.coordinates[0],
                            longitude: rideDetails.pickup.coordinates[1],
                        }
                        : null
                }
                dropCoords={
                    rideDetails?.drops[0]?.coordinates
                        ? {
                            latitude: rideDetails.drops[0].coordinates[0],
                            longitude: rideDetails.drops[0].coordinates[1],
                        }
                        : null
                }
            />

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
                                { backgroundColor: rideStatusColors[rideDetails?.status || RideStatus.REQUESTED] },
                            ]}
                        >
                            {rideDetails?.status?.charAt(0)?.toUpperCase() + rideDetails?.status?.slice(1)}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.ridePrice}>₹ {Number(rideDetails?.fare)?.toFixed(2) || 'NA'}</Text>
                        <Text style={styles.ridePrice}>
                            {rideDetails?.paymentMode?.charAt(0)?.toUpperCase() + rideDetails?.paymentMode?.slice(1)}
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.pathRow}
                    onPress={async () => {
                        const data = await fetchRideDetailData(setRideDetails);
                        const status = data?.status;
                        if (status === RideStatus.ACCEPTED) {
                            navigation.navigate('DriverApprochScreen', { ride: data });
                        } else if (status === RideStatus.ONGOING) {
                            navigation.navigate('InRideScreen', { ride: data });
                        } else {
                            ToastAndroid.show(
                                'Ride is not accepted, Please wait for the driver to accept the ride',
                                ToastAndroid.SHORT
                            );
                        }
                    }}
                >
                    <View style={styles.iconColumn}>
                        <View style={styles.greenCircle} />
                        <LinearGradient colors={['#00FF00', '#FF0000']} style={styles.verticalLine} />
                        <View style={styles.redCircle} />
                    </View>
                    <View style={styles.textColumn}>
                        <Text numberOfLines={1} style={styles.location}>
                            {rideDetails?.pickup?.address}
                        </Text>
                        <Text numberOfLines={1} style={styles.location}>
                            {rideDetails?.drops[0]?.address}
                        </Text>
                    </View>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>

                    <TouchableOpacity
                        style={[styles.bookButton]}
                        onPress={async () => {
                            const data = await fetchRideDetailData(setRideDetails);
                            const status = data?.status;
                            if (status === RideStatus.ACCEPTED) {
                                navigation.navigate('DriverApprochScreen', { ride: data });
                            } else if (status === RideStatus.ONGOING) {
                                navigation.navigate('InRideScreen', { ride: data });
                            } else {
                                ToastAndroid.show(
                                    'Ride is not accepted, Please wait for the driver to accept the ride',
                                    ToastAndroid.SHORT
                                );
                            }
                        }}                    >
                        <Text style={styles.bookButtonText}>Continue Ride</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.bookButton, { backgroundColor: THEAMCOLOR.PrimaryRed }, !isRideCancellable && { opacity: 0.5 }]}
                        onPress={handleCancelInitiate}
                        disabled={!isRideCancellable}
                    >
                        <Text style={styles.bookButtonText}>Cancel Ride</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Modal animationType="slide" transparent visible={isReasonModalVisible}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setIsReasonModalVisible(false)}>
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

            <Modal animationType="slide" transparent visible={isConfirmModalVisible}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setIsConfirmModalVisible(false)}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Confirm Cancellation</Text>
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
        zIndex: 0,
    },
    spacer: {
        height: height * 0.45,
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        width,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    rideOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    rideIcon: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
    },
    rideDetails: {
        flex: 1,
        marginHorizontal: 10,
    },
    rideType: {
        fontFamily: THEAMFONTFAMILY.PoppinsBold,
        fontSize: 18,
    },
    rideInfo: {
        marginTop: 4,
        paddingVertical: 3,
        paddingHorizontal: 10,
        borderRadius: 10,
        color: '#fff',
        alignSelf: 'flex-start',
        fontFamily: THEAMFONTFAMILY.PoppinsRegular,
        fontSize: 12,
        overflow: 'hidden',
    },
    ridePrice: {
        fontFamily: THEAMFONTFAMILY.PoppinsMedium,
        fontSize: 14,
        textAlign: 'right',
    },
    pathRow: {
        flexDirection: 'row',
        marginTop: 15,
    },
    iconColumn: {
        width: 20,
        alignItems: 'center',
        marginRight: 10,
    },
    greenCircle: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: 'green',
        marginBottom: 3,
    },
    verticalLine: {
        width: 2,
        flex: 1,
    },
    redCircle: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: 'red',
        marginTop: 3,
    },
    textColumn: {
        flex: 1,
    },
    location: {
        fontFamily: THEAMFONTFAMILY.PoppinsRegular,
        fontSize: 14,
        color: '#333',
        marginBottom: 10,
    },
    bookButton: {
        marginTop: 20,
        backgroundColor: THEAMCOLOR?.PrimaryGreen,
        borderRadius: 50,
        paddingVertical: 10,
        alignItems: 'center',
        width: width * 0.4
    },
    bookButtonText: {
        color: '#fff',
        fontFamily: THEAMFONTFAMILY.PoppinsMedium,
        fontSize: 13,
        fontWeight: '500'
    },
    sliderButton: {
        backgroundColor: THEAMCOLOR?.PrimaryGreen,
        borderRadius: 50,
        paddingVertical: 15,
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: '#00000099',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
    },
    closeButton: {
        alignSelf: 'flex-end',
    },
    modalTitle: {
        fontFamily: THEAMFONTFAMILY.PoppinsRegular,
        fontSize: 18,
        marginBottom: 20,
        color: '#000',
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: '#ccc',
        justifyContent: 'space-between',
    },
    radioText: {
        fontFamily: THEAMFONTFAMILY.PoppinsRegular,
        fontSize: 16,
        color: '#333',
    },
    radioCircle: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: THEAMCOLOR?.PrimaryGreen,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioSelected: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: THEAMCOLOR?.PrimaryGreen,
    },
    confirmButtonContainer: {
        flexDirection: 'row',
        marginTop: 20,
    },
    cancelButton: {
        backgroundColor: '#ccc',
        borderRadius: 50,
        paddingVertical: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontFamily: THEAMFONTFAMILY.PoppinsMedium,
        fontSize: 16,
        color: '#333',
    },
    confirmButton: {
        backgroundColor: THEAMCOLOR?.PrimaryGreen,
        borderRadius: 50,
        paddingVertical: 12,
        alignItems: 'center',
    },
});
