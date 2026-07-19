import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import polyline from '@mapbox/polyline';
import { Ionicons } from '@expo/vector-icons';

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function SafeRouteModal({ visible, onClose }) {
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState(null); // { fastest, safest }
  const [selected, setSelected] = useState(null); // 'fastest' | 'safest'
  const [started, setStarted] = useState(false);

  const findRoutes = async () => {
    if (!destination.trim()) {
      Alert.alert('Missing destination', 'Please type where you want to go.');
      return;
    }

    setLoading(true);
    setRoutes(null);
    setSelected(null);
    setStarted(false);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Location access is required to find routes.');
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const origin = `${loc.coords.latitude},${loc.coords.longitude}`;

      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${encodeURIComponent(
        destination
      )}&alternatives=true&key=${GOOGLE_API_KEY}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.status !== 'OK' || !data.routes.length) {
         console.log('Directions API response:', data.status, data.error_message);
         Alert.alert('Coming Soon',
    'Safe Route is currently in final testing and will be available soon.');   
         setLoading(false);
        return;
      }

      // Sort by duration - shortest = "fastest"
      const sorted = [...data.routes].sort(
        (a, b) => a.legs[0].duration.value - b.legs[0].duration.value
      );

      const fastestRoute = sorted[0];
      // "Safest" placeholder logic: pick a different alternative if one exists,
      // otherwise reuse the same route. Real risk-based scoring comes from
      // Zainab's model later - this is just a visual placeholder for now.
      const safestRoute = sorted.length > 1 ? sorted[1] : sorted[0];

      const buildRouteInfo = (route) => ({
        coords: polyline
          .decode(route.overview_polyline.points)
          .map(([latitude, longitude]) => ({ latitude, longitude })),
        distance: route.legs[0].distance.text,
        duration: route.legs[0].duration.text,
        startLoc: {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        },
        endLoc: {
          latitude: route.legs[0].end_location.lat,
          longitude: route.legs[0].end_location.lng,
        },
      });

      setRoutes({
        fastest: buildRouteInfo(fastestRoute),
        safest: buildRouteInfo(safestRoute),
      });
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not fetch routes. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const activeRoute = selected ? routes?.[selected] : null;

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={26} color="#1E1B4B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Safe Route</Text>
          <View style={{ width: 26 }} />
        </View>

        {/* Destination input */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            placeholder="Where are you going?"
            placeholderTextColor="#9CA3AF"
            value={destination}
            onChangeText={setDestination}
          />
          <TouchableOpacity style={styles.searchBtn} onPress={findRoutes}>
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator size="large" color="#6C4CE0" style={{ marginTop: 30 }} />}

        {/* Route option cards */}
        {routes && !loading && (
          <View style={styles.cardsRow}>
            <TouchableOpacity
              style={[styles.routeCard, selected === 'fastest' && styles.routeCardActive]}
              onPress={() => setSelected('fastest')}
            >
              <Ionicons name="flash" size={20} color="#6C4CE0" />
              <Text style={styles.routeCardTitle}>Fastest</Text>
              <Text style={styles.routeCardSub}>{routes.fastest.duration}</Text>
              <Text style={styles.routeCardSub}>{routes.fastest.distance}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.routeCard, selected === 'safest' && styles.routeCardActive]}
              onPress={() => setSelected('safest')}
            >
              <Ionicons name="shield-checkmark" size={20} color="#22C55E" />
              <Text style={styles.routeCardTitle}>Safest</Text>
              <Text style={styles.routeCardSub}>{routes.safest.duration}</Text>
              <Text style={styles.routeCardSub}>{routes.safest.distance}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Map preview of selected route */}
        {activeRoute && (
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: activeRoute.startLoc.latitude,
              longitude: activeRoute.startLoc.longitude,
              latitudeDelta: 0.08,
              longitudeDelta: 0.08,
            }}
          >
            <Marker coordinate={activeRoute.startLoc} pinColor="#6C4CE0" title="Start" />
            <Marker coordinate={activeRoute.endLoc} pinColor="#EF4444" title="Destination" />
            <Polyline
              coordinates={activeRoute.coords}
              strokeColor={selected === 'safest' ? '#22C55E' : '#6C4CE0'}
              strokeWidth={4}
            />
          </MapView>
        )}

        {/* Start button */}
        {activeRoute && !started && (
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => {
              setStarted(true);
              Alert.alert('Navigation started', 'Live risk re-check every 500m coming soon.');
            }}
          >
            <Text style={styles.startText}>Start Navigation</Text>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1E1B4B' },

  searchRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 16 },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#1E1B4B',
  },
  searchBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#6C4CE0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 16 },
  routeCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  routeCardActive: { borderColor: '#6C4CE0', backgroundColor: '#EEF2FF' },
  routeCardTitle: { fontSize: 14, fontWeight: '700', color: '#1E1B4B', marginTop: 6 },
  routeCardSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },

  map: { flex: 1, marginHorizontal: 20, borderRadius: 16, overflow: 'hidden' },

  startBtn: {
    margin: 20,
    backgroundColor: '#6C4CE0',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});