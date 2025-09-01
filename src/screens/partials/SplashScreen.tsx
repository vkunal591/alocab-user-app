import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImagePath from '../../constants/ImagePath';
import apiUtils from '../../utils/apiUtils';
import { useAuth } from '../../context/authcontext';

const SplashScreen = ({ navigation }: any) => {
  const { getCurrentUser }: any = useAuth()
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  const fetchCurrentUser = async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      console.log('User Token:', token);
      if (token) {
        const response: any = await apiUtils.get('/api/passenger/current');
        console.log('Current User Response:', response);
        if (response?.success) {
          const user = response.user;
          console.log('Current User:', user);
          return true;
        } else {
          console.error('Failed to fetch current user:', response?.message || 'Unknown error');
          return false;
        }
      } else {
        console.warn('No user token found, proceeding without authentication');
        return false;
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      return false;
    }
  };

  useEffect(() => {
    // Start animation
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Authentication and navigation check
    const timer = setTimeout(async () => {
      try {
        const isIntroViewed = await AsyncStorage.getItem('isIntroViewed');
        const token = await AsyncStorage.getItem('authToken');
        console.log(token,isIntroViewed)
        if (isIntroViewed === 'true') {
          console.log(token)
          let isLoggedIn
          if (token) {
            isLoggedIn = await getCurrentUser(token);
          }
          if (isLoggedIn) {
            navigation.replace('HomeScreen');
          } else {
            navigation.replace('LoginScreen');
          }
        } else {
          navigation.replace('IntroScreen1');
        }
      } catch (e) {
        console.error('Splash error:', e);
        navigation.replace('LoginScreen');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={ImagePath.alocabLogo}
        style={[
          styles.logo,
          // {
          //   opacity: opacityAnim,
          //   transform: [
          //     { scale: scaleAnim },
          //     {
          //       rotate: rotateAnim.interpolate({
          //         inputRange: [0, 1],
          //         outputRange: ['0deg', '360deg'],
          //       }),
          //     },
          //     {
          //       translateY: bounceAnim.interpolate({
          //         inputRange: [0, 1],
          //         outputRange: [0, -20],
          //       }),
          //     },
          //   ],
          // },
        ]}
      />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  logo: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
});
