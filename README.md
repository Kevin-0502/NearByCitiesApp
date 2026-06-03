Explorador de Países y Ciudades Cercanas

Aplicación móvil desarrollada con **React Native + Expo SDK 54** que combina dos flujos principales: exploración de países del mundo organizados por continente, y descubrimiento de ciudades cercanas a la ubicación del usuario con información del clima en tiempo real.

---

## Características

### Módulo Países
- Navegación por continente mediante un **Drawer lateral** (África, América, Asia, Europa, Oceanía)
- Listado de países con bandera, nombre, capital y población
- Pantalla de detalle por país con información completa

### Módulo Ciudades Cercanas
- Detección automática de la **ubicación GPS** del dispositivo
- Listado de hasta 25 ciudades cercanas con:
  - Distancia calculada desde la posición del usuario
  - Temperatura actual e ícono del clima (imágenes oficiales de OWM)
  - Descripción en español
- **Mapa interactivo** (Google Maps / Apple Maps) con marcadores por ciudad
  - Al tocar un marcador aparece una tarjeta de preview con temperatura y descripción
  - Botón "Ver detalle" navega a la pantalla completa
  - Botón ◎ para re-centrar la vista en la ubicación actual
- **Pantalla de detalle** por ciudad con:
  - Mapa embebido con la ubicación exacta
  - Tarjeta de clima actual (temperatura, sensación térmica, humedad, viento)
  - Pronóstico de los próximos 5 días (mínima, máxima, condición dominante)
- Pantallas de error dedicadas para falta de internet y permiso GPS denegado

---

