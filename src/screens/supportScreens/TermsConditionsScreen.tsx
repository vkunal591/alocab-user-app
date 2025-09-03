import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
// import RenderHtml from 'react-native-render-html';
import apiUtils from '../../utils/apiUtils';
import { THEAMCOLOR } from '../../../assets/theam/theam';

const TermsConditionsScreen = () => {
    const [content, setContent] = useState('');
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        fetchContent();
        fetchQueries();
    }, []);

    const fetchContent = async () => {
        try {
            setLoading(true);
            const response: any = await apiUtils.get('/api/passenger/terms-condition', {});
            if (!response?.status) throw new Error('Failed to fetch terms & condition');

            setContent(response?.content);
        } catch (err) {
            console.log(err);
            setError('Failed to load terms condition. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchQueries = async () => {
        try {
            const response: any = {
                data: [
                    { id: 1, query: 'How do I book a table?', status: 'Resolved' },
                    { id: 2, query: 'Can I cancel my order?', status: 'Pending' },
                ],
            };
            setQueries(response.data);
        } catch (err) {
            setError('Failed to load queries.');
        }
    };

    const htmlStyles: any = {
        h2: {
            fontSize: 20,
            fontFamily: 'Raleway-Bold',
            color: '#1F2937',
            marginBottom: 8,
        },
        h3: {
            fontSize: 18,
            fontWeight: '600',
            color: '#1F2937',
            marginTop: 12,
            marginBottom: 6,
        },
        p: {
            fontSize: 16,
            color: '#4B5563',
            lineHeight: 24,
        },
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Terms & Conditions</Text>
                {/* <Text style={styles.headerSubtitle}>Your Data, Our Responsibility</Text> */}
            </View>

            {/* Main Content */}
            <View style={styles.contentWrapper}>
                {loading ? (
                    <ActivityIndicator size="large" color={THEAMCOLOR.PrimaryGreen} />
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={fetchContent}>
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.htmlContainer}>
                        {/* <RenderHtml
                            contentWidth={Dimensions.get('window').width - 40}
                            source={{ html: content }}
                            tagsStyles={htmlStyles}
                        /> */}
                    </View>
                )}
            </View>

            {/* Queries Section (currently hidden) */}
            {/* Uncomment if needed */}
            {/* <View style={styles.queriesSection}>
        <Text style={styles.queriesTitle}>Your Queries</Text>
        {queries.length === 0 ? (
          <Text style={styles.queryText}>No queries found.</Text>
        ) : (
          queries.map(query => (
            <View key={query.id} style={styles.queryCard}>
              <Text style={styles.queryText}>{query.query}</Text>
              <Text style={styles.queryStatus}>Status: {query.status}</Text>
            </View>
          ))
        )}
      </View> */}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff', // gradient-to-white like light orange
    },
    header: {
        // paddingHorizontal: 24,
        paddingTop: 16,
        // paddingBottom: 32,
        // backgroundColor: THEAMCOLOR.PrimaryGreen, // Primary color
        // borderBottomLeftRadius: 24,
        // borderBottomRightRadius: 24,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 4 },
        // shadowOpacity: 0.15,
        // shadowRadius: 6,
        // elevation: 4,
    },
    headerTitle: {
        fontFamily: 'Raleway-Bold',
        fontSize: 26,
        color: '#000',
        textAlign: 'center',
        fontWeight:"bold"
    },
    headerSubtitle: {
        fontFamily: 'Raleway-Regular',
        fontSize: 18,
        color: '#000',
        textAlign: 'center',
        marginTop: 8,
    },
    contentWrapper: {
        paddingHorizontal: 20,
        marginTop: 24,
    },
    errorContainer: {
        backgroundColor: '#FEE2E2',
        borderRadius: 16,
        padding: 16,
    },
    errorText: {
        color: '#DC2626',
        fontSize: 16,
        fontFamily: 'Raleway-Regular',
    },
    retryButton: {
        marginTop: 16,
        backgroundColor: THEAMCOLOR.PrimaryGreen,
        padding: 12,
        borderRadius: 10,
    },
    retryButtonText: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontFamily: 'Raleway-SemiBold',
    },
    htmlContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    queriesSection: {
        paddingHorizontal: 20,
        marginTop: 24,
        marginBottom: 32,
    },
    queriesTitle: {
        fontSize: 24,
        fontFamily: 'Raleway-Bold',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 16,
    },
    queryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    queryText: {
        fontFamily: 'Raleway-SemiBold',
        color: '#111827',
    },
    queryStatus: {
        fontFamily: 'Raleway-Regular',
        color: '#6B7280',
        fontSize: 14,
        marginTop: 4,
    },
});

export default TermsConditionsScreen;
