import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Modal, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SOSButton() {
  const [modalVisible, setModalVisible] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleConfirmSOS = () => {
    setSending(true);
    // Placeholder - will call the real triggerSOS() API function later
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 1500);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSent(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.85}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="alert" size={24} color="#fff" />
        <Text style={styles.buttonText}>SOS</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            {!sent ? (
              <>
                <View style={styles.iconCircle}>
                  <Ionicons name="warning" size={32} color="#EF4444" />
                </View>
                <Text style={styles.modalTitle}>Send Emergency Alert?</Text>
                <Text style={styles.modalSubtitle}>
                  Your live location will be sent to 3 emergency contacts via SMS.
                </Text>

                {sending ? (
                  <ActivityIndicator size="large" color="#EF4444" style={{ marginVertical: 20 }} />
                ) : (
                  <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmSOS}>
                      <Text style={styles.confirmText}>Send Alert</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            ) : (
              <>
                <View style={[styles.iconCircle, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="checkmark-circle" size={36} color="#22C55E" />
                </View>
                <Text style={styles.modalTitle}>Alert Sent</Text>
                <Text style={styles.modalSubtitle}>
                  Your contacts have been notified with your live location.
                </Text>
                <TouchableOpacity style={styles.doneBtn} onPress={closeModal}>
                  <Text style={styles.confirmText}>Done</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#EF4444',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 999,
  },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 11, marginTop: 1 },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 26,
    width: '100%',
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 19, fontWeight: '800', color: '#1E1B4B', textAlign: 'center' },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 20,
  },
  buttonRow: { flexDirection: 'row', gap: 12, width: '100%' },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelText: { color: '#374151', fontWeight: '700' },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  doneBtn: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 14,
    backgroundColor: '#22C55E',
    alignItems: 'center',
  },
  confirmText: { color: '#fff', fontWeight: '700' },
});