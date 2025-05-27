import { Dimensions, Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { THEAMCOLOR } from '../../assets/theam/theam';
import BackButton from '../../Components/common/BackButton';
import ImagePath from '../../constants/ImagePath';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('screen');

const SupportScreen = () => {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const toggleDropdown = (section: string) => {
        setOpenDropdown(openDropdown === section ? null : section);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <BackButton />
                <Text style={styles.headerTitle}>Customer Support</Text>
            </View>

            <View style={styles.imageContainer}>
                <Image
                    source={ImagePath.support}
                    style={styles.supportImage}
                />
                <Text style={styles.greetingText}>Hello, How can we Help you?</Text>
            </View>

            <View style={styles.dropdownContainer}>
                {/* Contact Live Chat */}
                <TouchableOpacity
                    style={styles.dropdownHeader}
                    onPress={() => toggleDropdown('liveChat')}
                >
                    <View style={styles.headerContent}>
                        <Ionicons
                            name="chatbubble-ellipses-outline"
                            size={20}
                            color={THEAMCOLOR.PrimaryGreen}
                            style={styles.headerIcon}
                        />
                        <Text style={styles.dropdownTitle}>Contact Live Chat</Text>
                    </View>
                    <Ionicons
                        name={openDropdown === 'liveChat' ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={THEAMCOLOR.PrimaryGreen}
                    />
                </TouchableOpacity>
                {openDropdown === 'liveChat' && (
                    <View style={styles.dropdownContent}>
                        <Text style={styles.dropdownText}>
                            Connect with our support team in real-time. Our live chat is available
                            24/7 to assist with any issues or questions you may have.
                        </Text>
                        <TouchableOpacity style={styles.actionButton}>
                            <Text style={styles.actionButtonText}>Start Chat</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Send us an Email */}
                <TouchableOpacity
                    style={styles.dropdownHeader}
                    onPress={() => toggleDropdown('email')}
                >
                    <View style={styles.headerContent}>
                        <Ionicons
                            name="mail-outline"
                            size={20}
                            color={THEAMCOLOR.PrimaryGreen}
                            style={styles.headerIcon}
                        />
                        <Text style={styles.dropdownTitle}>Send us an Email</Text>
                    </View>
                    <Ionicons
                        name={openDropdown === 'email' ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={THEAMCOLOR.PrimaryGreen}
                    />
                </TouchableOpacity>
                {openDropdown === 'email' && (
                    <View style={styles.dropdownContent}>
                        <Text style={styles.dropdownText}>
                            Reach out to us via email at support@example.com. We'll respond to your
                            inquiry within 24 hours.
                        </Text>
                        <TouchableOpacity style={styles.actionButton}>
                            <Text style={styles.actionButtonText}>Compose Email</Text>
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
                            Browse our Frequently Asked Questions to find answers to common queries
                            about our services, booking process, and more.
                        </Text>
                        <TouchableOpacity style={styles.actionButton}>
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
    container: {
        flex: 1,
        backgroundColor: THEAMCOLOR.SecondarySmokeWhite,
    },
    header: {
        backgroundColor: '#fff',
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    headerTitle: {
        textAlign: 'center',
        fontWeight: '500',
        fontSize: 17,
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
        fontWeight: '600',
        fontSize: 16,
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
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIcon: {
        marginRight: 10,
    },
    dropdownTitle: {
        fontSize: 12,
        fontWeight: '400',
        color:'gray',
    },
    dropdownContent: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    dropdownText: {
        fontSize: 14,
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
        fontSize: 14,
        fontWeight: '600',
    },
});