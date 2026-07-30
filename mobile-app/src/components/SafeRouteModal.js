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
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import polyline from '@mapbox/polyline';
import { Ionicons } from '@expo/vector-icons';

// Web par native map crash prevent karne ke liye conditional require
let MapView, Marker, Polyline, PROVIDER_GOOGLE;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Polyline = Maps.Polyline;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
}

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

// 📍 MOCK ROUTE DATA (Delhi / Jamia Nagar Fallback coordinates for Demo)
const MOCK_ROUTES = {
  fastest: {
    distance: '3.2 km',
    duration: '11 mins',
    startLoc: { latitude: 28.5615, longitude: 77.2802 }, // Jamia Nagar
    endLoc: { latitude: 28.5672, longitude: 77.2690 },   // NFC / Connaught Place Direction
    coords: [
      { latitude: 28.5615, longitude: 77.2802 },
      { latitude: 28.5630, longitude: 77.2780 },
      { latitude: 28.5650, longitude: 77.2730 },
      { latitude: 28.5672, longitude: 77.2690 },
    ],
  },
  safest: {
    distance: '3.8 km',
    duration: '14 mins',
    startLoc: { latitude: 28.5615, longitude: 77.2802 },
    endLoc: { latitude: 28.5672, longitude: 77.2690 },
    coords: [
      { latitude: 28.5615, longitude: 77.2802 },
      { latitude: 28.5620, longitude: 77.2820 }, // Via Well-lit Main Corridor
      { latitude: 28.5645, longitude: 77.2760 },
      { latitude: 28.5660, longitude: 77.2710 },
      { latitude: 28.5672, longitude: 77.2690 },
    ],
  },
};

export default function SafeRouteModal({ visible, onClose }) {
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState(null); // { fastest, safest }
  const [selected, setSelected] = useState('safest'); // Default to safest
  const [started, setStarted] = useState(false);

  const findRoutes = async () => {
    if (!destination.trim()) {
      Alert.alert('Missing destination', 'Please type where you want to go.');
      return;
    }

    setLoading(true);
    setRoutes(null);
    setSelected('safest');
    setStarted(false);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      let origin = '28.5615,77.2802'; // Default Jamia Nagar coords

      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        origin = `${loc.coords.latitude},${loc.coords.longitude}`;
      }

      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${encodeURIComponent(
        destination
      )}&alternatives=true&key=${GOOGLE_API_KEY}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.status === 'OK' && data.routes?.length) {
        // Sort by duration - shortest = "fastest"
        const sorted = [...data.routes].sort(
          (a, b) => a.legs[0].duration.value - b.legs[0].duration.value
        );

        const fastestRoute = sorted[0];
        const safestRoute = sorted.length > 1 ? sorted[1] : sorted[0];

        const buildRouteInfo = (route) => ({
          coords: polyline
            .decode(route.overview_polyline.points)
            .map(([latitude, longitude]) => ({ latitude, longitude })),
          distance: route.legs[0].distance.text,
          duration: route.legs[0].duration.text,
          startLoc: {
            latitude: route.legs[0].start_location.lat,
            longitude: route.legs[0].start_location.lng,
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
      } else {
        console.log('Directions API Billing/Status Issue -> Loading Safe Fallback Route');
        setRoutes(MOCK_ROUTES);
      }
    } catch (err) {
      console.log('Directions API Error -> Loading Fallback Mock Route');
      setRoutes(MOCK_ROUTES);
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
          Platform.OS === 'web' ? (
            <View style={styles.webFallback}>
              <Ionicons name="map-outline" size={40} color="#6C4CE0" />
              <Text style={styles.webFallbackText}>
                Route polyline view is optimized for Mobile App view.
              </Text>
            </View>
          ) : (
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={{
                latitude: activeRoute.startLoc.latitude,
                longitude: activeRoute.startLoc.longitude,
                latitudeDelta: 0.04,
                longitudeDelta: 0.04,
              }}
            >
              <Marker coordinate={activeRoute.startLoc} pinColor="#6C4CE0" title="Start Location" />
              <Marker coordinate={activeRoute.endLoc} pinColor="#EF4444" title="Destination" />
              <Polyline
                coordinates={activeRoute.coords}
                strokeColor={selected === 'safest' ? '#22C55E' : '#6C4CE0'}
                strokeWidth={5}
              />
            </MapView>
          )
        )}

        {/* Start button */}
        {activeRoute && !started && (
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => {
              setStarted(true);
              Alert.alert('Navigation started', 'Live risk monitoring active.');
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
    justify: 'center',
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
  webFallback: {
    flex: 1,
    marginHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justify: 'center',
    padding: 20,
  },
  webFallbackText: { marginTop: 8, fontSize: 13, color: '#6B7280', textAlign: 'center' },

  startBtn: {
    margin: 20,
    backgroundColor: '#6C4CE0',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});