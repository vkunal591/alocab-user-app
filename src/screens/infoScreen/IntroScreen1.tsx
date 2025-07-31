import React, { useContext, useEffect, useRef } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  ImageSourcePropType,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ImagePath from '../../constants/ImagePath';
import {
  THEAMCOLOR,
  THEAMFONTFAMILY,
  TEXT_SIZE,
  LINE_HEIGHT,
  SPACING,
  RADIUS,
  SHADOW,
} from '../../../assets/theam/theam';
import { RootStackParamList } from '../../navigator/StackNavigator';

const { width, height } = Dimensions.get('window');

const IntroScreen1: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();


  // Animation refs
  const line1Scale = useRef(new Animated.Value(0)).current;
  const line2Scale = useRef(new Animated.Value(0)).current;
  const line3Scale = useRef(new Animated.Value(0)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const imageScale = useRef(new Animated.Value(0.8)).current;
  const bottomOpacity = useRef(new Animated.Value(0)).current;
  const bottomTranslateY = useRef(new Animated.Value(SPACING.xxl)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(line1Scale, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(line2Scale, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(line3Scale, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(imageOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(imageScale, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(bottomOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(bottomTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [line1Scale, line2Scale, line3Scale, imageOpacity, imageScale, bottomOpacity, bottomTranslateY]);

  const handleSkip = async () => {
    navigation.navigate('RegisterScreen'); // Navigate to RegisterScreen or any other screen
    // Navigation is handled by StackNavigator based on AuthContext state
  };

  const handleContinue = async () => {
    navigation.navigate('IntroScreen2');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Section */}
      <View style={styles.topSection}>
        <View style={styles.flowBorderContainer}>
          <Animated.View
            style={[
              styles.line1,
              {
                transform: [{ scaleX: line1Scale }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.line2,
              {
                transform: [{ scaleX: line2Scale }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.line3,
              {
                transform: [{ scaleX: line3Scale }],
              },
            ]}
          />
        </View>

        <TouchableOpacity style={styles.skipContainer} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip </Text>
          <MaterialIcons
            style={styles.rightIcon}
            name="arrow-forward-ios"
            size={width * 0.03}
            color={THEAMCOLOR.SecondaryBlack}
          />
        </TouchableOpacity>
      </View>

      {/* Middle Section */}
      <View style={styles.middleSection}>
        <Animated.Image
          source={ImagePath.introScreen1 as ImageSourcePropType}
          style={[
            styles.introImage,
            {
              opacity: imageOpacity,
              transform: [{ scale: imageScale }],
            },
          ]}
          resizeMode="contain"
        />
      </View>

      {/* Bottom Section */}
      <Animated.View
        style={[
          styles.bottomSection,
          {
            opacity: bottomOpacity,
            transform: [{ translateY: bottomTranslateY }],
          },
        ]}
      >
        <Text style={styles.title}>
          It is a long established fact that a reader will be distracted.
        </Text>
        <Text style={styles.description}>
          Lorem Ipsum is simply dummy text of the printing and typesetting industry.
        </Text>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: THEAMCOLOR.PureWhite,
    fontFamily: THEAMFONTFAMILY.PoppinsRegular,
  },
  topSection: {
    flex: 0.1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  flowBorderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
  },
  line1: {
    width: width * 0.15,
    height: height * 0.006,
    backgroundColor: THEAMCOLOR.PrimaryGreen,
    borderRadius: RADIUS.sm,
    marginRight: SPACING.md,
  },
  line2: {
    width: width * 0.05,
    height: height * 0.005,
    backgroundColor: THEAMCOLOR.LightGray,
    borderRadius: RADIUS.sm,
    marginRight: SPACING.md,
  },
  line3: {
    width: width * 0.05,
    height: height * 0.005,
    backgroundColor: THEAMCOLOR.LightGray,
    borderRadius: RADIUS.sm,
    marginRight: SPACING.md,
  },
  skipContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipText: {
    color: THEAMCOLOR.SecondaryBlack,
    fontSize: TEXT_SIZE.small,
    lineHeight: LINE_HEIGHT.small,
    fontFamily: THEAMFONTFAMILY.NunitoRegular,
  },
  rightIcon: {
    marginLeft: -SPACING.xs,
  },
  middleSection: {
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  introImage: {
    width: '100%',
    height: '100%',
    maxWidth: width * 0.9,
    maxHeight: height * 0.45,
  },
  bottomSection: {
    flex: 0.4,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    justifyContent: 'center',
  },
  title: {
    fontSize: TEXT_SIZE.bodyLarge,
    lineHeight: LINE_HEIGHT.bodyLarge,
    fontFamily: THEAMFONTFAMILY.LatoRegular,
    textAlign: 'left',
    marginBottom: SPACING.xs,
    color: THEAMCOLOR.SecondaryBlack,
  },
  description: {
    fontSize: TEXT_SIZE.small,
    lineHeight: LINE_HEIGHT.small,
    fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    textAlign: 'left',
    marginBottom: SPACING.xxxl,
    color: THEAMCOLOR.SecondaryGray,
  },
  continueButton: {
    backgroundColor: THEAMCOLOR.PrimaryGreen,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.xs,
    fontFamily: THEAMFONTFAMILY.LatoBold,
    ...SHADOW.medium,
  },
  primaryButtonText: {
    color: THEAMCOLOR.PureWhite,
    textAlign: 'center',
    fontSize: TEXT_SIZE.bodyLarge,
    lineHeight: LINE_HEIGHT.bodyLarge,
    fontFamily: THEAMFONTFAMILY.LatoBold,
  },
});

export default IntroScreen1;
