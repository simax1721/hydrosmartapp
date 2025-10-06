import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { ref, onValue } from "firebase/database";
import { db } from "../../firebase";

export default function MonitoringScreen() {
  const [data, setData] = useState({
    suhuUdara: "--",
    kelembapanUdara: "--",
    cahaya: "--",
    suhuAir: "--",
    ppm: "--",
    phair: "--",
    updatedAt: "--",
  });

  useEffect(() => {
    const sensorRef = ref(db, "hydrosmart/sensor");
    onValue(sensorRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        setData({
          suhuUdara: val.suhuudara ? Number(val.suhuudara).toFixed(2) : "--",
          kelembapanUdara: val.kelembabanudara ? Number(val.kelembabanudara).toFixed(2) : "--",
          cahaya: val.cahaya ? Number(val.cahaya).toFixed(2) : "--",
          suhuAir: val.suhuair ? Number(val.suhuair).toFixed(2) : "--",
          ppm: val.ppm ? Number(val.ppm).toFixed(2) : "--",
          phair: val.phair ? Number(val.phair).toFixed(2) : "--",
          updatedAt: new Date().toLocaleTimeString("id-ID"),
        });
      }
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Monitoring</Text>

      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.label}>🌡️ Suhu Udara</Text>
          <Text style={styles.value}>{data.suhuUdara} °C</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>💧 Kelembaban Udara</Text>
          <Text style={styles.value}>{data.kelembapanUdara} %</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>💡 Intensitas Cahaya</Text>
          <Text style={styles.value}>{data.cahaya} lux</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>💦 Suhu Air</Text>
          <Text style={styles.value}>{data.suhuAir} °C</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>🧪 Nutrisi (TDS)</Text>
          <Text style={styles.value}>{data.ppm} ppm</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>⚗️ PH Air</Text>
          <Text style={styles.value}>{data.phair}</Text>
        </View>
      </View>

      <Text style={styles.update}>
        Terakhir diperbarui: {data.updatedAt}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#0f172a",
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  label: {
    fontSize: 14,
    color: "#334155",
  },
  value: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  update: {
    marginTop: 15,
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },
});
