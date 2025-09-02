// authcontext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import apiUtils from '../utils/apiUtils';
import { ToastAndroid } from 'react-native';

const AuthContext = createContext('light');

export const AuthProvider = ({ children }: any) => {
  const [phoneNumber, setPhoneNumber] = useState<any>('');
  const [isVerified, setIsVerified] = useState<any>(false);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<any>(null);
  const [loading, setLoading] = useState<any>(false);
  const [error, setError] = useState<any>(null);
  const [otp, setOtp] = useState(null)

  // Load token and user on mount
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const loadUserFromStorage = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      if (storedToken) {
        setToken(storedToken);
        await getCurrentUser(storedToken);
      }
    } catch (err) {
      console.error('Failed to load user from storage:', err);
    }
  };

  const sendOtp = async (phone: any) => {
    try {
      setLoading(true);
      setError(null);
      setPhoneNumber(phone);
    const response: any = await apiUtils.post('/api/passenger/otp', { phoneNumber: phone });
      console.log(response)
      setOtp(response?.otp)
      return true
    } catch (err: any) {
      setError('Failed to send OTP');
      console.error(err);
      ToastAndroid.show(err?.message || "Otp Sending Failed", ToastAndroid.SHORT)
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (phone: string, otp: string) => {
    try {
      const res: any = await apiUtils.post('/api/passenger/verify-otp', {
        phoneNumber: phone,
        otp,
      });
      console.log(res)
      const { token, user } = res;

      setToken(token);
      setUser(user);
      await AsyncStorage.setItem('authToken', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return true;
    } catch (err) {
      console.error('OTP Verification Error:', err);
      return false;
    }
  };
  const verifyFirebaseApiOtp = async (idToken: string) => {
    try {
      const res: any = await apiUtils.post('/api/passenger/verify-user', {
        idToken,
      });
      console.log(res)
      const { token, user } = res;

      setToken(token);
      setUser(user);
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return true;
    } catch (err: any) {
      console.error('OTP Verification Error:', err);
      ToastAndroid.show(err?.message || "Otp Verification Failed", ToastAndroid.SHORT)
      // logout()
      return false;
    }
  };

  const resendOtp = async (phone: string) => {
    try {
      const response: any = await apiUtils.post('/api/passenger/otp', { phoneNumber: phone });
      setOtp(response?.otp)
      return { success: true, otp: response?.otp };
    } catch (err) {
      console.error('Resend OTP Error:', err);
      return false;
    }
  };


  const getCurrentUser = async (existingToken = token) => {
    try {
      setLoading(true);
      setError(null);
      const response: any = await apiUtils.get('/api/passenger/current/user');
      console.log(response)
      if (response?.success) {
        setUser(response?.user);
        setIsVerified(true);
        const user = response.user;

        // await AsyncStorage.setItem('authToken', existingToken);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        console.log('Current User:', user);
        return true;
      } else {
        console.error('Failed to fetch current user:', response?.message || 'Unknown error');
        return false;
      }
    } catch (err) {
      console.error('Failed to fetch current user:', err);
      // logout();
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    setPhoneNumber('');
    setIsVerified(false);
    await AsyncStorage.removeItem('authToken');
    delete axios.defaults.headers.common['Authorization'];
  };


  const register = async ({ name, email, phone, uid }: any) => {
    try {
      setLoading(true);
      setError(null);

      const response: any = await apiUtils.post('/api/passenger/register', {
        phoneNumber: phone,
        name,
        email,
        uid
      });

      console.log(response)
      const { user } = response;
      setUser(user);
      setIsVerified(true);
      // axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      return true;
    } catch (err: any) {
      setError('Registration failed. Check OTP or details.');
      console.error('Registration failed:', err);
      ToastAndroid.show(err?.message || "Registration Failed", ToastAndroid.SHORT)
      return false;
    } finally {
      setLoading(false);
    }
  };


  return (
    <AuthContext.Provider
      value={{
        phoneNumber,
        isVerified,
        user,
        token,
        loading,
        error,
        sendOtp,
        verifyOtp,
        getCurrentUser,
        logout,
        register,
        otp,
        setOtp,
        resendOtp,
        verifyFirebaseApiOtp
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
