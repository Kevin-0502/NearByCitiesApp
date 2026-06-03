import React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';

const owmIconUrl = (code) => `https://openweathermap.org/img/wn/${code}@2x.png`;

const countryFlag = (code) =>
  code
    ?.toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0))) ?? '🏳';

export default function CityCard({ city, distance, onPress }) {
  const iconCode = city.weather?.[0]?.icon;
  const temp = city.main?.temp !== undefined ? `${Math.round(city.main.temp)}°C` : '—';
  const description = city.weather?.[0]?.description;
  const country = city.sys?.country;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <Text style={styles.flag}>{countryFlag(country)}</Text>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{city.name}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {country}  ·  📍 {distance}
        </Text>
        {description ? (
          <Text style={styles.description} numberOfLines={1}>
            {description.charAt(0).toUpperCase() + description.slice(1)}
          </Text>
        ) : null}
      </View>
      <View style={styles.weather}>
        {iconCode ? (
          <Image source={{ uri: owmIconUrl(iconCode) }} style={styles.weatherIcon} />
        ) : (
          <Text style={styles.weatherIconFallback}>🌡</Text>
        )}
        <Text style={styles.temp}>{temp}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 5,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  flag: { fontSize: 30, marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: '#222', marginBottom: 2 },
  meta: { fontSize: 12, color: '#999', marginBottom: 2 },
  description: { fontSize: 13, color: '#666' },
  weather: { alignItems: 'center', marginRight: 8 },
  weatherIcon: { width: 44, height: 44 },
  weatherIconFallback: { fontSize: 26 },
  temp: { fontSize: 14, fontWeight: '700', color: '#1a73e8', marginTop: 2 },
  arrow: { fontSize: 22, color: '#ccc' },
});
