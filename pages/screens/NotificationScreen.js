import React, { useEffect, useState, useRef } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { db, ref, onValue, push, set } from "../../firebase"; // ✅ sesuaikan path firebase.js

export default function NotifikasiScreen() {
  const [notifikasi, setNotifikasi] = useState([]);
  const lastNotifiedRef = useRef({}); // untuk mencegah spam notifikasi

  useEffect(() => {
    const sensorRef = ref(db, "/hydrosmart/sensor");

    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      // panggil fungsi cek sensor
      checkSensor("suhuudara", data.suhuudara, (v) => v >= 35, "Suhu udara panas: " + data.suhuudara + "°C");
      checkSensor("suhuair", data.suhuair, (v) => v >= 32, "Suhu air terlalu tinggi: " + data.suhuair + "°C");
      checkSensor("kelembabanudara", data.kelembabanudara, (v) => v < 40, "Kelembaban udara rendah: " + data.kelembabanudara + "%");
      checkSensor("phair", data.phair, (v) => v < 5.5 || v > 7.5, "pH air tidak stabil: " + data.phair);
      checkSensor("ppm", data.ppm, (v) => v < 150 || v > 300, "Konsentrasi nutrisi (PPM) tidak normal: " + data.ppm);
      checkSensor("cahaya", data.cahaya, (v) => v < 10, "Cahaya terlalu rendah: " + data.cahaya);
    });

    return () => unsubscribe();
  }, []);

  const checkSensor = (key, value, conditionFn, message) => {
    const now = new Date();
    const timeKey = now.toLocaleString("id-ID");

    if (conditionFn(value)) {
      if (!lastNotifiedRef.current[key]) {
        const newNotif = {
          waktu: timeKey,
          pesan: message,
          sensor: key,
        };

        // Tambah ke state (tampil di layar)
        setNotifikasi((prev) => [newNotif, ...prev]);

        // Simpan ke Firebase historyNotifikasi
        const notifRef = push(ref(db, "/hydrosmart/notifikasi"));
        set(notifRef, newNotif);

        // Tandai agar tidak spam
        lastNotifiedRef.current[key] = true;
      }
    } else {
      // reset jika sensor kembali normal
      lastNotifiedRef.current[key] = false;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifikasi Sensor</Text>

      {notifikasi.length === 0 ? (
        <Text style={styles.empty}>Belum ada notifikasi</Text>
      ) : (
        <FlatList
          data={notifikasi}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.time}>⏰ {item.waktu}</Text>
              <Text style={styles.message}>⚠️ {item.pesan}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#0f172a",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff3cd",
    borderLeftWidth: 5,
    borderLeftColor: "#facc15",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 1,
  },
  time: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  message: {
    fontSize: 16,
    color: "#78350f",
    fontWeight: "500",
  },
  empty: {
    textAlign: "center",
    color: "#94a3b8",
  },
});
