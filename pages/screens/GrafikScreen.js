import React from 'react';
import { View, Text, Dimensions, ScrollView, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function GrafikScreen() {
  // Contoh data dummy (nanti bisa dari Firebase)
  const labels = ['08:00', '09:00', '10:00', '11:00', '12:00'];
  const suhuData = [28.1, 28.5, 29.2, 30.1, 29.6];
  const kelembabanData = [70, 72, 71, 73, 74];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Grafik Monitoring</Text>

      <Text style={styles.chartTitle}>🌡️ Suhu (°C)</Text>
      <LineChart
        data={{
          labels,
          datasets: [{ data: suhuData }],
        }}
        width={screenWidth - 32}
        height={220}
        yAxisSuffix="°C"
        chartConfig={chartConfig}
        style={styles.chart}
      />

      <Text style={styles.chartTitle}>💧 Kelembaban (%)</Text>
      <LineChart
        data={{
          labels,
          datasets: [{ data: kelembabanData }],
        }}
        width={screenWidth - 32}
        height={220}
        yAxisSuffix="%"
        chartConfig={chartConfig}
        style={styles.chart}
      />

      {/* Tambahkan grafik lainnya seperti pH, nutrisi, tingkat air */}
    </ScrollView>
  );
}

const chartConfig = {
  backgroundColor: '#fff',
  backgroundGradientFrom: '#f1f5f9',
  backgroundGradientTo: '#f1f5f9',
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(14, 116, 144, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(30, 41, 59, ${opacity})`,
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: '#0ea5e9',
  },
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f1f5f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#0f172a',
  },
  chartTitle: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  chart: {
    borderRadius: 12,
  },
});
