import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { Dimensions } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { THEAMCOLOR } from '../assets/theam/theam';
import BackButton from '../Components/common/BackButton';
import ImagePath from '../constants/ImagePath';

const { width } = Dimensions.get('screen');

const EarningsScreen = () => {
    // State for date picker
    const [selectedDate, setSelectedDate] = useState(new Date('2025-02-22')); // Default: 22 Feb 2025
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Sample payment history data
    const paymentHistory = [
        { id: 1, name: 'Nikhil', duration: '38 Min', amount: '₹69' },
        { id: 2, name: 'Nikhil', duration: '38 Min', amount: '₹69' },
        { id: 3, name: 'Nikhil', duration: '38 Min', amount: '₹69' },
    ];

    // Format date as "DD MMM, YYYY"
    const formatDate = (date) => {
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).replace(/ /g, ' ');
    };

    // Handle date selection
    const onDateChange = (event, newDate) => {
        setShowDatePicker(false);
        if (newDate) {
            setSelectedDate(newDate);
        }
    };

    // Show date picker
    const handleDatePicker = () => {
        setShowDatePicker(true);
    };

    return (
        <View style={styles.container}>
            {/* Header */}

            <BackButton />
            <Text style={styles.headerTitle}>Earnings</Text>


            {/* Today Section */}
            <View style={styles.todayContainer}>
                <Text style={styles.sectionTitle}>Today</Text>
                <Text style={styles.earningsAmount}>₹1232</Text>
                <View style={styles.ridesRow}>
                    <Image source={ImagePath.Rides} style={{ tintColor: THEAMCOLOR.PrimaryGreen || '#28A745', width: 30, height: 25, resizeMode: 'contain' }} />
                    <Text style={styles.ridesText}>12 Rides</Text>
                </View>
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>6.56 km</Text>
                        <Text style={styles.statLabel}>DISTANCE</Text>
                    </View>
                    <View style={styles.verticle} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>12 hr 23 m</Text>
                        <Text style={styles.statLabel}>TIME ONLINE</Text>
                    </View>
                </View>
            </View>

            {/* Payment History Section */}
            <View style={styles.historyContainer}>
                <View style={styles.historyHeader}>
                    <Text style={styles.sectionTitle}>Payment History</Text>
                    <View style={styles.datePickerContainer}>
                        <TouchableOpacity onPress={handleDatePicker}>
                            <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDatePicker}>
                            <Ionicons name="calendar-outline" size={20} color={THEAMCOLOR.PrimaryGreen || '#000'} />
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={selectedDate}
                                mode="date"
                                display="default"
                                onChange={onDateChange}
                            />
                        )}
                    </View>
                </View>

                {/* Payment History List */}
                <ScrollView
                    style={styles.historyList}
                    showsVerticalScrollIndicator={false}
                >
                    {paymentHistory.map((item, index) => (
                        <View key={item.id} style={styles.historyItem}>
                            <Image
                                source={{ uri: 'https://i.pravatar.cc/150?img=8' }} // Same placeholder as ChatScreen
                                style={styles.avatar}
                            />
                            <View style={styles.historyDetails}>
                                <Text style={styles.historyName}>{item.name}</Text>
                                <View style={styles.historyDurationRow}>
                                    <Ionicons name="time-outline" size={16} color={THEAMCOLOR.SecondaryGray || '#666'} />
                                    <Text style={styles.historyDuration}>{item.duration}</Text>
                                </View>
                            </View>
                            <Text style={styles.historyAmount}>{item.amount}</Text>
                            {(paymentHistory.length - 1) != index && < View
                                style={{
                                    borderBottomWidth: 1,
                                    borderColor: "lightgray",
                                    position: 'absolute',
                                    width: width * 0.83,
                                    left: '50%',
                                    transform: [{ translateX: -(width * 0.75) / 2 }],
                                    bottom: 0
                                }}
                            />
                            }
                        </View>
                    ))}
                </ScrollView>
            </View>

        </View>
    );
};

export default EarningsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEAMCOLOR.SecondarySmokeWhite || '#f5f5f5',
    },
    header: {
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: 'lightgray',
    },
    headerTitle: {
        paddingVertical: 15,
        backgroundColor: '#fff',
        fontSize: 18,
        fontWeight: '600',
        color: THEAMCOLOR.SecondaryBlack || '#000',
        textAlign: 'center',
    },
    todayContainer: {
        backgroundColor: '#fff',
        margin: 15,
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'lightgray',
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '500',
        color: THEAMCOLOR.SecondaryBlack || '#000',
        marginBottom: 7,
    },
    earningsAmount: {
        fontSize: 20,
        fontWeight: '600',
        color: THEAMCOLOR.PrimaryGreen,
        marginBottom: 7,
    },
    ridesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    ridesText: {
        fontSize: 12,
        color: THEAMCOLOR.SecondaryGray || '#000',
        marginLeft: 5,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        borderTopWidth: 1,
        borderColor: 'lightgray',
        paddingTop: 15,
    },
    statItem: {
        alignItems: 'center',
    },
    verticle: {
        height: 50,
        width: 1,
        backgroundColor: 'lightgray',
    },
    statValue: {
        fontSize: 12,
        fontWeight: '400',
        color: THEAMCOLOR.SecondaryBlack || '#000',
        marginBottom: 3,
    },
    statLabel: {
        fontSize: 12,
        color: THEAMCOLOR.SecondaryGray || '#666',
        textTransform: 'uppercase',
    },
    historyContainer: {
        marginHorizontal: 15,
        marginBottom: 15,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    datePickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
    },
    dateText: {
        fontSize: 13,
        color: THEAMCOLOR.SecondaryBlack || '#000',
        marginRight: 5,
    },
    historyList: {
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'lightgray',
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        paddingVertical:10,
        // borderBottomWidth: 1,
        // borderColor: 'lightgray',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    historyDetails: {
        flex: 1,
    },
    historyName: {
        fontSize: 13,
        fontWeight: '500',
        color: THEAMCOLOR.SecondaryBlack || '#000',
        marginBottom: 5,
    },
    historyDurationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    historyDuration: {
        fontSize: 11,
        color: THEAMCOLOR.SecondaryGray || '#666',
        marginLeft: 5,
    },
    historyAmount: {
        fontSize: 13,
        fontWeight: '500',
        color: THEAMCOLOR.PrimaryGreen || '#000',
    },
});
