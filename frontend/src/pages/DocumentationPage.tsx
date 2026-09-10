import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cloud,
  Layers,
  Map,
  MapPin,
  Wind,
  Activity,
  Cpu,
  Database,
  ExternalLink,
  Search,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  Code2,
  Compass,
  Zap,
  Radio,
  FileCode,
  Copy,
  Check
} from 'lucide-react';

interface DataSource {
  id: string;
  name: string;
  category: 'forecast' | 'radar' | 'geo' | 'air' | 'engine';
  categoryLabel: string;
  badge: string;
  provider: string;
  providerUrl: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  bgLight: string;
  borderColor: string;
  whatItPowers: string;
  modelsAndNetworks: string;
  updateCadence: string;
  dataResolution: string;
  license: string;
  endpoints: {
    label: string;
    method: 'GET' | 'POST' | 'TILE';
    url: string;
    description: string;
    sampleResponse: string;
  }[];
}

const DATA_SOURCES: DataSource[] = [
  {
    id: 'open-meteo-weather',
    name: 'Open-Meteo Weather Forecast API',
    category: 'forecast',
    categoryLabel: 'Atmospheric Forecasts',
    badge: 'Numerical Weather Prediction',
    provider: 'Open-Meteo GmbH',
    providerUrl: 'https://open-meteo.com',
    icon: Cloud,
    accentColor: 'text-blue-600',
    bgLight: 'bg-blue-50/70',
    borderColor: 'border-blue-200',
    whatItPowers:
      'Powers the main dashboard temperature readings, hourly micro-trends, 7-day extended forecasts, apparent feels-like temperatures, surface pressure, humidity, cloud cover, visibility, UV index, and sunrise/sunset times.',
    modelsAndNetworks:
      'Seamless multi-model blend: ECMWF (IFS 9km, Europe), NOAA GFS (13km, Global), DWD ICON (2km Central Europe & 13km Global), and Météo-France ARPEGE.',
    updateCadence: 'Hourly forecasts re-initialized every 1 to 3 hours as national weather agencies publish runs.',
    dataResolution: 'Downscaled to ~1 km to 11 km geographic grid resolution with digital elevation model (DEM) corrections.',
    license: 'Non-Commercial & Open Source Attribution (CC BY 4.0). Completely free for open consumer telemetry.',
    endpoints: [
      {
        label: 'Weather Forecast & Hourly Breakdown',
        method: 'GET',
        url: 'https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto',
        description: 'Comprehensive high-precision atmospheric telemetry for any GPS coordinate on Earth without API keys.',
        sampleResponse: `{
  "latitude": 28.61,
  "longitude": 77.20,
  "elevation": 216.0,
  "current": {
    "temperature_2m": 24.3,
    "relative_humidity_2m": 58,
    "apparent_temperature": 25.1,
    "precipitation": 0.0,
    "weather_code": 1,
    "surface_pressure": 1012.4,
    "wind_speed_10m": 12.4
  },
  "daily": {
    "temperature_2m_max": [29.2, 30.1, 28.5],
    "temperature_2m_min": [18.4, 19.0, 17.8],
    "uv_index_max": [6.2, 7.1, 6.5]
  }
}`
      }
    ]
  },
  {
    id: 'rainviewer-radar',
    name: 'RainViewer Doppler Radar & Nowcast',
    category: 'radar',
    categoryLabel: 'Doppler Radar & Satellite',
    badge: 'Real-time Radar Reflectivity',
    provider: 'RainViewer Inc.',
    providerUrl: 'https://www.rainviewer.com',
    icon: Radio,
    accentColor: 'text-indigo-600',
    bgLight: 'bg-indigo-50/70',
    borderColor: 'border-indigo-200',
    whatItPowers:
      'Powers the interactive precipitation radar layer, animated time-slider playback of recent storms, 10-minute historical radar frames, and automated 30-minute predictive storm nowcasts on the /radar page.',
    modelsAndNetworks:
      'Aggregates over 1,000+ national Doppler weather radar stations worldwide (e.g. NOAA NEXRAD across North America, OPERA composite across Europe, JMA in Japan, and IMD across India).',
    updateCadence: 'Refreshed every 10 minutes continuously with low-latency tile generation.',
    dataResolution: '512x512 PNG tiles in Web Mercator (EPSG:3857) projection down to zoom level 12.',
    license: 'RainViewer Open API Tier. Non-commercial and developer friendly for real-time radar mapping.',
    endpoints: [
      {
        label: 'Radar Timestamps & Tile Manifest',
        method: 'GET',
        url: 'https://api.rainviewer.com/public/weather-maps.json',
        description: 'Returns active radar server hosts along with Unix timestamps for past frames and future predictive nowcast frames.',
        sampleResponse: `{
  "version": "1.0.0",
  "generated": 1726059000,
  "host": "https://tilecache.rainviewer.com",
  "radar": {
    "past": [
      { "time": 1726056600, "path": "/v2/radar/1726056600/512" },
      { "time": 1726058400, "path": "/v2/radar/1726058400/512" }
    ],
    "nowcast": [
      { "time": 1726059600, "path": "/v2/radar/nowcast_1726059600/512" }
    ]
  }
}`
      },
      {
        label: 'Mercator Radar Tile Stream',
        method: 'TILE',
        url: 'https://tilecache.rainviewer.com/v2/radar/{time}/512/{z}/{x}/{y}/2/1_1.png',
        description: 'Transparent raster overlay with Universal Blue-Cyan-Green-Yellow-Red precipitation dBZ color scale.',
        sampleResponse: `Binary PNG stream (512x512 RGBA transparent raster tile)`
      }
    ]
  },
  {
    id: 'open-meteo-geocoding',
    name: 'Open-Meteo Geocoding API',
    category: 'geo',
    categoryLabel: 'Geospatial & Search',
    badge: 'Global Location Index',
    provider: 'Open-Meteo & GeoNames',
    providerUrl: 'https://open-meteo.com/en/docs/geocoding-api',
    icon: Compass,
    accentColor: 'text-emerald-600',
    bgLight: 'bg-emerald-50/70',
    borderColor: 'border-emerald-200',
    whatItPowers:
      'Powers the real-time search bar across the top navigation and the radar station picker. Allows instant discovery of towns, cities, districts, and coordinates worldwide.',
    modelsAndNetworks:
      'Composite database derived from GeoNames (cities >500 inhabitants), OpenStreetMap Nominatim data, and Natural Earth country and administrative boundaries.',
    updateCadence: 'Weekly updates to administrative boundary definitions, population metrics, and timezone changes.',
    dataResolution: 'Precise coordinates down to 6 decimal places (~0.1m ground precision) with elevation.',
    license: 'Creative Commons Attribution 4.0 International & GeoNames Open Data.',
    endpoints: [
      {
        label: 'City & Station Search Query',
        method: 'GET',
        url: 'https://geocoding-api.open-meteo.com/v1/search?name={query}&count=5&language=en&format=json',
        description: 'Instant autocomplete matching names, alternate spellings, postal designations, and country flags.',
        sampleResponse: `{
  "results": [
    {
      "id": 1273294,
      "name": "Delhi",
      "latitude": 28.65195,
      "longitude": 77.23149,
      "elevation": 218.0,
      "country_code": "IN",
      "country": "India",
      "admin1": "Delhi",
      "timezone": "Asia/Kolkata"
    }
  ]
}`
      }
    ]
  },
  {
    id: 'bigdatacloud-geocode',
    name: 'BigDataCloud Client Reverse Geocoding',
    category: 'geo',
    categoryLabel: 'Geospatial & Search',
    badge: 'Device Privacy Geolocation',
    provider: 'BigDataCloud Pty Ltd',
    providerUrl: 'https://www.bigdatacloud.net',
    icon: MapPin,
    accentColor: 'text-amber-600',
    bgLight: 'bg-amber-50/70',
    borderColor: 'border-amber-200',
    whatItPowers:
      'Powers the "Use GPS" button on the dashboard and the interactive click-to-inspect feature on the /radar map. When you click anywhere on the planet, it resolves the latitude and longitude into human-readable localities.',
    modelsAndNetworks:
      'High-performance reverse geocoding engine analyzing global administrative polygons and open geospatial gazetteers.',
    updateCadence: 'Real-time polygon point-in-polygon lookup with client-side caching.',
    dataResolution: 'Local street/neighborhood and administrative settlement level precision.',
    license: 'Free Client-Side Geocoding API with privacy-first zero storage policy.',
    endpoints: [
      {
        label: 'Reverse Coordinate Lookup',
        method: 'GET',
        url: 'https://api.bigdatacloud.net/data/reverse-geocode-client?latitude={lat}&longitude={lng}&localityLanguage=en',
        description: 'Resolves raw GPS coordinates into human-readable city, state, and country names without tracking IP or device IDs.',
        sampleResponse: `{
  "latitude": 28.6139,
  "longitude": 77.2090,
  "locality": "Connaught Place",
  "city": "New Delhi",
  "principalSubdivision": "Delhi",
  "countryName": "India",
  "countryCode": "IN"
}`
      }
    ]
  },
  {
    id: 'openstreetmap-tiles',
    name: 'OpenStreetMap Cartographic Base Layers',
    category: 'geo',
    categoryLabel: 'Geospatial & Search',
    badge: 'Interactive Cartography',
    provider: 'OpenStreetMap Contributors',
    providerUrl: 'https://www.openstreetmap.org',
    icon: Map,
    accentColor: 'text-teal-600',
    bgLight: 'bg-teal-50/70',
    borderColor: 'border-teal-200',
    whatItPowers:
      'Powers the interactive Leaflet map canvas on the /radar page, displaying national borders, coastlines, highways, water bodies, elevation relief, and city labels underneath atmospheric overlays.',
    modelsAndNetworks:
      'Global crowdsourced spatial dataset maintained by millions of cartographers and contributors around the world.',
    updateCadence: 'Tiles rendered from the continuous live OSM database with edge CDN caching.',
    dataResolution: 'Zoom levels 0 to 18 with down to 1-meter ground resolution for urban infrastructure.',
    license: 'Open Database License (ODbL) 1.0. Completely open and accessible under attribution requirements.',
    endpoints: [
      {
        label: 'Standard Tile Server (Slippy Map)',
        method: 'TILE',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        description: 'Fast 256x256 PNG raster map tiles distributed via global OSM tile server clusters.',
        sampleResponse: `Binary PNG stream (256x256 RGB raster map tile)`
      }
    ]
  },
  {
    id: 'open-meteo-air-quality',
    name: 'Copernicus & Open-Meteo Air Quality Service',
    category: 'air',
    categoryLabel: 'Air Quality & Pollen',
    badge: 'Atmospheric Chemistry',
    provider: 'Copernicus (CAMS) & Open-Meteo',
    providerUrl: 'https://open-meteo.com/en/docs/air-quality-api',
    icon: Wind,
    accentColor: 'text-violet-600',
    bgLight: 'bg-violet-50/70',
    borderColor: 'border-violet-200',
    whatItPowers:
      'Powers the "Air & Pollen" card, showing European Air Quality Index (AQI), PM2.5, PM10, Nitrogen Dioxide (NO₂), Sulphur Dioxide (SO₂), Carbon Monoxide (CO), Ozone (O₃), and Birch/Grass pollen counts.',
    modelsAndNetworks:
      'Copernicus Atmosphere Monitoring Service (CAMS, 10km grid) and Finnish Meteorological Institute SILAM model (pollen dispersion).',
    updateCadence: 'Hourly atmospheric dispersion updates computed once daily at 00:00 UTC.',
    dataResolution: 'Regional 10km chemistry grid with vertical atmospheric layers integration.',
    license: 'European Union Copernicus Open Access License & Open-Meteo Free API.',
    endpoints: [
      {
        label: 'Air Quality & Pollen Indices',
        method: 'GET',
        url: 'https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lng}&current=european_aqi,pm2_5,pm10,nitrogen_dioxide,ozone,birch_pollen,grass_pollen',
        description: 'Provides aerosol particulates, gaseous pollutants, and seasonal bio-allergens.',
        sampleResponse: `{
  "latitude": 28.65,
  "longitude": 77.23,
  "current": {
    "european_aqi": 72,
    "pm2_5": 48.2,
    "pm10": 92.6,
    "nitrogen_dioxide": 24.1,
    "ozone": 38.5,
    "grass_pollen": 12.0
  }
}`
      }
    ]
  },
  {
    id: 'mausam-engines',
    name: 'Mausam 2.0 Proprietary Intelligence Engines',
    category: 'engine',
    categoryLabel: 'Internal Processing Engines',
    badge: 'Algorithmic Synthesizers',
    provider: 'Mausam 2.0 Core Engineering',
    providerUrl: '#',
    icon: Cpu,
    accentColor: 'text-sky-600',
    bgLight: 'bg-sky-50/70',
    borderColor: 'border-sky-200',
    whatItPowers:
      'Synthesizes raw weather numbers into real human insights: InsightEngine computes health triggers (asthma, migraine, joint ache, cardio stress), PersonalizationEngine tailors routine advice (runners, commute, laundry), PriorityEngine ranks urgent flash alerts, and TemperatureRasterLayer generates 60fps thermal canvas heatmaps.',
    modelsAndNetworks:
      'Client & Node.js algorithmic inference: Inverse Distance Weighting (IDW) interpolation, biometric discomfort thresholds (Humidex & Wind Chill formulas), and personalized schedule correlation.',
    updateCadence: 'Executed in real-time instantly as new telemetry arrives (latency < 5ms).',
    dataResolution: 'Pixel-level dynamic canvas rasterization and localized user profile matching.',
    license: 'Mausam 2.0 Open Architecture (MIT License).',
    endpoints: [
      {
        label: 'Internal Health & Routine Analytics Pipeline',
        method: 'POST',
        url: '/api/weather/current (Synthesized via InsightEngine.ts)',
        description: 'Evaluates environmental factors against medical thresholds to compute preventive health risk scores.',
        sampleResponse: `{
  "insights": {
    "healthRisks": [
      { "type": "hydration", "level": "moderate", "message": "High midday UV and 32°C heat increase dehydration risk." },
      { "type": "joint_pain", "level": "low", "message": "Barometric pressure remains steady at 1012 hPa." }
    ],
    "commuteSuitability": {
      "score": 9,
      "verdict": "Clear conditions. Optimal for bicycle or outdoor transit."
    }
  }
}`
      }
    ]
  }
];

