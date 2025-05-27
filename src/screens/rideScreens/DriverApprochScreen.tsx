import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View, ScrollView, ToastAndroid, Modal } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { THEAMCOLOR, THEAMFONTFAMILY } from '../../assets/theam/theam';
import ImagePath from '../../constants/ImagePath';
import BackButton from '../../Components/common/BackButton';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import apiUtils from '../../utils/apiUtils';
import { RideDetails } from './BookRideScreen';

const { width, height } = Dimensions.get('screen');
export enum RideStatus {
    ONGOING = 'ongoing',
    REJECTED = 'rejected',
    ACCEPTED = 'accepted',
    REQUESTED = 'requested',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

const DriverApprochScreen = () => {
    const navigation = useNavigation<any>();
    const [rideDetails, setRideDetails] = useState<RideDetails | null>(null);
    const [request] = useState({
        name: 'Nikhil',
        eta: '3 Min',
        distance: 'Hero Splendor • DL 12 AA 2233',
        amount: 2480,
        pickup: '223, A Pocket, Dwarka, New Delhi',
        drop: 'E 99, Kamla Nagar, Delhi',
        totalDistance: '7.3 Km',
        userImage: 'https://i.pravatar.cc/150?img=8',
    });

    const [selectedReason, setSelectedReason] = useState<string>('');
    const [isReasonModalVisible, setIsReasonModalVisible] = useState(false);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

    const cancelReasons = [
        { id: '1', label: 'Driver not available' },
        { id: '2', label: 'Driver is late' },
        { id: '3', label: 'Plans changed unexpectedly' },
        { id: '4', label: 'Other' },
    ];

    // const isRideCancellable = rideDetails?.status === RideStatus.REQUESTED || rideDetails?.status === RideStatus.ACCEPTED;

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
            <BackButton style={styles.backButton} />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={true}
            >
                <MapView
                    style={styles.map}
                    region={{
                        latitude: 28.6139,
                        longitude: 77.2090,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                    scrollEnabled={false} // Disable map scrolling to avoid nested scrolling
                    zoomEnabled={true}
                    pitchEnabled={true}
                    rotateEnabled={true}
                >
                    <Marker coordinate={{ latitude: 28.6139, longitude: 77.2090 }} title="Your Location" />
                </MapView>
                <View style={styles.card}>
                    <View style={styles.profileRow}>
                        <Image source={{ uri: request.userImage }} style={styles.avatar} />
                        <View style={styles.info}>
                            <View style={styles.starContainer}>
                                <Text style={styles.name}>{rideDetails?.driver?.name}</Text>
                                {[...Array(rideDetails?.driver?.rating || 0)].map((_, index) => (
                                    <Icon key={index} name="star" size={16} color="#FFB700" />
                                ))}
                                {/* {[...Array(5 - rideDetails?.driver?.rating || 0)].map((_, index) => (
                                    <Icon key={index} name="star-outline" size={16} color="#000" />
                                ))} */}
                            </View>
                            <Text style={styles.detail}>{rideDetails?.driver?.vehicle?.model + ' • ' + rideDetails?.driver?.vehicle?.number}</Text>
                        </View>
                        <View style={styles.actions}>
                            <TouchableOpacity style={styles.callBtn}>
                                <Ionicons size={20} name="call-outline" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.msgBtn} onPress={() => navigation.navigate('ChatScreen')}>
                                <MaterialCommunityIcons size={20} name="message-processing-outline" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.detailsRow}>
                        <View style={styles.info}>
                            <Text style={styles.name2}>Driver is on the way</Text>
                            <Text style={styles.detail2}>
                                400 m away • ETA <Text style={{ color: THEAMCOLOR?.PrimaryGreen, fontFamily: THEAMFONTFAMILY.NunitoSemiBold }}>6 min</Text>
                            </Text>
                        </View>
                        <View>
                            <Text style={styles.cash}>Pin</Text>
                            <Text style={styles.amount}>{rideDetails?.pin}</Text>
                        </View>
                    </View>
                    <View style={styles.detailsRow3}>
                        <View style={styles.info}>
                            <Text style={styles.name2}>Ride Details</Text>
                        </View>
                        <View style={styles.moneyBox}>
                            <Image source={ImagePath?.location2} style={styles.money} />
                            <Text style={styles.detail2}>{rideDetails?.distance} Km</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.pathRow}
                        onPress={async () => {
                            const status = await fetchRideDetails();
                            RideStatus?.ONGOING === await status ? navigation.navigate('InRideScreen') : (RideStatus?.COMPLETED === await status ? navigation.navigate('AfterRideScreen') : ToastAndroid.show('Ride is not started, Please wait for the driver to start the ride', ToastAndroid.SHORT));

                        }}>
                        <View style={styles.iconColumn}>
                            <View style={styles.greenCircle} />
                            <LinearGradient colors={['#00FF00', '#FF0000']} style={styles.verticalLine} />
                            <View style={styles.redCircle} />
                        </View>
                        <View style={styles.textColumn}>
                            <Text style={styles.location}>{rideDetails?.pickup?.address}</Text>
                            <View style={styles.border} />
                            <Text style={styles.location2}>{rideDetails?.drops[0]?.address}</Text>
                        </View>
                    </TouchableOpacity>
                    {/* <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={() => navigation.navigate('InRideScreen')}
                    >
                        <Text style={styles.confirmButtonText}>Confirm your arrival</Text>
                    </TouchableOpacity> */}
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleCancelInitiate}
                    >
                        <Text style={styles.cancelButtonText}>Cancel Ride</Text>
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
                                    style={[styles.cancelButton2, { flex: 1, marginRight: 5 }]}
                                    onPress={() => setIsConfirmModalVisible(false)}
                                >
                                    <Text style={styles.cancelButtonText2}>No</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.confirmButton2, { flex: 1, marginLeft: 5 }]}
                                    onPress={handleCancelConfirm}
                                >
                                    <Text style={styles.confirmButtonText2}>Yes</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </SafeAreaView >
    );
};

