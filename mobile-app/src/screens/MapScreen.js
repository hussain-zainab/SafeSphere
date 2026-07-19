import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import SafeRouteModal from '../components/SafeRouteModal';

// Placeholder risk zone data - will come from Zainab's /predict-risk API later
const RISK_ZONES = [
  { id: '1', name: 'Connaught Place', lat: 28.6315, lng: 77.2167, level: 'Moderate' },
  { id: '2', name: 'Rajiv Chowk Metro', lat: 28.6328, lng: 77.2197, level: 'High' },
  { id: '3', name: 'Lodhi Garden', lat: 28.5931, lng: 77.2197, level: 'Safe' },
];

const riskColor = {
  Safe: '#22C55E',
  Moderate: '#F59E0B',
  High: '#EF4444',
};

export default function MapScreen() {
  const [routeModalVisible, setRouteModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.routeButton} onPress={() => setRouteModalVisible(true)}>
        <Ionicons name="navigate" size={18} color="#fff" />
        <Text style={styles.routeButtonText}>Safe Route</Text>
      </TouchableOpacity>

      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: 28.6139,
          longitude: 77.209,
          latitudeDelta: 0.15,
          longitudeDelta: 0.15,
        }}
      >
        {RISK_ZONES.map((zone) => (
          <Marker
            key={zone.id}
            coordinate={{ latitude: zone.lat, longitude: zone.lng }}
            title={zone.name}
            description={`${zone.level} Risk`}
            pinColor={riskColor[zone.level]}
          />
        ))}
      </MapView>

      {/* Legend */}
      <View style={styles.legend}>
        {Object.entries(riskColor).map(([level, color]) => (
          <View key={level} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: color }]} />
            <Text style={styles.legendText}>{level}</Text>
          </View>
        ))}
      </View>

      <SafeRouteModal visible={routeModalVisible} onClose={() => setRouteModalVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  routeButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#6C4CE0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 10,
    gap: 6,
  },
  routeButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  legend: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendText: { fontSize: 12, fontWeight: '600', color: '#374151' },
});