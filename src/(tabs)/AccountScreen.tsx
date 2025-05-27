import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    Modal,
    Alert,
    ToastAndroid,
} from 'react-native';
import React, { useState } from 'react';
import { THEAMCOLOR } from '../assets/theam/theam';
import ImagePath from '../constants/ImagePath';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window'); // Get device dimensions for responsiveness

const AccountScreen = () => {
    const navigation = useNavigation<any>();
    const [modalVisible, setModalVisible] = useState(false);
    const [actionType, setActionType] = useState(''); // 'logout' or 'deactivate'

    // Function to handle opening the confirmation modal
    const openConfirmationModal = (type) => {
        setActionType(type);
        setModalVisible(true);
    };

    // Function to handle confirmation action
    const handleConfirm = () => {
        if (actionType === 'logout') {
            // Perform logout action (e.g., clear auth token, navigate to login)
            ToastAndroid.show('You have been logged out successfully.', 2000);
            navigation.navigate('LoginScreen');
        } else if (actionType === 'deactivate') {
            // Perform deactivate account action
            ToastAndroid.show('Your account has been deactivated.', 2000);
            // Example: Call API to deactivate account
            navigation.navigate('LoginScreen');

        }
        setModalVisible(false);
    };

    // Function to handle canceling the action
    const handleCancel = () => {
        setModalVisible(false);
        setActionType('');
    };

    return (
        <ScrollView>
            <View style={styles.container}>
                {/* Header with Title */}
                <Text style={styles.headerTitle}>Profile</Text>

                {/* Profile Section */}
                <View style={styles.profileSection}>
                    <Image
                        source={{ uri: 'https://i.pravatar.cc/150?img=8' }}
                        style={styles.profileImage}
                    />
                    <TouchableOpacity
                        style={styles.editIcon}
                        onPress={() => navigation.navigate('EditProfileScreen')}>
                        <Image source={ImagePath.edit} style={{ width: 20, height: 20 }} />
                    </TouchableOpacity>
                    <Text style={styles.name}>Devesh</Text>
                    <Text style={styles.id}>01552882189</Text>

                    {/* Stats */}
                    <View style={styles.statsContainer}>
                        <View style={styles.stat}>
                            <Image source={ImagePath.star} style={{ width: 20, height: 20 }} />
                            <Text style={styles.statText}>4.9 Star</Text>
                        </View>
                        <View style={styles.stat}>
                            <Image source={ImagePath.route} style={{ width: 20, height: 20 }} />
                            <Text style={styles.statText}>100 Trip</Text>
                        </View>
                        <View style={styles.stat}>
                            <Image source={ImagePath.case} style={{ width: 20, height: 20 }} />
                            <Text style={styles.statText}>1 Year</Text>
                        </View>
                    </View>
                </View>

                {/* Options List */}
                <View style={styles.optionsContainer}>
                    <TouchableOpacity
                        style={styles.option}
                        onPress={() => navigation.navigate('WalletScreen')}>
                        <Image
                            source={ImagePath.wallet}
                            style={{ width: 20, height: 20, resizeMode: 'contain' }}
                        />
                        <Text style={styles.optionText}>Wallet</Text>
                        <Icon name="chevron-right" size={24} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.option}>
                        <Image
                            source={ImagePath.rating}
                            style={{ width: 20, height: 20, resizeMode: 'contain' }}
                        />
                        <Text style={styles.optionText}>Rating & Reviews</Text>
                        <Icon name="chevron-right" size={24} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('SupportScreen')}>
                        <Image
                            source={ImagePath.support2}
                            style={{ width: 20, height: 20, resizeMode: 'contain' }}
                        />
                        <Text style={styles.optionText}>Customer Support</Text>
                        <Icon name="chevron-right" size={24} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.option}>
                        <Image
                            source={ImagePath.privacy}
                            style={{ width: 20, height: 20, resizeMode: 'contain' }}
                        />
                        <Text style={styles.optionText}>Privacy Policy</Text>
                        <Icon name="chevron-right" size={24} color="#000" />
                    </TouchableOpacity>
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={() => openConfirmationModal('logout')}>
                    <Image
                        source={ImagePath.logout}
                        style={{ width: 20, height: 20, marginRight: width * 0.03 }}
                    />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                {/* Deactivate Account Button */}
                <TouchableOpacity
                    style={styles.deactivateButton}
                    onPress={() => openConfirmationModal('deactivate')}>
                    <Text style={styles.deactivateText}>Deactivate Account</Text>
                </TouchableOpacity>

                {/* Confirmation Modal */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={handleCancel}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>
                                {actionType === 'logout'
                                    ? 'Logout?'
                                    : 'Deactivate Account'}
                            </Text>
                            <Text style={styles.modalMessage}>
                                {actionType === 'logout'
                                    ? 'Are you sure you want to log out from the ALO App?'
                                    : 'Are you sure to deactivate your account ?'}
                            </Text>
                            <View style={styles.modalButtonContainer}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={handleCancel}>
                                    <Text style={styles.modalButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.confirmButton]}
                                    onPress={handleConfirm}>
                                    <Text style={[styles.modalButtonText, { color: '#FFF' }]}>
                                        {actionType === 'logout'
                                            ? 'Yes'
                                            : 'Deactivate'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </ScrollView>
    );
};

