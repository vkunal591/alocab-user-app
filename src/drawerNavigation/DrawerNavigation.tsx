import React, { use, useContext, useEffect, useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, Alert, ToastAndroid, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ImagePath from '../constants/ImagePath';
import { LINE_HEIGHT, TEXT_SIZE, THEAMCOLOR, THEAMFONTFAMILY } from '../../assets/theam/theam';
import HomeStackNatigator from '../navigator/HomeStackNatigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { set } from 'react-hook-form';

const { width } = Dimensions.get('screen')

// Custom Drawer Content
function CustomDrawerContent(props: any) {
    const [user, setUser] = useState<any>()

    const handleLogout = async () => {
        try {
            await AsyncStorage.multiRemove(['userToken', 'userData']);
            props.navigation.closeDrawer();
            props.navigation.navigate('LoginScreen'); // Assuming you have a LoginScreen
        } catch (error: any) {
            ToastAndroid.show(
                error.message || 'An error occurred during logout',
                2000
            );
        }
    };
    useEffect(() => {
        const fetchUserData = async () => {
            const userData = await AsyncStorage.getItem('user');
            setUser(userData);
        };
        fetchUserData();
    }, []);
    return (
        <DrawerContentScrollView {...props}>
            {/* Profile Section */}
            <View style={styles.profileContainer}>
                <Image
                    source={{
                        uri: 'https://i.pravatar.cc/150?img=8'
                    }}
                    style={styles.profileImage}
                    defaultSource={{ uri: 'https://i.pravatar.cc/150?img=8' }} // Add a default profile image in ImagePath
                />
                <View style={styles.profileTextContainer}>
                    <TouchableOpacity
                        onPress={() => props.navigation.navigate('AccountScreen')}
                        style={{ position: 'relative', zIndex: 5 }}
                    // disabled={isLoading}
                    >
                        <Image source={ImagePath.edit} style={styles.edit} />
                    </TouchableOpacity>
                    <Text style={styles.profileName}>
                        {user?.name || 'Guest User'}
                    </Text>
                    <Text style={styles.profilePhone}>
                        {user?.phoneNumber || 'Not provided'}
                    </Text>
                    <View style={styles.ratingContainer}>
                        <Text style={styles.ratedText}>Rated </Text>
                        {[...Array(5)].map((_, index) => (
                            <Icon key={index} name="star" size={16} color="#FFB700" />
                        ))}
                    </View>
                </View>
            </View>

            {/* Drawer Items */}
            <DrawerItemList {...props} />

            {/* Custom Drawer Items */}
            <DrawerItem
                label="Notifications"
                onPress={() => props.navigation.navigate('NotificationScreen')}
                icon={({ focused }) => (
                    <Image
                        source={ImagePath.notification}
                        style={{
                            width: 20,
                            height: 20,
                            resizeMode: 'contain',
                            tintColor: focused ? THEAMCOLOR.PrimaryGreen : '#000000',
                        }}
                    />
                )}
                labelStyle={styles.drawerLabel}
            />
            <DrawerItem
                label="Ride History"
                onPress={() => props.navigation.navigate('RideHistoryScreen')}
                icon={({ focused }) => (
                    <Image
                        source={ImagePath.rideHistory}
                        style={{
                            width: 20,
                            height: 20,
                            resizeMode: 'contain',
                            tintColor: focused ? THEAMCOLOR.PrimaryGreen : '#000000',
                        }}
                    />
                )}
                labelStyle={styles.drawerLabel}
            />
            <DrawerItem
                label="Payment"
                onPress={() => props.navigation.navigate('PaymentScreen')}
                icon={({ focused }) => (
                    <Image
                        source={ImagePath.payments}
                        style={{
                            width: 20,
                            height: 20,
                            resizeMode: 'contain',
                            tintColor: focused ? THEAMCOLOR.PrimaryGreen : '#000000',
                        }}
                    />
                )}
                labelStyle={styles.drawerLabel}
            />
            <DrawerItem
                label="Security Central"
                onPress={() => props.navigation.navigate('SecurityCentralScreen')}
                icon={({ focused }) => (
                    <Image
                        source={ImagePath.question}
                        style={{
                            width: 20,
                            height: 20,
                            resizeMode: 'contain',
                            tintColor: focused ? THEAMCOLOR.PrimaryGreen : '#000000',
                        }}
                    />
                )}
                labelStyle={styles.drawerLabel}
            />
            <DrawerItem
                label="About"
                onPress={() => props.navigation.navigate('AboutScreen')}
                icon={({ focused }) => (
                    <Image
                        source={ImagePath.info}
                        style={{
                            width: 20,
                            height: 20,
                            resizeMode: 'contain',
                            tintColor: focused ? THEAMCOLOR.PrimaryGreen : '#000000',
                        }}
                    />
                )}
                labelStyle={styles.drawerLabel}
            />
            <DrawerItem
                label="Customer Support"
                onPress={() => props.navigation.navigate('SupportScreen')}
                icon={({ focused }) => (
                    <Image
                        source={ImagePath.csSupport}
                        style={{
                            width: 20,
                            height: 20,
                            resizeMode: 'contain',
                            tintColor: focused ? THEAMCOLOR.PrimaryGreen : '#000000',
                        }}
                    />
                )}
                labelStyle={styles.drawerLabel}
            />
            <DrawerItem
                label="Logout"
                onPress={handleLogout}
                icon={({ focused }) => (
                    <Image
                        source={ImagePath.logout}
                        style={{
                            width: 20,
                            height: 20,
                            resizeMode: 'contain',
                            tintColor: '#FF0000',
                        }}
                    />
                )}
                labelStyle={[styles.drawerLabel, { color: '#FF0000' }]}
            />

            {/* Footer with Logo and Website */}
            <View style={styles.footerContainer}>
                <Image source={ImagePath.nameLogo} style={{ width: 100, height: 50, resizeMode: 'contain' }} />
                <View style={{ width: 40, height: 1.5, marginTop: 15, marginBottom: 10, backgroundColor: THEAMCOLOR.PrimaryGreen }} />
                <Text style={styles.websiteText}>WWW.ALOCAB.CO.IN</Text>
            </View>
        </DrawerContentScrollView>
    );
}

// Drawer Navigator
const Drawer = createDrawerNavigator();

export default function DrawerNavigation() {
    const [user, setUser] = useState<any>();
    const [isLoading, setIsLoading] = useState(false)
    useEffect(() => {
        const fetchUserData = async () => {
            setIsLoading(true);
            try {
                const userData = await AsyncStorage.getItem('userData');
                if (userData) {
                    setUser(JSON.parse(userData));
                    setIsLoading(false);
                } else {
                    setUser(null);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Failed to load user data:', error);
                setUser(null);
                setIsLoading(false);
            }
        };
        fetchUserData();
    }, []);
    const logout = async () => {
        try {
            await AsyncStorage.multiRemove(['userToken', 'userData']);
            ToastAndroid.show('Logged out successfully', ToastAndroid.SHORT);
        } catch (error: any) {
            ToastAndroid.show(
                error.message || 'An error occurred during logout',
                ToastAndroid.SHORT
            );
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={THEAMCOLOR.PrimaryGreen} />
                <Text style={{ color: THEAMCOLOR.PrimaryGreen, fontSize: TEXT_SIZE.bodyLarge }}>Loading...</Text>
            </View>
        );
    }


    if (!user) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Unable to load user data</Text>
                <TouchableOpacity
                    onPress={() => logout()}
                    style={styles.logoutButton}
                >
                    <Text style={styles.logoutButtonText}>Try Logout</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <Drawer.Navigator
            initialRouteName="HomeScreen"
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
                drawerStyle: {
                    backgroundColor: '#FFFFFF',
                    width: width * 0.65,
                    borderTopEndRadius: 0,
                    borderBottomEndRadius: 0,
                },
                drawerLabelStyle: {
                    fontSize: 12,
                    color: '#000000',
                },
                drawerActiveTintColor: THEAMCOLOR.PrimaryGreen,
                drawerActiveBackgroundColor: '#E6F5EC',
                drawerInactiveTintColor: '#000000',
                drawerItemStyle: {
                    marginTop: 10,
                    padding: 0,
                },
            }}
        >
            <Drawer.Screen
                name="HomeScreen"
                component={HomeStackNatigator}
                options={{
                    title: 'Home',
                    drawerIcon: ({ focused }) => (
                        <Image
                            source={ImagePath.Home}
                            style={{
                                width: 20,
                                height: 20,
                                resizeMode: 'contain',
                                tintColor: focused ? THEAMCOLOR.PrimaryGreen : '#000000',
                            }}
                        />
                    ),
                }}
            />
        </Drawer.Navigator>
    );
}