export default function DocumentationPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedEndpoints, setExpandedEndpoints] = useState<Record<string, boolean>>({
    'open-meteo-weather': true,
    'rainviewer-radar': true
  });

  const categories = [
    { id: 'all', label: 'All Sources', icon: Database, count: DATA_SOURCES.length },
    { id: 'forecast', label: 'Atmosphere & Forecasts', icon: Cloud, count: DATA_SOURCES.filter(s => s.category === 'forecast').length },
    { id: 'radar', label: 'Doppler Radar & Satellite', icon: Radio, count: DATA_SOURCES.filter(s => s.category === 'radar').length },
    { id: 'geo', label: 'Geospatial & Maps', icon: Map, count: DATA_SOURCES.filter(s => s.category === 'geo').length },
    { id: 'air', label: 'Air Quality & Pollen', icon: Wind, count: DATA_SOURCES.filter(s => s.category === 'air').length },
    { id: 'engine', label: 'Mausam Algorithmic Engines', icon: Cpu, count: DATA_SOURCES.filter(s => s.category === 'engine').length },
  ];

  const filteredSources = useMemo(() => {
    return DATA_SOURCES.filter(source => {
      const matchesCategory = selectedCategory === 'all' || source.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        source.name.toLowerCase().includes(q) ||
        source.provider.toLowerCase().includes(q) ||
        source.whatItPowers.toLowerCase().includes(q) ||
        source.modelsAndNetworks.toLowerCase().includes(q) ||
        source.categoryLabel.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleEndpoint = (id: string) => {
    setExpandedEndpoints(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black shadow-xs text-sm">
                M2
              </div>
              <div>
                <h1 className="text-sm font-extrabold text-slate-900 leading-tight flex items-center gap-2">
                  Mausam 2.0 Documentation
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Open Telemetry
                  </span>
                </h1>
                <p className="text-[11px] font-medium text-slate-500">
                  Data Providers, Numerical Models & Telemetry Architecture
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/radar')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-all flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Live</span> Radar Maps
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-10 shadow-lg border border-slate-800">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/3 -mb-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-4 border border-blue-400/30">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              100% Transparency Guarantee
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              Every data feed, satellite, and algorithm behind Mausam 2.0.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Mausam 2.0 aggregates open meteorological models, global Doppler radar feeds, crowdsourced cartography, and client-side interpolation algorithms to deliver sub-second, reliable weather intelligence without commercial bloat or tracking.
            </p>

            {/* Quick Metrics */}
            <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-2xl font-black text-white">6</span>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Core Telemetry Feeds</p>
              </div>
              <div>
                <span className="text-2xl font-black text-cyan-400">1,000+</span>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Doppler Radar Stations</p>
              </div>
              <div>
                <span className="text-2xl font-black text-emerald-400">100%</span>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Free & Open Standards</p>
              </div>
              <div>
                <span className="text-2xl font-black text-amber-400">0</span>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Ad Trackers / Telemetry</p>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Architecture Flow Diagram */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                System Data Pipeline Architecture
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-400">End-to-End Flow</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                  <span>STEP 1</span>
                  <Compass className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-xs">Location Geocoding</h4>
                <p className="text-slate-500 mt-1 text-[11px] leading-relaxed">
                  User searches a city or enables GPS. BigDataCloud or Open-Meteo Geocoder resolves exact coordinates.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/80 text-[10px] text-blue-600 font-bold">
                Output: Lat, Lng, Elev, City
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                  <span>STEP 2</span>
                  <Cloud className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-xs">Multi-Model Ingestion</h4>
                <p className="text-slate-500 mt-1 text-[11px] leading-relaxed">
                  Open-Meteo queries ECMWF/NOAA/DWD runs; RainViewer queries live Doppler radar reflectivity frames.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/80 text-[10px] text-indigo-600 font-bold">
                Output: Hourly Array + Radar Tiles
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                  <span>STEP 3</span>
                  <Cpu className="w-3.5 h-3.5 text-sky-600" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-xs">Mausam Algorithmic Synthesis</h4>
                <p className="text-slate-500 mt-1 text-[11px] leading-relaxed">
                  InsightEngine calculates asthma/joint risks; PriorityEngine ranks storms; Spatial IDW blends thermal grids.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/80 text-[10px] text-sky-600 font-bold">
                Output: Health Score + Interpolation
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                  <span>STEP 4</span>
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-xs">Ultra-Fast Client Rendering</h4>
                <p className="text-slate-500 mt-1 text-[11px] leading-relaxed">
                  Vite + React renders responsive cards and Leaflet WebGL/Canvas maps at smooth 60fps with zero latency.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/80 text-[10px] text-emerald-600 font-bold">
                Output: Live User Dashboard
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search providers, models, or metrics (e.g. radar, ECMWF, pollen)..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          <div className="text-xs font-bold text-slate-500 self-center">
            Showing <span className="text-slate-900">{filteredSources.length}</span> of {DATA_SOURCES.length} data sources
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {cat.label}
                <span
                  className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-blue-700/50 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Data Sources Grid */}
        <div className="space-y-6">
          {filteredSources.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <Database className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700">No data sources matched your filter</h3>
              <p className="text-xs text-slate-400 mt-1">Try searching for different keywords or select "All Sources".</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="mt-4 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredSources.map(source => {
              const Icon = source.icon;
              const isExpanded = !!expandedEndpoints[source.id];

              return (
                <div
                  key={source.id}
                  className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all shadow-xs overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-5 sm:p-6 border-b border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-10 h-10 rounded-xl ${source.bgLight} ${source.accentColor} flex items-center justify-center shrink-0 border ${source.borderColor}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                              {source.name}
                            </h3>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {source.badge}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Operational
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 font-medium mt-1">
                            Maintained by <span className="font-semibold text-slate-600">{source.provider}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                        {source.providerUrl !== '#' && (
                          <a
                            href={source.providerUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-all flex items-center gap-1.5"
                          >
                            <span>Official Docs</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <button
                          onClick={() => toggleEndpoint(source.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 border border-blue-200 transition-all flex items-center gap-1"
                        >
                          <Code2 className="w-3.5 h-3.5" />
                          <span>{isExpanded ? 'Hide Payload' : 'View Payload'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card Body: Details Grid */}
                  <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                    <div>
                      <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                        What It Powers In Mausam 2.0
                      </h4>
                      <p className="text-slate-700 leading-relaxed font-medium">{source.whatItPowers}</p>
                    </div>

                    <div>
                      <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                        Underlying Meteorological Models / Networks
                      </h4>
                      <p className="text-slate-700 leading-relaxed font-medium">{source.modelsAndNetworks}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Update Frequency
                        </span>
                        <span className="font-bold text-slate-800">{source.updateCadence}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Spatial Resolution
                        </span>
                        <span className="font-bold text-slate-800">{source.dataResolution}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        License & Attribution
                      </span>
                      <span className="font-medium text-slate-600">{source.license}</span>
                    </div>
                  </div>

                  {/* Collapsible Endpoints & Raw Payload Section */}
                  {isExpanded && (
                    <div className="bg-slate-900 text-slate-200 p-5 border-t border-slate-800 space-y-4">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                        <span className="flex items-center gap-1.5 text-blue-400">
                          <FileCode className="w-4 h-4" />
                          API Endpoints & Real Telemetry Schema
                        </span>
                        <span>REST / JSON / Mercator Tiles</span>
                      </div>

                      {source.endpoints.map((ep, idx) => (
                        <div key={idx} className="space-y-2 bg-slate-950/80 rounded-lg p-3.5 border border-slate-800">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                  ep.method === 'GET'
                                    ? 'bg-blue-900 text-blue-300 border border-blue-700'
                                    : ep.method === 'TILE'
                                    ? 'bg-purple-900 text-purple-300 border border-purple-700'
                                    : 'bg-emerald-900 text-emerald-300 border border-emerald-700'
                                }`}
                              >
                                {ep.method}
                              </span>
                              <span className="text-xs font-bold text-slate-200">{ep.label}</span>
                            </div>
                            <button
                              onClick={() => handleCopy(ep.url, `${source.id}-${idx}`)}
                              className="text-[10px] font-bold text-slate-400 hover:text-white flex items-center gap-1 self-start sm:self-auto transition-colors"
                            >
                              {copiedId === `${source.id}-${idx}` ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy URL</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="font-mono text-[11px] bg-slate-900 p-2 rounded text-blue-300 break-all select-all border border-slate-800/80">
                            {ep.url}
                          </div>

                          <p className="text-[11px] text-slate-400">{ep.description}</p>

                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                              Sample Telemetry Response
                            </span>
                            <pre className="font-mono text-[11px] text-emerald-300 bg-slate-900/90 p-3 rounded-lg overflow-x-auto max-h-48 scrollbar-thin border border-slate-800/60">
                              {ep.sampleResponse}
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Privacy & Ethical Telemetry Commitment Card */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border border-blue-200 rounded-2xl p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-slate-900">
                Privacy & Data Minimization Architecture
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Mausam 2.0 does not track your location history, does not sell telemetry coordinates to commercial advertisers, and does not require third-party cookies or intrusive mobile SDKs. When you query weather for a city or request browser GPS telemetry, your coordinates are strictly utilized to compute local meteorological calculations and cached locally in your browser's private <code className="bg-white px-1.5 py-0.5 rounded text-slate-800 font-mono text-xs border border-slate-200">localStorage</code>.
              </p>
              <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> No advertising trackers
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> End-to-end HTTPS encrypted APIs
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Open Source & Transparent
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-8 border-t border-slate-200">
          <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
            Mausam 2.0 Weather Intelligence — Open Telemetry Transparency
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/radar')}
              className="px-4 py-2 rounded-lg text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-all flex items-center gap-1.5"
            >
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Explore Interactive Radar</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
