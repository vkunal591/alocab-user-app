import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView, ToastAndroid } from 'react-native';
import React, { useEffect, useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { THEAMCOLOR, THEAMFONTFAMILY, TEXT_SIZE, LINE_HEIGHT } from '../../../assets/theam/theam';
import BackButton from '../../Components/common/BackButton';
import apiUtils from '../../utils/apiUtils';
import { RideDetails } from './BookRideScreen';

const { width, height } = Dimensions.get('window');

interface Location {
  address: string;
  coordinates: [number, number];
}

interface Ride {
  pickup: Location;
  _id: string;
  user: string;
  drops: Location[];
  status: string;
  isPinVerified: boolean;
  pin: number;
  vehicleType: string;
  penaltyAmount: number;
  paymentMode: string;
  promoCode: string | null;
  promoCodeDetails: any | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
  distance: string;
  driver: string;
  fare: number;
  startedAt: string;
  driverReachedAt: string;
  completedAt: string;
  duration: number;
}




export enum RideStatus {
  ONGOING = 'ongoing',
  REJECTED = 'rejected',
  ACCEPTED = 'accepted',
  REQUESTED = 'requested',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
};


export const rideStatusColors: any = {
  [RideStatus.ONGOING]: '#FFE58F',     // Light Yellow
  [RideStatus.REJECTED]: '#FF4D4F',    // Red
  [RideStatus.ACCEPTED]: '#91D5FF',    // Blue
  [RideStatus.REQUESTED]: '#D3ADF7',   // Purple
  [RideStatus.COMPLETED]: '#52C41A',   // Green
  [RideStatus.CANCELLED]: '#BFBFBF',   // Gray
};


const RidesScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedDate, setSelectedDate] = useState(new Date('2025-02-22'));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [ridesDetails, setRidesDetails] = useState<Ride[]>(null);

  const fetchRidesDetails = async () => {
    try {
      const response: any = await apiUtils.get('/api/ride/user');
      console.log('Ride details fetched:', response.rides);
      if (response?.success) {
        setRidesDetails(response.rides);
        return response?.rides?.[0]?.status;
      } else {
        ToastAndroid.show(response?.message || 'Failed to fetch ride details', ToastAndroid.SHORT);
        return null;
      }
    } catch (error: any) {
      ToastAndroid.show(error.message || 'Error fetching ride details', ToastAndroid.LONG);
      return null;
    }
  };

  useEffect(() => {
    const getRidesDetails = async () => {
      await fetchRidesDetails();
    };
    getRidesDetails();
  }, []);


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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).replace(/ /g, ' ');
  };

  const onDateChange = (event: any, newDate?: Date) => {
    setShowDatePicker(false);
    if (newDate) {
      setSelectedDate(newDate);
    }
  };

  const handleDatePicker = () => {
    setShowDatePicker(true);
  };

  return (
    <View style={styles.container}>
      {/* Header with Back Arrow and Title */}
      <View style={styles.headerContainer}>
        <BackButton />
        <Text style={styles.headerTitle}>My Rides</Text>
      </View>

      {/* Date Picker Section */}
      <View style={styles.datePickerContainer}>
        <View style={styles.datePickerInnerContainer}>
          <TouchableOpacity onPress={handleDatePicker}>
            <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDatePicker}>
            <Ionicons name="calendar-outline" size={20} color={THEAMCOLOR.PrimaryGreen || '#4CAF50'} />
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
        {ridesDetails && ridesDetails.map((ride, index) => (
          <TouchableOpacity key={index} onPress={() => navigation.navigate('RidesHistoryDetailsScreen', { rideId: ride?._id })}>
            <View style={styles.rideContainer}>
              <View style={styles.fareContainer}>
                <View>
                  <Text style={styles.rideDate}>
                    {ride?.createdAt ? new Date(ride.createdAt).toLocaleString() : ''}
                  </Text>
                  <Text
                    style={[
                      styles.status,
                      { backgroundColor: rideStatusColors[ride?.status] }
                    ]}
                  >
                    {ride.status?.charAt(0).toUpperCase() + ride?.status?.slice(1)}
                  </Text>
                </View>
                <View>
                  <Text style={styles.fareLabel}>Total Fare</Text>
                  <Text style={styles.fareValue}>₹ {Number(ride?.fare)?.toFixed(2)}</Text>
                </View>
              </View>
              <View style={styles.pathRow}>
                <View style={styles.iconColumn}>
                  <View style={styles.greenCircle} />
                  <LinearGradient
                    colors={['#00FF00', '#FF0000']}
                    style={styles.verticalLine}
                  />
                  <View style={styles.redCircle} />
                </View>
                <View style={styles.textColumn}>
                  <Text
                    style={styles.locationText}
                    numberOfLines={2} // Limit to 2 lines
                    ellipsizeMode="tail" // Add ellipsis at the end if truncated
                  >
                    {ride?.pickup?.address || 'Pickup Location'}
                  </Text>
                  <Text
                    style={styles.locationText}
                    numberOfLines={2} // Limit to 2 lines
                    ellipsizeMode="tail" // Add ellipsis at the end if truncated
                  >
                    {ride?.drops[0]?.address || 'Dropoff Location'}
                  </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: THEAMFONTFAMILY.LatoRegular,
    fontSize: TEXT_SIZE.body,
    lineHeight: LINE_HEIGHT.h3,
    fontWeight: 'bold',
    color: THEAMCOLOR.SecondaryBlack || '#333',
    textAlign: 'center',
    flex: 1,
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: height * 0.01,
    marginVertical: height * 0.01,
  },
  datePickerInnerContainer: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: height * 0.01,
    shadowColor: 'gray',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  dateText: {
    fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    fontSize: TEXT_SIZE.small,
    lineHeight: LINE_HEIGHT.small,
    color: THEAMCOLOR.SecondaryBlack || '#000',
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
    fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    fontSize: TEXT_SIZE.small,
    lineHeight: LINE_HEIGHT.small,
    color: THEAMCOLOR.SecondaryGray || '#757575',
  },
  status: {
    fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    fontSize: TEXT_SIZE.small,
    lineHeight: LINE_HEIGHT.small,
    fontWeight: '500',
    marginVertical: height * 0.01,
    width: width * 0.25,
    borderRadius: 14,
    paddingVertical: 1,
    textAlign: 'center',
  },
  fareContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: height * 0.01,
  },
  fareLabel: {
    fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    fontSize: TEXT_SIZE.small,
    lineHeight: LINE_HEIGHT.small,
    color: THEAMCOLOR.SecondaryGray || '#757575',
  },
  fareValue: {
    fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    fontSize: TEXT_SIZE.small,
    lineHeight: LINE_HEIGHT.small,
    fontWeight: '500',
    color: THEAMCOLOR.PrimaryGreen || '#4CAF50',
    marginTop: 5,
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
    height: 18,
    marginVertical: 2,
  },
  textColumn: {
    justifyContent: 'space-between',
    height: 50,
    flex: 1,
    maxWidth: width * 0.8, // Ensure text doesn't overflow the container
    overflow: 'hidden'
  },
  locationText: {
    fontFamily: THEAMFONTFAMILY.NunitoRegular,
    fontSize: 12,
    color: THEAMCOLOR.SecondaryBlack || '#000',
    flexWrap: 'wrap', // Ensures text wraps within the container
  },
});