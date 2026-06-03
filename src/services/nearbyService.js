import { WEATHER_BASE_URL, WEATHER_API_KEY } from '../config/api';

export const fetchNearbyCities = async (lat, lon, count = 20) => {
  const response = await fetch(
    `${WEATHER_BASE_URL}/find?lat=${lat}&lon=${lon}&cnt=${count}&appid=${WEATHER_API_KEY}&units=metric&lang=es`
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message ?? 'No se pudieron obtener las ciudades cercanas');
  }
  if (!Array.isArray(data.list)) {
    throw new Error('Formato de datos inválido');
  }
  return data.list;
};

export const fetchCityForecast = async (lat, lon) => {
  const response = await fetch(
    `${WEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric&lang=es`
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message ?? 'No se pudo obtener el pronóstico');
  }
  return data.list;
};
