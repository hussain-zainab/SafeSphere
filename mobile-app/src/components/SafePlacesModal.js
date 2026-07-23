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
          setError('Location permission is needed to find nearby safe places.');
          setLoading(false);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        const data = await getSafePlaces(loc.coords.latitude, loc.coords.longitude);
        setPlaces(data);
      } catch (err) {
        console.error(err);
        setError('Could not load safe places. Please try again.');
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
              const meta = categoryMeta[item.category];
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
    justifyContent: 'space-between',
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
    justifyContent: 'center',
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
    justifyContent: 'center',
  },
});