import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

export default function NotifikasiScreen() {
  // Dummy data, bisa diganti dengan Firebase
  const notifikasi = [
    {
      id: '1',
      waktu: '10:32',
      pesan: 'Suhu melebihi 35°C: 36.5°C',
    },
    {
      id: '2',
      waktu: '10:29',
      pesan: 'pH di bawah batas aman: 4.8',
    },
    {
      id: '3',
      waktu: '10:15',
      pesan: 'Tingkat air sangat rendah: 12%',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifikasi</Text>

      <FlatList
        data={notifikasi}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.time}>⏰ {item.waktu}</Text>
            <Text style={styles.message}>⚠️ {item.pesan}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#0f172a',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff3cd',
    borderLeftWidth: 5,
    borderLeftColor: '#facc15',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 1,
  },
  time: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  message: {
    fontSize: 16,
    color: '#78350f',
    fontWeight: '500',
  },
});