export default AccountScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEAMCOLOR.SecondarySmokeWhite,
        alignItems: 'center',
    },
    headerTitle: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '500',
        paddingVertical: 18,
        backgroundColor: '#fff',
        width: '100%',
        marginBottom: 20,
    },
    profileSection: {
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 16,
        marginHorizontal: width * 0.05,
        padding: height * 0.02,
        elevation: 2,
        width: width * 0.9,
    },
    profileImage: {
        width: width * 0.21,
        height: width * 0.21,
        borderRadius: width * 0.125,
    },
    editIcon: {
        position: 'absolute',
        top: height * 0.03,
        right: width * 0.05,
        borderRadius: 15,
        padding: 5,
    },
    name: {
        fontSize: 14,
        fontWeight: '500',
        marginTop: height * 0.01,
        color: THEAMCOLOR.PrimaryGreen,
        textAlign: 'center',
    },
    id: {
        fontSize: 12,
        color: '#757575',
        marginBottom: height * 0.02,
        textAlign: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    stat: {
        alignItems: 'center',
    },
    statText: {
        fontSize: 11,
        color: '#000',
        marginTop: 5,
        textAlign: 'center',
    },
    optionsContainer: {
        marginTop: height * 0.03,
        marginHorizontal: width * 0.05,
        width: width * 0.9,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: height * 0.02,
        borderWidth: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        borderColor: '#EEE',
        marginBottom: 10,
    },
    optionText: {
        flex: 1,
        fontSize: 12,
        marginLeft: width * 0.04,
        color: 'gray',
        borderLeftWidth: 1,
        borderColor: 'gray',
        paddingLeft: 15,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: height * 0.01,
        marginHorizontal: width * 0.05,
        padding: height * 0.015,
        backgroundColor: 'transparent',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'lightgray',
        width: width * 0.9,
    },
    logoutText: {
        fontSize: 12,
        color: '#D32F2F',
        textAlign: 'center',
        fontWeight: '500',
    },
    deactivateButton: {
        marginTop: height * 0.02,
        marginHorizontal: width * 0.05,
        padding: height * 0.015,
        backgroundColor: '#D32F2F',
        borderRadius: 14,
        alignItems: 'center',
        width: width * 0.9,
        marginBottom: height * 0.03,
    },
    deactivateText: {
        fontSize: 12,
        color: '#FFF',
        fontWeight: '500',
        textAlign: 'center',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        height: 'auto'
    },
    modalContainer: {
        width: width * 0.9,
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: height * 0.03,
        paddingHorizontal: height * 0.02,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: height * 0.01,
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 12,
        color: '#757575',
        marginBottom: height * 0.03,
        textAlign: 'center',
    },
    modalButtonContainer: {
        flexDirection: 'column-reverse',
        rowGap: 10,
        justifyContent: 'space-between',
        width: '90%',
    },
    modalButton: {
        // flex: 1,
        padding: height * 0.015,
        borderRadius: 14,
        alignItems: 'center',
        marginHorizontal: width * 0.02,
    },
    cancelButton: {
        backgroundColor: '#fff',
        borderColor: 'lightgray',
        borderWidth: 1,
    },
    confirmButton: {
        backgroundColor: THEAMCOLOR.PrimaryGreen,
    },
    modalButtonText: {
        fontSize: 12,
        fontWeight: '500',
        // color: '#fff',
    },
});