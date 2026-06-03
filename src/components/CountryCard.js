import React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';

export default function CountryCard({ country, onPress }) {
  const name = country.name?.common ?? 'Sin nombre';
  const capital = country.capital?.[0] ?? 'Sin capital';
  const flagUri = country.flags?.png;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      {flagUri ? (
        <Image source={{ uri: flagUri }} style={styles.flag} resizeMode="cover" />
      ) : (
        <View style={[styles.flag, styles.flagPlaceholder]}>
          <Text style={styles.flagPlaceholderText}>🏳</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.capital} numberOfLines={1}>🏙 {capital}</Text>
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
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  flag: {
    width: 64,
    height: 42,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  flagPlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flagPlaceholderText: { fontSize: 22 },
  info: { flex: 1, marginLeft: 13 },
  name: { fontSize: 16, fontWeight: '600', color: '#222' },
  capital: { fontSize: 13, color: '#888', marginTop: 3 },
  arrow: { fontSize: 24, color: '#ccc', marginLeft: 8 },
});
