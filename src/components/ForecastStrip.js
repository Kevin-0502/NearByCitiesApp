import React from 'react';
import { ScrollView, View, Text, Image, StyleSheet } from 'react-native';

const owmIconUrl = (code) => `https://openweathermap.org/img/wn/${code}@2x.png`;

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// Agrupa los bloques de 3h por día y extrae min/max/condición dominante
export const groupForecastByDay = (list) => {
  const map = {};
  list.forEach((entry) => {
    const date = entry.dt_txt.slice(0, 10);
    if (!map[date]) map[date] = [];
    map[date].push(entry);
  });

  return Object.entries(map).map(([date, entries]) => {
    const noon = entries.find((e) => e.dt_txt.includes('12:00:00')) ?? entries[0];
    return {
      date,
      tempMin: Math.round(Math.min(...entries.map((e) => e.main.temp_min))),
      tempMax: Math.round(Math.max(...entries.map((e) => e.main.temp_max))),
      iconCode: noon.weather[0]?.icon ?? null,
      description: noon.weather[0]?.description ?? '',
    };
  });
};

function DayCard({ item, isFirst }) {
  const dayName = isFirst
    ? 'Hoy'
    : DAY_NAMES[new Date(item.date + 'T12:00:00').getDay()];

  return (
    <View style={[styles.card, isFirst && styles.cardFirst]}>
      <Text style={[styles.dayName, isFirst && styles.dayNameFirst]}>{dayName}</Text>
      {item.iconCode ? (
        <Image source={{ uri: owmIconUrl(item.iconCode) }} style={styles.icon} />
      ) : (
        <Text style={styles.iconFallback}>🌡</Text>
      )}
      <Text style={[styles.tempMax, isFirst && styles.tempMaxFirst]}>{item.tempMax}°</Text>
      <Text style={styles.tempMin}>{item.tempMin}°</Text>
    </View>
  );
}

export default function ForecastStrip({ days }) {
  if (!days?.length) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.strip}
    >
      {days.map((item, index) => (
        <DayCard key={item.date} item={item} isFirst={index === 0} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  strip: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    minWidth: 72,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  cardFirst: {
    backgroundColor: '#1a73e8',
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  dayNameFirst: { color: 'rgba(255,255,255,0.85)' },
  icon: { width: 44, height: 44, marginBottom: 2 },
  iconFallback: { fontSize: 26, marginBottom: 6 },
  tempMax: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
    marginBottom: 2,
  },
  tempMaxFirst: { color: '#fff' },
  tempMin: {
    fontSize: 13,
    color: '#aaa',
  },
});
