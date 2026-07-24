import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getProfile } from '../services/api';
import SettingsModal from '../components/SettingsModal';

export default function ProfileScreen({ onLogout }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settingsVisible, setSettingsVisible] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (error) {
        console.warn('Profile fetch failed (expected in demo mode):', error.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6C4CE0" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={48} color="#FFFFFF" />
        </View>
        <Text style={styles.name}>{profile?.name || 'Demo User'}</Text>
        <Text style={styles.phone}>{profile?.phone || '+91 XXXXX XXXXX'}</Text>

        <TouchableOpacity style={styles.button} onPress={() => setSettingsVisible(true)}>
          <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="shield-checkmark" size={22} color="#22C55E" />
          <Text style={styles.infoText}>Account Status: Active</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={22} color="#6C4CE0" />
          <Text style={styles.infoText}>Emergency Contacts: Configurable</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={22} color="#F59E0B" />
          <Text style={styles.infoText}>Live Location Sharing Available</Text>
        </View>
      </View>

      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        onLogout={onLogout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8FC', padding: 20 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F8FC' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 25, alignItems: 'center', elevation: 4 },
  avatar: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: '#6C4CE0',
    justifyContent: 'center', alignItems: 'center', marginBottom: 18,
  },
  name: { fontSize: 24, fontWeight: '700', color: '#1E1B4B' },
  phone: { marginTop: 6, fontSize: 16, color: '#666', marginBottom: 22 },
  button: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#6C4CE0',
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  infoCard: { marginTop: 20, backgroundColor: '#FFFFFF', borderRadius: 18, padding: 18, elevation: 3 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  infoText: { marginLeft: 12, fontSize: 16, color: '#333333' },
});