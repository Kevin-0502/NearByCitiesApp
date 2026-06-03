# Manual Técnico — Módulo Nearby (Ciudades Cercanas)

## 1. Visión General

El módulo **Nearby** permite al usuario descubrir ciudades cercanas a su posición GPS, ver el clima actual de cada una, explorarlas en un mapa interactivo y consultar el pronóstico de 5 días de cualquier ciudad.

**Tecnologías clave:**
- React Native + Expo SDK 54 (newArchEnabled)
- React Navigation: Stack + Bottom Tabs
- react-native-maps (Google Maps en Android, Apple Maps en iOS)
- OpenWeatherMap API (plan gratuito)
- expo-location (permisos GPS)
- React Context (estado compartido entre tabs)

---

## 2. Estructura de Archivos

```
src/
├── config/
│   └── api.js                  # Claves y URLs base
├── context/
│   └── NearbyContext.js        # Estado global del módulo
├── navigation/
│   └── NearbyNavigator.js      # Definición de rutas
├── screens/
│   ├── NearbyScreen.js         # Tab Lista
│   ├── NearbyMapScreen.js      # Tab Mapa
│   └── CityDetailScreen.js     # Detalle de ciudad
├── components/
│   ├── CityCard.js             # Tarjeta en la lista
│   ├── CityPreviewCard.js      # Tarjeta flotante en el mapa
│   ├── WeatherCard.js          # Clima actual en detalle
│   ├── ForecastStrip.js        # Carrusel de pronóstico
│   ├── LoadingView.js          # Estado de carga
│   ├── NoInternetView.js       # Error sin internet
│   ├── NoLocationView.js       # Error sin GPS
│   └── ErrorView.js            # Error genérico
├── services/
│   └── nearbyService.js        # Llamadas a la API
└── utils/
    └── distance.js             # Cálculo de distancias
```

---

## 3. Arquitectura de Navegación

```
App.js
└── NavigationContainer
    └── NearbyNavigator (Stack)
        ├── NearbyTabs (Bottom Tabs)  ← headerShown: false
        │   ├── Tab "Lista"  →  NearbyScreen
        │   └── Tab "Mapa"   →  NearbyMapScreen
        └── CityDetail       →  CityDetailScreen
```

**Por qué este diseño:**
- `CityDetail` vive en el Stack externo, no dentro de las tabs. Esto permite que tanto `NearbyScreen` como `NearbyMapScreen` naveguen a él con `navigation.navigate('CityDetail', { city })` sin necesidad de configuración adicional.
- `NearbyProvider` envuelve todo el Stack, garantizando que el contexto esté disponible en las tres pantallas.

---

## 4. Flujo de Datos

```
NearbyProvider (mount)
    │
    ▼
expo-location.requestForegroundPermissionsAsync()
    │  permiso denegado → setPermissionDenied(true)
    │  permiso concedido ↓
    ▼
expo-location.getCurrentPositionAsync()
    │
    ▼
fetchNearbyCities(lat, lon, 25)
── GET /find?lat=&lon=&cnt=25&appid=&units=metric&lang=es
    │  error de red → setNoInternet(true)
    │  error de API → setError(message)
    │  éxito ↓
    ▼
setCities(data.list)   setUserLocation({ latitude, longitude })
    │
    ├──► NearbyScreen      lee cities, userLocation del contexto
    └──► NearbyMapScreen   lee cities, userLocation del contexto
```

El fetch ocurre **una sola vez** aunque el usuario cambie de tab. Si el usuario presiona "Reintentar", se vuelve a ejecutar el mismo `load()` del contexto.

---

## 5. NearbyContext (`src/context/NearbyContext.js`)

### Estado expuesto

| Campo | Tipo | Descripción |
|---|---|---|
| `cities` | `Array` | Lista de ciudades devuelta por `/find` |
| `userLocation` | `{ latitude, longitude }` | Coordenadas del dispositivo |
| `loading` | `boolean` | `true` mientras se obtiene ubicación o ciudades |
| `permissionDenied` | `boolean` | El usuario rechazó el permiso de ubicación |
| `noInternet` | `boolean` | Fallo de red detectado |
| `error` | `string \| null` | Mensaje de error no relacionado con red/GPS |
| `reload` | `function` | Vuelve a ejecutar todo el flujo desde cero |

### Detección de error de red

```js
const isNetworkError = (err) =>
  err instanceof TypeError ||
  err?.message?.toLowerCase().includes('network') ||
  err?.message?.toLowerCase().includes('fetch') ||
  err?.message?.toLowerCase().includes('internet') ||
  err?.message?.toLowerCase().includes('conexión');
```

`TypeError` cubre los fallos de `fetch()` cuando no hay red (el browser/RN lanza `TypeError: Network request failed`).

