import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image } from 'react-native';
import BackButton from '../../Components/common/BackButton';
import ImagePath from '../../constants/ImagePath';
import { LINE_HEIGHT, TEXT_SIZE, THEAMFONTFAMILY, THEAMCOLOR } from '../../../assets/theam/theam';
import Icon from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');

const SaveDestinationScreen = ({ navigation }) => {
  const handleRideAgain = (destination) => {
    // Implement ride again logic here
    console.log(`Ride again to ${destination}`);
  };

  const handleEdit = (destination) => {
    // Implement edit logic here
    console.log(`Edit ${destination}`);
  };

  const handleDelete = (destination) => {
    // Implement delete logic here
    console.log(`Delete ${destination}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.title}>Save Destination</Text>
      </View>

      <View style={styles.contentContainer}>
        {/* Work Destination Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Image source={ImagePath.addwork} style={styles.icon} />
              <Text style={styles.cardTitle}>Work</Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => handleEdit('Work')}>
                <FeatherIcon name="edit" size={18} color={THEAMCOLOR.PrimaryGreen || '#666'} style={styles.actionIcon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete('Work')}>
                <Icon name="trash-o" size={20} color="#FF0000" style={styles.actionIcon} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.cardAddress}>
            Metro Station Moti Nagar, Block 1, Mini Market, Moti Nagar, Delhi, India
          </Text>
          <TouchableOpacity style={styles.rideAgainButton} onPress={() => handleRideAgain('Work')}>
            <Icon name="refresh" size={16} color={THEAMCOLOR.PrimaryGreen || '#4CAF50'} style={styles.rideAgainIcon} />
            <Text style={styles.rideAgainText}>Ride Again</Text>
          </TouchableOpacity>
        </View>

        {/* Home Destination Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Image source={ImagePath.addhome} style={styles.icon} />
              <Text style={styles.cardTitle}>Home</Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => handleEdit('Home')}>
                <FeatherIcon name="edit" size={18} color={THEAMCOLOR.PrimaryGreen || '#666'} style={styles.actionIcon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete('Home')}>
                <Icon name="trash-o" size={20} color="#FF0000" style={styles.actionIcon} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.cardAddress}>
            Metro Station Moti Nagar, Block 1, Mini Market, Moti Nagar, Delhi, India
          </Text>
          <TouchableOpacity style={styles.rideAgainButton} onPress={() => handleRideAgain('Home')}>
            <Icon name="refresh" size={16} color={THEAMCOLOR.PrimaryGreen || '#4CAF50'} style={styles.rideAgainIcon} />
            <Text style={styles.rideAgainText}>Ride Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEAMCOLOR.SecondarySmokeWhite || '#FAFAFA',
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
    justifyContent: 'flex-start',
    width: '100%',
    paddingTop: 100, // Space for header
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    padding: 16 ,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: THEAMCOLOR.SecondaryGray || '#666',
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',

  },
  icon: {
    marginRight: 8,
    width: 20,
    height: 20,
    resizeMode: 'contain'
  },
  cardTitle: {
    fontFamily: THEAMFONTFAMILY.LatoBold,
    fontSize: TEXT_SIZE.body,
    fontWeight: '600',
    color: THEAMCOLOR.SecondaryBlack || '#333',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    marginLeft: 12,
  },
  cardAddress: {
    paddingHorizontal: 16,
    fontFamily: THEAMFONTFAMILY.NunitoRegular,
    fontSize: TEXT_SIZE.small,
    lineHeight: LINE_HEIGHT.small,
    color: THEAMCOLOR.SecondaryGray || '#666',
    marginBottom: 12,
  },
  rideAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 16,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: THEAMCOLOR.PrimaryGreen || '#4CAF50',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  rideAgainIcon: {
    marginRight: 6,
  },
  rideAgainText: {
    fontFamily: THEAMFONTFAMILY.LatoBold,
    fontSize: TEXT_SIZE.small,
    color: THEAMCOLOR.PrimaryGreen || '#4CAF50',
  },
});

export default SaveDestinationScreen;