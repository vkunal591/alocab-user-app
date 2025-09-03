import { StyleSheet, Text, View, Dimensions, ScrollView, Image, TouchableOpacity, ToastAndroid } from 'react-native';
import React, { useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import BackButton from '../../Components/common/BackButton';
import { THEAMCOLOR, THEAMFONTFAMILY, TEXT_SIZE, LINE_HEIGHT } from '../../../assets/theam/theam';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ImagePath from '../../constants/ImagePath';
import apiUtils from '../../utils/apiUtils';

const { width, height } = Dimensions.get('window');

interface Ride {
  _id: string;
  pickup: { address: string; coordinates: [number, number] };
  drops: { address: string; coordinates: [number, number] }[];
  driver: {
    name: string;
    vehicle: { number: string; type: string };
    rating: number;
  };
  status: string;
  vehicleType: string;
  penaltyAmount: number;
  fare: number;
  createdAt: string;
  distance: string;
  duration: number;
}

enum RideStatus {
  ONGOING = 'ongoing',
  REJECTED = 'rejected',
  ACCEPTED = 'accepted',
  REQUESTED = 'requested',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

const rideStatusColors: Record<RideStatus, string> = {
  [RideStatus.ONGOING]: '#FFE58F',
  [RideStatus.REJECTED]: '#FF4D4F',
  [RideStatus.ACCEPTED]: '#91D5FF',
  [RideStatus.REQUESTED]: '#D3ADF7',
  [RideStatus.COMPLETED]: '#52C41A',
  [RideStatus.CANCELLED]: '#BFBFBF',
};

const RidesHistoryDetailsScreen = () => {
  const { params: { rideId } } = useRoute();
  const [rideDetails, setRideDetails] = useState<Ride | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [review, setReview] = useState<any>(null)
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const fetchRideDetails = async () => {
    try {
      if (!rideId) {
        ToastAndroid.show('Ride ID is required', ToastAndroid.SHORT);
        return;
      }
      setIsLoading(true);
      const response: any = await apiUtils.get(`/api/ride/detail?rideId=${rideId}`);
      console.log(response)
      if (response?.success) {
        setReview(response?.review)
        setRideDetails(response.ride);
      } else {
        ToastAndroid.show(response?.message || 'Failed to fetch ride details', ToastAndroid.SHORT);
      }
    } catch (error: any) {
      ToastAndroid.show(error.message || 'Error fetching ride details', ToastAndroid.LONG);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRideDetails();
  }, [rideId]);

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`;
  };

  const renderStars = (rating: number) => (
    Array(rating)
      .fill(0)
      .map((_, index) => <Icon key={index} name="star" size={18} color="#FFB700" />)
  );

  const renderSkeleton = () => (
    <SkeletonPlaceholder>
      <View style={styles.rideDetailsContainer}>
        <View style={styles.infoRow}>
          <SkeletonPlaceholder.Item width={width * 0.4} height={20} borderRadius={8} />
          <SkeletonPlaceholder.Item width={width * 0.4} height={20} borderRadius={8} />
        </View>
        <View style={styles.infoRow}>
          <SkeletonPlaceholder.Item width={width * 0.4} height={20} borderRadius={8} />
          <SkeletonPlaceholder.Item width={width * 0.4} height={20} borderRadius={8} />
        </View>
        <View style={styles.infoRow}>
          <SkeletonPlaceholder.Item width={width * 0.4} height={20} borderRadius={8} />
          <SkeletonPlaceholder.Item width={width * 0.4} height={20} borderRadius={8} />
        </View>
        <View style={styles.ratingRow}>
          <SkeletonPlaceholder.Item width={50} height={50} borderRadius={25} />
          <View style={styles.profileContent}>
            <SkeletonPlaceholder.Item width={100} height={20} borderRadius={8} marginBottom={10} />
            <SkeletonPlaceholder.Item width={150} height={20} borderRadius={8} />
          </View>
        </View>
        <SkeletonPlaceholder.Item width={width * 0.9} height={150} borderRadius={10} marginVertical={10} />
      </View>
    </SkeletonPlaceholder>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <BackButton />
          <Text style={styles.headerTitle}>My Ride</Text>
        </View>
        <ScrollView style={styles.scrollView}>
          {renderSkeleton()}
        </ScrollView>
      </View>
    );
  }

  if (!rideDetails) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <BackButton />
          <Text style={styles.headerTitle}>My Ride</Text>
        </View>
        <Text style={styles.errorText}>No ride details available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <BackButton />
        <Text style={styles.headerTitle}>My Ride</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.rideDetailsContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Service Type</Text>
            <Text style={styles.infoValue}>{rideDetails?.vehicleType}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Vehicle Number</Text>
            <Text style={styles.infoValue}>{rideDetails?.driver?.vehicle.number}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date of Ride</Text>
            <Text style={styles.infoValue}>{new Date(rideDetails?.createdAt)?.toLocaleString()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ride ID</Text>
            <Text style={[styles.infoValue, { color: THEAMCOLOR.SecondaryBlack, fontWeight: '700' }]}>{rideDetails._id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={[styles.infoValue, { backgroundColor: rideStatusColors[rideDetails.status as RideStatus], fontWeight: '700' }]}>
              {rideDetails?.status?.charAt(0).toUpperCase() + rideDetails?.status?.slice(1)}
            </Text>
          </View>
          <View style={styles.ratingContainer}>
            <View style={styles.ratingRow}>
              <Image source={ImagePath.Profile} style={styles.driverImage} />
              <View style={styles.profileContent}>
                <Text style={styles.driverName}>{rideDetails?.driver?.name}</Text>
                <View style={styles.starsContainer}>
                  <Text style={{ fontSize: 12, color: 'gray', marginRight: 5 }}>You Rated:</Text>
                  {renderStars(review?.rating)}
                </View>
              </View>
            </View>
          </View>
          <View style={styles.totalAmountRow}>
            <Text style={styles.sectionTitle}>Total Amount</Text>
            <Text style={[styles.sectionTitle, { color: THEAMCOLOR.PrimaryGreen }]}>₹ {Number(rideDetails?.fare)?.toFixed(2)}</Text>
          </View>
          <View style={styles.ridePath}>
            <View style={styles.pathRow}>
              <View style={styles.iconColumn}>
                <View style={styles.greenCircle} />
                <LinearGradient colors={['#00FF00', '#FF0000']} style={styles.verticalLine} />
                <View style={styles.redCircle} />
              </View>
              <View style={styles.textColumn}>
                <Text numberOfLines={1} style={styles.locationText}>{rideDetails.pickup.address}</Text>
                <Text numberOfLines={1} style={styles.locationText}>{rideDetails.drops[0].address}</Text>
              </View>
            </View>
          </View>
          {/* <View style={styles.mapPlaceholder}>
            <Text style={styles.mapText}>[Map Placeholder]</Text>
          </View> */}
          <View style={styles.metricsRow}>
            <View style={styles.metricContainer}>
              <Text style={styles.metricValue}>{rideDetails.distance} Km</Text>
              <Text style={styles.metricLabel}>DISTANCE</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.metricContainer}>
              <Text style={styles.metricValue}>{formatDuration(rideDetails.duration)}</Text>
              <Text style={styles.metricLabel}>DURATION</Text>
            </View>
          </View>
        </View>
        <View style={styles.invoiceHeader}>
          <Text style={styles.sectionTitle}>Invoice</Text>
          <Image source={ImagePath.save} style={styles.invoiceIcon} />
        </View>
        <View style={[styles.rideDetailsContainer, { marginBottom: 40 }]}>
          <View style={styles.invoiceRow}>
            <Text style={styles.infoLabel}>Ride Charge</Text>
            <Text style={styles.infoValue}>₹ {Number(rideDetails.fare)?.toFixed(2)}</Text>
          </View>
          <View style={styles.invoiceRow}>
            <Text style={styles.infoLabel}>Penalty Amount</Text>
            <Text style={styles.infoValue}>₹ {Number(rideDetails.penaltyAmount)?.toFixed(2)}</Text>
          </View>
          <View style={styles.invoiceRow}>
            <Text style={styles.infoLabel}>Total Amount</Text>
            <Text style={styles.infoValue}>₹ {Number(rideDetails.fare + rideDetails.penaltyAmount)?.toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={styles.downloadButton}>
            <Image source={ImagePath.down} style={styles.downloadIcon} />
            <Text style={styles.downloadText}>Download Receipt</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default RidesHistoryDetailsScreen;

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
    fontFamily: THEAMFONTFAMILY.LatoBold,
    fontSize: TEXT_SIZE.body,
    lineHeight: LINE_HEIGHT.h3,
    fontWeight: '600',
    color: THEAMCOLOR.SecondaryBlack,
    textAlign: 'center',
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingTop: 20,
  },
  errorText: {
    fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    fontSize: TEXT_SIZE.small,
    color: THEAMCOLOR.SecondaryGray,
    textAlign: 'center',
    marginTop: 20,
  },
  ratingContainer: {
    paddingVertical: height * 0.015,
    paddingHorizontal: height * 0.02,
    marginVertical: height * 0.01,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'lightgray',
  },
  sectionTitle: {
    fontFamily: THEAMFONTFAMILY.LatoBold,
    fontSize: TEXT_SIZE.small,
    lineHeight: LINE_HEIGHT.h3,
    fontWeight: '500',
    color: THEAMCOLOR.SecondaryBlack,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  profileContent: {
    flexDirection: 'column',
  },
  driverName: {
    fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    fontSize: TEXT_SIZE.small,
    lineHeight: LINE_HEIGHT.small,
    fontWeight: '400',
    color: THEAMCOLOR.SecondaryBlack,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rideDetailsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    marginHorizontal: width * 0.05,
    marginBottom: height * 0.02,
    paddingTop: height * 0.01,
  },
  ridePath: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    marginBottom: height * 0.02,
    paddingHorizontal: height * 0.02,
  },
  pathRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: height * 0.01,
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
    fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    fontSize: TEXT_SIZE.small,
    lineHeight: LINE_HEIGHT.small,
    color: THEAMCOLOR.SecondaryBlack,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
    paddingHorizontal: height * 0.02,
  },
  infoLabel: {
    fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    fontSize: TEXT_SIZE.small,
    lineHeight: LINE_HEIGHT.small,
    color: THEAMCOLOR.SecondaryGray,
  },
  infoValue: {
    fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    fontSize: TEXT_SIZE.small,
    lineHeight: LINE_HEIGHT.small,
    color: THEAMCOLOR.SecondaryBlack,
    paddingVertical: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
  },
  mapPlaceholder: {
    height: 150,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: height * 0.02,
  },
  mapText: {
    fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    fontSize: TEXT_SIZE.small,
    lineHeight: LINE_HEIGHT.small,
    color: THEAMCOLOR.SecondaryGray,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 16,
    backgroundColor: '#fff',
    marginHorizontal: height * 0.02,
    marginBottom: height * 0.02,
  },
  metricContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  metricValue: {
    fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    fontSize: TEXT_SIZE.small,
    lineHeight: LINE_HEIGHT.small,
    color: THEAMCOLOR.SecondaryBlack,
  },
  metricLabel: {
    fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    fontSize: TEXT_SIZE.xSmall,
    lineHeight: LINE_HEIGHT.small,
    color: THEAMCOLOR.SecondaryGray,
  },
  divider: {
    height: '60%',
    width: 1,
    backgroundColor: 'lightgray',
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: width * 0.05,
    marginBottom: 10,
  },
  invoiceIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginVertical: 5,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    marginVertical: 10,
    backgroundColor: THEAMCOLOR.PrimaryGreen,
    paddingVertical: 12,
    borderRadius: 16,
  },
  downloadIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  downloadText: {
    fontFamily: THEAMFONTFAMILY.LatoBold,
    fontSize: TEXT_SIZE.small,
    lineHeight: LINE_HEIGHT.small,
    color: THEAMCOLOR.PureWhite,
  },
  totalAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 10,
  },
});