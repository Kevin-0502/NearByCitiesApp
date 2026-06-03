import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import WeatherCard from '../components/WeatherCard';
import ForecastStrip, { groupForecastByDay } from '../components/ForecastStrip';
import LoadingView from '../components/LoadingView';
import ErrorView from '../components/ErrorView';
import { fetchCityForecast } from '../services/nearbyService';

const countryFlag = (code) =>
  code
    ?.toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0))) ?? '🏳';

export default function CityDetailScreen({ route }) {
  const { city } = route.params ?? {};

  const [forecastDays, setForecastDays] = useState([]);
  const [forecastLoading, setForecastLoading] = useState(true);
  const [forecastError, setForecastError] = useState(null);

  const lat = city?.coord?.lat;
  const lon = city?.coord?.lon;
  const hasCoords = lat !== undefined && lon !== undefined;
  const country = city?.sys?.country ?? '—';

  useEffect(() => {
    if (!hasCoords) {
      setForecastLoading(false);
      return;
    }
    fetchCityForecast(lat, lon)
      .then((list) => setForecastDays(groupForecastByDay(list)))
      .catch((err) => setForecastError(err.message ?? 'Error al obtener el pronóstico'))
      .finally(() => setForecastLoading(false));
  }, [lat, lon]);

  if (!city) {
    return <ErrorView message="No se recibió información de la ciudad" />;
  }

  const openInMaps = () => {
    if (!hasCoords) {
      Alert.alert('Sin coordenadas', 'No hay coordenadas disponibles para esta ciudad.');
      return;
    }
    const label = encodeURIComponent(city.name ?? 'Ciudad');
    const geoUrl = Platform.select({
      ios: `maps:${lat},${lon}?q=${label}@${lat},${lon}`,
      android: `geo:${lat},${lon}?q=${lat},${lon}(${label})`,
    });
    const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}&zoom=12&layers=M`;

    Linking.canOpenURL(geoUrl).then((supported) => {
      Linking.openURL(supported ? geoUrl : osmUrl).catch(() => {
        Alert.alert('Error', 'No se pudo abrir la aplicación de mapas');
      });
    });
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.flag}>{countryFlag(country)}</Text>
        <Text style={styles.cityName}>{city.name ?? 'Ciudad desconocida'}</Text>
        <Text style={styles.countryName}>{country}</Text>
        {hasCoords && (
          <Text style={styles.coords}>
            {lat.toFixed(4)}, {lon.toFixed(4)}
          </Text>
        )}
      </View>

      {/* Mapa */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Ubicación</Text>
        {hasCoords ? (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: lat,
                longitude: lon,
                latitudeDelta: 0.5,
                longitudeDelta: 0.5,
              }}
            >
              <Marker
                coordinate={{ latitude: lat, longitude: lon }}
                title={city.name}
                description={country}
              />
            </MapView>
            <TouchableOpacity
              style={styles.mapsButton}
              onPress={openInMaps}
              activeOpacity={0.8}
            >
              <Text style={styles.mapsButtonText}>🗺 Ver en el mapa</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.noDataCard}>
            <Text style={styles.noDataText}>Sin coordenadas disponibles</Text>
          </View>
        )}
      </View>

      {/* Clima actual */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌤 Clima Actual</Text>
        <WeatherCard weather={city} />
      </View>

      {/* Pronóstico 5 días */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 Próximos 5 Días</Text>
        {forecastLoading ? (
          <View style={styles.forecastLoader}>
            <LoadingView message="Cargando pronóstico..." />
          </View>
        ) : forecastError ? (
          <View style={styles.forecastErrorCard}>
            <Text style={styles.forecastErrorText}>⚠️ {forecastError}</Text>
          </View>
        ) : (
          <ForecastStrip days={forecastDays} />
        )}
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  content: { flexGrow: 1 },

  header: {
    backgroundColor: '#1a73e8',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 28,
  },
  flag: { fontSize: 56, marginBottom: 10 },
  cityName: { fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  countryName: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  coords: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
    fontFamily: 'monospace',
  },

  section: { marginTop: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#444',
    marginHorizontal: 16,
    marginBottom: 10,
  },

  mapContainer: { marginHorizontal: 16 },
  map: { height: 240, borderRadius: 14, overflow: 'hidden' },
  mapsButton: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  mapsButtonText: { fontSize: 16, fontWeight: '600', color: '#1a73e8' },

  noDataCard: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
  },
  noDataText: { color: '#999', fontSize: 14 },

  forecastLoader: { height: 110 },
  forecastErrorCard: {
    marginHorizontal: 16,
    backgroundColor: '#fff8e1',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  forecastErrorText: { color: '#795548', fontSize: 14 },

  bottomSpacer: { height: 40 },
});
