import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    ScrollView,
    Image,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { THEAMCOLOR, THEAMFONTFAMILY, TEXT_SIZE, LINE_HEIGHT } from '../../../assets/theam/theam';
import ImagePath from '../../constants/ImagePath';

const { width } = Dimensions.get('window');

type RootStackParamList = {
    PaymentScreen: undefined;
    TransactionHistoryScreen: undefined;
};

const PaymentScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [amount, setAmount] = useState('0');
    const [cardNumber, setCardNumber] = useState('');

    const presetAmounts = [100, 200, 500];

    const handleAddMoney = () => {
        console.log(`Adding ₹${amount} to ALO Wallet`);
        // Placeholder for actual payment logic
    };

    const handleAddCard = () => {
        console.log(`Adding card with number: ${cardNumber}`);
        // Placeholder for actual card addition logic
    };

    const handlePresetAmount = (value: number) => {
        setAmount(value.toString());
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color={THEAMCOLOR.SecondaryBlack || '#000'} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment</Text>
            </View>

            {/* Scrollable Content */}
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* ALO Wallet Section */}
                <View style={styles.walletHeader}>
                    <Text style={styles.sectionTitle}>ALO Wallet</Text>
                    <Text style={styles.walletBalance}>Wallet Balance ₹69</Text>
                </View>
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionSubtitle}>
                        Add Money to ALO Wallet
                    </Text>
                    <Text style={styles.walletBalance}>Wallet Balance ₹69</Text>
                    <Text style={styles.sectionDescription}>
                        ALO wallet can only be used to pay for Bike Ride on ALO.
                    </Text>
                    <View style={styles.amountContainer}>
                        <Text style={styles.currencySymbol}>₹</Text>
                        <TextInput
                            style={styles.amountInput}
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor={THEAMCOLOR.SecondaryGray || '#757575'}
                        />
                    </View>
                    <Text style={styles.minAmountText}>Minimum Amount: ₹50</Text>
                    <View style={styles.presetButtonsContainer}>
                        {presetAmounts.map((value) => (
                            <TouchableOpacity
                                key={value}
                                style={[
                                    styles.presetButton,
                                    amount === value.toString() && styles.presetButtonActive,
                                ]}
                                onPress={() => handlePresetAmount(value)}
                            >
                                <Text
                                    style={[
                                        styles.presetButtonText,
                                        amount === value.toString() && styles.presetButtonTextActive,
                                    ]}
                                >
                                    ₹{value}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity
                        style={styles.addMoneyButton}
                        onPress={handleAddMoney}
                        disabled={parseInt(amount) < 50}
                    >
                        <Text style={styles.addMoneyButtonText}>Add Money</Text>
                    </TouchableOpacity>
                </View>

                {/* Transaction History Link */}
                <TouchableOpacity
                    style={styles.transactionLinkContainer}
                    onPress={() => navigation.navigate('TransactionHistoryScreen')}
                >
                    <Image source={ImagePath.crossarrow} style={styles.transactionIcon} />
                    <Text style={styles.transactionLinkText}>View All Transaction</Text>
                    <Icon name="chevron-right" size={20} color={THEAMCOLOR.SecondaryGray || '#757575'} />
                </TouchableOpacity>

                {/* Payment Methods Section */}
                <View style={styles.sectionContainer}>
                    {/* QR Pay */}
                    <View style={styles.paymentMethodRow}>
                        <Image source={ImagePath.qr} style={styles.paymentIcon} />
                        <Text style={styles.paymentMethodText}>QR Pay</Text>
                    </View>

                    {/* UPI Options */}
                    <View style={styles.paymentMethodRow}>
                        <Image source={ImagePath.upi} style={[styles.paymentIcon, { width: 80, height: 34 }]} />
                        <Text style={styles.paymentMethodText}>Pay by any UPI app</Text>
                    </View>
                    <View style={styles.upiOptionsContainer}>
                        <View style={styles.upiOptionRow}>
                            <Image source={ImagePath.ppay} style={styles.upiIcon} />
                        </View>
                        <View style={styles.upiOptionRow}>
                            <Image source={ImagePath.gpayn} style={styles.upiIcon} />
                        </View>
                        <View style={styles.upiOptionRow}>
                            <Image source={ImagePath.amz} style={styles.upiIcon} />
                        </View>
                    </View>

                    {/* Add Card */}
                    <View style={styles.paymentMethodRow}>
                        <Image source={ImagePath.card} style={styles.paymentIcon} />
                        <Text style={styles.paymentMethodText}>Add Card</Text>
                    </View>
                    <TextInput
                        style={styles.cardInput}
                        value={cardNumber}
                        onChangeText={setCardNumber}
                        placeholder="Card Number"
                        placeholderTextColor={THEAMCOLOR.SecondaryGray || '#757575'}
                        keyboardType="numeric"
                    />
                    <TouchableOpacity style={styles.addCardButton} onPress={handleAddCard}>
                        <Text style={styles.addCardButtonText}>Add Card</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

export default PaymentScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEAMCOLOR.SecondarySmokeWhite || '#F5F5F5',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 15,
        paddingHorizontal: width * 0.05,
        borderBottomWidth: 1,
        borderBottomColor: 'lightgray',
    },
    headerTitle: {
        flex: 1,
        fontFamily: THEAMFONTFAMILY.LatoBold,
        fontSize: TEXT_SIZE.body,
        lineHeight: LINE_HEIGHT.h3,
        fontWeight: '600',
        color: THEAMCOLOR.SecondaryBlack || '#000',
        textAlign: 'center',
    },
    scrollContent: {
        paddingVertical: 20,
        paddingBottom: 40,
    },
    sectionContainer: {
        backgroundColor: '#fff',
        borderRadius: 15,
        marginHorizontal: width * 0.05,
        marginBottom: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    walletHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        marginHorizontal: 20,
    },
    sectionTitle: {
        fontFamily: THEAMFONTFAMILY.LatoBold,
        fontSize: TEXT_SIZE.body,
        lineHeight: LINE_HEIGHT.h3,
        color: THEAMCOLOR.SecondaryBlack || '#000',
    },
    walletBalance: {
        fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
        fontSize: TEXT_SIZE.small,
        lineHeight: LINE_HEIGHT.small,
        color: THEAMCOLOR.SecondaryBlack || '#000',
    },
    sectionSubtitle: {
        fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
        fontSize: TEXT_SIZE.small,
        lineHeight: LINE_HEIGHT.small,
        color: THEAMCOLOR.SecondaryBlack || '#000',
        marginBottom: 5,
    },
    sectionDescription: {
        fontFamily: THEAMFONTFAMILY.NunitoRegular,
        fontSize: TEXT_SIZE.xSmall,
        lineHeight: LINE_HEIGHT.small,
        color: THEAMCOLOR.SecondaryGray || '#757575',
        marginBottom: 15,
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        // backgroundColor: '#000',
    },
    currencySymbol: {
        fontFamily: THEAMFONTFAMILY.NunitoBold,
        fontSize: TEXT_SIZE.h2,
        lineHeight: LINE_HEIGHT.h2,
        color: THEAMCOLOR.SecondaryBlack || '#000',
        marginRight: 10,
    },
    amountInput: {
        flex: 1,
        fontFamily: THEAMFONTFAMILY.NunitoBold,
        fontSize: TEXT_SIZE.h2,
        lineHeight: LINE_HEIGHT.h2,
        color: THEAMCOLOR.SecondaryBlack || '#000',
    },
    minAmountText: {
        fontFamily: THEAMFONTFAMILY.NunitoRegular,
        fontSize: TEXT_SIZE.xSmall,
        lineHeight: LINE_HEIGHT.small,
        color: THEAMCOLOR.SecondaryGray || '#757575',
        marginBottom: 15,
    },
    presetButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    presetButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: 'lightgray',
        borderRadius: 8,
    },
    presetButtonActive: {
        borderColor: THEAMCOLOR.PrimaryGreen || '#4CAF50',
        backgroundColor: THEAMCOLOR.PrimaryGreen + '20' || '#4CAF5020',
    },
    presetButtonText: {
        fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
        fontSize: TEXT_SIZE.small,
        lineHeight: LINE_HEIGHT.small,
        color: THEAMCOLOR.SecondaryBlack || '#000',
    },
    presetButtonTextActive: {
        color: THEAMCOLOR.PrimaryGreen || '#4CAF50',
    },
    addMoneyButton: {
        backgroundColor: THEAMCOLOR.PrimaryGreen || '#4CAF50',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    addMoneyButtonText: {
        fontFamily: THEAMFONTFAMILY.LatoBold,
        fontSize: TEXT_SIZE.body,
        lineHeight: LINE_HEIGHT.h3,
        color: '#fff',
    },
    transactionLinkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: width * 0.05,
        marginBottom: 20,
    },
    transactionIcon: {
        width: 20,
        height: 20,
    },
    transactionLinkText: {
        flex: 1,
        fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
        fontSize: TEXT_SIZE.small,
        lineHeight: LINE_HEIGHT.small,
        color: THEAMCOLOR.SecondaryBlack || '#000',
        marginHorizontal: 10,
    },
    paymentMethodRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    paymentIcon: {
        width: 24,
        height: 24,
        marginRight: 10,
        resizeMode: 'contain',
    },
    paymentMethodText: {
        fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
        fontSize: TEXT_SIZE.small,
        lineHeight: LINE_HEIGHT.small,
        color: THEAMCOLOR.SecondaryBlack || '#000',
    },
    upiOptionsContainer: {
        marginLeft: 34,
        marginBottom: 15,
    },
    upiOptionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    upiIcon: {
        width: 80,
        height: 34,
        marginRight: 10,
        resizeMode: 'contain',
    },
    upiOptionText: {
        fontFamily: THEAMFONTFAMILY.NunitoRegular,
        fontSize: TEXT_SIZE.small,
        lineHeight: LINE_HEIGHT.small,
        color: THEAMCOLOR.SecondaryBlack || '#000',
    },
    cardInput: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: 'lightgray',
        borderRadius: 8,
        padding: 10,
        fontFamily: THEAMFONTFAMILY.NunitoRegular,
        fontSize: TEXT_SIZE.small,
        lineHeight: LINE_HEIGHT.small,
        color: THEAMCOLOR.SecondaryBlack || '#000',
        marginBottom: 20,
    },
    addCardButton: {
        backgroundColor: THEAMCOLOR.PrimaryGreen || '#4CAF50',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    addCardButtonText: {
        fontFamily: THEAMFONTFAMILY.LatoBold,
        fontSize: TEXT_SIZE.body,
        lineHeight: LINE_HEIGHT.h3,
        color: '#fff',
    },
});