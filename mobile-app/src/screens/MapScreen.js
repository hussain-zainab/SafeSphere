import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Web vs Native Conditional Imports
let MapView, Marker, Circle, PROVIDER_GOOGLE;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Circle = Maps.Circle;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
}

// Demo Risk Zones (Jamia Nagar & Delhi NCR)
const RISK_ZONES = [
  {
    id: '1',
    title: 'Jamia Nagar - High Caution Zone',
    riskLevel: 'High Risk',
    color: '#EF4444', // Red
    coordinate: { latitude: 28.5615, longitude: 77.2802 },
    radius: 400,
  },
  {
    id: '2',
    title: 'Okhla Vihar - Moderate Zone',
    riskLevel: 'Medium Risk',
    color: '#F59E0B', // Yellow
    coordinate: { latitude: 28.5580, longitude: 77.2850 },
    radius: 300,
  },
  {
    id: '3',
    title: 'NFC Community Centre - Safe Zone',
    riskLevel: 'Low Risk',
    color: '#22C55E', // Green
    coordinate: { latitude: 28.5672, longitude: 77.2690 },
    radius: 500,
  },
];

export default function MapScreen() {
  const [selectedZone, setSelectedZone] = useState(null);

  const initialRegion = {
    latitude: 28.5615,
    longitude: 77.2802,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
  };

  // 💻 LAPTOP / WEB VIEW (OpenStreetMap Embed for Vercel/Browser)
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.webHeader}>
          <Ionicons name="map-outline" size={20} color="#6C4CE0" />
          <Text style={styles.webHeaderText}>Interactive Risk Map (Delhi / Jamia Nagar)</Text>
        </View>
        <iframe
          title="SafeSphere Risk Map"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src={`https://www.openstreetmap.org/export/embed.html?bbox=77.2500%2C28.5400%2C77.3000%2C28.5800&layer=mapnik&marker=28.5615%2C77.2802`}
        />
        {/* Overlay Risk Badges for Web */}
        <View style={styles.webLegend}>
          <Text style={styles.legendTitle}>Risk Analysis Zones:</Text>
          {RISK_ZONES.map((zone) => (
            <TouchableOpacity 
              key={zone.id} 
              style={[styles.legendBadge, { borderColor: zone.color }]}
              onPress={() => setSelectedZone(zone)}
            >
              <Text style={{ color: zone.color, fontWeight: '700', fontSize: 12 }}>
                ● {zone.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  // 📱 PHONE / MOBILE VIEW (React Native Native Map)
  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {RISK_ZONES.map((zone) => (
          <React.Fragment key={zone.id}>
            <Circle
              center={zone.coordinate}
              radius={zone.radius}
              fillColor={zone.color + '33'}
              strokeColor={zone.color}
              strokeWidth={2}
            />
            <Marker
              coordinate={zone.coordinate}
              pinColor={zone.color}
              title={zone.title}
              description={`Safety Status: ${zone.riskLevel}`}
              onPress={() => setSelectedZone(zone)}
            />
          </React.Fragment>
        ))}
      </MapView>

      {/* Selected Zone Card Overlay */}
      {selectedZone && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{selectedZone.title}</Text>
            <TouchableOpacity onPress={() => setSelectedZone(null)}>
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.badge, { color: selectedZone.color }]}>
            ● {selectedZone.riskLevel}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { width: '100%', height: '100%' },

  // Web Styles
  webHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#EEF2FF',
  },
  webHeaderText: { fontSize: 14, fontWeight: '700', color: '#1E1B4B' },
  webLegend: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  legendTitle: { fontSize: 12, fontWeight: '700', color: '#1E1B4B', marginRight: 4 },
  legendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#fff',
  },

  // Mobile Styles
  card: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1E1B4B' },
  badge: { fontSize: 13, fontWeight: '600', marginTop: 4 },
});