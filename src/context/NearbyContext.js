import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { fetchNearbyCities } from '../services/nearbyService';

const NearbyContext = createContext(null);

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
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [noInternet, setNoInternet] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
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

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = location.coords;
      setUserLocation({ latitude, longitude });

      const data = await fetchNearbyCities(latitude, longitude, 25);
      setCities(data);
    } catch (err) {
      if (isNetworkError(err)) {
        setNoInternet(true);
      } else {
        setError(err.message ?? 'Error al obtener ciudades cercanas');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <NearbyContext.Provider
      value={{ cities, userLocation, loading, permissionDenied, noInternet, error, reload: load }}
    >
      {children}
    </NearbyContext.Provider>
  );
}

export const useNearby = () => useContext(NearbyContext);
