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

    // Foreground message handler
    const unsubscribeForeground = getMessaging().onMessage(async remoteMessage => {
      console.log('📩 Foreground Message:', remoteMessage);

      const { title, body } = remoteMessage.notification || {};
      const { rideId, notificationId, pickup } = remoteMessage.data || {};

      if (rideId) {
        setRideRequest({
          title: title || 'New Ride Request',
          body: body || '',
          rideId: rideId?.toString() || '',
          notificationId: notificationId?.toString() || '',
          pickup: pickup?.toString() || '',
        });
      }
    });

    // Token refresh handler
    const unsubscribeTokenRefresh = onTokenRefreshListener();

    // Background/quit handlers
    onNotificationOpenedAppHandler();
    checkInitialNotification();

    return () => {
      unsubscribeForeground();
      unsubscribeTokenRefresh();
    };
  }, []);

  // Accept ride
  // const handleAccept = async () => {
  //   if (!rideRequest) return;

  //   try {
  //     const response: any = await apiUtils.post(`/api/ride/accept/${rideRequest?.rideId}`, {});
  //     console.log(response)
  //     if (response?.success) {
  //       navigate('DriverETAScreen', { ride: response?.ride }); // ✅ Use global navigate
  //     } else {
  //       throw new Error('Error accepting ride');
  //     } console.log('Ride accepted');
  //   } catch (error) {
  //     console.error('Failed to accept ride:', error);
  //   } finally {
  //     setRideRequest(null);
  //   }
  // };

  // // Reject ride
  // const handleReject = async () => {
  //   if (!rideRequest) return;

  //   try {
  //     // await rejectRideRequest(rideRequest.rideId);
  //     console.log('Ride rejected');
  //   } catch (error) {
  //     console.error('Failed to reject ride:', error);
  //   } finally {
  //     setRideRequest(null);
  //   }
  // };

  return (
    <AuthProvider>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
