import React, { useState, useRef, useEffect } from 'react';
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
  THEAMCOLOR,
  THEAMFONTFAMILY,
  TEXT_SIZE,
  LINE_HEIGHT,
  SPACING,
  RADIUS,
  SHADOW,
  OPACITY,
  BREAKPOINT,
  Z_INDEX,
} from '../../assets/theam/theam';

const { width, height } = Dimensions.get('window');

// Font scaling function for responsiveness
const scaleFont = (size: number) => Math.round(size * Math.min(width / 375, 1.5));

// Breakpoints
const isTablet = width >= BREAKPOINT.tablet;
const isDesktop = width >= BREAKPOINT.desktop;

interface RegisterFormData {
  name: string;
  email: string;
  phone: string;
}

interface RegisterResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
}

interface OtpResponse {
  message: string;
}

const RegisterScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>();
  const scrollViewRef = useRef(null);

  // Animation states
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Check auth state and redirect if authenticated
  useEffect(() => {
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
        navigation.replace('LoginScreen');
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

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      // Step 1: Register the user
      const registerResult = await apiUtils.post<RegisterResponse>('/api/passenger/register', {
        name: data.name,
        email: data.email,
        phoneNumber: data.phone,
      });

      // Store the token and user data in AsyncStorage
      // await AsyncStorage.setItem('authToken', registerResult.token);
      await AsyncStorage.setItem('user', JSON.stringify(registerResult.user));

      // Update AuthContext with the token
      // await login(registerResult.token);

      // Step 2: Send OTP using the token
      const otpResult = await apiUtils.post<OtpResponse>('/api/passenger/otp', {
        phoneNumber: data.phone,
      });

      showToastOrAlert(otpResult.message || 'Registration successful! OTP sent.');
      navigation.navigate( 'OtpRegisterScreen');
    } catch (error: any) {
      console.error('Registration/OTP Error:', error);
      showToastOrAlert(error.message || 'Registration or OTP request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleButtonPress = handleSubmit(onSubmit);

  const handleSocialLogin = (provider: string) => {
    showToastOrAlert(`${provider} login is not implemented yet.`);
  };

  const scrollToInput = (y: number) => {
    scrollViewRef.current?.scrollTo({ y, animated: true });
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
            <Text style={styles.title}>Register yourself</Text>
            <Text style={styles.subtitle}>Enter your details</Text>

            <View style={styles.form}>
              {/* Name Input */}
              <Controller
                control={control}
                rules={{ required: 'Name is required' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputWrapper}>
                    <Image source={ImagePath?.name} style={styles.inputIcon} />
                    <View style={styles.line} />
                    <TextInput
                      style={[styles.input, errors.name && styles.inputError]}
                      placeholder="Enter your name"
                      placeholderTextColor={THEAMCOLOR.SecondaryGray}
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      onFocus={(e) => scrollToInput(e.nativeEvent.target)}
                    />
                  </View>
                )}
                name="name"
              />
              {errors.name?.message && <Text style={styles.errorText}>{errors.name.message}</Text>}

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
                  <View style={styles.inputWrapper}>
                    <Image source={ImagePath?.email} style={styles.inputIcon} />
                    <View style={styles.line} />
                    <TextInput
                      style={[styles.input, errors.email && styles.inputError]}
                      placeholder="Enter your email"
                      placeholderTextColor={THEAMCOLOR.SecondaryGray}
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      onFocus={(e) => scrollToInput(e.nativeEvent.target)}
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
                  <View style={styles.inputWrapper}>
                    <Image source={ImagePath?.phone} style={styles.inputIcon} />
                    <View style={styles.line} />
                    <TextInput
                      style={[styles.input, errors.phone && styles.inputError]}
                      placeholder="Enter your phone number"
                      placeholderTextColor={THEAMCOLOR.SecondaryGray}
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      keyboardType="phone-pad"
                      onFocus={(e) => scrollToInput(e.nativeEvent.target)}
                    />
                  </View>
                )}
                name="phone"
              />
              {errors.phone && <Text style={styles.errorText}>{errors.phone.message}</Text>}

              {/* Register with Google/Apple */}
              <Text style={styles.orRegister}>Or register with</Text>
              <View style={styles.socialButtons}>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleSocialLogin('Google')}
                >
                  <Image source={ImagePath?.google} style={styles.socialIcon} />
                  <Text style={styles.socialText}>Google</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleSocialLogin('Apple')}
                >
                  <Image source={ImagePath?.apple} style={styles.socialIcon} />
                  <Text style={styles.socialText}>Apple Id</Text>
                </TouchableOpacity>
              </View>

              {/* Submit Button */}
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={handleButtonPress}
                  disabled={loading}
                >
                  <Text style={styles.submitButtonText}>Send OTP</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Footer Text */}
            <View style={styles.footerText}>
              <Text style={styles.loginLink}>Already have an account?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('LoginScreen')}
              >
                <Text style={styles.loginText}>Login</Text>
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
    fontSize: TEXT_SIZE.h3,
    lineHeight: LINE_HEIGHT.body,
    fontFamily: THEAMFONTFAMILY.LatoRegular,
    textAlign: 'left',
    width: '100%',
    marginBottom: SPACING.sm,
    color: THEAMCOLOR.SecondaryBlack,
  },
  subtitle: {
    fontSize: TEXT_SIZE.body,
    lineHeight: LINE_HEIGHT.small,
    fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    color: THEAMCOLOR.SecondaryGray,
    textAlign: 'left',
    width: '100%',
    marginBottom: SPACING.xxl,
  },
  form: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: THEAMCOLOR.BorderGray,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    backgroundColor: THEAMCOLOR.SecondarySmokeWhite,
  },
  input: {
    height: 50,
    flex: 1,
    paddingHorizontal: SPACING.md,
    fontSize: scaleFont(TEXT_SIZE.body),
    lineHeight: LINE_HEIGHT.body,
    fontFamily: THEAMFONTFAMILY.LatoRegular,
    backgroundColor: THEAMCOLOR.Transparent,
    color: THEAMCOLOR.SecondaryBlack,
  },
  line: {
    width: 1,
    height: '60%',
    backgroundColor: THEAMCOLOR.BorderGray,
    borderRadius: RADIUS.sm,
    marginRight: SPACING.md,
  },
  inputIcon: {
    width: scaleFont(20),
    height: scaleFont(20),
    marginHorizontal: SPACING.sm,
    resizeMode: 'contain',
  },
  inputError: {
    borderColor: THEAMCOLOR.Error,
  },
  errorText: {
    color: THEAMCOLOR.Error,
    fontSize: scaleFont(TEXT_SIZE.small),
    lineHeight: LINE_HEIGHT.small,
    fontFamily: THEAMFONTFAMILY.NunitoRegular,
    marginBottom: SPACING.sm,
  },
  orRegister: {
    textAlign: 'left',
    marginVertical: SPACING.md,
    fontSize: scaleFont(TEXT_SIZE.body),
    lineHeight: LINE_HEIGHT.body,
    fontFamily: THEAMFONTFAMILY.LatoRegular,
    color: THEAMCOLOR.SecondaryGray,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: SPACING.xxxl,
  },
  socialButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.lg,
    borderRadius: RADIUS.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialText: {
    color: THEAMCOLOR.SecondaryBlack,
    fontSize: scaleFont(TEXT_SIZE.body),
    lineHeight: LINE_HEIGHT.body,
    fontFamily: THEAMFONTFAMILY.LatoRegular,
    marginLeft: SPACING.sm,
  },
  socialIcon: {
    width: scaleFont(24),
    height: scaleFont(24),
  },
  submitButton: {
    backgroundColor: THEAMCOLOR.PrimaryGreen,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: THEAMFONTFAMILY.LatoBold,
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
  loginLink: {
    fontSize: scaleFont(TEXT_SIZE.body),
    lineHeight: LINE_HEIGHT.body,
    fontFamily: THEAMFONTFAMILY.LatoRegular,
    color: THEAMCOLOR.SecondaryGray,
    marginHorizontal: SPACING.sm,
  },
  loginText: {
    fontSize: scaleFont(TEXT_SIZE.body),
    lineHeight: LINE_HEIGHT.body,
    fontFamily: THEAMFONTFAMILY.LatoBold,
    color: THEAMCOLOR.PrimaryGreen,
  },
});

export default RegisterScreen;