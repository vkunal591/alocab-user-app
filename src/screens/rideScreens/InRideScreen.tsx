import { Dimensions, Image, Modal, StyleSheet, Text, TouchableOpacity, View, ScrollView, ToastAndroid } from 'react-native';
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

const InRideScreen = () => {
    const [modalVisible, setModalVisible] = useState(false);
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

    const handleOptionPress = (option) => {
        console.log(`Selected option: ${option}`);
        setModalVisible(false);
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


    return (
        <SafeAreaView style={styles.container}>
            <BackButton />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <MapView
                    style={styles.map}
                    region={{
                        latitude: 28.6139,
                        longitude: 77.2090,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                    scrollEnabled={true}
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
                                <Text style={styles.name}>{request.name}</Text>
                                {[...Array(rideDetails?.driver?.rating || 0)].map((_, index) => (
                                    <Icon key={index} name="star" size={16} color="#FFB700" />
                                ))}
                            </View>
                            <Text style={styles.detail}>{rideDetails?.driver?.vehicle?.model + ' • ' + rideDetails?.driver?.vehicle?.number}</Text>
                        </View>
                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={styles.callBtn}
                                onPress={() => setModalVisible(true)}
                            >
                                <Image source={ImagePath.alert} style={styles.inputIcon} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.msgBtn}>
                                <Image source={ImagePath.share} style={styles.inputIcon} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.detailsRow}>
                        <View style={styles.info}>
                            <Text style={styles.name2}>Trip in progress</Text>
                            <Text style={styles.detail2}>You will reach your destination in<Text style={{ color: THEAMCOLOR?.PrimaryGreen, }}>{' 32 min'}</Text></Text>
                        </View>
                    </View>
                    <View style={styles.detailsRow3}>
                        <View style={styles.info}>
                            <Text style={styles.name2}>Payment Mode</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, }}>
                                <Image source={ImagePath.money} style={{ width: 15, height: 15, resizeMode: 'contain' }} />
                                <Text style={styles.detail2}>{rideDetails?.paymentMode?.charAt(0)?.toUpperCase() + rideDetails?.paymentMode?.slice(1)}</Text>
                            </View>
                        </View>
                        {/* <TouchableOpacity onPress={() => navigation.navigate("PaymentScreen")} style={{ backgroundColor: THEAMCOLOR.PrimaryGreen, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 10, color: '#fff', }}>
                            <Text style={{ fontSize: 12, color: '#fff' }}>Pay Now</Text>
                        </TouchableOpacity> */}
                    </View>
                    <View style={styles.detailsRow3}>
                        <View style={styles.info}>
                            <Text style={styles.name2}>Ride Details </Text>
                        </View>
                        <View style={styles.moneyBox}>
                            <Image source={ImagePath?.location2} style={styles.money} />
                            <Text style={styles.detail2}>{rideDetails?.distance} Km</Text>
                        </View>
                    </View>
                    <View style={styles.pathRow}>
                        <View style={styles.iconColumn}>
                            <View style={styles.greenCircle} />
                            <LinearGradient colors={['#00FF00', '#FF0000']} style={styles.verticalLine} />
                            <View style={styles.redCircle} />
                        </View>
                        <View style={styles.textColumn}>
                            <Text style={styles.location}>{rideDetails?.pickup?.address}</Text>
                            <View style={styles.border}></View>
                            <Text style={styles.location2}>{rideDetails?.drops[0]?.address}</Text>
                        </View>
                    </View>
                    {/* <View style={styles.withdrawSection}>
                        <Text style={styles.name2}>Tip the driver</Text>
                        <View style={styles.amountButtons}>
                            {[100, 200, 500, 'Tip In Cash'].map((amount) => (
                                <TouchableOpacity key={amount} style={styles.amountButton}>
                                    <Text style={styles.amountButtonText}>₹{amount}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View> */}
                    <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={async () => {
                            const status = fetchRideDetails();
                            RideStatus?.COMPLETED === await status ? navigation.navigate('AfterRideScreen',{rideId:rideDetails?._id}): ToastAndroid.show('Ride is not completed, Please wait for the driver to complete the ride', ToastAndroid.SHORT);
                        }}>
                        <Text style={styles.confirmButtonText}>Add Review</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
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
                            <MaterialCommunityIcons name="alert-rhombus" size={29} color="#333" style={{ color: 'red' }} />
                            <Text style={styles.modalTitle}>Need Help?</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => handleOptionPress('Call our support for help')}
                        >
                            <View style={styles.optionContainer}>
                                <MaterialCommunityIcons name="phone-outline" size={16} color="#333" style={styles.optionIcon} />
                                <Text style={styles.modalOptionText}>Call our support for help</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => handleOptionPress('Call your emergency contact')}
                        >
                            <View style={styles.optionContainer}>
                                <MaterialCommunityIcons name="contacts" size={16} color="#333" style={styles.optionIcon} />
                                <Text style={styles.modalOptionText}>Call your emergency contact</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => handleOptionPress('Call Police for help')}
                        >
                            <View style={styles.optionContainer}>
                                <MaterialCommunityIcons name="police-badge" size={16} color="#333" style={styles.optionIcon} />
                                <Text style={styles.modalOptionText}>Call Police for help</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => handleOptionPress('Report crash')}
                        >
                            <View style={styles.optionContainer}>
                                <MaterialCommunityIcons name="car-brake-alert" size={16} color="#333" style={styles.optionIcon} />
                                <Text style={styles.modalOptionText}>Report crash</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default InRideScreen;
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
    map: {
        width,
        height: height * 0.4,
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
    },
    profileRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderStyle: 'dashed',
        borderColor: 'lightgray',
        paddingBottom: 18,
        marginBottom: 10,
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
        shadowColor: 'gray',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
        marginHorizontal: 15,
        padding: 15,
        marginTop: 5,
        marginBottom: 25,
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
        fontFamily: THEAMFONTFAMILY.NunitoSemiBold, // Subtitle
    },
    name2: {
        fontWeight: 'semibold',
        fontSize: 14,
        marginBottom: 5,
        fontFamily: THEAMFONTFAMILY.NunitoSemiBold, // Subtitle
    },
    detail: {
        color: '#666',
        fontSize: 11,
        fontFamily: THEAMFONTFAMILY.NunitoSemiBold, // Description
    },
    detail2: {
        color: '#666',
        fontSize: 12,
        marginBottom: 5,
        fontFamily: THEAMFONTFAMILY.NunitoSemiBold, // Description
    },
    amount: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#4CAF50',
        fontFamily: THEAMFONTFAMILY.NunitoSemiBold, // Description
    },
    cash: {
        textAlign: 'right',
        color: 'gray',
        fontSize: 11,
        fontFamily: THEAMFONTFAMILY.NunitoSemiBold, // Description
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
        fontFamily: THEAMFONTFAMILY.NunitoSemiBold, // Description
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
        fontFamily: THEAMFONTFAMILY.NunitoSemiBold, // Description
    },
    distanceText: {
        fontSize: 11,
        color: '#999',
        fontFamily: THEAMFONTFAMILY.NunitoSemiBold, // Description
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
    inputIcon: {
        width: 20,
        height: 20,
        padding: 5,
        marginHorizontal: 10,
        resizeMode: 'contain',
    },
    withdrawSection: {
        marginHorizontal: 15,
        marginBottom: height * 0.02,
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
        fontFamily: THEAMFONTFAMILY.NunitoSemiBold, // Description
    },
    confirmButton: {
        backgroundColor: THEAMCOLOR?.PrimaryGreen,
        paddingVertical: 12,
        borderRadius: 15,
        marginHorizontal: 15,
        marginBottom: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: width * 0.035,
        fontWeight: 'bold',
        fontFamily: THEAMFONTFAMILY.NunitoSemiBold, // Description
    },
    cancelButton: {
        backgroundColor: THEAMCOLOR?.SecondaryWhite,
        paddingVertical: 12,
        borderRadius: 15,
        marginHorizontal: 15,
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: 'lightgray',
        borderWidth: 1,
    },
    cancelButtonText: {
        color: THEAMCOLOR?.PrimaryGreen,
        fontSize: width * 0.035,
        fontWeight: 'bold',
        fontFamily: THEAMFONTFAMILY.NunitoSemiBold, // Description
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
        fontFamily: THEAMFONTFAMILY.LatoRegular, // Title
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    modalOption: {
        paddingVertical: 10,
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
        fontSize: 11,
        color: '#333',
        fontFamily: THEAMFONTFAMILY.NunitoSemiBold, // Description
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 15,
    },
});