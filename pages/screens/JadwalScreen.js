import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function JadwalScreen() {
  const [jadwalList, setJadwalList] = useState([
    { id: '1', hari: 'Senin', jam: '07:00', aksi: 'Penyiraman' },
    { id: '2', hari: 'Rabu', jam: '18:00', aksi: 'Nutrisi' },
  ]);

  const [hari, setHari] = useState('Senin');
  const [jam, setJam] = useState('');
  const [aksi, setAksi] = useState('Penyiraman');

  const tambahJadwal = () => {
    if (jam.trim() === '') return;
    const newItem = {
      id: Date.now().toString(),
      hari,
      jam,
      aksi,
    };
    setJadwalList([newItem, ...jadwalList]);
    setJam('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jadwal Penyiraman & Nutrisi</Text>

      <Text style={styles.subTitle}>🗓️ Tambah Jadwal Baru</Text>

      <View style={styles.form}>
        <TextInput
          placeholder="Jam (contoh: 07:00)"
          value={jam}
          onChangeText={setJam}
          style={styles.input}
        />

        <View style={styles.pickerBox}>
          <Picker selectedValue={hari} onValueChange={setHari}>
            {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((day) => (
              <Picker.Item key={day} label={day} value={day} />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerBox}>
          <Picker selectedValue={aksi} onValueChange={setAksi}>
            <Picker.Item label="Penyiraman" value="Penyiraman" />
            <Picker.Item label="Nutrisi" value="Nutrisi" />
          </Picker>
        </View>

        <TouchableOpacity style={styles.btnAdd} onPress={tambahJadwal}>
          <Text style={styles.btnText}>Tambahkan</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subTitle}>📋 Jadwal Aktif</Text>
      <FlatList
        data={jadwalList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>
              ✔️ {item.hari} - {item.jam} - {item.aksi}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#0f172a',
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 10,
    color: '#334155',
  },
  form: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    marginBottom: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  btnAdd: {
    backgroundColor: '#10b981',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  item: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  itemText: {
    color: '#92400e',
  },
});
