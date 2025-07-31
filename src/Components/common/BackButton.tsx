import React from 'react';
import { TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { THEAMCOLOR } from '../../../assets/theam/theam';
import ImagePath from '../../constants/ImagePath';

const BackButton = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
      <Image source={ImagePath?.backArrow} style={styles.backArrow} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderColor: THEAMCOLOR?.SecondaryGray,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  backArrow: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: THEAMCOLOR?.SecondaryBlack,
  },
});

export default BackButton;
