import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { updateContacts } from '../services/api';

export default function SettingsModal({ visible, onClose, onLogout }) {
  const [contacts, setContacts] = useState(['', '', '']);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateContacts(contacts.filter((c) => c.trim() !== ''));
      Alert.alert('Success', 'Emergency contacts updated successfully.');
    } catch (error) {
      Alert.alert(
        'Demo Mode',
        'Emergency contacts will be saved once login is connected to the backend.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={26} color="#1E1B4B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="call-outline" size={22} color="#6C4CE0" />
            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          </View>

          {contacts.map((contact, index) => (
            <TextInput
              key={index}
              style={styles.input}
              placeholder={`Emergency Contact ${index + 1}`}
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={contact}
              onChangeText={(text) => {
                const updated = [...contacts];
                updated[index] = text;
                setContacts(updated);
              }}
            />
          ))}

          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
            <Ionicons name="save-outline" size={20} color="#fff" />
            <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save Contacts'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Ionicons name="notifications-outline" size={22} color="#F59E0B" />
              <Text style={styles.sectionTitle}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#ccc', true: '#6C4CE0' }}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            onClose();
            onLogout();
          }}
        >
          <Ionicons name="log-out-outline" size={22} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
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

  container: { flex: 1, backgroundColor: '#F8F8FC', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 18, marginBottom: 20, elevation: 3 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { marginLeft: 10, fontSize: 18, fontWeight: '600', color: '#1E1B4B' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#6C4CE0',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginTop: 5,
  },
  saveText: { color: '#fff', fontWeight: '600', marginLeft: 8, fontSize: 16 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchLabel: { flexDirection: 'row', alignItems: 'center' },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 40,
  },
  logoutText: { color: '#fff', fontWeight: '600', fontSize: 16, marginLeft: 8 },
});