import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Banner */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome to SafeSphere 👋</Text>
        <Text style={styles.subText}>Your safety network & live zone tracking</Text>
      </View>

      {/* 🗺️ Interactive Live Map Preview Card (Clickable) */}
      <TouchableOpacity 
        style={styles.mapCard}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('Map')}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <Ionicons name="map-outline" size={20} color="#6C4CE0" />
            <Text style={styles.cardTitle}>Live Risk Zone Map</Text>
          </View>
          <Text style={styles.tapText}>Open Full Map →</Text>
        </View>

        {/* Embedded Map Window */}
        <View style={styles.mapFrame}>
          <iframe
            title="Home Map Preview"
            width="100%"
            height="160"
            style={{ border: 0, pointerEvents: 'none' }}
            src="https://www.openstreetmap.org/export/embed.html?bbox=77.2500%2C28.5400%2C77.3000%2C28.5800&layer=mapnik&marker=28.5615%2C77.2802"
          />
        </View>

        {/* Status Indicator */}
        <View style={styles.cardFooter}>
          <Text style={styles.legendText}>
            🔴 <Text style={{ fontWeight: '700' }}>Jamia Nagar:</Text> Caution Zone | 🟢 <Text style={{ fontWeight: '700' }}>NFC:</Text> Safe
          </Text>
        </View>
      </TouchableOpacity>

      {/* Quick Action Buttons */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={[styles.actionBox, { backgroundColor: '#EEF2FF' }]}
          onPress={() => navigation.navigate('Map')}
        >
          <Ionicons name="shield-checkmark" size={24} color="#4F46E5" />
          <Text style={styles.actionText}>Safe Places</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionBox, { backgroundColor: '#ECFDF5' }]}
          onPress={() => navigation.navigate('Map')}
        >
          <Ionicons name="navigate-circle" size={24} color="#10B981" />
          <Text style={styles.actionText}>Safe Route</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 16 },
  header: { marginBottom: 16 },
  welcomeText: { fontSize: 22, fontWeight: '800', color: '#1E1B4B' },
  subText: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  
  mapCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1E1B4B' },
  tapText: { fontSize: 12, fontWeight: '700', color: '#6C4CE0' },
  
  mapFrame: {
    borderRadius: 12,
    overflow: 'hidden',
    height: 160,
  },
  cardFooter: { marginTop: 10 },
  legendText: { fontSize: 12, color: '#374151' },

  quickActions: { flexDirection: 'row', gap: 12 },
  actionBox: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionText: { fontSize: 13, fontWeight: '700', color: '#1F2937' },
});