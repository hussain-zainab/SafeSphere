import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ onLoginSuccess }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleContinue = () => {
    if (phone.trim().length < 10) {
      setError('Please enter a valid phone number.');
      return;
    }
    setError(null);
    setLoading(true);

    // NOTE: Real Firebase phone-auth (OTP + reCAPTCHA) requires a native
    // build - it does not work reliably inside Expo Go. This simulates
    // the login flow for demo purposes. Swap this back to real
    // signInWithPhoneNumber() once you build with EAS Build / a dev client.
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess();
    }, 1200);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="shield-checkmark" size={44} color="#6C4CE0" />
      </View>
      <Text style={styles.title}>Welcome to SafeSphere</Text>
      <Text style={styles.subtitle}>Sign in with your phone number</Text>

      <TextInput
        style={styles.input}
        placeholder="Phone number"
        placeholderTextColor="#9CA3AF"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleContinue} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Continue</Text>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#1E1B4B', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 6, marginBottom: 30 },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1E1B4B',
    marginBottom: 12,
  },
  errorText: { color: '#EF4444', fontSize: 13, marginBottom: 12 },
  button: {
    backgroundColor: '#6C4CE0',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});