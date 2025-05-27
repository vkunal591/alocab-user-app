import React from 'react';
import Feather from 'react-native-vector-icons/Feather';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');
import LinearGradient from 'react-native-linear-gradient';
import { THEAMCOLOR } from '../../assets/theam/theam';


const RideRequestCard = ({ request, onAccept, onDecline }: any) => {
  return (
    <View style={styles.card}>
      <View style={styles.profileRow}>
        <Image source={{ uri: request.userImage }} style={styles.avatar} />
        <View style={styles.info}>
          <Text style={styles.name}>{request.name}</Text>
          <Text style={styles.detail}>ETA {request.eta} • <Feather size={12} name="map-pin" /> {request.distance}</Text>
        </View>
        <View>
          <Text style={styles.amount}>₹ {request.amount}</Text>
          <Text style={styles.cash}>Cash</Text>
        </View>
      </View>
      <View style={styles.actioBox}>
        <Text style={styles.location}> {request.totalDistance}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onDecline}><Text style={styles.decline}>Decline</Text></TouchableOpacity>
          <TouchableOpacity onPress={onAccept} style={styles.acceptBtn}><Text style={styles.accept}>Accept</Text></TouchableOpacity>
        </View>
      </View>
      <View style={styles.pathRow}>
        <View style={styles.iconColumn}>
          <View style={styles.greenCircle} />
          <LinearGradient
            colors={['#00FF00', '#FF0000']} // green to red
            style={styles.verticalLine}
          />
          <View style={styles.redCircle} />
        </View>

        <View style={styles.textColumn}>
          <Text style={styles.location}>{request.pickup}</Text>
          <Text style={styles.location}>{request.drop}</Text>
        </View>
      </View>


    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 15, width: width * 0.92, marginHorizontal: 'auto', padding: 15, marginTop: 0, elevation: 5, shadowColor: 'lightgray' },
  profileRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 5, paddingBottom: 15, borderBottomWidth: 1, borderColor: 'lightgray' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 5, },
  pathRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f2f5',
    borderRadius: 15,
    padding: 20,
    backgroundColor: '#fff', // required for shadow to be visible

    // iOS shadow
    shadowColor: 'gray',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 10,

    // Android shadow
    elevation: 5,
  },

  iconColumn: {
    alignItems: 'center',
    marginRight: 10,
  },

  greenCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'green',
  },

  redCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'red',
  },

  verticalLine: {
    width: 2,
    height: 30,
    marginVertical: 2,
  },

  textColumn: {
    justifyContent: 'space-between',
    height: 60,
  },

  avatar: { width: 45, height: 45, borderRadius: 22, marginRight: 10 },
  info: { flex: 1, marginHorizontal: 10 },
  name: { fontWeight: '500', fontSize: 15 },
  detail: { color: '#666', fontSize: 11 },
  amount: { fontSize: 15, fontWeight: 'bold', color: '#4CAF50' },
  cash: { color: '#666', fontSize: 11 },
  location: { fontSize: 11, color: '#333', marginVertical: 2 },
  distanceText: { fontSize: 11, color: '#999' },
  actioBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: width * 0.42, marginTop: 10 },
  decline: { color: 'red',fontSize:12 },
  acceptBtn: { backgroundColor: THEAMCOLOR?.PrimaryGreen, paddingHorizontal: 20, paddingVertical: 6, borderRadius: 16 },
  accept: { color: '#fff',fontSize:12 },
});

export default RideRequestCard;
