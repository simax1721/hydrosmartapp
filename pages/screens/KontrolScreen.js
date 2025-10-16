import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { db, ref, set, onValue } from '../../firebase'; // ✅ path sesuaikan

export default function KontrolScreen() {
  const [controls, setControls] = useState({
    // pompaIn: { mode: 'manual', status: false },
    // pompaOut: { mode: 'manual', status: false },
    pompa: { mode: 'manual', status: false },
    lampu: { mode: 'manual', status: false },
    kipas: { mode: 'manual', status: false },
  });

  useEffect(() => {
  const alatList = ['pompa', 'lampu', 'kipas'];

  alatList.forEach((alat) => {
    // 🔹 Mode
    const modeRef = ref(db, `/hydrosmart/control/${alat}Mode`);
    onValue(modeRef, (snapshot) => {
      const value = snapshot.val();
      if (value !== null) {
        setControls((prev) => ({
          ...prev,
          [alat]: {
            ...prev[alat],
            mode: value ? 'otomatis' : 'manual',
          },
        }));
      }
    });

    // 🔹 Status khusus untuk pompa → baca 2 node (In dan Out)
    if (alat === 'pompa') {
      const pompaInRef = ref(db, `/hydrosmart/controlAdvance/pompaInMode`);
      const pompaOutRef = ref(db, `/hydrosmart/controlAdvance/pompaOutMode`);

      const updatePompaStatus = (valIn, valOut) => {
        const isOn = valIn || valOut; // jika salah satu true → dianggap ON
        setControls((prev) => ({
          ...prev,
          pompa: {
            ...prev.pompa,
            status: isOn,
          },
        }));
      };

      let pompaInVal = false;
      let pompaOutVal = false;

      onValue(pompaInRef, (snapshot) => {
        const val = snapshot.val();
        pompaInVal = val ?? false;
        updatePompaStatus(pompaInVal, pompaOutVal);
      });

      onValue(pompaOutRef, (snapshot) => {
        const val = snapshot.val();
        pompaOutVal = val ?? false;
        updatePompaStatus(pompaInVal, pompaOutVal);
      });
    } 
    // 🔹 Status biasa untuk alat lain
    else {
      const statusRef = ref(db, `/hydrosmart/controlAdvance/${alat}Mode`);
      onValue(statusRef, (snapshot) => {
        const value = snapshot.val();
        if (value !== null) {
          setControls((prev) => ({
            ...prev,
            [alat]: {
              ...prev[alat],
              status: value,
            },
          }));
        }
      });
    }
  });
}, []);

  // 🔹 Update Mode ke Firebase
  const changeMode = (key, mode) => {
    setControls({
      ...controls,
      [key]: { ...controls[key], mode },
    });

    set(ref(db, `/hydrosmart/control/${key}Mode`), mode === 'otomatis');
  };

  // 🔹 Toggle Status (hanya jika manual)
  const toggleStatus = (key) => {
    if (controls[key].mode === 'manual') {
      const newStatus = !controls[key].status;

      setControls({
        ...controls,
        [key]: { ...controls[key], status: newStatus },
      });

      set(ref(db, `/hydrosmart/controlAdvance/${key}Mode`), newStatus);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kontrol</Text>

      <View style={styles.grid}>
        {[
          // { key: 'pompaIn', label: 'Pompa Air' },
          // { key: 'pompaOut', label: 'Kipas' }, // ✅ ganti label biar jelas
          { key: 'pompa', label: 'Pompa Air' },
          { key: 'lampu', label: 'Lampu' },
          { key: 'kipas', label: 'Kipas' },
        ].map(({ key, label }) => (
          <View key={key} style={styles.card}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.status}>
              Mode: {controls[key].mode === 'otomatis' ? 'Otomatis' : 'Manual'}
            </Text>
            <Text
              style={[
                styles.status,
                { color: controls[key].status ? '#10b981' : '#ef4444' },
              ]}
            >
              Status: {controls[key].status ? 'ON' : 'OFF'}
            </Text>

            {/* Picker untuk mode */}
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={controls[key].mode}
                onValueChange={(value) => changeMode(key, value)}
                dropdownIconColor="#0f172a"
                mode="dropdown"
              >
                <Picker.Item label="Manual" value="manual" />
                <Picker.Item label="Otomatis" value="otomatis" />
              </Picker>
            </View>

            {/* Tombol ON/OFF jika manual */}
            {controls[key].mode === 'manual' && (
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  { backgroundColor: controls[key].status ? '#10b981' : '#ef4444' },
                ]}
                onPress={() => toggleStatus(key)}
              >
                <Text style={styles.toggleText}>
                  {controls[key].status ? 'ON' : 'OFF'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

        ))}
      </View>
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
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  status: {
    fontSize: 14,
    marginBottom: 8,
    color: '#475569',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    marginBottom: 8,
    overflow: 'hidden',
    width: '100%',
    backgroundColor: '#fff',
  },
  toggleButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
