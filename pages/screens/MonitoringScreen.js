import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MonitoringScreen() {
  const data = [
    { label: '🌡️ Suhu', value: '29.5°C' },
    { label: '💧 Kelembaban', value: '72%' },
    { label: '⚗️ pH Air', value: '6.3' },
    { label: '🧪 Nutrisi', value: '1100 ppm' },
    { label: '🚰 Tingkat Air', value: '85%' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Monitoring</Text>

      <View style={styles.grid}>
        {data.map((item, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.value}>{item.value}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.update}>Terakhir diperbarui: 10:32:21 WIB</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#0f172a',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  label: {
    fontSize: 14,
    color: '#334155',
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  update: {
    marginTop: 15,
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
});
