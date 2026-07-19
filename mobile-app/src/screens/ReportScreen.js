import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const CRIME_TYPES = [
  'Eve Teasing / Harassment',
  'Theft',
  'Assault',
  'Molestation',
  'Sexual Harassment',
  'Domestic Violence',
  'Kidnapping / Abduction',
  'Chain / Purse Snatching',
];

export default function ReportScreen() {
  const [selectedType, setSelectedType] = useState(null);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo access to attach an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
    });
    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (!selectedType) {
      Alert.alert('Missing info', 'Please select a crime type.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Missing info', 'Please add a short description.');
      return;
    }
    // Placeholder - will call submitReport() from services/api.js later
    Alert.alert('Report submitted', 'Thank you for helping keep the community safe.');
    setSelectedType(null);
    setDescription('');
    setPhoto(null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Report an Incident</Text>
      <Text style={styles.subtitle}>
        Your report helps improve safety predictions for everyone nearby.
      </Text>

      {/* Crime type dropdown */}
      <Text style={styles.label}>Category</Text>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setDropdownOpen(!dropdownOpen)}
      >
        <Text style={selectedType ? styles.dropdownText : styles.dropdownPlaceholder}>
          {selectedType || 'Select category'}
        </Text>
        <Ionicons name={dropdownOpen ? 'chevron-up' : 'chevron-down'} size={20} color="#6B7280" />
      </TouchableOpacity>

      {dropdownOpen && (
        <View style={styles.dropdownList}>
          {CRIME_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={styles.dropdownItem}
              onPress={() => {
                setSelectedType(type);
                setDropdownOpen(false);
              }}
            >
              <Text style={styles.dropdownItemText}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Description */}
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Briefly describe what happened..."
        placeholderTextColor="#9CA3AF"
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />

      {/* Photo upload */}
      <Text style={styles.label}>Photo (optional)</Text>
      <TouchableOpacity style={styles.photoBox} onPress={pickImage}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.photoPreview} />
        ) : (
          <>
            <Ionicons name="camera-outline" size={28} color="#818CF8" />
            <Text style={styles.photoText}>Tap to add a photo</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Location note */}
      <View style={styles.locationRow}>
        <Ionicons name="location" size={16} color="#6C4CE0" />
        <Text style={styles.locationText}>Current location will be attached automatically</Text>
      </View>

      {/* Submit */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit Report</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#1E1B4B' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, marginBottom: 24 },

  label: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 8, marginTop: 4 },

  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 6,
  },
  dropdownText: { color: '#1E1B4B', fontSize: 14, fontWeight: '600' },
  dropdownPlaceholder: { color: '#9CA3AF', fontSize: 14 },
  dropdownList: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemText: { fontSize: 14, color: '#374151' },

  textArea: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 14,
    color: '#1E1B4B',
    textAlignVertical: 'top',
    minHeight: 100,
    marginBottom: 20,
  },

  photoBox: {
    height: 130,
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  photoText: { color: '#818CF8', fontSize: 13, marginTop: 6, fontWeight: '500' },
  photoPreview: { width: '100%', height: '100%' },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  locationText: { marginLeft: 6, fontSize: 12, color: '#6B7280' },

  submitButton: {
    backgroundColor: '#6C4CE0',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#6C4CE0',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});