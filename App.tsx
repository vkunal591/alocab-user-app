// App.tsx
import 'react-native-get-random-values'; // ✅ Add this at the very top
import React, { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './src/navigator/StackNavigator';
import { AuthProvider } from './src/context/authcontext';
import { checkInitialNotification, getFcmToken, onNotificationOpenedAppHandler, onTokenRefreshListener, requestUserPermission } from './src/utils/notification/firebase';
import { getMessaging } from '@react-native-firebase/messaging';

const App: React.FC = () => {
  const [rideRequest, setRideRequest] = useState<{
    title: string;
    body: string;
    rideId: string;
    notificationId: string;
    pickup: string;
  } | null>(null);

  useEffect(() => {
    requestUserPermission();
    getFcmToken();


    // Token refresh handler
    const unsubscribeTokenRefresh = onTokenRefreshListener();

    // Background/quit handlers
    onNotificationOpenedAppHandler();
    checkInitialNotification();

    return () => {
      unsubscribeTokenRefresh();
    };
  }, []);

  

  return (
    <AuthProvider>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
