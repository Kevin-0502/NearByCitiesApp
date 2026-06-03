import React, { useState } from 'react';
import { View, FlatList, Text, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useNearby } from '../context/NearbyContext';
import CityCard from '../components/CityCard';
import LoadingView from '../components/LoadingView';
import NoInternetView from '../components/NoInternetView';
import NoLocationView from '../components/NoLocationView';
import ErrorView from '../components/ErrorView';
import { haversineDistance, formatDistance } from '../utils/distance';

export default function NearbyScreen({ navigation }) {
  const { cities, userLocation, loading, refreshing: locationRefreshing, permissionDenied, noInternet, error, reload } = useNearby();
  const [refreshing, setRefreshing] = useState(false);

  const retry = () => reload();

  const handleRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  if (loading) return <LoadingView message="Obteniendo tu ubicación..." />;
  if (permissionDenied) return <NoLocationView onRetry={retry} />;
  if (noInternet) return <NoInternetView onRetry={retry} />;
  if (error) return <ErrorView message={error} onRetry={retry} />;

  return (
    <View style={styles.container}>
      {userLocation && (
        <View style={styles.locationBar}>
          <Text style={styles.locationText}>
            📍 {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
          </Text>
          <View style={styles.locationRight}>
            {locationRefreshing && (
              <ActivityIndicator size="small" color="rgba(255,255,255,0.9)" style={styles.locationSpinner} />
            )}
            <Text style={styles.locationCount}>
              {locationRefreshing ? 'Actualizando...' : `${cities.length} ciudades`}
            </Text>
          </View>
        </View>
      )}

      <FlatList
        data={cities}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => {
          const dist = userLocation
            ? formatDistance(
                haversineDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  item.coord.lat,
                  item.coord.lon
                )
              )
            : '—';
          return (
            <CityCard
              city={item}
              distance={dist}
              onPress={() => navigation.navigate('CityDetail', { city: item })}
            />
          );
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#1a73e8']}
            tintColor="#1a73e8"
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏙</Text>
            <Text style={styles.emptyText}>No se encontraron ciudades cercanas</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },

  locationBar: {
    backgroundColor: '#1a73e8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  locationText: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontFamily: 'monospace' },
  locationRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationSpinner: { marginRight: 2 },
  locationCount: { fontSize: 12, color: 'rgba(255,255,255,0.75)' },

  listContent: { paddingTop: 10, paddingBottom: 24 },

  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 52, marginBottom: 12 },
  emptyText: { color: '#aaa', fontSize: 15 },
});
