import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useIsFocused, useNavigation } from '@react-navigation/native';

import { THEAMCOLOR, TEXT_SIZE, THEAMFONTFAMILY, LINE_HEIGHT } from '../../../assets/theam/theam';
import apiUtils from '../../utils/apiUtils';
import BackButton from '../../Components/common/BackButton';

const { width, height } = Dimensions.get('window');
const AVAILABLE_TAGS = ['Bug', 'Feature', 'UI', 'Backend', 'Performance', 'Other'];

interface Ticket {
  id: string;
  priority: string;
  status: string;
  dueDate: string;
  createdAt: string;
  resolutionDate?: string;
  assigneeName: string;
  assigneeEmail: string;
  requesterName: string;
  requesterNumber: string;
}

const SupportTicketsScreen = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation<any>();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', tags: [] as string[] });
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = useCallback(async (page = 1) => {
    try {
      if (page === 1) setLoading(true);

      const res: any = await apiUtils.get('/api/support/tickets', { params: { page } });
      console.log(res)
      if (res.success && res.data) {
        const mapped = res.data.result.map((item: any) => ({
          id: item._id,
          priority: item.priority,
          status: item.status,
          dueDate: item.dueDate,
          createdAt: item.createdAt,
          resolutionDate: item.resolutionDate,
          assigneeName: item.assigneeName,
          assigneeEmail: item.assigneeEmail,
          requesterName: item.requesterName,
          requesterNumber: item.requesterNumber,
        }));
        setTickets(prev =>
          page === 1 ? mapped : [...prev, ...mapped]
        );
        setCurrentPage(res.data.pagination.currentPage);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchTickets(1);
    }
  }, [isFocused, fetchTickets]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets(1);
  };

  const loadMore = () => {
    if (currentPage < totalPages && !loading) {
      fetchTickets(currentPage + 1);
    }
  };

  const submitTicket = async () => {
    setSubmitting(true);
    try {
      const res: any = await apiUtils.post('/api/support/tickets', {
        title: form.title,
        description: form.description,
        tags: form.tags,
      });
      if (res.success) {
        setModalVisible(false);
        setForm({ title: '', description: '', tags: [] });
        fetchTickets(1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTag = (tag: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const renderTicket = ({ item }: { item: Ticket }) => (
    <View style={styles.card}>
      <Text style={styles.ticketTitle}>{item.requesterName}</Text>
      <Text style={styles.metaText}>Status: {item.status}</Text>
      <Text style={styles.metaText}>Priority: {item.priority}</Text>
      <Text style={styles.metaText}>
        Created: {new Date(item.createdAt).toLocaleString()}
      </Text>
      {/* <TouchableOpacity
        style={styles.chatBtn}
        onPress={() => navigation.navigate('ChatScreen', { ticket: item })}
      >
        <Icon name="chatbubble-ellipses-outline" size={25} />
      </TouchableOpacity> */}
    </View>
  );

  const ListFooter = () => (loading && currentPage > 1 ? <ActivityIndicator style={{ margin: 12 }} /> : null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Support Tickets</Text>
      </View>

      <FlatList
        data={tickets}
        keyExtractor={item => item.id}
        renderItem={renderTicket}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[THEAMCOLOR.PrimaryGreen]} />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading && <Text style={styles.emptyText}>No tickets raised yet.</Text>
        }
        ListFooterComponent={ListFooter}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Icon name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Create Ticket Modal */}
      <Modal transparent animationType="slide" visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Raise a Ticket</Text>
            <TextInput
              placeholder="Title"
              placeholderTextColor="gray"
              style={styles.input}
              value={form.title}
              onChangeText={text => setForm(prev => ({ ...prev, title: text }))}
            />
            <TextInput
              placeholder="Description"
              placeholderTextColor="gray"
              style={[styles.input, { height: 80 }]}
              value={form.description}
              onChangeText={text => setForm(prev => ({ ...prev, description: text }))}
              multiline
            />
            <Text style={[styles.modalTitle, { fontSize: TEXT_SIZE.small, marginTop: 10 }]}>
              Select Tags
            </Text>
            <View style={styles.tagSelectionContainer}>
              {AVAILABLE_TAGS.map(tag => {
                const selected = form.tags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => toggleTag(tag)}
                    style={[styles.selectableTag, selected && styles.selectableTagSelected]}
                  >
                    <Text style={[styles.tagText, selected && { color: '#fff' }]}>{tag}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={submitTicket} disabled={submitting}>
              <Text style={styles.submitBtnText}>{submitting ? 'Submitting...' : 'Submit'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)} disabled={submitting}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SupportTicketsScreen;
const styles = StyleSheet.create({
  // your existing style definitions...
  chatBtn: {
    position: 'absolute',
    right: 15,
    bottom: 15
  },
  container: { flex: 1, backgroundColor: '#F2F2F2' },
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
  list: { padding: 16, paddingBottom: 80 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  ticketTitle: {
    fontSize: TEXT_SIZE.body,
    fontFamily: THEAMFONTFAMILY.LatoBold,
    marginBottom: 6,
  },
  ticketDesc: {
    fontSize: TEXT_SIZE.small,
    color: '#555',
    marginBottom: 8,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  tag: {
    backgroundColor: THEAMCOLOR.PrimaryGreen + '22',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: TEXT_SIZE.small,
    color: THEAMCOLOR.PrimaryGreen,
  },
  metaText: {
    fontSize: TEXT_SIZE.small,
    color: '#888',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: height * 0.3,
    color: '#888',
    fontSize: TEXT_SIZE.body,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: THEAMCOLOR.PrimaryGreen,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    width: width * 0.9,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: TEXT_SIZE.body,
    fontFamily: THEAMFONTFAMILY.LatoBold,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontFamily: THEAMFONTFAMILY.NunitoRegular,
    color: "#000"
  },
  submitBtn: {
    backgroundColor: THEAMCOLOR.PrimaryGreen,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: TEXT_SIZE.body,
    fontFamily: THEAMFONTFAMILY.LatoBold,
  },
  cancelBtn: {
    marginTop: 8,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#555',
    fontSize: TEXT_SIZE.small,
    fontFamily: THEAMFONTFAMILY.LatoRegular,
  },

  // New styles for selectable tags
  tagSelectionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  selectableTag: {
    borderWidth: 1,
    borderColor: THEAMCOLOR.PrimaryGreen,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  selectableTagSelected: {
    backgroundColor: THEAMCOLOR.PrimaryGreen,
    borderColor: THEAMCOLOR.PrimaryGreen,
  },
});
