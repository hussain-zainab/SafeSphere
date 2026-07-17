import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ReportScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Community Report</Text>
      <Text style={styles.subtitle}>Incident report form will go here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '600' },
  subtitle: { color: '#888', marginTop: 6 },
});