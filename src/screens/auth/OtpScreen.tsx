import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  Animated,
  Platform,
  Modal,
  ToastAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Controller, useForm } from 'react-hook-form';
import ImagePath from '../../constants/ImagePath';
import apiUtils from '../../utils/apiUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LINE_HEIGHT,
  SPACING,
  TEXT_SIZE,
  THEAMCOLOR,
  THEAMFONTFAMILY,
  RADIUS,
  SHADOW,
  OPACITY,
  BREAKPOINT,
  Z_INDEX,
} from '../../assets/theam/theam';

const { width, height } = Dimensions.get('screen');
const scaleFont = (size: number) => Math.round(size * Math.min(width / 375, 1.5));

// Breakpoints
const isTablet = width >= BREAKPOINT.tablet;
const isDesktop = width >= BREAKPOINT.desktop;

interface OtpFormData {
  otp: string;
}

interface OtpResponse {
  message: string;
}

interface VerifyOtpResponse {
  token: string;
}

// Resend Timer Component
const ResendTimer = ({ onResend, phoneNumber }: { onResend: () => void; phoneNumber: string }) => {
  const [resendTimer, setResendTimer] = useState(30);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  const showToastOrAlert = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.LONG);
    } else {
      Alert.alert('Notification', message);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || resendLoading) return;
    setResendLoading(true);
    try {
      const response = await apiUtils.post<OtpResponse>('/api/passenger/otp', {
        phoneNumber,
      });
      console.log('Resend OTP Response:', response);
      setResendTimer(30);
      showToastOrAlert(response.message || 'OTP resent successfully!');
      onResend();
    } catch (error: any) {
      console.error('Resend OTP Error:', error);
      showToastOrAlert(error.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <View style={styles.resendContainer}>
      <TouchableOpacity
        onPress={handleResendOtp}
        disabled={resendTimer > 0 || resendLoading}
        style={styles.resendButton}
      >
        <Text
          style={[
            styles.resendText,
            (resendTimer > 0 || resendLoading) && styles.resendTextDisabled,
          ]}
        >
          Resend OTP {resendTimer > 0 ? `(${resendTimer}s)` : ''}
        </Text>
      </TouchableOpacity>
      {resendLoading && (
        <ActivityIndicator
          size="small"
          color={THEAMCOLOR.PrimaryGreen}
          style={styles.resendLoading}
        />
      )}
    </View>
  );
};

// Memoized OTP Input Component
const OTPInput = React.memo(
  ({ otpLength = 6, value = '', onChange, error }: { otpLength: number; value: string; onChange: (value: string) => void; error?: string }) => {
    const inputsRef = useRef<TextInput[]>([]);
    const scrollViewRef = useRef<ScrollView>(null);

    const handleChange = (text: string, index: number) => {
      if (!/^[0-9]*$/.test(text) && text !== '') return;
      const newValue = value.split('');
      newValue[index] = text;
      const updatedValue = newValue.join('').slice(0, otpLength);
      onChange(updatedValue);

      if (text && index < otpLength - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    };

    const handleKeyPress = ({ nativeEvent: { key } }: { nativeEvent: { key: string } }, index: number) => {
      if (key === 'Backspace' && !value[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    };

    const handleFocus = (index: number) => {
      if (value[index]) {
        inputsRef.current[index]?.setSelection(0, 1);
      }
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 100, animated: true });
      }
    };

    return (
      <View style={styles.otpContainer}>
        {[...Array(otpLength)].map((_, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputsRef.current[index] = ref as TextInput)}
            style={[styles.otpBox, error && styles.inputError]}
            maxLength={1}
            keyboardType="numeric"
            value={value[index] || ''}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            onFocus={() => handleFocus(index)}
            textAlign="center"
            placeholder=""
            placeholderTextColor={THEAMCOLOR.SecondaryGray}
            autoFocus={index === 0}
            returnKeyType={index < otpLength - 1 ? 'next' : 'done'}
            onSubmitEditing={() => {
              if (index < otpLength - 1) {
                inputsRef.current[index + 1]?.focus();
              }
            }}
          />
        ))}
      </View>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.value === nextProps.value &&
      prevProps.error === nextProps.error &&
      prevProps.otpLength === nextProps.otpLength
    );
  }
);

const OtpScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const { control, handleSubmit, formState: { errors }, reset } = useForm<OtpFormData>();
  const scrollViewRef = useRef<ScrollView>(null);

  // Animation states
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Fetch phone number from AsyncStorage
  useEffect(() => {
    const fetchPhoneNumber = async () => {
      try {
        const phone = await AsyncStorage.getItem('phoneNumber');
        console.log('Fetched Phone Number:', phone);
         // If phone number is not passed as a param, try to get it from AsyncStorage
        if (phone) {
          setPhoneNumber(phone);
        } else {
          console.warn('Phone number not found in AsyncStorage');
        }
      } catch (error) {
        console.error('Failed to fetch phone number from AsyncStorage:', error);
      }
    };

    fetchPhoneNumber();

    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: OPACITY.full,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(formTranslateY, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    AsyncStorage.getItem('userToken').then((token) => {
      if (token) {
        // User is authenticated, navigate to HomeScreen
        navigation.replace('HomeScreen');
      } else {
        // User is not authenticated, stay on OtpScreen
        console.log('User is not authenticated, staying on OtpScreen');
      }
    })
  }, [navigation, logoOpacity, formTranslateY]);

  const showToastOrAlert = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.LONG);
    } else {
      Alert.alert('Notification', message);
    }
  };

  const onSubmit = async (data: OtpFormData) => {
    setLoading(true);
    try {
      const response: any = await apiUtils.post<VerifyOtpResponse>('/api/passenger/verify-otp', {
        phoneNumber,
        otp: data.otp,
      });
      console.log('OTP Verification Response:', response);
      if (!response || !response.token) {
        throw new Error('Invalid response from server');
      }
      // Save user data and token to AsyncStorage
      await AsyncStorage.setItem('userToken', response.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.user));
      navigation.replace('HomeScreen'); // Navigate to HomeScreen after successful verification
      // Assuming login is a function that handles user login
      showToastOrAlert('Login successful!');
      // navigation.replace('App', { screen: 'HomeScreen' });
    } catch (error: any) {
      console.error('OTP Verification Error:', error);
      showToastOrAlert(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    handleSubmit(onSubmit)();
  };

  const handleResend = () => {
    reset({ otp: '' }); // Clear OTP input
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Modal
        transparent
        animationType="fade"
        visible={loading}
        style={{ zIndex: Z_INDEX.modal }}
      >
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={THEAMCOLOR.PrimaryGreen} />
        </View>
      </Modal>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Animated.View style={[styles.logoSection, { opacity: logoOpacity }]}>
            <Image
              source={ImagePath?.alocabLogo}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>

          <Animated.View style={[styles.formContainer, { transform: [{ translateY: formTranslateY }] }]}>
            <Text style={styles.title}>Enter OTP</Text>
            <Text style={styles.subtitle}>OTP sent to: {phoneNumber || 'Loading...'}</Text>

            <View style={styles.form}>
              <Controller
                control={control}
                name="otp"
                rules={{
                  required: 'OTP is required',
                  minLength: { value: 6, message: 'OTP must be 6 digits' },
                  pattern: { value: /^\d{6}$/, message: 'OTP must be 6 digits' },
                }}
                render={({ field: { value, onChange } }) => (
                  <OTPInput
                    otpLength={6}
                    value={value || ''}
                    onChange={onChange}
                    error={errors.otp?.message}
                  />
                )}
              />
              {errors.otp?.message && <Text style={styles.errorText}>{errors.otp.message}</Text>}
            </View>

            <ResendTimer onResend={handleResend} phoneNumber={phoneNumber} />

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleButtonPress}
                disabled={loading || !phoneNumber}
              >
                <Text style={styles.submitButtonText}>Verify</Text>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.footerText}>
              <Text style={styles.accountText}>Don’t have an account?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('RegisterScreen')}
              >
                <Text style={styles.otpText}>Register</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEAMCOLOR.PureWhite,
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: THEAMCOLOR.Overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: Z_INDEX.modal,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING.xxxl,
  },
  container: {
    width: '100%',
    paddingHorizontal: isDesktop
      ? width * 0.15
      : isTablet
        ? width * 0.1
        : SPACING.lg,
    alignItems: 'center',
  },
  logoSection: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxl,
  },
  logo: {
    width: isDesktop ? width * 0.3 : isTablet ? width * 0.4 : width * 0.5,
    height: isDesktop ? height * 0.15 : height * 0.2,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: TEXT_SIZE.bodyLarge,
    lineHeight: LINE_HEIGHT.bodyLarge,
    fontFamily: THEAMFONTFAMILY.LatoRegular,
    textAlign: 'left',
    width: '100%',
    color: THEAMCOLOR.SecondaryBlack,
  },
  subtitle: {
    fontSize: TEXT_SIZE.small,
    lineHeight: LINE_HEIGHT.small,
    fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    color: THEAMCOLOR.SecondaryGray,
    textAlign: 'left',
    width: '100%',
    marginBottom: SPACING.xxl,
  },
  form: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  otpBox: {
    borderWidth: 1,
    borderColor: THEAMCOLOR.BorderGray,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    textAlign: 'center',
    fontSize: TEXT_SIZE.bodyLarge,
    lineHeight: LINE_HEIGHT.bodyLarge,
    fontFamily: THEAMFONTFAMILY.LatoRegular,
    width: scaleFont(45),
    height: scaleFont(50),
    marginHorizontal: SPACING.xs,
    backgroundColor: THEAMCOLOR.SecondarySmokeWhite,
    color: THEAMCOLOR.SecondaryBlack,
    ...SHADOW.light,
  },
  inputError: {
    borderColor: THEAMCOLOR.Error,
  },
  errorText: {
    color: THEAMCOLOR.Error,
    fontSize: scaleFont(TEXT_SIZE.small),
    lineHeight: LINE_HEIGHT.small,
    fontFamily: THEAMFONTFAMILY.NunitoRegular,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  resendContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  resendButton: {
    paddingVertical: SPACING.sm,
  },
  resendText: {
    fontSize: scaleFont(TEXT_SIZE.body),
    lineHeight: LINE_HEIGHT.body,
    fontFamily: THEAMFONTFAMILY.LatoBold,
    color: THEAMCOLOR.PrimaryGreen,
  },
  resendTextDisabled: {
    color: THEAMCOLOR.SecondaryGray,
    opacity: 0.6,
  },
  resendLoading: {
    marginLeft: SPACING.sm,
  },
  submitButton: {
    backgroundColor: THEAMCOLOR.PrimaryGreen,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    marginTop: height * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    width: width * 0.9,
    ...SHADOW.medium,
  },
  submitButtonDisabled: {
    backgroundColor: THEAMCOLOR.SecondaryGray,
    opacity: 0.6,
  },
  submitButtonText: {
    color: THEAMCOLOR.PureWhite,
    fontSize: scaleFont(TEXT_SIZE.body),
    lineHeight: LINE_HEIGHT.body,
    fontFamily: THEAMFONTFAMILY.LatoBold,
  },
  footerText: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  accountText: {
    fontSize: scaleFont(TEXT_SIZE.body),
    lineHeight: LINE_HEIGHT.body,
    fontFamily: THEAMFONTFAMILY.NunitoRegular,
    color: THEAMCOLOR.SecondaryGray,
    marginRight: SPACING.sm,
  },
  otpText: {
    fontSize: scaleFont(TEXT_SIZE.body),
    lineHeight: LINE_HEIGHT.body,
    fontFamily: THEAMFONTFAMILY.NunitoBold,
    color: THEAMCOLOR.PrimaryGreen,
  },
});

export default OtpScreen;