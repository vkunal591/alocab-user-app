import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


import SplashScreen from '../screens/partials/SplashScreen';
import IntroScreen1 from '../screens/infoScreen/IntroScreen1';
import IntroScreen2 from '../screens/infoScreen/IntroScreen2';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OtpRegisterScreen from '../screens/auth/OtpRegisterScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import OtpScreen from '../screens/auth/OtpScreen';
import DrawerNavigation from '../drawerNavigation/DrawerNavigation';
import RideSelectionScreen from '../screens/rideScreens/RideSelectionScreen';
import BookRideScreen from '../screens/rideScreens/BookRideScreen';
import DriverApprochScreen from '../screens/rideScreens/DriverApprochScreen';
import ChatScreen from '../screens/supportScreens/ChatScreen';
import SupportScreen from '../screens/supportScreens/SupportScreen';
import InRideScreen from '../screens/rideScreens/InRideScreen';
import AfterRideScreen from '../screens/rideScreens/AfterRideScreen';
import DestinationScreen from '../screens/rideScreens/DestinationScreen';
import RidesHistoryDetailsScreen from '../screens/rideScreens/RidesHistoryDetailsScreen';
import RidesScreen from '../screens/rideScreens/RidesScreen';
import PaymentScreen from '../screens/paymentScreen/PaymentScreen';
import AccountScreen from '../screens/accountScreens/AccountScreen';
import AboutScreen from '../screens/infoScreen/AboutScreen';
import NotificationScreen from '../screens/supportScreens/NotificationScreen';
import SaveDestinationScreen from '../screens/supportScreens/SaveDestinationScreen';
import SecurityCentralScreen from '../screens/supportScreens/SecurityCentralScreen';

// Define navigation param list for TypeScript
export type RootStackParamList = {
  Splash: undefined;
  IntroScreen1: undefined;
  IntroScreen2: undefined;
  RegisterScreen: undefined;
  OtpRegisterScreen: undefined;
  LoginScreen: undefined;
  OtpScreen: undefined;
  HomeScreen: undefined;
  RideSelectionScreen: undefined;
  BookRideScreen: undefined;
  DriverApprochScreen: undefined;
  ChatScreen: undefined;
  SupportScreen: undefined;
  InRideScreen: undefined;
  AfterRideScreen: undefined;
  DestinationScreen: undefined;
  RideHistoryScreen: undefined;
  RidesHistoryDetailsScreen: undefined;
  PaymentScreen: undefined;
  AccountScreen: undefined;
  AboutScreen: undefined;
  NotificationScreen: undefined;
  SaveDestinationScreen: undefined;
  SecurityCentralScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const StackNavigator: React.FC = () => {



  return (
    <Stack.Navigator
      initialRouteName={'Splash'}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="IntroScreen1" component={IntroScreen1} />
      <Stack.Screen name="IntroScreen2" component={IntroScreen2} />

      <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
      <Stack.Screen name="OtpRegisterScreen" component={OtpRegisterScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="OtpScreen" component={OtpScreen} />

      <Stack.Screen name="HomeScreen" component={DrawerNavigation} />
      <Stack.Screen name="RideSelectionScreen" component={RideSelectionScreen} />
      <Stack.Screen name="BookRideScreen" component={BookRideScreen} />
      <Stack.Screen name="DriverApprochScreen" component={DriverApprochScreen} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="SupportScreen" component={SupportScreen} />
      <Stack.Screen name="InRideScreen" component={InRideScreen} />
      <Stack.Screen name="AfterRideScreen" component={AfterRideScreen} />
      <Stack.Screen name="DestinationScreen" component={DestinationScreen} />
      <Stack.Screen name="RideHistoryScreen" component={RidesScreen} />
      <Stack.Screen name="RidesHistoryDetailsScreen" component={RidesHistoryDetailsScreen} />
      <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
      <Stack.Screen name="AccountScreen" component={AccountScreen} />
      <Stack.Screen name="AboutScreen" component={AboutScreen} />
      <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
      <Stack.Screen name="SaveDestinationScreen" component={SaveDestinationScreen} />
      <Stack.Screen name="SecurityCentralScreen" component={SecurityCentralScreen} />
    </Stack.Navigator>
  );
};

export default StackNavigator;




