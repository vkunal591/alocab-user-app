import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Image } from 'react-native';
import BackButton from '../../Components/common/BackButton';
import ImagePath from '../../constants/ImagePath';
import { LINE_HEIGHT, TEXT_SIZE, THEAMCOLOR, THEAMFONTFAMILY } from '../../../assets/theam/theam';
import Icon from 'react-native-vector-icons/AntDesign';

const AboutScreen = ({ navigation }) => {
    const handleLinkPress = (url) => {
        Linking.openURL(url).catch((err) => console.error('Error opening URL:', err));
    };

    return (
        <View style={styles.container}>
            {/* Back Button */}

            <View style={styles.header}>
                <BackButton />
                <Text style={styles.title}>About</Text>
            </View>

            {/* Title */}

            {/* Logo */}
            <Image source={ImagePath.nameLogo} style={{ width: 150, height: 70, resizeMode: 'contain' }} />

            <View style={styles.linehr} />
            {/* Website */}
            <TouchableOpacity onPress={() => handleLinkPress('https://www.alocab.co.in')}>
                <Text style={styles.website}>WWW.ALOCAB.CO.IN</Text>
            </TouchableOpacity>

            {/* Version */}
            <Text style={styles.version}>Version 3.2.25</Text>

            {/* Links */}
            <TouchableOpacity style={styles.linkContainer} onPress={() => navigation.navigate('PrivacyPolicyScreen')}>
                <Text style={styles.linkText}>Privacy Policy</Text>
                <Text style={styles.arrow}><Icon name="right" size={14} color="gray" /></Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkContainer} onPress={() => navigation.navigate('TermsConditionsScreen')}>
                <Text style={styles.linkText}>Terms & Conditions</Text>
                <Text style={styles.arrow}><Icon name="right" size={14} color="gray" /></Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffff',
        alignItems: 'center',
    },

    header: {
        backgroundColor: '#fff',
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginBottom: 40,
        width: '100%',
    },
    backButtonText: {
        fontSize: 24,
        color: '#000',
    },
    title: {
        fontFamily: THEAMFONTFAMILY.LatoBold,
        fontSize: TEXT_SIZE.h3,
        lineHeight: LINE_HEIGHT.h3,
        fontWeight: '600',
        color: THEAMCOLOR.SecondaryBlack || '#333',
        textAlign: 'center',
    },
    logo: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#00C853',
        marginBottom: 20,
    },
    linehr: {
        marginTop: 30,
        width: 40,
        height: 1,
        backgroundColor: THEAMCOLOR.PrimaryGreen,
    },
    website: {
        fontSize: 10,
        color: THEAMCOLOR.PrimaryGreen,
        textDecorationLine: 'underline',
        marginBottom: 10,
        marginTop: 10
    },
    version: {
        fontSize: 12,
        color: '#666',
        marginBottom: 40,
    },
    linkContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        width: '90%',
        paddingHorizontal: 15,
        paddingVertical: 13,
        borderColor: 'lightgray',
        borderWidth: 1,
        borderRadius: 14,
        marginBottom: 10,
        elevation: 1,
    },
    linkText: {
        fontSize: 13,
        color: THEAMCOLOR.SecondaryBlack || '#000',
    },
    arrow: {
        fontSize: 16,
        color: '#000',
    },
});

export default AboutScreen;