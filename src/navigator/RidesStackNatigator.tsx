import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import RidesScreen from '../(tabs)/RidesScreen';

const RidesStackNatigator = () => {
    const Stack = createNativeStackNavigator();
    return (
        <Stack.Navigator>
            <Stack.Screen name="RidesScreen" component={RidesScreen} options={{ headerShown: false }} />
            {/* <Stack.Screen name="DriverETAScreen" component={DriverETAScreen} options={{ headerShown: false }} />
            <Stack.Screen name="StartRideScreen" component={StartRideScreen} options={{ headerShown: false }} />
            <Stack.Screen name="InRideScreen" component={InRideScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CancelRideScreen" component={CancelRideScreen} options={{ headerShown: false }} /> */}

        </Stack.Navigator>
    )
}

export default RidesStackNatigator;
