import { COUNTRIES_BASE_URL } from '../config/api';

export const fetchAllCountries = async () => {
  const response = await fetch(
    `${COUNTRIES_BASE_URL}/all?fields=name,flags,capital,capitalInfo,continents,currencies,languages`
  );
  if (!response.ok) {
    throw new Error(`Error ${response.status}: No se pudieron obtener los países`);
  }
  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error('Formato de datos inválido recibido desde la API');
  }
  return data.sort((a, b) =>
    (a.name?.common ?? '').localeCompare(b.name?.common ?? '')
  );
};
