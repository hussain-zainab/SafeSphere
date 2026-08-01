import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1. Header Banner */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>SafeSphere 🛡️</Text>
          <Text style={styles.subGreeting}>Jamia Nagar Safety Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-circle-outline" size={36} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      {/* 2. Current Safety Score Card */}
      <View style={styles.scoreCard}>
        <View style={styles.scoreRow}>
          <View>
            <Text style={styles.scoreTitle}>Your Area Safety Score</Text>
            <Text style={styles.scoreValue}>82 / 100</Text>
            <Text style={styles.scoreSub}>Zone: Moderate Caution</Text>
          </View>
          <View style={styles.shieldIcon}>
            <Ionicons name="shield-checkmark" size={32} color="#10B981" />
          </View>
        </View>
      </View>

      {/* 3. Compact Map Widget (Chhota Map Preview Button) */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Live Area Risk Preview</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Map')}>
          <Text style={styles.seeAllText}>Open Full Map →</Text>
        </TouchableOpacity>
      </View>

      {/* Chhota Clickable Map Card */}
      <TouchableOpacity 
        style={styles.compactMapCard}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('Map')}
      >
        <View style={styles.compactMapFrame}>
          <iframe
            title="Home Map Preview"
            width="100%"
            height="100"
            style={{ border: 0, pointerEvents: 'none' }}
            src="https://www.openstreetmap.org/export/embed.html?bbox=77.2500%2C28.5400%2C77.3000%2C28.5800&layer=mapnik&marker=28.5615%2C77.2802"
          />
        </View>
        <View style={styles.mapCardFooter}>
          <Ionicons name="location" size={16} color="#EF4444" />
          <Text style={styles.mapFooterText}>Tap here to open interactive map & routes</Text>
        </View>
      </TouchableOpacity>

      {/* 4. Safety Action Shortcuts */}
      <Text style={styles.sectionTitle}>Quick Services</Text>
      <View style={styles.gridContainer}>
        <TouchableOpacity 
          style={[styles.gridCard, { backgroundColor: '#EEF2FF' }]}
          onPress={() => navigation.navigate('Map')}
        >
          <Ionicons name="shield-checkmark" size={22} color="#4F46E5" />
          <Text style={styles.gridTitle}>Safe Places</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.gridCard, { backgroundColor: '#ECFDF5' }]}
          onPress={() => navigation.navigate('Map')}
        >
          <Ionicons name="navigate" size={22} color="#10B981" />
          <Text style={styles.gridTitle}>Safe Route</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.gridCard, { backgroundColor: '#FEF3C7' }]}
          onPress={() => navigation.navigate('Report')}
        >
          <Ionicons name="warning" size={22} color="#D97706" />
          <Text style={styles.gridTitle}>Report Incident</Text>
        </TouchableOpacity>
      </View>

      {/* 5. Recent Community Safety Feeds */}
      <Text style={styles.sectionTitle}>Recent Area Feeds</Text>
      <View style={styles.feedCard}>
        <View style={styles.feedHeader}>
          <Ionicons name="time-outline" size={16} color="#64748B" />
          <Text style={styles.feedTime}>15 mins ago • Okhla Vihar</Text>
        </View>
        <Text style={styles.feedText}>Street lights working properly on main road corridor.</Text>
      </View>

      <View style={styles.feedCard}>
        <View style={styles.feedHeader}>
          <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
          <Text style={styles.feedTime}>1 hr ago • Batla House</Text>
        </View>
        <Text style={styles.feedText}>Heavy traffic reported near metro station entrance.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingHorizontal: 16 },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 16,
  },
  greeting: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  subGreeting: { fontSize: 12, color: '#64748B', marginTop: 2 },
  profileBtn: { padding: 2 },

  scoreCard: {
    backgroundColor: '#312E81',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreTitle: { color: '#C7D2FE', fontSize: 12, fontWeight: '600' },
  scoreValue: { color: '#fff', fontSize: 26, fontWeight: '800', marginVertical: 2 },
  scoreSub: { color: '#34D399', fontSize: 12, fontWeight: '600' },
  shieldIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 8, marginTop: 4 },
  seeAllText: { fontSize: 12, fontWeight: '600', color: '#4F46E5' },

  // Compact Map Card
  compactMapCard: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 20,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  compactMapFrame: { height: 100, width: '100%' },
  mapCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    backgroundColor: '#F1F5F9',
  },
  mapFooterText: { fontSize: 11, fontWeight: '600', color: '#334155' },

  gridContainer: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  gridCard: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  gridTitle: { fontSize: 12, fontWeight: '700', color: '#0F172A' },

  feedCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  feedHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  feedTime: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  feedText: { fontSize: 13, color: '#1E293B', fontWeight: '500' },
});
