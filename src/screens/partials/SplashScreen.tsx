import React, { useEffect, useRef, useContext, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import ImagePath from '../../constants/ImagePath';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiUtils from '../../utils/apiUtils';
import { set } from 'react-hook-form';

const SplashScreen = ({ navigation }: any) => {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;


  const fetchCurrentUser = async () => {
    AsyncStorage.getItem('userToken').then(async (token) => {
      console.log('User Token:', token);
      if (token) {
        const response: any = await apiUtils.get('/api/passenger/current');
        console.log('Current User Response:', response);
        if (response?.success) {
          const user = response.user;
          console.log('Current User:', user);
          return true;
          // Handle user data as needed
        }else {
          console.error('Failed to fetch current user:', response?.message || 'Unknown error');
          return false;
        }
      } else {
        console.warn('No user token found, proceeding without authentication');
        return false; // No user token, proceed without authentication
      }
    });
  };



  useEffect(() => {
    // const rotate = rotateAnim.interpolate({
    //   inputRange: [0, 1],
    //   outputRange: ['0deg', '360deg'],
    // });

    // Start animations
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






    // Navigate after animations and auth check
    const timer = setTimeout(() => {
      AsyncStorage.getItem('isIntroViewed').then((value) => {
        console.log('isIntroViewed:', value);
        if (value === 'true') {
          fetchCurrentUser().then((user) => {
            console.log('Fetched User:', user);
            if (user) {
              navigation.replace('HomeScreen');
            } else {
              // User is authenticated, navigate to App stack
              navigation.replace('LoginScreen');
            }
          });
        } else {
          // User is not authenticated, navigate to Intro stack
          navigation.replace('IntroScreen1');
        }
      })
    }, 2500); // Wait for animations to complete

    // Cleanup timer on unmount
    return () => clearTimeout(timer);
  }, [navigation, opacityAnim, scaleAnim, rotateAnim, bounceAnim]);




  return (
    <View style={styles.container}>
      <Animated.Image
        source={ImagePath.alocabLogo}
        style={[
          styles.logo,
          {
            opacity: opacityAnim,
            transform: [
              { scale: scaleAnim },
              {
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                })
              },
              {
                translateY: bounceAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -20],
                })
              },
            ],
          },
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
    marginBottom: 20,
    resizeMode: 'contain',
  },
});