---

## 6. Servicios (`src/services/nearbyService.js`)

### `fetchNearbyCities(lat, lon, count)`

Llama al endpoint `/find` de OpenWeatherMap.

```
GET https://api.openweathermap.org/data/2.5/find
    ?lat={lat}
    &lon={lon}
    &cnt={count}       ← número de ciudades (máx 50)
    &appid={key}
    &units=metric      ← temperatura en °C
    &lang=es           ← descripciones en español
```

**Respuesta relevante por ciudad:**
```json
{
  "id": 3621849,
  "name": "San José",
  "coord": { "lat": 9.9333, "lon": -84.0833 },
  "main": { "temp": 22.5, "feels_like": 22.1, "humidity": 78 },
  "weather": [{ "main": "Clouds", "description": "nubes dispersas", "icon": "03d" }],
  "wind": { "speed": 3.1 },
  "sys": { "country": "CR" }
}
```

### `fetchCityForecast(lat, lon)`

Llama al endpoint `/forecast` para el pronóstico de 5 días en bloques de 3 horas.

```
GET https://api.openweathermap.org/data/2.5/forecast
    ?lat={lat}
    &lon={lon}
    &appid={key}
    &units=metric
    &lang=es
```

Devuelve hasta 40 bloques (`list[]`), uno por cada intervalo de 3 horas.

---

## 7. Utilidades (`src/utils/distance.js`)

### `haversineDistance(lat1, lon1, lat2, lon2) → km`

Calcula la distancia en kilómetros entre dos coordenadas usando la fórmula de Haversine, que tiene en cuenta la curvatura de la Tierra.

```js
const R = 6371; // Radio de la Tierra en km
```

### `formatDistance(km) → string`

| Valor | Resultado |
|---|---|
| `< 1 km` | `"850 m"` |
| `>= 1 km` | `"12.4 km"` |

---

## 8. Pantallas

### 8.1 NearbyScreen (Tab Lista)

**Responsabilidad:** Mostrar las ciudades en una lista vertical con pull-to-refresh.

**Lógica propia:** Solo maneja `refreshing` (estado local del `RefreshControl`). Todo lo demás viene del contexto.

**Árbol de renderizado:**
```
loading          → <LoadingView message="Obteniendo tu ubicación..." />
permissionDenied → <NoLocationView onRetry={reload} />
noInternet       → <NoInternetView onRetry={reload} />
error            → <ErrorView message={error} onRetry={reload} />
OK               → <FlatList data={cities} renderItem={<CityCard>} />
```

**Distancia por tarjeta:** se calcula en el `renderItem` con `haversineDistance(userLocation, city.coord)` y se pasa como prop a `CityCard`. No se almacena en estado para no forzar re-renders.

---

### 8.2 NearbyMapScreen (Tab Mapa)

**Responsabilidad:** Mostrar las ciudades como marcadores sobre un mapa interactivo.

**Estado local:**
| State | Uso |
|---|---|
| `selectedCity` | Ciudad activa al presionar un marcador |
| `mapRef` | Referencia al `MapView` para animar la cámara |

**Flujo de interacción:**
```
Toca marcador
    → onPress dispara setSelectedCity(city)
    → aparece CityPreviewCard en la parte inferior

Toca "Ver detalle ›"
    → navigation.navigate('CityDetail', { city: selectedCity })

Toca el mapa (área vacía)
    → MapView.onPress dispara setSelectedCity(null)
    → CityPreviewCard desaparece

Toca "◎" (botón centrar)
    → mapRef.current.animateToRegion(userLocation, 600ms)
```

**Por qué no se usa `<Callout>`:** El componente `Callout` de react-native-maps con Google Maps en Android no dispara eventos de press de forma confiable. La solución es manejar la selección con `onPress` en el `Marker` y renderizar la tarjeta de preview en la capa de React Native (fuera del `MapView`), donde los eventos touch funcionan normalmente.

**Íconos del clima:** Se obtienen directamente de la API con `city.weather[0].icon` (ej. `"03d"`). La URL del ícono es:
```
https://openweathermap.org/img/wn/{code}@2x.png
```
El sufijo `@2x` entrega imágenes de 100×100px, adecuadas para pantallas de alta densidad.

---

### 8.3 CityDetailScreen

**Responsabilidad:** Mostrar información completa de una ciudad: encabezado, mapa, clima actual y pronóstico de 5 días.

**Recibe:** `route.params.city` — el objeto completo de la ciudad tal como lo devuelve `/find`.

**Estado local:**
| State | Uso |
|---|---|
| `forecastDays` | Array de días agrupados |
| `forecastLoading` | Spinner en la sección de pronóstico |
| `forecastError` | Mensaje de error del pronóstico |

