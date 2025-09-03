import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  RefreshControl,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import apiUtils from '../../utils/apiUtils';
import BackButton from '../../Components/common/BackButton';
import { THEAMCOLOR, THEAMFONTFAMILY, TEXT_SIZE, LINE_HEIGHT } from '../../../assets/theam/theam';


const { width, height } = Dimensions.get('window');

const RidesScreen = () => {
  const navigation = useNavigation<any>();
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState(new Date());
  const [pickerMode, setPickerMode] = useState<'start' | 'end'>('start');
  const [showPicker, setShowPicker] = useState(false);
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRides = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data: any = await apiUtils.get('/api/ride/user', {});
      console.log(data)
      if (!data?.success) throw new Error('Failed to fetch rides');

      const formatted = data?.rides?.map((ride: any) => ({
        ...ride,
        formattedDate: new Date(ride.createdAt).toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        statusText: ride.status.charAt(0).toUpperCase() + ride.status.slice(1),
        totalFare: `₹${ride.fare.toFixed(2)}`,
        earnings: `₹${(ride.fare).toFixed(2)}`,
      }));

      setRides(formatted);
    } catch {
      setError('An error occurred while fetching rides.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  const filteredRides = rides.filter((ride) => {
    const rideDate = new Date(ride.createdAt);

    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);
    console.log(rideDate, startOfDay, endOfDay)
    return rideDate >= startOfDay && rideDate <= endOfDay;
  });


  const onRefresh = () => {
    setRefreshing(true);
    fetchRides();
  };

  const onChangeDate = (event: any, newDate?: Date) => {
    setShowPicker(false);
    if (!newDate) return;
    pickerMode === 'start' ? setStartDate(newDate) : setEndDate(newDate);
  };

  const formatDateLabel = (date: Date) =>
    date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const formatDuration = (durationInSeconds: number) => {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;
    return `${minutes} min ${seconds} sec`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Rides</Text>
      </View>

      {/* Date Range Filter */}
      <View style={styles.filterCard}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => { setPickerMode('start'); setShowPicker(true); }}
        >
          <Text style={styles.filterText}>From: {formatDateLabel(startDate)}</Text>
        </TouchableOpacity>

        <LinearGradient colors={['#00FF00', '#FF0000']} style={styles.separator} />

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => { setPickerMode('end'); setShowPicker(true); }}
        >
          <Text style={styles.filterText}>To: {formatDateLabel(endDate)}</Text>
        </TouchableOpacity>
      </View>

      {showPicker && (
        <DateTimePicker
          value={pickerMode === 'start' ? startDate : endDate}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[THEAMCOLOR.PrimaryGreen]}
            tintColor={THEAMCOLOR.PrimaryGreen}
          />
        }
      >
        {loading ? (
          <Text style={styles.messageText}>Loading rides...</Text>
        ) : error ? (
          <Text style={[styles.messageText, styles.errorText]}>{error}</Text>
        ) : filteredRides.length === 0 ? (
          <Text style={styles.messageText}>No rides in this date range.</Text>
        ) : (
          filteredRides.map((ride, idx) => (
            <TouchableOpacity
              key={ride._id || idx}
              style={styles.rideCard}
              onPress={() => navigation.navigate('RidesHistoryDetailsScreen', { rideId: ride?._id })}
            >
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.dateTextSmall}>{ride.formattedDate}</Text>
                  <Text style={[
                    styles.statusText,
                    { color: ride.statusText === 'Completed' ? THEAMCOLOR.PrimaryGreen : '#D32F2F' }
                  ]}>{ride.statusText}</Text>
                </View>
                <View style={styles.fareInfo}>
                  <Text style={styles.label}>Fare</Text>
                  <Text style={styles.value}>{ride.totalFare}</Text>
                </View>
              </View>

              <View style={styles.routeRow}>
                <View style={styles.iconCol}>
                  <View style={styles.greenDot} />
                  <LinearGradient colors={['#00FF00', '#FF0000']} style={styles.verticalLine} />
                  <View style={styles.redDot} />
                </View>
                <View style={styles.textCol}>
                  <Text style={styles.locationText} numberOfLines={1}>
                    {ride.pickup?.address}
                  </Text>
                  <Text style={styles.locationText} numberOfLines={1}>
                    {ride.drops?.map((d: any) => d.address).join(' → ')}
                  </Text>
                </View>
              </View>

              {/* <View style={{ marginTop: 10 }}>
                <Text style={styles.locationText}>Vehicle: {ride.vehicleType}</Text>
                <Text style={styles.locationText}>Distance: {ride.distance} km</Text>
                <Text style={styles.locationText}>Duration: {formatDuration(ride.duration)}</Text>
                <Text style={styles.locationText}>Payment: {ride.paymentMode}</Text>
              </View> */}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default RidesScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEAMCOLOR.SecondarySmokeWhite },
  header: {
    paddingVertical: 18,
    paddingHorizontal: width * 0.05,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: THEAMFONTFAMILY.LatoRegular,
    fontSize: TEXT_SIZE.body,
    lineHeight: LINE_HEIGHT.h3,
    fontWeight: 'bold',
    color: THEAMCOLOR.SecondaryBlack,
    textAlign: 'center',
  },
  filterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: width * 0.05,
    marginVertical: height * 0.02,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    elevation: 3,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterText: {
    fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    fontSize: TEXT_SIZE.small,
    color: THEAMCOLOR.SecondaryBlack,
  },
  separator: {
    width: 2,
    height: '80%',
    borderRadius: 1,
    marginHorizontal: 8,
  },
  scrollView: { flex: 1 },
  messageText: {
    textAlign: 'center',
    marginTop: height * 0.1,
    fontSize: 16,
    color: THEAMCOLOR.SecondaryGray,
  },
  errorText: { color: '#D32F2F' },
  rideCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    marginHorizontal: width * 0.05,
    padding: height * 0.02,
    marginBottom: height * 0.02,
    elevation: 3,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.015,
  },
  dateTextSmall: {
    fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    fontSize: 12,
    color: THEAMCOLOR.SecondaryGray,
  },
  statusText: {
    fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    fontSize: 14,
    marginTop: height * 0.005,
  },
  fareInfo: { alignItems: 'flex-end' },
  label: {
    fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    fontSize: 12,
    color: THEAMCOLOR.SecondaryGray,
  },
  value: {
    fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    fontSize: 16,
    color: THEAMCOLOR.PrimaryGreen,
    marginTop: 5,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: height * 0.01,
  },
  iconCol: { alignItems: 'center', marginRight: 10 },
  greenDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'green' },
  redDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'red' },
  verticalLine: { width: 2, height: 30, marginVertical: 2 },
  textCol: {
    flex: 1,
    height: 50,
    flexDirection: "column",
    alignItems: 'flex-start',
    justifyContent: "space-between"
  },
  locationText: {
    fontFamily: THEAMFONTFAMILY.NunitoRegular,
    fontSize: TEXT_SIZE.small,
    color: THEAMCOLOR.SecondaryBlack,
  },
});
