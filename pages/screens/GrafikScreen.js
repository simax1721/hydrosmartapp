import React, { useState, useEffect } from "react";
import { View, Text, Button, Dimensions, ScrollView, ActivityIndicator } from "react-native";
import { LineChart } from "react-native-chart-kit";
import dayjs from "dayjs";
import { db, ref, onValue } from "../../firebase"; // pastikan path benar

export default function GrafikScreen() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil data dari Firebase berdasarkan tanggal
  useEffect(() => {
    const datePrefix = selectedDate.format("YYYY-MM-DD"); // contoh: 2025-10-03
    const historyRef = ref(db, "hydrosmart/history");

    const unsubscribe = onValue(historyRef, (snapshot) => {
      if (snapshot.exists()) {
        const raw = snapshot.val();

        // Filter hanya data dengan prefix tanggal terpilih
        const filtered = Object.keys(raw)
          .filter((key) => key.startsWith(datePrefix)) // contoh: "2025-10-03_08"
          .map((key) => {
            const sensor = raw[key];
            return {
              time: dayjs(sensor.time, "YYYY-MM-DD HH:mm:ss").toDate(),
              cahaya: parseFloat(sensor.cahaya) || 0,
              kelembabanudara: parseFloat(sensor.kelembabanudara) || 0,
              phair: parseFloat(sensor.phair) || 0,
              ppm: parseFloat(sensor.ppm) || 0,
              suhuair: parseFloat(sensor.suhuair) || 0,
              suhuudara: parseFloat(sensor.suhuudara) || 0,
            };
          });

        // Urutkan berdasarkan waktu
        filtered.sort((a, b) => a.time - b.time);

        setHistoryData(filtered);
      } else {
        setHistoryData([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedDate]);

  // Labels untuk chart
  const labels = historyData.map((d) => dayjs(d.time).format("HH:mm"));

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    propsForDots: { r: "4", strokeWidth: "2", stroke: "#333" },
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: "#fff" }}>
      {/* Header Tanggal */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
        <Button title="← Sebelumnya" onPress={() => setSelectedDate((prev) => prev.subtract(1, "day"))} />
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>{selectedDate.format("DD MMMM YYYY")}</Text>
        <Button
          title="Berikutnya →"
          onPress={() => setSelectedDate((prev) => prev.add(1, "day"))}
          disabled={selectedDate.isSame(dayjs(), "day")}
        />
      </View>

      {historyData.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 20 }}>📭 Tidak ada data untuk tanggal ini</Text>
      ) : (
        <>
          {/* Suhu Udara */}
          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 4 }}>🌡️ Suhu Udara (°C)</Text>
          <LineChart
            data={{ labels, datasets: [{ data: historyData.map((d) => d.suhuudara) }] }}
            width={Dimensions.get("window").width - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={{ marginBottom: 24, borderRadius: 8 }}
          />

          {/* Kelembaban Udara */}
          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 4 }}>💧 Kelembaban Udara (%)</Text>
          <LineChart
            data={{ labels, datasets: [{ data: historyData.map((d) => d.kelembabanudara) }] }}
            width={Dimensions.get("window").width - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={{ marginBottom: 24, borderRadius: 8 }}
          />

          {/* Intensitas Cahaya */}
          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 4 }}>💡 Intensitas Cahaya (lux)</Text>
          <LineChart
            data={{ labels, datasets: [{ data: historyData.map((d) => d.cahaya) }] }}
            width={Dimensions.get("window").width - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={{ marginBottom: 24, borderRadius: 8 }}
          />

          {/* Suhu Air */}
          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 4 }}>💦 Suhu Air (°C)</Text>
          <LineChart
            data={{ labels, datasets: [{ data: historyData.map((d) => d.suhuair) }] }}
            width={Dimensions.get("window").width - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={{ marginBottom: 24, borderRadius: 8 }}
          />

          {/* Nutrisi */}
          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 4 }}>🧪 Nutrisi (TDS ppm)</Text>
          <LineChart
            data={{ labels, datasets: [{ data: historyData.map((d) => d.ppm) }] }}
            width={Dimensions.get("window").width - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={{ marginBottom: 24, borderRadius: 8 }}
          />

          {/* pH Air */}
          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 4 }}>⚗️ pH Air</Text>
          <LineChart
            data={{ labels, datasets: [{ data: historyData.map((d) => d.phair) }] }}
            width={Dimensions.get("window").width - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={{ marginBottom: 24, borderRadius: 8 }}
          />
        </>
      )}
    </ScrollView>
  );
}
