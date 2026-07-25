import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { triggerSOS } from '../services/api';

export default function SOSButton() {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendAlert = async () => {
    setLoading(true);
    try {
      // Calling real backend API function
      const response = await triggerSOS();
      setLoading(false);
      setModalVisible(false);

      if (response && response.success) {
        Alert.alert('SOS Sent!', 'Emergency alert sent successfully to your contacts.');
      } else {
        // Fallback alert if backend sends simulated or soft success
        Alert.alert('SOS Alert Triggered', response?.message || 'Emergency alert has been processed.');
      }
    } catch (error) {
      setLoading(false);
      setModalVisible(false);
      Alert.alert('Error', 'Failed to send SOS alert. Please try again.');
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.sosFloatingButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.sosButtonText}>!</Text>
        <Text style={styles.sosButtonSubtext}>SOS</Text>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          if (!loading) setModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.warningIcon}>⚠️</Text>
            </View>

            <Text style={styles.modalTitle}>Send Emergency Alert?</Text>
            <Text style={styles.modalSubtitle}>
              Your live location will be sent to 3 emergency contacts via SMS.
            </Text>

            {loading ? (
              <ActivityIndicator size="large" color="#DC2626" style={{ marginVertical: 20 }} />
            ) : (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.sendButton]}
                  onPress={handleSendAlert}
                >
                  <Text style={styles.sendButtonText}>Send Alert</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  sosFloatingButton: {
    position: 'absolute',
    bottom: 80, // 👈 Raised above bottom navigation bar so it doesn't overlap Profile/History
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    zIndex: 999,
  },
  sosButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  sosButtonSubtext: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: -2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    elevation: 10,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  warningIcon: {
    fontSize: 28,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#4B5563',
    fontWeight: '600',
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: '#DC2626',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
});