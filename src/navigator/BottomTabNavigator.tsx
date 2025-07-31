// BottomTabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { THEAMCOLOR } from '../../assets/theam/theam';
import { Image } from 'react-native';
import ImagePath from '../constants/ImagePath';
import HomeStackNatigator from './HomeStackNatigator';
import RidesStackNatigator from './RidesStackNatigator';
import EarningStackNatigator from './EarningStackNatigator';
import AccountStackNatigator from './AccountStackNatigator';

const Tab = createBottomTabNavigator();

const iconMap: any = {
    Home: ImagePath.Home,
    Rides: ImagePath.Rides,
    Earnings: ImagePath.Earns,
    Profile: ImagePath.Profile,
};

export default function BottomTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused }) => (
                    <Image
                        source={iconMap[route.name]}
                        resizeMode="contain"
                        style={{
                            width: 24,
                            height: 24,
                            tintColor: focused ? THEAMCOLOR?.PrimaryGreen : 'gray',
                            borderRadius: focused ? 0 : 0,
                        }}
                    />
                ),
                tabBarStyle: {
                    height: 65,
                    backgroundColor: '#fff',
                    elevation: 5,
                },
                tabBarActiveTintColor: THEAMCOLOR?.PrimaryGreen,
                tabBarInactiveTintColor: THEAMCOLOR?.SecondaryGray,
            })}
        >
            <Tab.Screen name="Home" component={HomeStackNatigator} />
            {/* <Tab.Screen name="Rides" component={RidesStackNatigator} />
            <Tab.Screen name="Earnings" component={EarningStackNatigator} />
            <Tab.Screen name="Profile" component={AccountStackNatigator} /> */}

        </Tab.Navigator>
    );
}
