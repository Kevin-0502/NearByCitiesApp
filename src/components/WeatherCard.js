import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const owmIconUrl = (code) => `https://openweathermap.org/img/wn/${code}@2x.png`;

function StatItem({ icon, label, value }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export default function WeatherCard({ weather }) {
  const temp = weather.main?.temp;
  const feelsLike = weather.main?.feels_like;
  const humidity = weather.main?.humidity;
  const windSpeed = weather.wind?.speed;
  const description = weather.weather?.[0]?.description;
  const iconCode = weather.weather?.[0]?.icon;

  const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : 'Sin descripción';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {iconCode ? (
          <Image source={{ uri: owmIconUrl(iconCode) }} style={styles.mainIcon} />
        ) : (
          <Text style={styles.mainIconFallback}>🌡</Text>
        )}
        <View style={styles.headerText}>
          <Text style={styles.temp}>
            {temp !== undefined ? `${Math.round(temp)}°C` : 'N/A'}
          </Text>
          <Text style={styles.description}>{capitalize(description)}</Text>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.statsRow}>
        <StatItem
          icon="🌡"
          label="Sensación"
          value={feelsLike !== undefined ? `${Math.round(feelsLike)}°C` : 'N/A'}
        />
        <View style={styles.statDivider} />
        <StatItem
          icon="💧"
          label="Humedad"
          value={humidity !== undefined ? `${humidity}%` : 'N/A'}
        />
        <View style={styles.statDivider} />
        <StatItem
          icon="💨"
          label="Viento"
          value={windSpeed !== undefined ? `${windSpeed} m/s` : 'N/A'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 16,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  mainIcon: { width: 72, height: 72, marginRight: 8 },
  mainIconFallback: { fontSize: 52, marginRight: 16 },
  headerText: { flex: 1 },
  temp: { fontSize: 38, fontWeight: 'bold', color: '#1a73e8' },
  description: { fontSize: 16, color: '#555', marginTop: 2, textTransform: 'capitalize' },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginBottom: 14,
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', flex: 1 },
  statIcon: { fontSize: 24, marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#aaa', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { fontSize: 15, fontWeight: '600', color: '#333' },
  statDivider: { width: 1, backgroundColor: '#f0f0f0' },
});
