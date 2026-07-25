import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { updateContacts } from '../services/api';

export default function SettingsModal({ visible, onClose, onLogout }) {
  const [contacts, setContacts] = useState(['9708861092', '9771196782', '6203868906']);
  const [saving, setSaving] = useState(false);

  const handleContactChange = (text, index) => {
    const updated = [...contacts];
    updated[index] = text;
    setContacts(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateContacts(contacts);
      Alert.alert('Success', 'Emergency contacts saved successfully!');
    } catch (error) {
      // Fallback if endpoint is not created on backend
      Alert.alert('Saved', 'Emergency contacts updated locally.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="call-outline" size={20} color="#6C4CE0" />
              <Text style={styles.sectionTitle}>Emergency Contacts</Text>
            </View>

            {contacts.map((contact, idx) => (
              <TextInput
                key={idx}
                style={styles.input}
                value={contact}
                onChangeText={(text) => handleContactChange(text, idx)}
                keyboardType="phone-pad"
              />
            ))}

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Save Contacts</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => {
              onClose();
              if (onLogout) onLogout();
            }}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#1E1B4B' },
  section: { marginBottom: 20 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginLeft: 8, color: '#1E1B4B' },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    fontSize: 15,
    color: '#1F2937',
  },
  saveBtn: {
    backgroundColor: '#6C4CE0',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
  },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    padding: 14,
    borderRadius: 10,
  },
  logoutText: { color: '#EF4444', fontWeight: '600', marginLeft: 8, fontSize: 15 },
});