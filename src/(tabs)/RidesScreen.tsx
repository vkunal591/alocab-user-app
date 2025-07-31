import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import React, { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient'; // Added for gradient
import BackButton from '../Components/common/BackButton';
import { THEAMCOLOR } from '../../assets/theam/theam';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const RidesScreen = () => {
  const navigation = useNavigation<any>()
  const [selectedDate, setSelectedDate] = useState(new Date('2025-02-22')); // Default: 22 Feb 2025
  const [showDatePicker, setShowDatePicker] = useState(false);

  const rides = [
    {
      date: '16/02/2025, 08:59 PM',
      status: 'Completed',
      totalFare: '₹69',
      earnings: '₹29',
      pickup: 'C-50, Dal Mil Road, Uttam Nagar, NEW DELHI, 110022.',
      dropoff: 'A2/32, DC, JANAKPURI, Uttam Nagar, NEW DELHI, 110059.',
    },
    {
      date: '16/02/2025, 08:59 PM',
      status: 'Cancelled',
      totalFare: '₹0',
      earnings: '₹0',
      pickup: 'C-50, Dal Mil Road, Uttam Nagar, NEW DELHI, 110022.',
      dropoff: 'A2/32, DC, JANAKPURI, Uttam Nagar, NEW DELHI, 110059.',
    },
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
      {/* Header with Back Arrow and Title */}
      <View style={styles.headerContainer}>
        <BackButton />
        <Text style={styles.headerTitle}>Rides</Text>
      </View>

      {/* Date Picker Section */}
      <View style={styles.datePickerContainer}>
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

      {/* Rides List */}
      <ScrollView style={styles.scrollView}>
        {rides.map((ride, index) => (
          <TouchableOpacity onPress={() => navigation.navigate('RidesHistoryDetailsScreen')}>
            <View key={index} style={styles.rideContainer} >
              <View style={styles.fareContainer}>
                <View>
                  <Text style={styles.rideDate}>{ride.date}</Text>
                  <Text style={[styles.status, { color: ride.status === 'Completed' ? THEAMCOLOR.PrimaryGreen : '#D32F2F' }]}>
                    {ride.status}
                  </Text>
                </View>
                <View>
                  <Text style={styles.fareLabel}>Total Fare</Text>
                  <Text style={styles.fareValue}>{ride.totalFare}</Text>
                </View>
                <View>
                  <Text style={styles.fareLabel}>Earning</Text>
                  <Text style={styles.fareValue}>{ride.earnings}</Text>
                </View>
              </View>
              <View style={styles.pathRow}>
                <View style={styles.iconColumn}>
                  <View style={styles.greenCircle} />
                  <LinearGradient
                    colors={['#00FF00', '#FF0000']} // Green to red gradient
                    style={styles.verticalLine}
                  />
                  <View style={styles.redCircle} />
                </View>
                <View style={styles.textColumn}>
                  <Text style={styles.locationText}>{ride.pickup}</Text>
                  <Text style={styles.locationText}>{ride.dropoff}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default RidesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEAMCOLOR.SecondarySmokeWhite,
  },
  headerContainer: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: width * 0.05,
  },
  headerTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '500',
    marginTop: 10,
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 5,
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: height * 0.01,
    marginVertical: height * 0.01,
    shadowColor: 'gray',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  dateText: {
    fontSize: 14,
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  rideContainer: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    marginHorizontal: width * 0.05,
    padding: height * 0.02,
    marginBottom: height * 0.02,
    elevation: 5,
    shadowColor: 'gray',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  rideDate: {
    fontSize: 11,
    color: '#757575',
  },
  status: {
    fontSize: 11,
    fontWeight: '500',
    marginVertical: height * 0.01,
  },
  fareContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: height * 0.01,
  },
  fareLabel: {
    fontSize: 11,
    color: '#757575',
  },
  fareValue: {
    fontSize: 12,
    fontWeight: '500',
    color: THEAMCOLOR.PrimaryGreen,
    marginTop: 5
  },
  pathRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: height * 0.01,
  },
  iconColumn: {
    alignItems: 'center',
    marginRight: 10,
  },
  greenCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'green',
  },
  redCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'red',
  },
  verticalLine: {
    width: 2,
    height: 30,
    marginVertical: 2,
  },
  textColumn: {
    justifyContent: 'space-between',
    height: 60,
    flex: 1,
  },
  locationText: {
    fontSize: 9.5,
    color: '#000',
  },
});