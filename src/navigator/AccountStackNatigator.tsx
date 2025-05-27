import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import AccountScreen from '../(tabs)/AccountScreen';
import WalletScreen from '../Screens/accountScreens/WalletScreen';

const AccountStackNatigator = () => {
    const Stack = createNativeStackNavigator();
    return (
        <Stack.Navigator>
            <Stack.Screen name="AccountScreen" component={AccountScreen} options={{ headerShown: false }} />
            {/* <Stack.Screen name="WalletScreen" component={WalletScreen} options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name="StartRideScreen" component={StartRideScreen} options={{ headerShown: false }} />
            <Stack.Screen name="InRideScreen" component={InRideScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CancelRideScreen" component={CancelRideScreen} options={{ headerShown: false }} /> */}

        </Stack.Navigator>
    )
}

export default AccountStackNatigator;
