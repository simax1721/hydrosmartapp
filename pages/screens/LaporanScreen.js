import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function LaporanScreen() {
  // Data dummy, nanti bisa dari Firebase
  const laporan = {
    periode: '22 - 28 Juli 2025',
    suhu: 29.2,
    kelembaban: 72,
    ph: 6.2,
    nutrisi: 1100,
    air: 65,
    penyiraman: 14,
    nutrisiJumlah: 7,
    catatan: [
      'Suhu cukup stabil.',
      'Air sedikit menurun hari Jumat.',
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Laporan Berkala</Text>

      <Text style={styles.periode}>📅 Periode: {laporan.periode}</Text>

      <View style={styles.card}>
        <Text style={styles.item}>🌡️ Suhu rata-rata: {laporan.suhu}°C</Text>
        <Text style={styles.item}>💧 Kelembaban rata-rata: {laporan.kelembaban}%</Text>
        <Text style={styles.item}>⚗️ pH rata-rata: {laporan.ph}</Text>
        <Text style={styles.item}>🧪 Nutrisi rata-rata: {laporan.nutrisi} ppm</Text>
        <Text style={styles.item}>🚰 Tingkat air rata-rata: {laporan.air}%</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.item}>🔁 Penyiraman otomatis: {laporan.penyiraman}x</Text>
        <Text style={styles.item}>🔁 Pemberian nutrisi: {laporan.nutrisiJumlah}x</Text>
      </View>

      <View style={styles.catatanBox}>
        <Text style={styles.catatanTitle}>📝 Catatan:</Text>
        {laporan.catatan.map((note, idx) => (
          <Text key={idx} style={styles.catatan}>• {note}</Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 20,
  },
  periode: {
    fontSize: 14,
    marginBottom: 10,
    color: '#334155',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 15,
    elevation: 1,
  },
  item: {
    fontSize: 16,
    marginBottom: 6,
    color: '#1e293b',
  },
  catatanBox: {
    backgroundColor: '#fff7ed',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f97316',
  },
  catatanTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#92400e',
  },
  catatan: {
    fontSize: 14,
    color: '#78350f',
    marginBottom: 4,
  },
});