export default DriverApprochScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEAMCOLOR?.SecondarySmokeWhite,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 2,
    },
    map: {
        width,
        height: height * 0.47, // Match InRideScreen map height
        alignSelf: 'center',
        overflow: 'hidden',
    },
    card: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderWidth: 1,
        borderColor: '#fafafa',
        overflow: 'hidden',
        backgroundColor: THEAMCOLOR.SecondarySmokeWhite,
        paddingBottom: 20,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: -2 },
        // shadowOpacity: 0.1,
        // shadowRadius: 4,
        // elevation: 5,
    },
    profileRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderStyle: 'dashed',
        borderColor: 'lightgray',
        backgroundColor: THEAMCOLOR.SecondarySmokeWhite,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingBottom: 5,
        marginBottom: 10,
    },
    detailsRow3: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    pathRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f0f2f5',
        borderRadius: 15,
        backgroundColor: '#fff',
        // shadowColor: 'gray',
        // shadowOffset: { width: 1, height: 1 },
        // shadowOpacity: 0.5,
        // shadowRadius: 10,
        elevation: 5,
        marginHorizontal: 15,
        padding: 15,
        marginVertical: 10,
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
        width: width * 0.75,
    },
    avatar: {
        width: 45,
        height: 45,
        borderRadius: 22,
        marginRight: 10,
    },
    info: {
        flex: 1,
    },
    starContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    name: {
        fontWeight: '600',
        fontSize: 13,
        marginRight: 10,
        fontFamily: THEAMFONTFAMILY.LatoRegular,
    },
    name2: {
        fontWeight: '600',
        fontSize: 14,
        marginBottom: 5,
        fontFamily: THEAMFONTFAMILY.LatoRegular,
    },
    detail: {
        color: '#666',
        fontSize: 11,
        fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    },
    detail2: {
        color: '#666',
        fontSize: 12,
        marginBottom: 5,
        fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    },
    amount: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#4CAF50',
        fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    },
    cash: {
        textAlign: 'right',
        color: 'gray',
        fontSize: 11,
        fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    },
    moneyBox: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    money: {
        width: 20,
        height: 18,
        marginRight: 5,
        resizeMode: 'contain',
    },
    location: {
        fontSize: 11,
        color: '#333',
        marginVertical: 3,
        marginBottom: 10,
        fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    },
    border: {
        width: '100%',
        borderStyle: 'dashed',
        borderColor: 'lightgray',
        borderBottomWidth: 1,
    },
    location2: {
        fontSize: 11,
        color: '#333',
        marginVertical: 2,
        marginTop: 10,
        fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: width * 0.25,
        marginTop: 10,
    },
    callBtn: {
        backgroundColor: THEAMCOLOR?.SecondaryWhite,
        borderWidth: 1,
        borderColor: 'gray',
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40,
        borderRadius: 22,
    },
    msgBtn: {
        backgroundColor: THEAMCOLOR?.SecondaryWhite,
        borderWidth: 1,
        borderColor: 'gray',
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40,
        borderRadius: 22,
    },
    withdrawSection: {
        marginHorizontal: 15,
        marginVertical: height * 0.02,
    },
    amountButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: 15,
        marginVertical: height * 0.01,
    },
    amountButton: {
        borderWidth: 1,
        borderColor: 'gray',
        paddingVertical: 3,
        paddingHorizontal: 15,
        borderRadius: 20,
    },
    amountButtonText: {
        fontSize: 10,
        fontWeight: '500',
        color: THEAMCOLOR.PrimaryGreen,
        fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    },
    confirmButton: {
        backgroundColor: THEAMCOLOR?.PrimaryGreen,
        paddingVertical: 12,
        borderRadius: 15,
        marginHorizontal: 15,
        marginVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: width * 0.035,
        fontWeight: 'bold',
        fontFamily: THEAMFONTFAMILY.LatoRegular,
    },
    cancelButton: {
        backgroundColor: THEAMCOLOR?.SecondaryWhite,
        paddingVertical: 12,
        borderRadius: 15,
        marginHorizontal: 15,
        marginVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: 'lightgray',
        borderWidth: 1,
    },
    cancelButtonText: {
        color: THEAMCOLOR?.PrimaryGreen,
        fontSize: width * 0.035,
        fontWeight: 'bold',
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
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmButtonContainer: {
        flexDirection: 'row',
        marginTop: 20,
    },

    cancelButton2: {
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
    confirmButton2: {
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
    cancelButtonText2: {
        fontSize: 14,
        fontWeight: 'bold',
        color: THEAMCOLOR.SecondaryBlack,
        fontFamily: THEAMFONTFAMILY.LatoRegular,
    },
    confirmButtonText2: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
        fontFamily: THEAMFONTFAMILY.LatoRegular,
    },
});