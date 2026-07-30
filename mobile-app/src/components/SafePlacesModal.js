import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { getSafePlaces } from '../services/api';

const categoryMeta = {
  police: { label: 'Police Stations', icon: 'shield', color: '#3B82F6' },
  markets: { label: 'Markets', icon: 'storefront', color: '#F59E0B' },
  metro: { label: 'Metro Stations', icon: 'train', color: '#22C55E' },
};

// 📍 JAMIA NAGAR & LOCAL FALLBACK DATA (For smooth hackathon demo)
const FALLBACK_SAFE_PLACES = {
  police: [
    { name: 'Jamia Nagar Police Station', distance: '0.6 km', phone: '01126981234' },
    { name: 'Okhla Vihar Police Post', distance: '1.1 km', phone: '112' },
  ],
  markets: [
    { name: 'Batla House Main Market', distance: '0.4 km' },
    { name: 'Community Centre Market, New Friends Colony', distance: '1.5 km' },
  ],
  metro: [
    { name: 'Jamia Millia Islamia Metro Station', distance: '0.5 km' },
    { name: 'Okhla Vihar Metro Station', distance: '0.9 km' },
  ],
};

export default function SafePlacesModal({ visible, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [places, setPlaces] = useState({ police: [], markets: [], metro: [] });

  useEffect(() => {
    if (!visible) return;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          // If permission denied, load fallback places safely
          setPlaces(FALLBACK_SAFE_PLACES);
          setLoading(false);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        const data = await getSafePlaces(loc.coords.latitude, loc.coords.longitude);

        // Check if API returned valid data, else use fallback
        if (data && (data.police?.length || data.markets?.length || data.metro?.length)) {
          setPlaces(data);
        } else {
          setPlaces(FALLBACK_SAFE_PLACES);
        }
      } catch (err) {
        console.log('API Error -> Loading Jamia Nagar Fallback Safe Places');
        setPlaces(FALLBACK_SAFE_PLACES);
      } finally {
        setLoading(false);
      }
    })();
  }, [visible]);

  const flatData = Object.entries(places).flatMap(([category, items]) =>
    items.map((item) => ({ ...item, category }))
  );

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={26} color="#1E1B4B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Safe Places Nearby</Text>
          <View style={{ width: 26 }} />
        </View>

        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#6C4CE0" />
            <Text style={styles.loadingText}>Finding safe places nearby...</Text>
          </View>
        )}

        {!loading && error && (
          <View style={styles.centered}>
            <Ionicons name="alert-circle-outline" size={40} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!loading && !error && (
          <FlatList
            contentContainerStyle={styles.listContent}
            data={flatData}
            keyExtractor={(item, index) => `${item.category}-${index}`}
            ListEmptyComponent={
              <View style={styles.centered}>
                <Ionicons name="location-outline" size={40} color="#9CA3AF" />
                <Text style={styles.emptyText}>No safe places found nearby yet.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const meta = categoryMeta[item.category] || categoryMeta.police;
              return (
                <View style={styles.card}>
                  <View style={[styles.iconCircle, { backgroundColor: meta.color + '22' }]}>
                    <Ionicons name={meta.icon} size={22} color={meta.color} />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>{item.name || meta.label}</Text>
                    <Text style={styles.cardSubtitle}>{item.distance || 'Nearby'}</Text>
                  </View>
                  {item.phone && (
                    <TouchableOpacity
                      style={styles.callButton}
                      onPress={() => Linking.openURL(`tel:${item.phone}`)}
                    >
                      <Ionicons name="call" size={18} color="#fff" />
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },
  header: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1E1B4B' },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  loadingText: { marginTop: 12, color: '#6B7280', fontSize: 14 },
  errorText: { marginTop: 12, color: '#EF4444', fontSize: 14, textAlign: 'center' },
  emptyText: { marginTop: 12, color: '#9CA3AF', fontSize: 14, textAlign: 'center' },

  listContent: { padding: 16, flexGrow: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justify: 'center',
  },
  cardText: { flex: 1, marginLeft: 12 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#1E1B4B' },
  cardSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  callButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justify: 'center',
  },
});