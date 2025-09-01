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
import React, { useEffect, useState } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import apiUtils from '../../utils/apiUtils';
import { RideDetails } from './BookRideScreen';
import ImagePath from '../../constants/ImagePath';

const { width, height } = Dimensions.get('screen');

const AfterRideScreen = () => {
  const route = useRoute();
  const ride: any = route.params?.ride;
  const navigation = useNavigation<any>();

  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<any>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<any>(null);
  const [rideDetails, setRideDetails] = useState<RideDetails | null>(ride ?? null);
  const [request] = useState({
    name: 'Nikhil',
    userImage: 'https://i.pravatar.cc/150?img=8',
  });

  const fetchRideDetails = async () => {
    try {
      const response: any = await apiUtils.get('/api/ride/active/ride');
      if (response?.success) {
        setRideDetails(response.ride);
        console.log('Ride details fetched:', response.ride);
        return response?.ride?.status;
      } else {
        ToastAndroid.show(
          response?.message || 'Failed to fetch ride details',
          ToastAndroid.SHORT,
        );
        return null;
      }
    } catch (error: any) {
      ToastAndroid.show(
        error.message || 'Error fetching ride details',
        ToastAndroid.LONG,
      );
      return null;
    }
  };

  useEffect(() => {
    const getRideDetails = async () => {
      await fetchRideDetails();
    };
    getRideDetails();
  }, []);

  const feedbackTags = [
    'Late Arrival',
    'Rude Behavior',
    'Clean Vehicle',
    'Safe Driving',
    'No Show',
    'Inappropriate Conduct',
  ];

  const validateInput = () => {
    if (rating === 0) {
      setError('Please select a star rating');
      return false;
    }
    if (feedback.trim().length === 0) {
      setError('Please provide feedback');
      return false;
    }
    if (feedback.length > 500) {
      setError('Feedback cannot exceed 500 characters');
      return false;
    }
    return true;
  };

  const handleTagPress = (tag: any) => {
    setSelectedTags((prev: any) =>
      prev.includes(tag) ? prev.filter((t: any) => t !== tag) : [...prev, tag],
    );
  };

  const handleFeedbackSubmit = async () => {
    if (!validateInput()) {
      ToastAndroid.show(error, ToastAndroid.SHORT);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const requestData = {
        rideId: ride?._id,
        rating,
        review: feedback.trim(),
        tags: selectedTags,
      };
      const response: any = await apiUtils.post('/api/review/', requestData);
      if (response.success) {
        ToastAndroid.show(
          'Feedback submitted successfully',
          ToastAndroid.SHORT,
        );
        navigation.navigate('HomeScreen');
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      ToastAndroid.show(err?.message, ToastAndroid.SHORT);
      console.log('Error:', err);
      ToastAndroid.show(err, ToastAndroid.SHORT);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarPress = (starIndex: any) => {
    setRating(starIndex + 1);
    setError(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 28.6139,
            longitude: 77.209,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          scrollEnabled
          zoomEnabled
          pitchEnabled
          rotateEnabled>
          <Marker
            coordinate={{ latitude: 28.6139, longitude: 77.209 }}
            title="Your Location"
          />
        </MapView>
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <Text style={styles.name}>
              Rate Driver: {rideDetails?.driver?.name}
            </Text>
            <Image source={ImagePath.Profile} style={styles.avatar} />
            <View style={styles.starContainer}>
              {[...Array(5)].map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleStarPress(index)}
                  disabled={isSubmitting}>
                  <Icon
                    name={index < rating ? 'star' : 'star-border'}
                    size={28}
                    color="#FFB700"
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[styles.feedbackInput, error && styles.inputError]}
              placeholder="Write your feedback here (max 500 characters)..."
              value={feedback}
              onChangeText={text => {
                setFeedback(text);
                setError(null);
              }}
              multiline
              numberOfLines={8}
              maxLength={500}
              editable={!isSubmitting}
            />
            <Text style={styles.charCount}>
              {feedback.length}/500 characters
            </Text>
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
                  disabled={isSubmitting}>
                  <Text
                    style={[
                      styles.amountButtonText,
                      selectedTags.includes(tag) && styles.selectedTagText,
                    ]}>
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
            disabled={isSubmitting}>
            <Text style={styles.cancelButtonText}>
              {isSubmitting ? 'Submitting...' : 'Done'}
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
    backgroundColor: THEAMCOLOR?.SecondarySmokeWhite,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  map: {
    width,
    height: height * 0.4,
  },
  card: {
    marginTop: -10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: '#fafafa',
    backgroundColor: THEAMCOLOR.SecondarySmokeWhite,
    paddingBottom: 20,
  },
  profileRow: {
    alignItems: 'center',
    padding: 15,
  },
  avatar: {
    width: 85,
    height: 85,
    borderRadius: 45,
    marginVertical: 10,
  },
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
    height: 6 * 20,
    fontSize: TEXT_SIZE.small,
    lineHeight: LINE_HEIGHT.small,
    fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
  },
  inputError: {
    borderColor: 'red',
  },
  charCount: {
    alignSelf: 'flex-end',
    fontSize: TEXT_SIZE.xSmall,
    color: 'gray',
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
    fontSize: TEXT_SIZE.small,
  },
  name: {
    fontWeight: '400',
    textAlign: 'center',
    width,
    marginBottom: 5,
    fontSize: TEXT_SIZE.bodyLarge,
    lineHeight: LINE_HEIGHT.bodyLarge,
    fontFamily: THEAMFONTFAMILY.LatoRegular,
  },
  name2: {
    fontWeight: '400',
    marginBottom: 5,
    fontSize: TEXT_SIZE.bodyLarge,
    lineHeight: LINE_HEIGHT.bodyLarge,
    fontFamily: THEAMFONTFAMILY.LatoRegular,
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
    backgroundColor: THEAMCOLOR.PrimaryGreen,
    borderColor: THEAMCOLOR.PrimaryGreen,
  },
  selectedTagText: {
    color: THEAMCOLOR.PureWhite,
  },
  amountButtonText: {
    fontWeight: '500',
    color: THEAMCOLOR.PrimaryGreen,
    fontSize: TEXT_SIZE.xSmall,
    lineHeight: LINE_HEIGHT.xSmall,
    fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
  },
  confirmButton: {
    backgroundColor: THEAMCOLOR?.PrimaryGreen,
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
    fontSize: TEXT_SIZE.body,
    lineHeight: LINE_HEIGHT.small,
    fontFamily: THEAMFONTFAMILY.LatoBold,
    color: THEAMCOLOR?.PureWhite,
    fontWeight: 'bold',
  },
});