## Requisitos Previos

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Expo Go instalado en el dispositivo físico, o un emulador Android / simulador iOS configurado
- Cuenta en [OpenWeatherMap](https://openweathermap.org/api) (plan gratuito)
- Proyecto en [Google Cloud Console](https://console.cloud.google.com/) con **Maps SDK for Android** habilitado (solo para Android)

---

## Instalación y Ejecución

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd desafio03-DPS
```

### 2. Instalar dependencias

```bash
npm install --legacy-peer-deps
```

> Se requiere `--legacy-peer-deps` por la combinación de React 19 con algunas dependencias de navegación.

### 3. Configurar las API keys

Abre el archivo `src/config/api.js` y reemplaza los valores:

```js
// src/config/api.js
export const WEATHER_API_KEY = 'TU_OPENWEATHERMAP_API_KEY';
export const GOOGLE_MAPS_API_KEY = 'TU_GOOGLE_MAPS_API_KEY';
```

Para la key de Google Maps en Android, también debe estar en `app.json`:

```json
"android": {
  "config": {
    "googleMaps": {
      "apiKey": "TU_GOOGLE_MAPS_API_KEY"
    }
  }
}
```

### 4. Ejecutar la aplicación

```bash
# Iniciar el servidor de desarrollo
npm start

# Abrir directamente en Android
npm run android

# Abrir directamente en iOS
npm run ios
```

Escanea el código QR con Expo Go o presiona `a` / `i` en la terminal para abrir en emulador.

---

## Configuración de API Keys

### OpenWeatherMap

1. Crear cuenta en [openweathermap.org](https://openweathermap.org)
2. Ir a **API Keys** en el perfil
3. Copiar la key por defecto o generar una nueva
4. Pegar en `src/config/api.js` → `WEATHER_API_KEY`

> El plan gratuito permite 60 peticiones/minuto. La app utiliza dos endpoints: `/find` (ciudades cercanas) y `/forecast` (pronóstico).

### Google Maps (solo Android)

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear un proyecto o seleccionar uno existente
3. Habilitar **Maps SDK for Android** en *APIs y servicios*
4. Ir a *Credenciales* → *Crear credencial* → *Clave de API*
5. Pegar la key en `src/config/api.js` → `GOOGLE_MAPS_API_KEY` **y** en `app.json` bajo `android.config.googleMaps.apiKey`

> En iOS se usa Apple Maps de forma nativa, sin necesidad de configuración adicional.

---

## Arquitectura

La aplicación sigue una arquitectura basada en **Context + Services**, sin librería de estado externa.

```
src/
├── config/          # Constantes globales (URLs, API keys)
├── context/         # Estado compartido entre pantallas (React Context)
├── navigation/      # Definición de rutas (Stack, Drawer, Bottom Tabs)
├── screens/         # Pantallas principales
├── components/      # Componentes visuales reutilizables
├── services/        # Funciones de acceso a APIs externas (fetch)
└── utils/           # Lógica pura sin dependencias de UI
```

### Capas

| Capa | Descripción | Archivos |
|---|---|---|
| **Config** | Claves y URLs base centralizadas | `config/api.js`, `config/continents.js` |
| **Services** | Llamadas HTTP. Lanzan excepciones con mensajes claros si falla la petición | `services/nearbyService.js`, `services/countriesService.js` |
| **Context (ViewModel)** | Orquesta permisos, llamadas a servicios y manejo de errores. Expone estado listo para consumir en la UI | `context/NearbyContext.js`, `context/CountriesContext.js` |
| **Screens** | Solo lógica de presentación y navegación. Leen del contexto, no hacen fetch directamente | `screens/` |
| **Components** | Piezas visuales sin lógica de negocio. Reciben datos por props | `components/` |
| **Utils** | Funciones puras (matemáticas, formateo). Sin imports de React ni RN | `utils/distance.js` |

### Navegación

```
App.js
└── NavigationContainer
    └── NearbyNavigator (Stack)           ← módulo activo
        ├── NearbyTabs (Bottom Tabs)
        │   ├── Lista  →  NearbyScreen
        │   └── Mapa   →  NearbyMapScreen
        └── CityDetail →  CityDetailScreen

    # CountriesNavigator disponible (no montado en App.js actualmente)
    └── CountriesNavigator (Stack)
        └── ContinentDrawer (Drawer)
            └── [continente] → CountriesScreen
                └── CountryDetail → CountryDetailScreen
```

El estado del módulo Nearby vive en `NearbyContext`. Los datos se cargan **una sola vez** al montar el provider; ambos tabs (Lista y Mapa) consumen el mismo contexto sin duplicar peticiones.

---

## Limitaciones Conocidas y Trade-offs

| Limitación | Motivo | Posible mejora |
|---|---|---|
| No hay historial de clima (días pasados) | OWM solo ofrece datos históricos en el plan de pago | Integrar [Open-Meteo](https://open-meteo.com/) que es gratuito |
| Los íconos del clima dependen de internet | Se cargan como `<Image uri>` desde OWM en cada render | Pre-cargar o cachear localmente con `expo-image` |
| `Callout` de react-native-maps no funciona en Android con Google Maps | Bug conocido del SDK; los eventos de press dentro del Callout no disparan | Solución implementada: preview card en capa React Native fuera del MapView |
| El pronóstico muestra hasta 6 días (no siempre 5) | El endpoint `/forecast` devuelve bloques desde la hora actual, el primer "día" puede ser parcial | Filtrar el día actual si tiene menos de 4 bloques |
| Sin persistencia local | Cada apertura de la app vuelve a hacer fetch | Añadir `AsyncStorage` o SQLite para caché offline |
| Un solo navegador activo en `App.js` | `CountriesNavigator` está implementado pero no montado | Agregar un tab raíz o selector de módulo en `App.js` |

---

## Tiempo de Implementación

| Tarea | Tiempo estimado |
|---|---|
| Estructura base del proyecto y navegación (Drawer + Stack) | 3 h |
| Módulo Países (listado, detalle, contexto, servicio) | 4 h |
| Módulo Nearby: GPS + fetch + lista con distancias | 4 h |
| Pantallas de error (NoInternet, NoLocation, ErrorView) | 1.5 h |
| Refactor a NearbyContext (estado compartido entre tabs) | 2 h |
| Tab Mapa con react-native-maps + marcadores + preview card | 5 h |
| Pronóstico 5 días (ForecastStrip, groupForecastByDay) | 2.5 h |
| Migración de emojis a íconos OWM en todos los componentes | 1.5 h |
| Configuración Google Maps Android + fix OSM 403 | 1 h |
| Ajustes de UX (botón centrar mapa, pull-to-refresh, fallbacks) | 1.5 h |
| **Total** | **~26 h** |

---

## Dependencias Principales

| Paquete | Versión | Uso |
|---|---|---|
| `expo` | 54.0.35 | Runtime y herramientas de build |
| `react-native` | 0.81.5 | Framework base |
| `react` | 19.1.0 | — |
| `@react-navigation/native-stack` | 7.x | Navegación Stack |
| `@react-navigation/drawer` | 7.x | Navegación Drawer |
| `@react-navigation/bottom-tabs` | 7.x | Navegación Bottom Tabs |
| `react-native-maps` | 1.20.1 | Mapas (Google Maps / Apple Maps) |
| `expo-location` | 19.0.x | Acceso al GPS del dispositivo |
| `react-native-reanimated` | 4.1.x | Animaciones (requerido por Navigation) |
| `react-native-gesture-handler` | 2.28.x | Gestos (requerido por Navigation) |

![alt text](<WhatsApp Image 2026-06-03 at 14.35.45.jpeg>) ![alt text](<WhatsApp Image 2026-06-03 at 14.35.45 (1).jpeg>) ![alt text](<WhatsApp Image 2026-06-03 at 14.35.45 (2).jpeg>)
