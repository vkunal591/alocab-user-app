import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import BackButton from '../../Components/common/BackButton';
import ImagePath from '../../constants/ImagePath';
import {
  LINE_HEIGHT,
  TEXT_SIZE,
  THEAMFONTFAMILY,
  THEAMCOLOR,
} from '../../../assets/theam/theam';

import apiUtils from '../../utils/apiUtils';
import { useIsFocused } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const typeColorMap: any = {
  'trip-requested': '#ffa600b3',
  'trip-accepted': '#4CAF50b3',
  'trip-started': '#2196F3b3',
  'trip-rejected': '#F44336b3',
  'driver-reached': '#9C27B0b3',
  'trip-cancelled': '#FF5722b3',
  'trip-completed': '#2E7D32b3',
};

const NotificationScreen = ({ navigation }: any) => {
  const isFocused = useIsFocused();
  const [notifications, setNotifications] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchNotifications = async (pageToLoad = 1, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res: any = await apiUtils.get(`/api/notification?page=${pageToLoad}`);
      console.log(res)
      // Ensure data is array and pagination meta exists
      const data = Array.isArray(res?.data?.result) ? res.data.result : [];
      const currentPage = res?.data?.pagination?.currentPage || 1;
      const total = res?.data?.pagination?.totalPages || 1;

      if (isRefresh) {
        setNotifications(data);
      } else {
        setNotifications((prev: any) => [...prev, ...data]);
      }

      setPage(currentPage);
      setTotalPages(total);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };


  useEffect(() => {
    if (isFocused) {
      fetchNotifications(1, true); // refresh on screen focus
    }
  }, [isFocused]);

  const onRefresh = () => {
    fetchNotifications(1, true);
  };

  const loadMore = () => {
    if (!loadingMore && page < totalPages) {
      setLoadingMore(true);
      fetchNotifications(page + 1);
    }
  };

  const renderItem = ({ item }: any) => {
    const { title, message, type, createdAt } = item;
    const typeColor = typeColorMap[type] || '#000';
    const formattedDate = new Date(createdAt).toLocaleString();

    return (
      <TouchableOpacity
        style={[styles.card, { borderLeftColor: typeColor, borderLeftWidth: 5 }]}
        activeOpacity={0.8}
        onPress={() => {
          // Optional navigation
          // navigation.navigate('TripDetails', { id: item._id });
        }}
      >
        <Image source={ImagePath.notifi} style={[styles.cardIcon, { tintColor: typeColor }]} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardMessage}>{message}</Text>
          <View style={styles.cardFooter}>
            <View style={[styles.badge, { backgroundColor: typeColor }]}>
              <Text style={styles.badgeText}>
                {type.replace('trip-', '').replace('-', ' ')}
              </Text>
            </View>
            <Text style={styles.cardTime}>{formattedDate}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <BackButton />
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {loading && page === 1 ? (
          <ActivityIndicator size="large" color={THEAMCOLOR.PrimaryGreen || '#00ff2aff'} />
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Image source={ImagePath.notifi} style={styles.notificationImage} />
            <Text style={styles.noNotificationText}>No Notifications Yet</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator size="small" color="#999" style={{ marginVertical: 10 }} />
              ) : null
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
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
    backgroundColor: '#fff',
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: 'lightgray',
  },
  title: {
    fontFamily: THEAMFONTFAMILY.LatoBold,
    fontSize: TEXT_SIZE.h3,
    lineHeight: LINE_HEIGHT.h3,
    fontWeight: '600',
    color: THEAMCOLOR.SecondaryBlack || '#333',
    flex: 1,
    textAlign: 'center',
    // marginRight: 32,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  notificationImage: {
    width: width * 0.5,
    height: width * 0.5 * 1.2,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  noNotificationText: {
    fontFamily: THEAMFONTFAMILY.LatoBold,
    fontSize: TEXT_SIZE.body,
    fontWeight: '600',
    color: THEAMCOLOR.SecondaryBlack || '#333',
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 6,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardIcon: {
    width: 40,
    height: "auto",
    resizeMode: 'contain',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: THEAMFONTFAMILY.LatoBold,
    fontSize: TEXT_SIZE.medium,
    color: THEAMCOLOR.PrimaryBlack || '#222',
    marginBottom: 4,
  },
  cardMessage: {
    fontFamily: THEAMFONTFAMILY.LatoRegular,
    fontSize: TEXT_SIZE.small,
    color: THEAMCOLOR.SecondaryBlack || '#444',
    marginBottom: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: THEAMFONTFAMILY.LatoBold,
    textTransform: 'capitalize',
  },
  cardTime: {
    fontSize: 12,
    color: '#999',
    fontFamily: THEAMFONTFAMILY.LatoRegular,
  },
});

export default NotificationScreen;
