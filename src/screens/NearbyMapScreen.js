import React, { useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useNearby } from '../context/NearbyContext';
import LoadingView from '../components/LoadingView';
import NoInternetView from '../components/NoInternetView';
import NoLocationView from '../components/NoLocationView';
import ErrorView from '../components/ErrorView';

const owmIconUrl = (code) =>
  `https://openweathermap.org/img/wn/${code}@2x.png`;

const countryFlag = (code) =>
  code?.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0))) ?? '🏳';

function CityPreviewCard({ city, onClose, onNavigate }) {
  const iconCode = city.weather?.[0]?.icon;
  const iconUri = iconCode ? owmIconUrl(iconCode) : null;
  const temp = city.main?.temp !== undefined ? `${Math.round(city.main.temp)}°C` : '—';
  const description = city.weather?.[0]?.description ?? '';
  const flag = countryFlag(city.sys?.country);

  return (
    <View style={styles.previewCard}>
      <TouchableOpacity style={styles.previewClose} onPress={onClose} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
        <Text style={styles.previewCloseText}>✕</Text>
      </TouchableOpacity>
      <View style={styles.previewContent}>
        <Text style={styles.previewFlag}>{flag}</Text>
        <View style={styles.previewInfo}>
          <Text style={styles.previewName} numberOfLines={1}>{city.name}</Text>
          <View style={styles.previewMetaRow}>
            {iconUri && <Image source={{ uri: iconUri }} style={styles.previewIcon} />}
            <Text style={styles.previewMeta}>
              {city.sys?.country}  ·  {temp}
              {description ? `  ${description}` : ''}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.previewButton} onPress={onNavigate} activeOpacity={0.8}>
        <Text style={styles.previewButtonText}>Ver detalle  ›</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function NearbyMapScreen({ navigation }) {
  const { cities, userLocation, loading, permissionDenied, noInternet, error, reload } = useNearby();
  const [selectedCity, setSelectedCity] = useState(null);
  const mapRef = useRef(null);

  const retry = () => reload();

  const centerOnUser = () => {
    mapRef.current?.animateToRegion({
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    }, 600);
  };

  if (loading) return <LoadingView message="Obteniendo tu ubicación..." />;
  if (permissionDenied) return <NoLocationView onRetry={retry} />;
  if (noInternet) return <NoInternetView onRetry={retry} />;
  if (error) return <ErrorView message={error} onRetry={retry} />;
  if (!userLocation) return <LoadingView message="Calculando posición..." />;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        onPress={() => setSelectedCity(null)}
      >
        {/* Marcador de posición del usuario */}
        <Marker coordinate={userLocation} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={styles.userDot}>
            <View style={styles.userDotInner} />
          </View>
        </Marker>

        {/* Marcadores de ciudades */}
        {cities.map((city) => {
          const iconCode = city.weather?.[0]?.icon;
          const iconUri = iconCode ? owmIconUrl(iconCode) : null;

          return (
            <Marker
              key={String(city.id)}
              coordinate={{ latitude: city.coord.lat, longitude: city.coord.lon }}
              onPress={(e) => { e.stopPropagation(); setSelectedCity(city); }}
            >
              <View style={styles.pin}>
                {iconUri ? (
                  <Image source={{ uri: iconUri }} style={styles.pinIcon} />
                ) : (
                  <Text style={styles.pinFallback}>🌡</Text>
                )}
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Contador flotante */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>📍 {cities.length} ciudades</Text>
      </View>

      {/* Botón centrar en ubicación */}
      <TouchableOpacity style={styles.centerButton} onPress={centerOnUser} activeOpacity={0.8}>
        <Text style={styles.centerButtonIcon}>◎</Text>
      </TouchableOpacity>

      {/* Tarjeta de ciudad seleccionada */}
      {selectedCity && (
        <CityPreviewCard
          city={selectedCity}
          onClose={() => setSelectedCity(null)}
          onNavigate={() => navigation.navigate('CityDetail', { city: selectedCity })}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  /* Punto de usuario */
  userDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(26,115,232,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1a73e8',
    borderWidth: 2,
    borderColor: '#fff',
  },

  /* Pin de ciudad */
  pin: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 2,
    borderWidth: 1.5,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  pinIcon: { width: 36, height: 36 },
  pinFallback: { fontSize: 22 },

  /* Tarjeta de ciudad seleccionada */
  previewCard: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  previewClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  previewCloseText: { fontSize: 16, color: '#bbb' },
  previewContent: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  previewFlag: { fontSize: 36, marginRight: 12 },
  previewInfo: { flex: 1 },
  previewName: { fontSize: 18, fontWeight: '700', color: '#222', marginBottom: 4 },
  previewMetaRow: { flexDirection: 'row', alignItems: 'center' },
  previewIcon: { width: 32, height: 32, marginRight: 4 },
  previewMeta: { fontSize: 13, color: '#888', flexShrink: 1 },
  previewButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  previewButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  /* Botón centrar */
  centerButton: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  centerButtonIcon: { fontSize: 24, color: '#1a73e8' },

  /* Badge flotante */
  badge: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    backgroundColor: 'rgba(26,115,232,0.92)',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  badgeText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});
