import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import React, { useState, useRef } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Controller, useForm } from 'react-hook-form';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'react-native-image-picker';
import BackButton from '../../Components/common/BackButton';
import { LINE_HEIGHT, TEXT_SIZE, THEAMCOLOR, THEAMFONTFAMILY } from '../../assets/theam/theam';
import ImagePath from '../../constants/ImagePath';

const { width, height } = Dimensions.get('window');

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const scrollViewRef = useRef(null);
  const inputRefs = useRef({});
  const [profileImage, setProfileImage] = useState('https://i.pravatar.cc/150?img=8');
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: 'Devesh',
      email: 'deveshdixit@gmail.com',
      phone: '+91 912834311',
      gender: '',
      city: '',
      dateOfBirth: '',
      emergencyContact: '',
    },
  });

  const [loading, setLoading] = useState(false);
  const [genderItems] = useState([
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ]);
  const [cityItems] = useState([
    { label: 'New York', value: 'new_york' },
    { label: 'Los Angeles', value: 'los_angeles' },
    { label: 'Chicago', value: 'chicago' },
    { label: 'Houston', value: 'houston' },
  ]);

  const handleImagePick = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };
    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        Alert.alert('Error', 'Failed to pick image: ' + response.errorMessage);
      } else if (response.assets && response.assets[0].uri) {
        setProfileImage(response.assets[0].uri);
      }
    });
  };

  const handleFocus = (fieldName) => {
    if (inputRefs.current[fieldName]) {
      inputRefs.current[fieldName].measureLayout(
        scrollViewRef.current.getScrollResponder(),
        (x, y) => {
          scrollViewRef.current.scrollTo({ y: y - 100, animated: true });
        },
        (error) => console.log('measureLayout error:', error)
      );
    }
  };

  const onSubmit = (data) => {
    setLoading(true);
    console.log(data);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Profile Updated', 'Your profile has been successfully updated.');
    }, 1000);
  };

  return (
    <ScrollView
      style={styles.container}
      ref={scrollViewRef}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <BackButton />
      <Text style={styles.headerTitle}>Profile</Text>

      <View style={styles.profileContainer}>
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
          {/* Name Input */}
          <Controller
            control={control}
            rules={{ required: 'Name is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View
                style={[styles.inputWrapper, errors.name && styles.inputError]}
                ref={(ref) => (inputRefs.current['name'] = ref)}
              >
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

          {/* Email Input */}
          <Controller
            control={control}
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                message: 'Invalid email address',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View
                style={[styles.inputWrapper, errors.email && styles.inputError]}
                ref={(ref) => (inputRefs.current['email'] = ref)}
              >
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

          {/* Phone Input */}
          <Controller
            control={control}
            rules={{ required: 'Phone number is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View
                style={[styles.inputWrapper, errors.phone && styles.inputError]}
                ref={(ref) => (inputRefs.current['phone'] = ref)}
              >
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

          {/* Gender Picker */}
          <Controller
            control={control}
            rules={{ required: 'Gender is required' }}
            render={({ field: { onChange, value }, fieldState }) => (
              <View
                style={[styles.inputWrapper, fieldState.error && styles.inputError]}
                ref={(ref) => (inputRefs.current['gender'] = ref)}
              >
                <Image source={ImagePath?.gender} style={styles.inputIcon} />
                <View style={styles.line} />
                <Picker
                  selectedValue={value || ''}
                  onValueChange={(itemValue) => onChange(itemValue || '')}
                  style={[styles.pickerInput, Platform.OS === 'android' && { zIndex: 1000 }]}
                  itemStyle={styles.pickerItem}
                  onFocus={() => handleFocus('gender')}
                >
                  <Picker.Item
                    label="Select gender"
                    value=""
                    style={styles.input}
                    color={THEAMCOLOR.SecondaryGray}
                    enabled={false}
                  />
                  {genderItems.map((item) => (
                    <Picker.Item
                      key={item.value}
                      label={item.label}
                      value={item.value}
                      color={THEAMCOLOR.SecondaryBlack}
                    />
                  ))}
                </Picker>
              </View>
            )}
            name="gender"
          />
          {errors.gender && <Text style={styles.errorText}>{errors.gender.message}</Text>}

          {/* City Picker */}
          <Controller
            control={control}
            rules={{ required: 'City is required' }}
            render={({ field: { onChange, value }, fieldState }) => (
              <View
                style={[styles.inputWrapper, fieldState.error && styles.inputError]}
                ref={(ref) => (inputRefs.current['city'] = ref)}
              >
                <Image source={ImagePath?.location} style={styles.inputIcon} />
                <View style={styles.line} />
                <Picker
                  selectedValue={value || ''}
                  onValueChange={(itemValue) => onChange(itemValue || '')}
                  style={[styles.pickerInput, Platform.OS === 'android' && { zIndex: 1000 }]}
                  itemStyle={styles.pickerItem}
                  onFocus={() => handleFocus('city')}
                >
                  <Picker.Item
                    label="Select city you drive in"
                    value=""
                    style={styles.input}
                    color={THEAMCOLOR.SecondaryGray}
                    enabled={false}
                  />
                  {cityItems.map((item) => (
                    <Picker.Item
                      key={item.value}
                      label={item.label}
                      value={item.value}
                      color={THEAMCOLOR.SecondaryBlack}
                    />
                  ))}
                </Picker>
              </View>
            )}
            name="city"
          />
          {errors.city && <Text style={styles.errorText}>{errors.city.message}</Text>}

          {/* Date of Birth */}
          <Controller
            control={control}
            rules={{
              pattern: {
                value: /^\d{2}-\d{2}-\d{4}$/,
                message: 'Date must be in MM-DD-YYYY format',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View
                style={[styles.inputWrapper, errors.dateOfBirth && styles.inputError]}
                ref={(ref) => (inputRefs.current['dateOfBirth'] = ref)}
              >
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

          {/* Emergency Contact */}
          <Controller
            control={control}
            rules={{
              pattern: {
                value: /^\+?\d{10,15}$/,
                message: 'Invalid phone number',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View
                style={[styles.inputWrapper, errors.emergencyContact && styles.inputError]}
                ref={(ref) => (inputRefs.current['emergencyContact'] = ref)}
              >
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

          {/* Submit Button */}
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
      </View>
    </ScrollView>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEAMCOLOR.SecondarySmokeWhite || '#f5f5f5',
  },
  headerTitle: {
    paddingVertical: 15,
    backgroundColor: '#fff',
    fontWeight: '600',
    color: THEAMCOLOR.SecondaryBlack || '#000',
    textAlign: 'center',
    fontFamily: THEAMFONTFAMILY.LatoBold,
    fontSize: TEXT_SIZE.h3, // Changed from 18 to 16
    lineHeight: LINE_HEIGHT.h3, // Added, 24
  },
  profileContainer: {
    flex: 1,
    marginHorizontal: width * 0.05,
    marginVertical: height * 0.02,
    paddingBottom: 20,
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
  },
  form: {
    flex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'lightgray' || '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 10,
    fontSize: 13,
    maxWidth: width * 0.7,
    fontFamily: THEAMFONTFAMILY.NunitoSemiBold
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
  },
  pickerInput: {
    flex: 1,
    height: 50,
    fontSize: 13,
    color: THEAMCOLOR.SecondaryBlack || '#000',
  },
  pickerItem: {
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
    fontSize: TEXT_SIZE.body, // Changed from 12 to 12 (consistent)
    lineHeight: LINE_HEIGHT.small, // Added, 16
  },
});