import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import apiUtils from '../../utils/apiUtils';
import { THEAMCOLOR } from '../../../assets/theam/theam';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FaqScreen = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    useEffect(() => {
        fetchFaqs();
    }, []);

    const fetchFaqs = async () => {
        try {
            setLoading(true);
            const response: any = await apiUtils.get('/faqs'); // Replace with your actual API call
            setFaqs(response);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Failed to load FAQs. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleFaq = (id: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setActiveFaq(activeFaq === id ? null : id);
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Frequently Asked Questions</Text>

            {loading && <ActivityIndicator size="large" color="#EA580C" style={styles.spinner} />}

            {error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchFaqs}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                faqs.map((faq: any) => (
                    <View key={faq.id} style={styles.faqItem}>
                        <TouchableOpacity onPress={() => toggleFaq(faq.id)} style={styles.questionBox}>
                            <Text style={styles.questionText}>{faq.question}</Text>
                        </TouchableOpacity>
                        {activeFaq === faq.id && (
                            <View style={styles.answerBox}>
                                <Text style={styles.answerText}>{faq.answer}</Text>
                            </View>
                        )}
                    </View>
                ))
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#ffffffff',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        fontFamily: 'Raleway-Bold',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 24,
    },
    faqItem: {
        marginBottom: 16,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        elevation: 2,
    },
    questionBox: {
        padding: 16,
        backgroundColor: THEAMCOLOR.PrimaryGreen,
    },
    questionText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontFamily: 'Raleway-SemiBold',
    },
    answerBox: {
        padding: 16,
        backgroundColor: '#FFF7ED',
        borderTopWidth: 1,
        borderTopColor: THEAMCOLOR.PrimaryGreen,
    },
    answerText: {
        fontSize: 15,
        color: '#374151',
        fontFamily: 'Raleway-Regular',
        lineHeight: 22,
    },
    spinner: {
        marginTop: 40,
    },
    errorContainer: {
        backgroundColor: '#FEE2E2',
        padding: 16,
        borderRadius: 8,
    },
    errorText: {
        color: '#B91C1C',
        fontFamily: 'Raleway-Regular',
        fontSize: 14,
    },
    retryButton: {
        marginTop: 12,
        backgroundColor: THEAMCOLOR.PrimaryGreen,
        padding: 10,
        borderRadius: 8,
    },
    retryText: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontFamily: 'Raleway-SemiBold',
    },
});

export default FaqScreen;
