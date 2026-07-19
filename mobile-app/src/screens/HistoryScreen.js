import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FILTERS = ['All', 'SOS', 'Reports', 'Routes'];

// Placeholder data - will come from getReports() / SOS log API later
const HISTORY_DATA = [
  {
    id: '1',
    type: 'SOS',
    title: 'SOS Alert Sent',
    subtitle: 'Connaught Place • 3 contacts notified',
    time: '2 days ago',
    icon: 'alert',
    color: '#EF4444',
  },
  {
    id: '2',
    type: 'Reports',
    title: 'Eve Teasing / Harassment reported',
    subtitle: 'Near Rajiv Chowk Metro Station',
    time: '4 days ago',
    icon: 'flag',
    color: '#F59E0B',
  },
  {
    id: '3',
    type: 'Routes',
    title: 'Safe route to Hauz Khas',
    subtitle: 'Chosen over 6 min faster route',
    time: '5 days ago',
    icon: 'navigate',
    color: '#6C4CE0',
  },
  {
    id: '4',
    type: 'Reports',
    title: 'Poor lighting reported',
    subtitle: 'Lajpat Nagar Market area',
    time: '1 week ago',
    icon: 'flag',
    color: '#F59E0B',
  },
];

export default function HistoryScreen() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredData =
    activeFilter === 'All'
      ? HISTORY_DATA
      : HISTORY_DATA.filter((item) => item.type === activeFilter);

  return (
    <View style={styles.container}>
      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterChip,
              activeFilter === filter && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter && styles.filterTextActive,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No history in this category yet.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <View style={[styles.iconCircle, { backgroundColor: item.color + '22' }]}>
              <Ionicons name={item.icon} size={20} color={item.color} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            </View>
            <Text style={styles.cardTime}>{item.time}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },

  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#6C4CE0',
    borderColor: '#6C4CE0',
  },
  filterText: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  filterTextActive: { color: '#fff' },

  listContent: { padding: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { flex: 1, marginLeft: 12 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#1E1B4B' },
  cardSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  cardTime: { fontSize: 11, color: '#9CA3AF' },

  emptyText: { textAlign: 'center', color: '#9CA3AF', marginTop: 40, fontSize: 14 },
});