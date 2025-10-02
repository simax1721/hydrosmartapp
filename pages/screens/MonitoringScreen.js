import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { ref, onValue } from "firebase/database";
import { db } from "../../firebase"; // perbaikan path

export default function MonitoringScreen() {
  const [data, setData] = useState({
    suhu: "--",
    kelembapan: "--",
    ph: "--",
    nutrisi: "--",
    air: "--",
    updatedAt: "--"
  });

  useEffect(() => {
    const sensorRef = ref(db, "hydrosmart/sensor");
    onValue(sensorRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        setData({
          suhu: val.suhu ?? "--",
          kelembapan: val.kelembapan ?? "--",
          ph: "--",       // placeholder
          nutrisi: val.tds ?? "--",  // placeholder
          air: "--",      // placeholder
          updatedAt: new Date().toLocaleTimeString("id-ID")
        });
      }
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Monitoring</Text>

      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.label}>🌡️ Suhu</Text>
          <Text style={styles.value}>{data.suhu} °C</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>💧 Kelembaban</Text>
          <Text style={styles.value}>{data.kelembapan} %</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>⚗️ pH Air</Text>
          <Text style={styles.value}>{data.ph}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>🧪 Nutrisi</Text>
          <Text style={styles.value}>{data.nutrisi} ppm</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>🚰 Tingkat Air</Text>
          <Text style={styles.value}>{data.air}</Text>
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
