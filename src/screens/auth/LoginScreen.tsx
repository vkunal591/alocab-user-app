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
} from '../../../assets/theam/theam';

const { width, height } = Dimensions.get('screen');
const scaleFont = (size: number) => Math.round(size * Math.min(width / 375, 1.5));

// Breakpoints
const isTablet = width >= BREAKPOINT.tablet;
const isDesktop = width >= BREAKPOINT.desktop;

interface LoginFormData {
  phone: string;
}

interface OtpResponse {
  token: string;
  message: string;
}

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const scrollViewRef = useRef<ScrollView>(null);

  // Animation states
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Animations and auth check
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

    // AsyncStorage.getItem('userToken').then((token) => {
    //   if (token) {
    //     // User is authenticated, navigate to HomeScreen
    //     navigation.replace('HomeScreen');
    //   } else {
    //     // User is not authenticated, stay on LoginScreen
    //     console.log('No user token found, staying on LoginScreen');
    //   }
    // });
  }, [navigation, logoOpacity, formTranslateY]);

  const showToastOrAlert = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.LONG);
    } else {
      Alert.alert('Notification', message);
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      // API call to send OTP
      const response: any = await apiUtils.post<OtpResponse>('/api/passenger/otp', {
        phoneNumber: data.phone,
      });
      console.log('API Response:', response);
      if (response.success) {
        // Store the user in AsyncStorage
        showToastOrAlert(response.message || 'OTP sent successfully!');
        navigation.navigate('OtpScreen', { phone: data.phone, otp: response?.otp });
      }
    } catch (error: any) {
      console.error('Login Error:', error);
      showToastOrAlert(error.message || 'Failed to send OTP. Please try again.');
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
            <Text style={styles.title}>Login to your account</Text>
            <Text style={styles.subtitle}>Enter your details</Text>

            <View style={styles.form}>
              {/* Phone Input */}
              <Controller
                control={control}
                rules={{
                  required: 'Phone number is required',
                  pattern: {
                    value: /^\d{10}$/, // Only digits, exactly 10
                    message: 'Phone number must be exactly 10 digits',
                  },
                }}
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
                      onChangeText={(text) => {
                        // Allow only digits
                        const filteredText = text.replace(/[^0-9]/g, '');
                        onChange(filteredText);
                      }}
                      keyboardType="number-pad"
                      onFocus={(e) => scrollToInput(e.nativeEvent.target)}
                      returnKeyType="done"
                      onSubmitEditing={handleButtonPress}
                      maxLength={10} // prevent typing more than 10 digits
                    />
                  </View>
                )}
                name="phone"
              />
              {errors.phone && <Text style={styles.errorText}>{String(errors.phone.message)}</Text>}

              {/* Social Login */}
              <Text style={styles.orLogin}>Or login with</Text>
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
            </View>

            {/* Submit Button */}
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleButtonPress}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Sending...' : 'Send OTP'}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Footer Text */}
            <View style={styles.footerText}>
              <Text style={styles.accountText}>Don’t have an account?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('RegisterScreen')}
              >
                <Text style={styles.loginText}>Register</Text>
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
    marginBottom: SPACING.sm,
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
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: THEAMCOLOR.SecondaryGray,
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
    backgroundColor: THEAMCOLOR.SecondaryGray,
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
  orLogin: {
    textAlign: 'left',
    marginTop: SPACING.md,
    fontSize: scaleFont(TEXT_SIZE.body),
    lineHeight: LINE_HEIGHT.body,
    fontFamily: THEAMFONTFAMILY.LatoRegular,
    color: THEAMCOLOR.SecondaryGray,
    paddingLeft: 5
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
    marginTop: height * 0.2,
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
  loginText: {
    fontSize: scaleFont(TEXT_SIZE.body),
    lineHeight: LINE_HEIGHT.body,
    fontFamily: THEAMFONTFAMILY.NunitoBold,
    color: THEAMCOLOR.PrimaryGreen,
  },
});

export default LoginScreen;