// Styles
const styles = StyleSheet.create({
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 16,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 35,
        marginRight: 16,
    },
    profileTextContainer: {
        flex: 1,
    },
    profileName: {
        fontSize: TEXT_SIZE.bodyLarge,
        lineHeight: LINE_HEIGHT.bodyLarge,
        fontFamily: THEAMFONTFAMILY.LatoRegular,
        fontWeight: 'bold',
        color: '#000000',
    },
    profilePhone: {
        color: '#666666',
        marginVertical: 4,
        fontSize: TEXT_SIZE.small,
        lineHeight: LINE_HEIGHT.small,
        fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    },
    edit: {
        position: 'absolute',
        right: 0,
        top: 0,
        width: 18,
        height: 18,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratedText: {
        color: '#666666',
        marginRight: 5,
        fontSize: TEXT_SIZE.small,
        lineHeight: LINE_HEIGHT.small,
        fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    },
    drawerLabel: {
        fontSize: TEXT_SIZE.small,
        lineHeight: LINE_HEIGHT.small,
        fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
        color: '#000000',
        fontWeight: '400',
    },
    footerContainer: {
        alignItems: 'center',
        marginTop: 20,
        paddingBottom: 20,
    },
    websiteText: {
        fontSize: TEXT_SIZE.small,
        lineHeight: LINE_HEIGHT.small,
        fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
        color: THEAMCOLOR.PrimaryGreen,
        marginTop: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: TEXT_SIZE.bodyLarge,
        color: '#FF0000',
        marginBottom: 20,
        textAlign: 'center',
    },
    logoutButton: {
        backgroundColor: THEAMCOLOR.PrimaryGreen,
        padding: 10,
        borderRadius: 5,
    },
    logoutButtonText: {
        color: '#FFFFFF',
        fontSize: TEXT_SIZE.bodyMedium,
        fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    },
});