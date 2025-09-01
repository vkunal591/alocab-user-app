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
import PhoneInput from 'react-native-phone-number-input';
import auth from '@react-native-firebase/auth';

import ImagePath from '../../constants/ImagePath';
import { useAuth } from '../../context/authcontext';
import {
  THEAMCOLOR,
  THEAMFONTFAMILY,
  TEXT_SIZE,
  LINE_HEIGHT,
  SPACING,
  RADIUS,
  SHADOW,
  BREAKPOINT,
  Z_INDEX,
  OPACITY,
} from '../../../assets/theam/theam';

const { width, height } = Dimensions.get('window');
const scaleFont = (size: number) => Math.round(size * Math.min(width / 375, 1.5));
const isTablet = width >= BREAKPOINT.tablet;
const isDesktop = width >= BREAKPOINT.desktop;

interface RegisterFormData {
  name: string;
  email: string;
  phone: string;
}

const RegisterScreen = () => {
  const { register }: any = useAuth();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>();
  const scrollViewRef = useRef(null);
  const phoneInputRef = useRef<any>(null);
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

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
  }, []);

  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.LONG);
    } else {
      Alert.alert('Error', message);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      const fullPhoneNumber = data.phone;

      if (!phoneInputRef.current?.isValidNumber(fullPhoneNumber)) {
        showToast('Please enter a valid phone number.');
        return;
      }

      const confirmation: any = await auth().signInWithPhoneNumber(fullPhoneNumber);
      const uid = confirmation?._auth?._user?._user?.uid;
      if (!uid) {
        throw new Error('Failed to get user UID from authentication')
      }
      const res = await register({ ...data, phone: fullPhoneNumber, uid });
      console.log(res)
      if (res) {
        showToast(`OTP sent to ${fullPhoneNumber}`);
        navigation.navigate('OtpRegisterScreen', { phone: fullPhoneNumber, confirmation });
      } else {
        showToast('Registration failed. Please try again.');
      }

    } catch (err: any) {
      console.error('Registration error:', err);
      showToast(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    showToast(`${provider} login is not implemented yet.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {loading && (
        <Modal transparent animationType="fade" visible={loading}>
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={THEAMCOLOR.PrimaryGreen} />
          </View>
        </Modal>
      )}

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Animated.View style={[styles.logoSection, { opacity: logoOpacity }]}>
            <Image source={ImagePath.alocabLogo} style={styles.logo} resizeMode="contain" />
          </Animated.View>

          <Animated.View style={[styles.formContainer, { transform: [{ translateY: formTranslateY }] }]}>
            <Text style={styles.title}>Register yourself</Text>
            <Text style={styles.subtitle}>Enter your details</Text>

            <View style={styles.form}>
              {/* Name */}
              <Controller
                control={control}
                name="name"
                rules={{ required: 'Name is required' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <View style={styles.inputWrapper}>
                      <Image source={ImagePath.name} style={styles.inputIcon} />
                      <View style={styles.line} />
                      <TextInput
                        style={[styles.input, errors.name && styles.inputError]}
                        placeholder="Enter your name"
                        placeholderTextColor={THEAMCOLOR.SecondaryGray}
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                      />
                    </View>
                    {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
                  </View>
                )}
              />

              {/* Email */}
              <Controller
                control={control}
                name="email"
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <View style={styles.inputWrapper}>
                      <Image source={ImagePath.email} style={styles.inputIcon} />
                      <View style={styles.line} />
                      <TextInput
                        style={[styles.input, errors.email && styles.inputError]}
                        placeholder="Enter your email"
                        placeholderTextColor={THEAMCOLOR.SecondaryGray}
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                    {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
                  </View>
                )}
              />

              {/* Phone */}
              <Controller
                control={control}
                name="phone"
                rules={{ required: 'Phone number is required' }}
                render={({ field: { value, onChange } }) => (
                  <View>
                    <View style={styles.inputWrapper}>
                      <PhoneInput
                        ref={phoneInputRef}
                        defaultValue={value}
                        defaultCode="IN"
                        layout="second"
                        onChangeFormattedText={onChange}
                        withShadow
                        disableArrowIcon={true}
                        containerStyle={{ flex: 1, backgroundColor: THEAMCOLOR.SecondarySmokeWhite }}
                        textContainerStyle={{
                          paddingVertical: 0,
                          backgroundColor: THEAMCOLOR.SecondarySmokeWhite,
                        }}
                        countryPickerButtonStyle={{
                          paddingVertical: 10,
                          borderRightColor: THEAMCOLOR.BorderGray,
                          borderRightWidth: 1,
                          width: 50,
                          paddingLeft: 5,
                          backgroundColor: THEAMCOLOR.SecondarySmokeWhite,
                        }}
                      />
                    </View>
                    {errors.phone && <Text style={styles.errorText}>{errors.phone.message}</Text>}
                  </View>
                )}
              />

              {/* Social login */}
              <Text style={styles.orRegister}>Or register with</Text>
              <View style={styles.socialButtons}>
                <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('Google')}>
                  <Image source={ImagePath.google} style={styles.socialIcon} />
                  <Text style={styles.socialText}>Google</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('Apple')}>
                  <Image source={ImagePath.apple} style={styles.socialIcon} />
                  <Text style={styles.socialText}>Apple Id</Text>
                </TouchableOpacity>
              </View>

              {/* Submit */}
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={handleSubmit(onSubmit)}
                  disabled={loading}
                >
                  <Text style={styles.submitButtonText}>Send OTP</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>

            <View style={styles.footerText}>
              <Text style={styles.loginLink}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
                <Text style={styles.loginText}>Login</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;


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
    overflow: 'hidden'
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
    width: 1.5,
    height: '100%',
    backgroundColor: THEAMCOLOR.BorderGray,
    borderRadius: RADIUS.sm,
    marginLeft: SPACING.md,
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

