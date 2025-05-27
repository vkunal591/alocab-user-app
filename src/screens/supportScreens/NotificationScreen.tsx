import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import BackButton from '../../Components/common/BackButton';
import ImagePath from '../../constants/ImagePath';
import { LINE_HEIGHT, TEXT_SIZE, THEAMFONTFAMILY, THEAMCOLOR } from '../../assets/theam/theam';

const { width } = Dimensions.get('window');

const NotificationScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.title}>Notifications</Text>
      </View>
      
      <View style={styles.contentContainer}>
        <Image
          source={ImagePath.notifi}
          style={styles.notificationImage}
        />
        <Text style={styles.noNotificationText}>No Notification Yet</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEAMCOLOR.SecondarySmokeWhite || '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    width: '100%',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: 'lightgray',
    position: 'absolute',
    top: 0,
  },
  title: {
    fontFamily: THEAMFONTFAMILY.LatoBold,
    fontSize: TEXT_SIZE.h3,
    lineHeight: LINE_HEIGHT.h3,
    fontWeight: '600',
    color: THEAMCOLOR.SecondaryBlack || '#333',
    textAlign: 'center',
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  notificationImage: {
    width: width * 0.6,
    height: width * 0.6 * 1.8, // Maintain aspect ratio
    resizeMode: 'contain',
    marginBottom: 20,
  },
  noNotificationText: {
    position: 'absolute',
    top: '75%',
    left: '60%',
    transform: [{ translateX: -width * 0.3 }, { translateY: -width * 0.3 }],
    fontFamily: THEAMFONTFAMILY.LatoBold,
    fontSize: TEXT_SIZE.body,
    fontWeight: '600',
    color: THEAMCOLOR.SecondaryBlack || '#333',
    textAlign: 'center',
  },
});

export default NotificationScreen;