import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  ImageSourcePropType,
  Platform,
  Alert,
  Linking,
  ToastAndroid,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { request, check, PERMISSIONS, RESULTS } from 'react-native-permissions';

import {
  LINE_HEIGHT,
  TEXT_SIZE,
  THEAMCOLOR,
  THEAMFONTFAMILY,
} from '../../../assets/theam/theam';
import { RootStackParamList } from '../../navigator/StackNavigator';
import ImagePath from '../../constants/ImagePath';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const showToast = (msg: string) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  } else {
    Alert.alert('', msg);
  }
};

const IntroScreen2: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Run animation once
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const openSettings = async () => {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('app-settings:');
      } else {
        await Linking.openSettings();
      }
    } catch (error) {
      showToast('Unable to open settings.');
    }
  };

  const requestLocationPermission = async () => {
    try {
      await AsyncStorage.setItem('isIntroViewed', 'true');
      const permission =
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

      const checkResult = await check(permission);

      if (checkResult === RESULTS.GRANTED) {
        setLocationPermissionGranted(true);
        showToast('Location permission already granted.');
        navigation.navigate('RegisterScreen');
        return;
      }

      const result = await request(permission);

      if (result === RESULTS.GRANTED) {
        setLocationPermissionGranted(true);
        showToast('Location permission granted successfully.');
      } else if (result === RESULTS.DENIED) {
        showToast('Location permission denied. You can enable it later in settings.');
      } else if (result === RESULTS.BLOCKED) {
        showToast('Please enable location permissions in settings.');
        openSettings();
      }

      // Mark intro as complete regardless of permission outcome
      navigation.navigate('RegisterScreen');
    } catch (error) {
      console.error('Permission Error:', error);
      showToast('Something went wrong while requesting permission.');
      navigation.navigate('RegisterScreen');
    }
  };

  const handleDenyAndContinue = async () => {
    await AsyncStorage.setItem('isIntroViewed', 'true');
    navigation.navigate('RegisterScreen');
  };



  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.middleSection}>
        <Animated.Image
          source={ImagePath.introScreen2 as ImageSourcePropType}
          style={[
            styles.introImage,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
          resizeMode="contain"
        />
      </View>

      <View style={styles.bottomSection}>
        <Text style={styles.title}>Allow Location</Text>
        <Text style={styles.description}>
          We need your location to provide a personalized experience. Please allow access.
        </Text>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={requestLocationPermission}
          accessibilityLabel="Allow location access"
          accessibilityRole="button"
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Allow</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.previousButton}
          onPress={handleDenyAndContinue}
          accessibilityLabel="Deny location access"
          accessibilityRole="button"
          activeOpacity={0.8}
        >
          <View style={styles.textWithUnderline}>
            <Text style={styles.secondaryButtonText}>Deny</Text>
            <View style={styles.underline} />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: THEAMCOLOR.PureWhite,
    fontFamily: THEAMFONTFAMILY.PoppinsRegular,
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleSection: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  introImage: {
    width: '100%',
    height: '100%',
    maxWidth: width * 0.9,
    maxHeight: height * 0.5,
  },
  bottomSection: {
    flex: 0.4,
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: TEXT_SIZE.bodyLarge,
    lineHeight: LINE_HEIGHT.bodyLarge,
    fontFamily: THEAMFONTFAMILY.LatoRegular,
    textAlign: 'left',
    marginBottom: 5,
    color: THEAMCOLOR.SecondaryBlack,
  },
  description: {
    fontSize: TEXT_SIZE.small,
    lineHeight: LINE_HEIGHT.small,
    fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    textAlign: 'left',
    marginBottom: 20,
    color: THEAMCOLOR.SecondaryGray,
  },
  continueButton: {
    backgroundColor: THEAMCOLOR.PrimaryGreen,
    paddingVertical: 12,
    borderRadius: 15,
    marginBottom: 10,
  },
  previousButton: {
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: THEAMCOLOR.PureWhite,
    fontFamily: THEAMFONTFAMILY.LatoBold,
    textAlign: 'center',
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: THEAMCOLOR.SecondaryGray,
    textAlign: 'center',
    fontWeight: '600',
    fontFamily: THEAMFONTFAMILY.LatoBold,
  },
  textWithUnderline: {
    alignItems: 'center',
  },
  underline: {
    height: 1,
    width: width * 0.13,
    backgroundColor: THEAMCOLOR.SecondaryGray,
    marginTop: 4,
  },
});

export default IntroScreen2;
