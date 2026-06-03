import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import { fetchNearbyCities } from '../services/nearbyService';
import { haversineDistance } from '../utils/distance';

const NearbyContext = createContext(null);

const REFETCH_THRESHOLD_KM = 0.05;

const isNetworkError = (err) =>
  err instanceof TypeError ||
  err?.message?.toLowerCase().includes('network') ||
  err?.message?.toLowerCase().includes('fetch') ||
  err?.message?.toLowerCase().includes('internet') ||
  err?.message?.toLowerCase().includes('conexión');

export function NearbyProvider({ children }) {
  const [cities, setCities] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [noInternet, setNoInternet] = useState(false);
  const [error, setError] = useState(null);

  const lastFetchCoordsRef = useRef(null);
  const watcherRef = useRef(null);

  const fetchForCoords = useCallback(async (latitude, longitude, isInitial) => {
    try {
      if (!isInitial) setRefreshing(true);
      setError(null);
      setNoInternet(false);

      const data = await fetchNearbyCities(latitude, longitude, 10);
      setCities(data);
      lastFetchCoordsRef.current = { latitude, longitude };
    } catch (err) {
      if (isNetworkError(err)) setNoInternet(true);
      else setError(err.message ?? 'Error al obtener ciudades cercanas');
    } finally {
      if (isInitial) setLoading(false);
      else setRefreshing(false);
    }
  }, []);

  const startWatching = useCallback(async () => {
    try {
      setError(null);
      setNoInternet(false);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionDenied(true);
        setLoading(false);
        return;
      }
      setPermissionDenied(false);

      watcherRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 500 },
        (loc) => {
          const { latitude, longitude } = loc.coords;
          setUserLocation({ latitude, longitude });

          const last = lastFetchCoordsRef.current;
          const moved =
            !last ||
            haversineDistance(last.latitude, last.longitude, latitude, longitude) >= REFETCH_THRESHOLD_KM;

          if (moved) fetchForCoords(latitude, longitude, !last);
        }
      );
    } catch (err) {
      if (isNetworkError(err)) setNoInternet(true);
      else setError(err.message ?? 'Error al obtener ubicación');
      setLoading(false);
    }
  }, [fetchForCoords]);

  const reload = useCallback(async () => {
    watcherRef.current?.remove();
    watcherRef.current = null;
    lastFetchCoordsRef.current = null;
    setLoading(true);
    setCities([]);
    setUserLocation(null);
    setPermissionDenied(false);
    setNoInternet(false);
    setError(null);
    await startWatching();
  }, [startWatching]);

  useEffect(() => {
    startWatching();
    return () => { watcherRef.current?.remove(); };
  }, [startWatching]);

  return (
    <NearbyContext.Provider
      value={{ cities, userLocation, loading, refreshing, permissionDenied, noInternet, error, reload }}
    >
      {children}
    </NearbyContext.Provider>
  );
}

export const useNearby = () => useContext(NearbyContext);
