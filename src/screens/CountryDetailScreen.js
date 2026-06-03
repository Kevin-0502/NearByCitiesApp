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
  Image,
} from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import WeatherCard from '../components/WeatherCard';
import LoadingView from '../components/LoadingView';
import ErrorView from '../components/ErrorView';
import { fetchWeatherByCity } from '../services/weatherService';

export default function CountryDetailScreen({ route }) {
  const { country } = route.params ?? {};

  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(null);

  const name = country?.name?.common;
  const officialName = country?.name?.official;
  const capital = country?.capital?.[0];
  const latlng = country?.capitalInfo?.latlng;
  const hasCoords =
    Array.isArray(latlng) &&
    latlng.length === 2 &&
    latlng[0] !== undefined &&
    latlng[1] !== undefined;
  const lat = hasCoords ? latlng[0] : null;
  const lng = hasCoords ? latlng[1] : null;
  const flagUri = country?.flags?.png;

  // Monedas: { USD: { name, symbol }, EUR: { name, symbol } }
  const currencies = country?.currencies
    ? Object.values(country.currencies).filter(Boolean)
    : [];

  // Idiomas: { eng: "English", fra: "French" }
  const languages = country?.languages
    ? Object.values(country.languages).filter(Boolean)
    : [];

  const loadWeather = async () => {
    if (!capital) {
      setWeatherError('Este país no tiene capital registrada');
      setWeatherLoading(false);
      return;
    }
    try {
      setWeatherError(null);
      setWeatherLoading(true);
      const data = await fetchWeatherByCity(capital);
      setWeather(data);
    } catch (err) {
      setWeatherError(err.message ?? 'No se pudo obtener el clima');
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    loadWeather();
  }, [capital]);

  const openInMaps = () => {
    if (!hasCoords) {
      Alert.alert(
        'Sin coordenadas',
        'No hay coordenadas disponibles para esta capital.'
      );
      return;
    }
    const label = encodeURIComponent(capital ?? 'Capital');
    // geo: URI abre la app de mapas predeterminada del dispositivo (sin API key)
    const geoUrl = Platform.select({
      ios: `maps:${lat},${lng}?q=${label}@${lat},${lng}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}(${label})`,
    });
    // Fallback a OpenStreetMap en el navegador (gratuito, sin API key)
    const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=12&layers=M`;

    Linking.canOpenURL(geoUrl).then((supported) => {
      Linking.openURL(supported ? geoUrl : osmUrl).catch(() => {
        Alert.alert('Error', 'No se pudo abrir la aplicación de mapas');
      });
    });
  };

  if (!country) {
    return <ErrorView message="No se recibió información del país" />;
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {/* Header con bandera */}
      <View style={styles.header}>
        {flagUri && (
          <Image
            source={{ uri: flagUri }}
            style={styles.flag}
            resizeMode="cover"
          />
        )}
        <Text style={styles.countryName}>{name ?? 'País desconocido'}</Text>
        {officialName && officialName !== name && (
          <Text style={styles.officialName}>{officialName}</Text>
        )}
        <View style={styles.capitalBadge}>
          <Text style={styles.capitalBadgeText}>
            🏙 Capital: {capital ?? 'Sin capital'}
          </Text>
        </View>
      </View>

      {/* Mapa */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Ubicación de la Capital</Text>
        {hasCoords ? (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              mapType="none"
              initialRegion={{
                latitude: lat,
                longitude: lng,
                latitudeDelta: 4,
                longitudeDelta: 4,
              }}
            >
              {/* Tiles de OpenStreetMap — sin API key */}
              <UrlTile
                urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                maximumZ={19}
                flipY={false}
              />
              <Marker
                coordinate={{ latitude: lat, longitude: lng }}
                title={capital}
                description={`Capital de ${name}`}
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
            <Text style={styles.noDataIcon}>🗺</Text>
            <Text style={styles.noDataText}>
              No hay coordenadas disponibles para esta capital
            </Text>
          </View>
        )}
      </View>

      {/* Monedas e Idiomas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ Información General</Text>
        <View style={styles.infoCard}>
          {/* Monedas */}
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>💰</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                {currencies.length > 1 ? 'Monedas' : 'Moneda'}
              </Text>
              {currencies.length > 0 ? (
                currencies.map((c, i) => (
                  <Text key={i} style={styles.infoValue}>
                    {c.name ?? 'Desconocida'}
                    {c.symbol ? ` (${c.symbol})` : ''}
                  </Text>
                ))
              ) : (
                <Text style={styles.infoValueEmpty}>Sin información</Text>
              )}
            </View>
          </View>

          <View style={styles.infoSeparator} />

          {/* Idiomas */}
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🗣</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                {languages.length > 1 ? 'Idiomas' : 'Idioma'}
              </Text>
              {languages.length > 0 ? (
                languages.map((lang, i) => (
                  <Text key={i} style={styles.infoValue}>{lang}</Text>
                ))
              ) : (
                <Text style={styles.infoValueEmpty}>Sin información</Text>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Clima */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          🌤 Clima Actual — {capital ?? 'Sin capital'}
        </Text>
        {weatherLoading ? (
          <View style={styles.inlineLoader}>
            <LoadingView message="Obteniendo datos del clima..." />
          </View>
        ) : weatherError ? (
          <View style={styles.weatherErrorCard}>
            <Text style={styles.weatherErrorIcon}>⚠️</Text>
            <Text style={styles.weatherErrorTitle}>Clima no disponible</Text>
            <Text style={styles.weatherErrorText}>{weatherError}</Text>
            {capital && (
              <TouchableOpacity style={styles.retryButton} onPress={loadWeather}>
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : weather ? (
          <WeatherCard weather={weather} />
        ) : null}
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  content: { flexGrow: 1 },

  /* Header */
  header: {
    backgroundColor: '#1a73e8',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
  },
  flag: {
    width: 120,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: 14,
  },
  countryName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  officialName: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  capitalBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 6,
  },
  capitalBadgeText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

  /* Sections */
  section: { marginTop: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#444',
    marginHorizontal: 16,
    marginBottom: 10,
  },

  /* Map */
  mapContainer: { marginHorizontal: 16 },
  map: {
    height: 260,
    borderRadius: 14,
    overflow: 'hidden',
  },
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
  mapsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a73e8',
  },

  /* No data state */
  noDataCard: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
  },
  noDataIcon: { fontSize: 40, marginBottom: 10 },
  noDataText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  /* Weather states */
  inlineLoader: { height: 160 },
  weatherErrorCard: {
    marginHorizontal: 16,
    backgroundColor: '#fff8e1',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
  },
  weatherErrorIcon: { fontSize: 36, marginBottom: 8 },
  weatherErrorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e65100',
    marginBottom: 6,
  },
  weatherErrorText: {
    color: '#795548',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 14,
    backgroundColor: '#1a73e8',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },

  bottomSpacer: { height: 40 },

  /* Info card (monedas + idiomas) */
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoIcon: { fontSize: 24, marginRight: 14, marginTop: 2 },
  infoContent: { flex: 1 },
  infoLabel: {
    fontSize: 12,
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValueEmpty: {
    fontSize: 14,
    color: '#bbb',
    fontStyle: 'italic',
  },
  infoSeparator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 16,
  },
});
