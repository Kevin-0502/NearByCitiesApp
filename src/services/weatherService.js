import { WEATHER_BASE_URL, WEATHER_API_KEY } from '../config/api';

export const fetchWeatherByCity = async (city) => {
  if (!city || typeof city !== 'string') {
    throw new Error('Nombre de ciudad inválido');
  }
  const response = await fetch(
    `${WEATHER_BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric&lang=es`
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message ?? 'No se pudo obtener el clima');
  }
  if (!data.main || !data.weather?.[0]) {
    throw new Error('Los datos del clima recibidos son incompletos');
  }
  return data;
};
