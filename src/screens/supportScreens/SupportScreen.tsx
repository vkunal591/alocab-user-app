import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import BackButton from '../../Components/common/BackButton';
import ImagePath from '../../constants/ImagePath';
import {
  THEAMCOLOR,
  THEAMFONTFAMILY,
  TEXT_SIZE,
  LINE_HEIGHT,
} from '../../../assets/theam/theam';

const { width, height } = Dimensions.get('screen');

const SupportScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (section: string) =>
    setOpenDropdown(openDropdown === section ? null : section);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Customer Support</Text>
      </View>

      <View style={styles.imageContainer}>
        <Image source={ImagePath.support} style={styles.supportImage} />
        <Text style={styles.greetingText}>Hello, how can we help you?</Text>
      </View>

      <View style={styles.dropdownContainer}>
        {/* Raise a Ticket */}
        <TouchableOpacity
          style={styles.dropdownHeader}
          onPress={() => toggleDropdown('ticket')}
        >
          <View style={styles.headerContent}>
            <Ionicons
              name="clipboard-outline"
              size={20}
              color={THEAMCOLOR.PrimaryGreen}
              style={styles.headerIcon}
            />
            <Text style={styles.dropdownTitle}>Raise a Ticket</Text>
          </View>
          <Ionicons
            name={openDropdown === 'ticket' ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={THEAMCOLOR.PrimaryGreen}
          />
        </TouchableOpacity>
        {openDropdown === 'ticket' && (
          <View style={styles.dropdownContent}>
            <Text style={styles.dropdownText}>
              Submit a support ticket and our team will assist you shortly.
            </Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('SupportTicketsScreen')}
            >
              <Text style={styles.actionButtonText}>Create Ticket</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* FAQs */}
        <TouchableOpacity
          style={styles.dropdownHeader}
          onPress={() => toggleDropdown('faqs')}
        >
          <View style={styles.headerContent}>
            <Ionicons
              name="help-circle-outline"
              size={20}
              color={THEAMCOLOR.PrimaryGreen}
              style={styles.headerIcon}
            />
            <Text style={styles.dropdownTitle}>FAQs</Text>
          </View>
          <Ionicons
            name={openDropdown === 'faqs' ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={THEAMCOLOR.PrimaryGreen}
          />
        </TouchableOpacity>
        {openDropdown === 'faqs' && (
          <View style={styles.dropdownContent}>
            <Text style={styles.dropdownText}>
              Browse our Frequently Asked Questions to find answers about our services.
            </Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('FaqScreen')}
            >
              <Text style={styles.actionButtonText}>View FAQs</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default SupportScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEAMCOLOR.SecondarySmokeWhite },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    justifyContent: 'center',
    position: 'relative',
  },
  headerTitle: {
    textAlign: 'center',
    fontFamily: THEAMFONTFAMILY.LatoBold,
    fontSize: TEXT_SIZE.h3,
    lineHeight: LINE_HEIGHT.h3,
    color: THEAMCOLOR.SecondaryBlack,
  },
  imageContainer: {
    height: height * 0.25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportImage: {
    width: width * 0.35,
    height: height * 0.2,
    marginTop: 30,
    resizeMode: 'contain',
  },
  greetingText: {
    textAlign: 'center',
    fontFamily: THEAMFONTFAMILY.LatoBold,
    fontSize: TEXT_SIZE.bodyLarge,
    lineHeight: LINE_HEIGHT.bodyLarge,
    color: THEAMCOLOR.SecondaryBlack,
    marginTop: 10,
  },
  dropdownContainer: {
    paddingHorizontal: 20,
    marginTop: 70,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  headerIcon: { marginRight: 10 },
  dropdownTitle: {
    fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    fontSize: TEXT_SIZE.small,
    color: THEAMCOLOR.SecondaryBlack,
  },
  dropdownContent: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  dropdownText: {
    fontFamily: THEAMFONTFAMILY.NunitoRegular,
    fontSize: TEXT_SIZE.small,
    color: THEAMCOLOR.SecondaryBlack,
    marginBottom: 10,
  },
  actionButton: {
    backgroundColor: THEAMCOLOR.PrimaryGreen,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: TEXT_SIZE.body,
    fontFamily: THEAMFONTFAMILY.LatoBold,
  },
});
