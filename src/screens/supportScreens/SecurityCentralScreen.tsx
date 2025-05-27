import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import BackButton from '../../Components/common/BackButton';
import { LINE_HEIGHT, TEXT_SIZE, THEAMFONTFAMILY, THEAMCOLOR } from '../../assets/theam/theam';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const SecurityCentralScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <BackButton />
                <Text style={styles.title}>Security Central</Text>
            </View>

            <View style={styles.contentContainer}>
                {/* Call for Help Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardTitleContainer}>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: THEAMCOLOR.SecondaryGray || '#4CAF50', borderRadius: 50, height: 35, width: 35, padding: 5, marginRight:10 }}>
                                <Icon name="call-outline" size={20} color="#FF0000" style={styles.icon} />
                            </View>                            <Text style={styles.cardTitle}>Call for Help</Text>
                        </View>
                    </View>
                    <Text style={styles.cardDescription}>
                        Contrary to popular belief, Lorem Ipsum is not simply random text.
                    </Text>
                </View>

                {/* Share Route Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardTitleContainer}>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: THEAMCOLOR.SecondaryGray || '#4CAF50', borderRadius: 50, height: 35, width: 35, padding: 5, marginRight:10 }}>
                                <Icon name="send-outline" size={20} color={THEAMCOLOR.PrimaryGreen || '#4CAF50'} style={styles.icon} />
                            </View>
                            <Text style={styles.cardTitle}>Share Route</Text>
                        </View>
                    </View>
                    <Text style={styles.cardDescription}>
                        There are many variations of passages of Lorem Ipsum available, but.
                    </Text>
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
        padding: 16,
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
    },
    cardTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 0,
    },
    cardTitle: {
        fontFamily: THEAMFONTFAMILY.LatoBold,
        fontSize: TEXT_SIZE.body,
        fontWeight: '600',
        color: THEAMCOLOR.SecondaryBlack || '#333',
    },
    cardDescription: {
        fontFamily: THEAMFONTFAMILY.NunitoRegular,
        fontSize: TEXT_SIZE.small,
        lineHeight: LINE_HEIGHT.small,
        color: THEAMCOLOR.SecondaryGray || '#666',
    },
});

export default SecurityCentralScreen;