**Carga del pronóstico:**
```js
useEffect(() => {
  fetchCityForecast(lat, lon)
    .then(list => setForecastDays(groupForecastByDay(list)))
    .catch(err => setForecastError(err.message))
    .finally(() => setForecastLoading(false));
}, [lat, lon]);
```

**Secciones de la pantalla:**
1. **Header** — bandera del país (emoji de indicador regional), nombre, código ISO, coordenadas
2. **Ubicación** — MapView con un `Marker` en las coordenadas de la ciudad + botón "Ver en el mapa" (abre Maps nativo o OSM)
3. **Clima Actual** — `<WeatherCard>` con temperatura, sensación, humedad y viento
4. **Próximos 5 Días** — `<ForecastStrip>` horizontal

---

## 9. Componentes

### CityCard

Fila de la lista. Muestra bandera, nombre, país, distancia, descripción del clima, ícono OWM y temperatura. Recibe `onPress` para navegar a `CityDetail`.

### WeatherCard

Tarjeta de clima actual. Muestra ícono OWM grande (72×72), temperatura, descripción y tres stats: sensación térmica, humedad y velocidad del viento.

### ForecastStrip + `groupForecastByDay`

`groupForecastByDay(list)` procesa los 40 bloques de 3h del endpoint `/forecast`:

```
list (40 entradas × 3h)
    │
    ▼  agrupar por fecha (dt_txt.slice(0,10))
    │
    ▼  por cada día:
       - noon = entrada de las 12:00:00 (o primera disponible)
       - tempMin = min(temp_min de todas las entradas del día)
       - tempMax = max(temp_max de todas las entradas del día)
       - iconCode = noon.weather[0].icon
       - description = noon.weather[0].description
    │
    ▼
Array de hasta 6 días [ { date, tempMin, tempMax, iconCode, description } ]
```

Cada día se renderiza en un `DayCard`. El primero ("Hoy") tiene fondo azul `#1a73e8`.

### LoadingView / NoInternetView / NoLocationView / ErrorView

Pantallas de estado completas (ocupan `flex: 1`). Cada una tiene:

| Componente | Ícono | Acción principal |
|---|---|---|
| `LoadingView` | `ActivityIndicator` | — |
| `NoInternetView` | 📡 | Reintentar |
| `NoLocationView` | 📍 | Abrir configuración del SO |
| `ErrorView` | ⚠️ | Reintentar |

`NoLocationView` detecta la plataforma para mostrar pasos específicos y para abrir el enlace correcto:
- **iOS:** `Linking.openURL('app-settings:')`
- **Android:** `Linking.openSettings()`

---

## 10. APIs Externas

### OpenWeatherMap (plan gratuito)

| Endpoint | Uso | Límite gratuito |
|---|---|---|
| `/find` | Ciudades cercanas | 60 req/min |
| `/forecast` | Pronóstico 5 días / 3h | 60 req/min |

**Key:** configurada en `src/config/api.js` → `WEATHER_API_KEY`

### Google Maps

**Android:** La key se inyecta automáticamente en `AndroidManifest.xml` durante el build de Expo a través de:

```json
// app.json
"android": {
  "config": {
    "googleMaps": {
      "apiKey": "..."
    }
  }
}
```

**Key:** configurada también en `src/config/api.js` → `GOOGLE_MAPS_API_KEY`

> En iOS se usa Apple Maps nativo; no requiere key adicional.

---

## 11. Banderas de País

Las banderas se generan con el truco de los **indicadores regionales Unicode**. Cada letra del código ISO (ej. `"CR"`) se convierte al carácter regional correspondiente sumando `127397` al código ASCII:

```js
const countryFlag = (code) =>
  code?.toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0))) ?? '🏳';
```

`'C'` (67) → `127464` → 🇨  
`'R'` (82) → `127479` → 🇷  
Resultado: 🇨🇷

---

## 12. Diagrama de Componentes por Pantalla

```
NearbyScreen
├── LoadingView | NoInternetView | NoLocationView | ErrorView
└── FlatList
    └── CityCard (× n ciudades)

NearbyMapScreen
├── LoadingView | NoInternetView | NoLocationView | ErrorView
├── MapView
│   ├── Marker (usuario)  — punto azul con halo
│   └── Marker (× n ciudades) — pin blanco con ícono OWM
├── Badge flotante (contador)
├── TouchableOpacity (botón centrar ◎)
└── CityPreviewCard (condicional al seleccionar marcador)

CityDetailScreen
├── ScrollView
│   ├── Header (bandera, nombre, coordenadas)
│   ├── MapView + Marker + botón "Ver en el mapa"
│   ├── WeatherCard
│   └── ForecastStrip
│       └── DayCard (× días)
```
