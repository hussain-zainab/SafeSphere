import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { getRiskPrediction } from '../services/api';

const riskTheme = {
  Safe: { bg: '#DCFCE7', text: '#15803D', icon: '#22C55E' },
  Moderate: { bg: '#FEF3C7', text: '#B45309', icon: '#F59E0B' },
  High: { bg: '#FEE2E2', text: '#B91C1C', icon: '#EF4444' },
};

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [riskData, setRiskData] = useState({
    level: 'Safe',
    score: 2,
    locality: 'Current Location',
    factors: ['Low crime density', 'Well-lit area nearby'],
  });

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          const data = await getRiskPrediction(loc.coords.latitude, loc.coords.longitude);

          if (data) {
            setRiskData({
              level: data.riskLevel || data.level || 'Safe',
              score: data.riskScore ?? data.score ?? 2,
              locality: data.locality || 'Current Location',
              factors: data.topFactors || data.factors || ['Monitored safety zone'],
            });
          }
        }
      } catch (err) {
        console.log('Risk fetch fallback applied:', err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6C4CE0" />
        <Text style={styles.loadingText}>Checking your area's safety...</Text>
      </View>
    );
  }

  const theme = riskTheme[riskData.level] || riskTheme.Safe;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Hi Shifa 👋</Text>
      <Text style={styles.subGreeting}>Here's your current area safety status</Text>

      <View style={[styles.riskCard, { backgroundColor: theme.bg }]}>
        <View style={styles.riskHeader}>
          <View style={[styles.iconCircle, { backgroundColor: '#fff' }]}>
            <Ionicons name="shield-checkmark" size={26} color={theme.icon} />
          </View>
          <View style={{ marginLeft: 14 }}>
            <Text style={[styles.riskLevel, { color: theme.text }]}>{riskData.level} Risk</Text>
            <Text style={[styles.locality, { color: theme.text }]}>{riskData.locality}</Text>
          </View>
        </View>
        <View style={styles.scoreRow}>
          <Text style={[styles.scoreText, { color: theme.text }]}>Risk Score</Text>
          <Text style={[styles.scoreValue, { color: theme.text }]}>{riskData.score}/10</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Why this area?</Text>
      {riskData.factors.length > 0 ? (
        riskData.factors.map((factor, index) => (
          <View key={index} style={styles.factorRow}>
            <View style={styles.factorIconWrap}>
              <Ionicons name="information-circle" size={18} color="#6C4CE0" />
            </View>
            <Text style={styles.factorText}>{factor}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.noFactorsText}>No contributing factors data available yet.</Text>
      )}

      <Text style={styles.sectionTitle}>Map Preview</Text>
      <View style={styles.mapPlaceholder}>
        <Ionicons name="map-outline" size={40} color="#A5B4FC" />
        <Text style={styles.mapPlaceholderText}>Open the Map tab for live risk zones</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },
  content: { padding: 20, paddingBottom: 40 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  loadingText: { marginTop: 12, color: '#6B7280', fontSize: 14 },
  noFactorsText: { color: '#9CA3AF', fontSize: 13, marginBottom: 10 },

  greeting: { fontSize: 26, fontWeight: '800', color: '#1E1B4B' },
  subGreeting: { fontSize: 14, color: '#6B7280', marginTop: 4, marginBottom: 22 },

  riskCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 26,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  riskHeader: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  riskLevel: { fontSize: 21, fontWeight: '800' },
  locality: { fontSize: 14, fontWeight: '500', marginTop: 2, opacity: 0.85 },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  scoreText: { fontSize: 13, fontWeight: '600', opacity: 0.85 },
  scoreValue: { fontSize: 15, fontWeight: '800' },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E1B4B', marginBottom: 10 },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  factorIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  factorText: { marginLeft: 12, fontSize: 14, color: '#374151', fontWeight: '500' },

  mapPlaceholder: {
    height: 170,
    backgroundColor: '#EEF2FF',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  mapPlaceholderText: { color: '#818CF8', marginTop: 8, fontSize: 13, fontWeight: '500' },
});