import React, { useEffect, useState, useCallback } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
  Alert,
  ToastAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  LINE_HEIGHT,
  TEXT_SIZE,
  THEAMCOLOR,
  THEAMFONTFAMILY,
} from '../../../assets/theam/theam';
import BackButton from '../../Components/common/BackButton';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import apiUtils from '../../utils/apiUtils';
import ImagePath from '../../constants/ImagePath';

const { width, height } = Dimensions.get('screen');

type RideDetails = {
  _id?: string;
  driver?: {
    name?: string;
  };
};

type AfterRideRouteProp = RouteProp<{ AfterRide: { ride?: RideDetails } }, 'AfterRide'>;

const AfterRideScreen: React.FC = () => {
  const route = useRoute<AfterRideRouteProp>();
  const navigation = useNavigation<any>();

  const ride = route.params?.ride ?? null;

  const [fareDetails, setRideDetails] = useState<RideDetails | null>(ride);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feedbackTags = [
    'Late Arrival',
    'Rude Behavior',
    'Clean Vehicle',
    'Safe Driving',
    'No Show',
    'Inappropriate Conduct',
  ];

  // Safe fetch ride details
  const fetchRideDetails = useCallback(async () => {
    try {
      const response: any = await apiUtils.get('/api/ride/active/ride');
      if (response?.success && response?.ride) {
        setRideDetails(response.ride);
      } else {
        const msg = response?.message ?? 'Failed to fetch ride details';
        ToastAndroid.show(msg, ToastAndroid.SHORT);
      }
    } catch (err: any) {
      ToastAndroid.show(err.message ?? 'Error fetching ride details', ToastAndroid.LONG);
    }
  }, []);

  useEffect(() => {
    fetchRideDetails();
  }, [fetchRideDetails]);

  const validateInput = (): boolean => {
    if (rating <= 0) {
      Alert.alert('Validation', 'Please select a star rating.');
      return false;
    }
    if (!feedback.trim()) {
      Alert.alert('Validation', 'Please provide your feedback.');
      return false;
    }
    if (feedback.length > 500) {
      Alert.alert('Validation', 'Feedback cannot exceed 500 characters.');
      return false;
    }
    return true;
  };

  const handleStarPress = (index: number) => {
    if (isSubmitting) return;
    setRating(index + 1);
  };

  const handleTagPress = (tag: string) => {
    if (isSubmitting) return;
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleFeedbackSubmit = async () => {
    if (!validateInput()) return;

    setIsSubmitting(true);

    const rideId = fareDetails?._id;
    if (!rideId) {
      ToastAndroid.show('Ride ID is missing.', ToastAndroid.SHORT);
      setIsSubmitting(false);
      return;
    }

    const requestPayload = {
      rideId,
      rating,
      review: feedback.trim(),
      tags: selectedTags,
    };

    try {
      const response: any = await apiUtils.post('/api/review/', requestPayload);
      if (response?.success) {
        ToastAndroid.show('Feedback submitted successfully!', ToastAndroid.SHORT);
        navigation.navigate('HomeScreen');
      } else {
        const msg = response?.message ?? 'Failed to submit feedback';
        throw new Error(msg);
      }
    } catch (err: any) {
      ToastAndroid.show(err.message ?? 'Something went wrong', ToastAndroid.SHORT);
      console.error('Feedback submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 28.6139,
            longitude: 77.2090,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker coordinate={{ latitude: 28.6139, longitude: 77.2090 }} title="Your Location" />
        </MapView>

        <View style={styles.card}>
          <View style={styles.profileRow}>
            <Text style={styles.name}>
              Rate Driver: {fareDetails?.driver?.name ?? 'Unknown'}
            </Text>
            <Image source={ImagePath.Profile} style={styles.avatar} />

            <View style={styles.starContainer}>
              {Array.from({ length: 5 }).map((_, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleStarPress(idx)}
                  disabled={isSubmitting}
                >
                  <Icon
                    name={idx < rating ? 'star' : 'star-border'}
                    size={28}
                    color="#FFB700"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.feedbackInput}
              placeholder="Write your feedback here (max 500 chars)..."
              value={feedback}
              onChangeText={text => {
                setFeedback(text);
              }}
              multiline
              maxLength={500}
              editable={!isSubmitting}
            />
            <Text style={styles.charCount}>{feedback.length}/500</Text>
          </View>

          <View style={styles.withdrawSection}>
            <Text style={styles.name2}>Feedback Tags</Text>
            <View style={styles.amountButtons}>
              {feedbackTags.map(tag => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.amountButton,
                    selectedTags.includes(tag) && styles.selectedTag,
                  ]}
                  onPress={() => handleTagPress(tag)}
                  disabled={isSubmitting}
                >
                  <Text
                    style={[
                      styles.amountButtonText,
                      selectedTags.includes(tag) && styles.selectedTagText,
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.confirmButton,
              isSubmitting && styles.disabledButton,
            ]}
            onPress={handleFeedbackSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelButtonText}>
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AfterRideScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEAMCOLOR?.SecondarySmokeWhite ?? '#f5f5f5',
  },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  map: { width, height: height * 0.4 },
  card: {
    marginTop: -10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: '#fafafa',
    backgroundColor: THEAMCOLOR?.SecondarySmokeWhite ?? '#fff',
    paddingBottom: 20,
  },
  profileRow: { alignItems: 'center', padding: 15 },
  name: {
    fontWeight: '400',
    textAlign: 'center',
    width: '100%',
    marginBottom: 5,
    fontSize: TEXT_SIZE?.bodyLarge ?? 18,
    lineHeight: LINE_HEIGHT?.bodyLarge ?? 24,
    fontFamily: THEAMFONTFAMILY?.LatoRegular ?? 'System',
  },
  avatar: { width: 85, height: 85, borderRadius: 45, marginVertical: 10 },
  starContainer: {
    flexDirection: 'row',
    marginTop: 5,
    marginBottom: 15,
  },
  feedbackInput: {
    width: '97%',
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 10,
    padding: 10,
    textAlignVertical: 'top',
    marginBottom: 10,
    height: 120,
    fontSize: TEXT_SIZE?.small ?? 14,
    lineHeight: LINE_HEIGHT?.small ?? 18,
    fontFamily: THEAMFONTFAMILY?.NunitoSemiBold ?? 'System',
  },
  charCount: {
    alignSelf: 'flex-end',
    fontSize: TEXT_SIZE?.xSmall ?? 12,
    color: 'gray',
    marginBottom: 10,
  },
  name2: {
    fontWeight: '400',
    marginBottom: 5,
    fontSize: TEXT_SIZE?.bodyLarge ?? 18,
    lineHeight: LINE_HEIGHT?.bodyLarge ?? 24,
    fontFamily: THEAMFONTFAMILY?.LatoRegular ?? 'System',
  },
  withdrawSection: {
    marginHorizontal: 15,
    marginBottom: height * 0.02,
  },
  amountButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: height * 0.01,
  },
  amountButton: {
    borderWidth: 1,
    borderColor: 'gray',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  selectedTag: {
    backgroundColor: THEAMCOLOR?.PrimaryGreen ?? '#4caf50',
    borderColor: THEAMCOLOR?.PrimaryGreen ?? '#4caf50',
  },
  amountButtonText: {
    fontWeight: '500',
    color: THEAMCOLOR?.PrimaryGreen ?? '#4caf50',
    fontSize: TEXT_SIZE?.xSmall ?? 12,
    lineHeight: LINE_HEIGHT?.xSmall ?? 16,
    fontFamily: THEAMFONTFAMILY?.NunitoSemiBold ?? 'System',
  },
  selectedTagText: {
    color: THEAMCOLOR?.PureWhite ?? '#fff',
  },
  confirmButton: {
    backgroundColor: THEAMCOLOR?.PrimaryGreen ?? '#4caf50',
    paddingVertical: 12,
    borderRadius: 15,
    marginHorizontal: 15,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: 'gray',
    opacity: 0.7,
  },
  cancelButtonText: {
    fontSize: TEXT_SIZE?.body ?? 16,
    lineHeight: LINE_HEIGHT?.small ?? 18,
    fontFamily: THEAMFONTFAMILY?.LatoBold ?? 'System',
    color: THEAMCOLOR?.PureWhite ?? '#fff',
    fontWeight: 'bold',
  },
});
