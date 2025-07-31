import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    Modal,
    ToastAndroid,
    TextInput,
    ActivityIndicator,
    Platform,
} from 'react-native';
import React, { useState, useRef } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';
import { useForm, Controller } from 'react-hook-form';
import { THEAMCOLOR, THEAMFONTFAMILY, TEXT_SIZE, LINE_HEIGHT } from '../../../assets/theam/theam';
import BackButton from '../../Components/common/BackButton';
import ImagePath from '../../constants/ImagePath';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
    LoginScreen: undefined;
    EditProfileScreen: undefined;
    WalletScreen: undefined;
    SupportScreen: undefined;
};

type FormData = {
    name: string;
    email: string;
    phone: string;
    gender: string;
    city: string;
    dateOfBirth: string;
    emergencyContact: string;
};

const AccountScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [modalVisible, setModalVisible] = useState(false);
    const [actionType, setActionType] = useState<'logout' | 'deactivate' | ''>('');
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef<{ [key: string]: any }>({});

    // Mock data - replace with actual data source
    const profileImage = 'https://i.pravatar.cc/150?img=8'; // Replace with actual image source
    const genderItems = [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
        { label: 'Other', value: 'other' },
    ];
    const cityItems = [
        { label: 'New York', value: 'ny' },
        { label: 'London', value: 'london' },
        { label: 'Tokyo', value: 'tokyo' },
    ];

    const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            gender: '',
            city: '',
            dateOfBirth: '',
            emergencyContact: '',
        },
    });

    const handleImagePick = () => {
        // Implement image picker logic here
        console.log('Image picker triggered');
    };

    const handleFocus = (field: string) => {
        inputRefs.current[field]?.focus();
    };

    const openConfirmationModal = (type: 'logout' | 'deactivate') => {
        setActionType(type);
        setModalVisible(true);
    };

    const handleConfirm = () => {
        if (actionType === 'logout') {
            ToastAndroid.show('You have been logged out successfully.', ToastAndroid.LONG);
            navigation.navigate('LoginScreen');
        } else if (actionType === 'deactivate') {
            ToastAndroid.show('Your account has been deactivated.', ToastAndroid.LONG);
            navigation.navigate('LoginScreen');
        }
        setModalVisible(false);
    };

    const handleCancel = () => {
        setModalVisible(false);
        setActionType('');
    };

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try {
            // Implement form submission logic here
            console.log('Form submitted:', data);
            ToastAndroid.show('Profile updated successfully', ToastAndroid.SHORT);
        } catch (error) {
            ToastAndroid.show('Error updating profile', ToastAndroid.SHORT);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <BackButton />
                <Text style={styles.headerTitle}>Profile</Text>
            </View>

            <View style={styles.profileHeader}>
                <View style={styles.imageContainer}>
                    <Image source={{ uri: profileImage }} style={styles.profileImage} />
                    <TouchableOpacity style={styles.editImageButton} onPress={handleImagePick}>
                        <Icon name="edit" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.phoneText}>+91 912834311</Text>
            </View>

            <View style={styles.form}>
                <Controller
                    control={control}
                    rules={{ required: 'Name is required' }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <View style={[styles.inputWrapper, errors.name && styles.inputError]}>
                            <Image source={ImagePath.name} style={styles.inputIcon} />
                            <View style={styles.line} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your name"
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                onFocus={() => handleFocus('name')}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            />
                        </View>
                    )}
                    name="name"
                />
                {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

                <Controller
                    control={control}
                    rules={{
                        required: 'Email is required',
                        pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address',
                        },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                            <Image source={ImagePath.email} style={styles.inputIcon} />
                            <View style={styles.line} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                onFocus={() => handleFocus('email')}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            />
                        </View>
                    )}
                    name="email"
                />
                {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

                <Controller
                    control={control}
                    rules={{ required: 'Phone number is required' }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <View style={[styles.inputWrapper, errors.phone && styles.inputError]}>
                            <Image source={ImagePath.phone} style={styles.inputIcon} />
                            <View style={styles.line} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your phone number"
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                keyboardType="phone-pad"
                                onFocus={() => handleFocus('phone')}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            />
                        </View>
                    )}
                    name="phone"
                />
                {errors.phone && <Text style={styles.errorText}>{errors.phone.message}</Text>}

                <Controller
                    control={control}
                    rules={{ required: 'Gender is required' }}
                    render={({ field: { onChange, value } }) => (
                        <View style={[styles.inputWrapper, errors.gender && styles.inputError]}>
                            <Image source={ImagePath.gender} style={styles.inputIcon} />
                            <View style={styles.line} />
                            <Picker
                                selectedValue={value}
                                onValueChange={onChange}
                                style={[styles.pickerInput, Platform.OS === 'android' && { zIndex: 1000 }]}
                            >
                                <Picker.Item
                                    label="Select gender"
                                    value=""
                                    style={{ fontSize: 12 }}
                                    color={THEAMCOLOR.SecondaryGray}
                                    enabled={false}
                                />
                                {genderItems.map((item) => (
                                    <Picker.Item
                                        key={item.value}
                                        label={item.label}
                                        value={item.value}
                                        style={{ fontSize: 12 }}
                                        color={THEAMCOLOR.SecondaryBlack}
                                    />
                                ))}
                            </Picker>
                        </View>
                    )}
                    name="gender"
                />
                {errors.gender && <Text style={styles.errorText}>{errors.gender.message}</Text>}


                <Controller
                    control={control}
                    rules={{
                        pattern: {
                            value: /^\d{2}-\d{2}-\d{4}$/,
                            message: 'Date must be in MM-DD-YYYY format',
                        },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <View style={[styles.inputWrapper, errors.dateOfBirth && styles.inputError]}>
                            <Image source={ImagePath.dob} style={styles.inputIcon} />
                            <View style={styles.line} />
                            <TextInput
                                style={styles.input}
                                placeholder="MM-DD-YYYY"
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                onFocus={() => handleFocus('dateOfBirth')}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            />
                        </View>
                    )}
                    name="dateOfBirth"
                />
                {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth.message}</Text>}

                <Controller
                    control={control}
                    rules={{
                        pattern: {
                            value: /^\+?\d{10,15}$/,
                            message: 'Invalid phone number',
                        },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <View style={[styles.inputWrapper, errors.emergencyContact && styles.inputError]}>
                            <Image source={ImagePath.name} style={styles.inputIcon} />
                            <View style={styles.line} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter emergency contact"
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                keyboardType="phone-pad"
                                onFocus={() => handleFocus('emergencyContact')}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            />
                        </View>
                    )}
                    name="emergencyContact"
                />
                {errors.emergencyContact && <Text style={styles.errorText}>{errors.emergencyContact.message}</Text>}

                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={handleSubmit(onSubmit)}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Save Profile</Text>
                    )}
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => openConfirmationModal('logout')}
            >
                <Image
                    source={ImagePath.logout}
                    style={{ width: 20, height: 20, marginRight: width * 0.03 }}
                />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.deactivateButton}
                onPress={() => openConfirmationModal('deactivate')}
            >
                <Text style={styles.deactivateText}>Deactivate Account</Text>
            </TouchableOpacity>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={handleCancel}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            {actionType === 'logout' ? 'Logout?' : 'Deactivate Account'}
                        </Text>
                        <Text style={styles.modalMessage}>
                            {actionType === 'logout'
                                ? 'Are you sure you want to log out from the ALO App?'
                                : 'Are you sure to deactivate your account?'}
                        </Text>
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={handleCancel}
                            >
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={handleConfirm}
                            >
                                <Text style={[styles.modalButtonText, { color: '#FFF' }]}>
                                    {actionType === 'logout' ? 'Yes' : 'Deactivate'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

export default AccountScreen;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: THEAMCOLOR.SecondarySmokeWhite || '#FAFAFA',
        alignItems: 'center',
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        width: '100%',
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderColor: 'lightgray',
        marginBottom: 20,
    },
    headerTitle: {
        fontFamily: THEAMFONTFAMILY.LatoBold,
        fontSize: TEXT_SIZE.h3,
        lineHeight: LINE_HEIGHT.h3,
        fontWeight: '600',
        color: THEAMCOLOR.SecondaryBlack || '#333',
        textAlign: 'center',
        flex: 1,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: height * 0.03,
    },
    imageContainer: {
        position: 'relative',
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    editImageButton: {
        position: 'absolute',
        bottom: 10,
        right: 0,
        backgroundColor: THEAMCOLOR.PrimaryGreen || '#007AFF',
        borderRadius: 15,
        padding: 5,
    },
    phoneText: {
        fontSize: 14,
        fontWeight: '500',
        color: THEAMCOLOR.PrimaryGreen,
        fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    },
    form: {
        width: width * 0.9,
        marginBottom: 20,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: 'lightgray',
        borderWidth: 1,
        borderRadius: 12,
        backgroundColor: '#fff',
        marginVertical: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    input: {
        flex: 1,
        height: 50,
        paddingHorizontal: 10,
        fontSize: 13,
        maxWidth: width * 0.7,
        fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    },
    inputIcon: {
        width: 20,
        height: 20,
        marginHorizontal: 10,
        resizeMode: 'contain',
    },
    line: {
        width: 1,
        height: '60%',
        backgroundColor: THEAMCOLOR.SecondaryGray || '#ccc',
        marginRight: 10,
    },
    inputError: {
        borderColor: 'red',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginBottom: 8,
        marginLeft: 10,
        fontFamily: THEAMFONTFAMILY.NunitoRegular,
    },
    pickerInput: {
        flex: 1,
        height: 50,
        fontSize: 13,
        color: THEAMCOLOR.SecondaryBlack || '#000',
    },
    submitButton: {
        backgroundColor: THEAMCOLOR.PrimaryGreen || '#007AFF',
        paddingVertical: 12,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonDisabled: {
        backgroundColor: '#aaa',
    },
    submitButtonText: {
        color: '#fff',
        fontFamily: THEAMFONTFAMILY.LatoBold,
        fontSize: TEXT_SIZE.body,
        lineHeight: LINE_HEIGHT.small,
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
        fontFamily: THEAMFONTFAMILY.LatoBold,
        fontSize: TEXT_SIZE.body,
        lineHeight: LINE_HEIGHT.small,
        color: '#D32F2F',
        textAlign: 'center',
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
        fontFamily: THEAMFONTFAMILY.LatoBold,
        fontSize: TEXT_SIZE.body,
        lineHeight: LINE_HEIGHT.small,
        color: '#FFF',
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: width * 0.9,
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: height * 0.03,
        alignItems: 'center',
    },
    modalTitle: {
        fontFamily: THEAMFONTFAMILY.LatoBold,
        fontSize: TEXT_SIZE.body,
        lineHeight: LINE_HEIGHT.h3,
        fontWeight: '600',
        color: THEAMCOLOR.SecondaryBlack || '#000',
        marginBottom: height * 0.01,
        textAlign: 'center',
    },
    modalMessage: {
        fontFamily: THEAMFONTFAMILY.NunitoRegular,
        fontSize: TEXT_SIZE.small,
        lineHeight: LINE_HEIGHT.small,
        color: THEAMCOLOR.SecondaryGray || '#757575',
        marginBottom: height * 0.03,
        textAlign: 'center',
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
        gap: 10,
    },
    modalButton: {
        flex: 1,
        padding: height * 0.015,
        borderRadius: 14,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#fff',
        borderColor: 'lightgray',
        borderWidth: 1,
    },
    confirmButton: {
        backgroundColor: THEAMCOLOR.PrimaryGreen || '#4CAF50',
    },
    modalButtonText: {
        fontFamily: THEAMFONTFAMILY.LatoBold,
        fontSize: TEXT_SIZE.body,
        lineHeight: LINE_HEIGHT.small,
        fontWeight: '500',
        color: THEAMCOLOR.SecondaryBlack || '#333',
    },
});