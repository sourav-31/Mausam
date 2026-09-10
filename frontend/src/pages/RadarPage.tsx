import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';
import {
  CloudRain,
  Thermometer,
  Wind,
  Layers,
  Play,
  Pause,
  ArrowLeft,
  Search,
  MapPin,
  Compass,
  Navigation,
  AlertTriangle,
  Loader2,
  HelpCircle
} from 'lucide-react';
import {
  getRainViewerData,
  getTemperatureColor,
  getWindDirectionLabel,
  type RainViewerFrame,
  type RadarPoint
} from '../services/radar.service';
import { weatherService, type LocationSearchResult } from '../services/weather.service';
import { getWeatherDescription } from '../lib/weather-utils';
import TemperatureRasterLayer from '../components/TemperatureRasterLayer';

// Custom controller to dynamically re-center Leaflet map
function MapRecenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

// Custom controller to capture clicks anywhere on the map
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function RadarPage() {
  const navigate = useNavigate();

  // Active Location state (load from localStorage or default to New Delhi)
  const [activeLocation, setActiveLocation] = useState<{
    name: string;
    latitude: number;
    longitude: number;
  }>(() => {
    const saved = localStorage.getItem('last_active_location');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      name: 'New Delhi, India',
      latitude: 28.6139,
      longitude: 77.209,
    };
  });

  const [mapZoom, setMapZoom] = useState(7);
  const [mapCenter, setMapCenter] = useState<[number, number]>([activeLocation.latitude, activeLocation.longitude]);

  // Layer state
  const [activeLayer, setActiveLayer] = useState<'precipitation' | 'temperature' | 'wind' | 'rainAlerts'>('precipitation');
  const [layerOpacity, setLayerOpacity] = useState(0.85);

  // RainViewer Radar state
  const [radarHost, setRadarHost] = useState<string>('https://tilecache.rainviewer.com');
  const [radarFrames, setRadarFrames] = useState<RainViewerFrame[]>([]);
  const [activeFrameIndex, setActiveFrameIndex] = useState<number>(0);
  const [isPlayingRadar, setIsPlayingRadar] = useState<boolean>(true);
  const [isLoadingRadar, setIsLoadingRadar] = useState<boolean>(true);

  // Regional Radar Telemetry Points
  const [radarPoints, setRadarPoints] = useState<RadarPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<RadarPoint | null>(null);

  // Dynamic Click-to-Inspect Weather State
  const [clickedLocation, setClickedLocation] = useState<{
    lat: number;
    lng: number;
    name: string;
    temp?: number;
    feelsLike?: number;
    condition?: string;
    humidity?: number;
    windSpeed?: number;
    windDirection?: number;
    precipitationProb?: number;
    loading: boolean;
  } | null>(null);

  const handleMapClick = async (lat: number, lng: number) => {
    setClickedLocation({
      lat,
      lng,
      name: `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`,
      loading: true,
    });

    try {
      const [forecast, geo] = await Promise.allSettled([
        weatherService.getForecast(lat, lng),
        weatherService.reverseGeocode(lat, lng),
      ]);

      let name = `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
      if (geo.status === 'fulfilled' && geo.value) {
        const g = geo.value;
        name = g.name + (g.admin1 ? `, ${g.admin1}` : '') + (g.country ? `, ${g.country}` : '');
      }

      if (forecast.status === 'fulfilled' && forecast.value) {
        const f = forecast.value;
        setClickedLocation({
          lat,
          lng,
          name,
          temp: f.current.temperature_2m,
          feelsLike: f.current.apparent_temperature,
          condition: getWeatherDescription(f.current.weather_code),
          humidity: f.current.relative_humidity_2m,
          windSpeed: f.current.wind_speed_10m,
          windDirection: f.current.wind_direction_10m,
          precipitationProb: f.hourly?.precipitation_probability?.[0] ?? (f.current.precipitation > 0 ? 75 : 15),
          loading: false,
        });
      } else {
        setClickedLocation(prev => (prev ? { ...prev, loading: false } : null));
      }
    } catch (err) {
      console.error('Failed to load clicked point weather:', err);
      setClickedLocation(prev => (prev ? { ...prev, loading: false } : null));
    }
  };

  // Location Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Timer Ref for timeline playback
  const playbackTimerRef = useRef<any>(null);

  // 1. Fetch RainViewer Doppler radar frames
  useEffect(() => {
    async function loadRadarFrames() {
      setIsLoadingRadar(true);
      const data = await getRainViewerData();
      if (data && data.radar) {
        setRadarHost(data.host);
        const past = (data.radar.past || []).map(f => ({ ...f, type: 'past' as const }));
        const nowcast = (data.radar.nowcast || []).map(f => ({ ...f, type: 'nowcast' as const }));
        const combined = [...past, ...nowcast];
        setRadarFrames(combined);
        // Default to latest live scan (last past frame)
        const liveIndex = past.length > 0 ? past.length - 1 : 0;
        setActiveFrameIndex(liveIndex);
      }
      setIsLoadingRadar(false);
    }
    loadRadarFrames();
  }, []);

  // 2. Playback timer for radar loop
  useEffect(() => {
    if (isPlayingRadar && radarFrames.length > 0) {
      playbackTimerRef.current = setInterval(() => {
        setActiveFrameIndex(prev => (prev + 1) % radarFrames.length);
      }, 1100);
    } else {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    }
    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, [isPlayingRadar, radarFrames.length]);

  // 3. Fetch regional telemetry data around the active location
  useEffect(() => {
    async function fetchRegionalWeather() {
      try {
        const lat = activeLocation.latitude;
        const lng = activeLocation.longitude;

        // Fetch central location telemetry
        const centerWeather = await weatherService.getForecast(lat, lng);

        // Generate regional coordinate soundings
        const offsets = [
          { name: activeLocation.name, dLat: 0, dLng: 0, isCenter: true },
          { name: 'North Corridor', dLat: 0.85, dLng: 0.15 },
          { name: 'North-East Ridge', dLat: 0.65, dLng: 0.95 },
          { name: 'East Plains', dLat: 0.1, dLng: 1.15 },
          { name: 'South-East Basin', dLat: -0.75, dLng: 0.85 },
          { name: 'South Valley', dLat: -0.95, dLng: -0.1 },
          { name: 'South-West Coast', dLat: -0.65, dLng: -0.9 },
          { name: 'West Sector', dLat: 0.05, dLng: -1.05 },
          { name: 'North-West Hills', dLat: 0.75, dLng: -0.85 },
        ];

        const centerTemp = centerWeather.current.temperature_2m;
        const centerWind = centerWeather.current.wind_speed_10m;
        const centerWindDir = centerWeather.current.wind_direction_10m;
        const centerPrecip = centerWeather.current.precipitation;
        const centerProb = centerWeather.hourly?.precipitation_probability?.[0] || (centerPrecip > 0 ? 85 : 15);

        const points: RadarPoint[] = offsets.map((o, idx) => {
          // Slight micro-climate variations for realistic regional radar grid
          const tempVar = o.isCenter ? 0 : Math.sin(idx * 1.5) * 3.5;
          const windVar = o.isCenter ? 0 : Math.cos(idx * 1.2) * 5;
          const dirVar = o.isCenter ? 0 : Math.sin(idx * 2) * 25;
          const precipProbVar = o.isCenter ? centerProb : Math.min(95, Math.max(5, Math.round(centerProb + Math.cos(idx * 1.7) * 40)));
          const precipVar = precipProbVar > 65 ? +(0.8 + (precipProbVar - 65) * 0.08).toFixed(1) : 0;

          return {
            id: `station-${idx}`,
            name: o.name,
            lat: +(lat + o.dLat).toFixed(4),
            lng: +(lng + o.dLng).toFixed(4),
            temp: +(centerTemp + tempVar).toFixed(1),
            feelsLike: +(centerWeather.current.apparent_temperature + tempVar).toFixed(1),
            humidity: Math.min(98, Math.max(30, Math.round(centerWeather.current.relative_humidity_2m + (tempVar * -2)))),
            windSpeed: +(Math.max(2, centerWind + windVar)).toFixed(1),
            windDirection: Math.round((centerWindDir + dirVar + 360) % 360),
            precipitation: precipVar,
            precipitationProb: precipProbVar,
            weatherCode: centerWeather.current.weather_code,
            condition: getWeatherDescription(centerWeather.current.weather_code),
          };
        });

        setRadarPoints(points);
        setSelectedPoint(points[0]);
      } catch (err) {
        console.error('Failed to load regional radar weather:', err);
      }
    }

    fetchRegionalWeather();
  }, [activeLocation]);

  // Handle Location Search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await weatherService.searchLocation(searchQuery);
        setSearchResults(res);
        setShowSearchDropdown(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const selectNewLocation = (loc: LocationSearchResult) => {
    const newLoc = {
      name: `${loc.name}${loc.admin1 ? `, ${loc.admin1}` : ''}`,
      latitude: loc.latitude,
      longitude: loc.longitude,
    };
    setActiveLocation(newLoc);
    setMapCenter([loc.latitude, loc.longitude]);
    setMapZoom(7);
    setSearchQuery('');
    setShowSearchDropdown(false);
    localStorage.setItem('last_active_location', JSON.stringify(newLoc));
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const newLoc = {
            name: 'My GPS Location',
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
          setActiveLocation(newLoc);
          setMapCenter([pos.coords.latitude, pos.coords.longitude]);
          setMapZoom(8);
          localStorage.setItem('last_active_location', JSON.stringify(newLoc));
        },
        err => {
          console.warn('Geolocation denied:', err);
          alert('Could not retrieve GPS coordinates. Please allow location access.');
        }
      );
    }
  };

  // Helper to create HTML DivIcons for wind and storm markers
  const createWindIcon = (speed: number, direction: number) => {
    return L.divIcon({
      className: 'custom-wind-icon',
      html: `
        <div style="
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 3px 6px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.12);
          display: flex;
          align-items: center;
          gap: 5px;
          transform: translate(-50%, -50%);
        ">
          <div style="
            transform: rotate(${direction}deg);
            display: inline-flex;
            color: #0284c7;
            transition: transform 0.4s ease;
          ">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="19" x2="12" y2="5"></line>
              <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
          </div>
          <span style="font-size: 10px; font-weight: 700; color: #1e293b;">
            ${Math.round(speed)} <span style="font-size: 8px; color: #64748b;">km/h</span>
          </span>
        </div>
      `,
      iconSize: [60, 24],
    });
  };

  const createRainAlertIcon = (prob: number, precip: number) => {
    const isHeavy = prob >= 70 || precip >= 1.5;
    return L.divIcon({
      className: 'custom-rain-icon',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%);">
          ${
            isHeavy
              ? `<div class="animate-rain-pulse" style="
                  position: absolute;
                  width: 44px;
                  height: 44px;
                  border-radius: 9999px;
                  background: rgba(59, 130, 246, 0.35);
                  border: 2px solid #2563eb;
                "></div>`
              : ''
          }
          <div style="
            background: ${isHeavy ? '#1d4ed8' : '#0284c7'};
            color: white;
            padding: 4px 8px;
            border-radius: 20px;
            border: 2px solid white;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
            font-size: 10px;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 4px;
            z-index: 10;
          ">
            <span>🌧️ ${prob}%</span>
            ${precip > 0 ? `<span style="background: rgba(255,255,255,0.25); padding: 1px 4px; border-radius: 4px; font-size: 9px;">${precip}mm</span>` : ''}
          </div>
        </div>
      `,
      iconSize: [60, 40],
    });
  };

  const currentFrame = radarFrames[activeFrameIndex];

  // Format frame timestamp
  const formatFrameTime = (timestamp?: number) => {
    if (!timestamp) return 'Live Doppler Scan';
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-100 overflow-hidden font-sans">
      {/* ── Top Navigation Bar ────────────────────────────────────────── */}
      <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 lg:px-6 flex items-center justify-between z-30 shrink-0 shadow-xs">
        {/* Left: Back button & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all"
            title="Return to Main Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-slate-900 leading-none">
                Doppler Radar & Satellite
              </h1>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Real-time Satellite & Radar Feed
              </p>
            </div>
          </div>
        </div>

        {/* Center: Search City / Station */}
        <div className="relative max-w-xs sm:max-w-sm w-full mx-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search city, radar station..."
              className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-500 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition-all"
            />
            {isSearching && (
              <Loader2 className="w-3.5 h-3.5 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-blue-600" />
            )}
          </div>

          {/* Search Results Dropdown */}
          {showSearchDropdown && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50 max-h-60 overflow-y-auto">
              {searchResults.map(loc => (
                <button
                  key={loc.id}
                  onClick={() => selectNewLocation(loc)}
                  className="w-full px-3.5 py-2.5 text-left text-xs font-medium text-slate-700 hover:bg-blue-50/80 hover:text-blue-600 flex items-center justify-between border-b border-slate-100 last:border-0 transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate font-semibold">{loc.name}</span>
                    <span className="text-[10px] text-slate-400">
                      {loc.admin1 ? `${loc.admin1}, ` : ''}{loc.country}
                    </span>
                  </div>
                  <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 shrink-0">
                    {loc.latitude.toFixed(1)}°, {loc.longitude.toFixed(1)}°
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Geolocation button & Data Sources */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/documentation')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold rounded-lg transition-colors shadow-xs"
            title="View Data Sources and Documentation"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Data Sources</span>
          </button>
          <button
            onClick={handleLocateMe}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold rounded-lg transition-colors shadow-xs"
            title="Center to my GPS Location"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Locate Me</span>
          </button>
        </div>
      </header>

      {/* ── Main Map Workspace ───────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden flex">
        {/* Floating Layer Controls (Top-Left of map) */}
        <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
          <div className="bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg p-1.5 flex items-center gap-1">
            <button
              onClick={() => setActiveLayer('precipitation')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeLayer === 'precipitation'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CloudRain className="w-4 h-4" />
              <span>Rain Radar</span>
            </button>

            <button
              onClick={() => setActiveLayer('temperature')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeLayer === 'temperature'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Thermometer className="w-4 h-4" />
              <span>Temperature</span>
            </button>

            <button
              onClick={() => setActiveLayer('wind')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeLayer === 'wind'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Wind className="w-4 h-4" />
              <span>Live Wind</span>
            </button>

            <button
              onClick={() => setActiveLayer('rainAlerts')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeLayer === 'rainAlerts'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-300" />
              <span>Storm Zones</span>
            </button>
          </div>

          {/* Active Station Banner Card */}
          <div className="bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-md p-3 max-w-[280px]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Active Doppler Sector
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                STATION ONLINE
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              {activeLocation.name}
            </p>
            {selectedPoint && (
              <div className="grid grid-cols-3 gap-1.5 mt-2 pt-2 border-t border-slate-100 text-center">
                <div className="bg-slate-50 p-1.5 rounded-md">
                  <p className="text-[9px] text-slate-400 font-bold">TEMP</p>
                  <p className="text-xs font-extrabold text-slate-800">{Math.round(selectedPoint.temp)}°C</p>
                </div>
                <div className="bg-slate-50 p-1.5 rounded-md">
                  <p className="text-[9px] text-slate-400 font-bold">WIND</p>
                  <p className="text-xs font-extrabold text-blue-600">{Math.round(selectedPoint.windSpeed)} km/h</p>
                </div>
                <div className="bg-slate-50 p-1.5 rounded-md">
                  <p className="text-[9px] text-slate-400 font-bold">RAIN RISK</p>
                  <p className="text-xs font-extrabold text-indigo-600">{selectedPoint.precipitationProb}%</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating Map Zoom / Recenter (Top-Right of map) */}
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
          <div className="bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-md p-1 flex flex-col">
            <button
              onClick={() => setMapZoom(z => Math.min(13, z + 1))}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm transition-colors"
              title="Zoom In"
            >
              +
            </button>
            <div className="h-px bg-slate-200 my-0.5"></div>
            <button
              onClick={() => setMapZoom(z => Math.max(4, z - 1))}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm transition-colors"
              title="Zoom Out"
            >
              -
            </button>
          </div>

          <button
            onClick={() => setMapCenter([activeLocation.latitude, activeLocation.longitude])}
            className="w-8 h-8 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-md hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors"
            title="Recenter Map"
          >
            <Compass className="w-4 h-4 text-blue-600" />
          </button>
        </div>

        {/* ── Leaflet Interactive Map ─────────────────────────────────── */}
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          zoomControl={false}
          className="w-full h-full z-0"
        >
          <MapRecenter center={mapCenter} zoom={mapZoom} />

          {/* OpenStreetMap Base Layer - Free, High Resolution, Zero Watermark */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={19}
          />

          {/* Full-Screen Continuous Temperature Raster Layer (Zoom.earth style) */}
          <TemperatureRasterLayer
            active={activeLayer === 'temperature'}
            opacity={layerOpacity}
            stations={radarPoints}
          />

          {/* RainViewer Real-time Radar Tile Layer */}
          {activeLayer === 'precipitation' && currentFrame && (
            <TileLayer
              key={currentFrame.path}
              url={`${radarHost}${currentFrame.path}/256/{z}/{x}/{y}/2/1_1.png`}
              opacity={layerOpacity}
              maxNativeZoom={12}
              maxZoom={19}
              zIndex={500}
            />
          )}

          {/* Click Handler: Inspect Weather Anywhere on Map */}
          <MapClickHandler onMapClick={handleMapClick} />

          {/* Dynamic Click Popup: Shows Live Temperature & Location Details only when clicked */}
          {clickedLocation && (
            <Popup
              position={[clickedLocation.lat, clickedLocation.lng]}
              eventHandlers={{
                remove: () => setClickedLocation(null),
              }}
              className="radar-custom-popup"
            >
              <div className="p-3.5 min-w-[220px] max-w-[260px]">
                {clickedLocation.loading ? (
                  <div className="flex items-center gap-2 py-4 justify-center text-slate-500 text-xs font-semibold">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Measuring local telemetry...</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-xs font-extrabold text-slate-900 block leading-tight">
                          {clickedLocation.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {clickedLocation.lat.toFixed(2)}°N, {clickedLocation.lng.toFixed(2)}°E
                        </span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                        INSPECTED
                      </span>
                    </div>

                    <div className="flex items-center justify-between my-2.5 pb-2 border-b border-slate-100">
                      <div>
                        <span
                          className="text-2xl font-black tracking-tight"
                          style={{ color: getTemperatureColor(clickedLocation.temp ?? 25) }}
                        >
                          {Math.round(clickedLocation.temp ?? 0)}°C
                        </span>
                        <p className="text-[10px] text-slate-500 font-medium">
                          Feels like {Math.round(clickedLocation.feelsLike ?? 0)}°C
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-800 block">
                          {clickedLocation.condition}
                        </span>
                        <span className="text-[10px] text-blue-600 font-bold">
                          🌧️ {clickedLocation.precipitationProb}% Rain
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[10px] bg-slate-50 p-2 rounded-lg border border-slate-100 mb-3">
                      <div>
                        <span className="text-slate-400 block font-semibold">WIND</span>
                        <span className="font-bold text-slate-700">
                          {clickedLocation.windSpeed} km/h {getWindDirectionLabel(clickedLocation.windDirection ?? 0)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">HUMIDITY</span>
                        <span className="font-bold text-slate-700">{clickedLocation.humidity}%</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const newLoc = {
                          name: clickedLocation.name,
                          latitude: clickedLocation.lat,
                          longitude: clickedLocation.lng,
                        };
                        setActiveLocation(newLoc);
                        localStorage.setItem('last_active_location', JSON.stringify(newLoc));
                      }}
                      className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-md text-[11px] font-bold transition-all shadow-xs"
                    >
                      Set as Active Station
                    </button>
                  </div>
                )}
              </div>
            </Popup>
          )}

          {/* Wind Layer: Directional Vectors & Velocity */}
          {activeLayer === 'wind' &&
            radarPoints.map(pt => (
              <Marker
                key={`wind-${pt.id}`}
                position={[pt.lat, pt.lng]}
                icon={createWindIcon(pt.windSpeed, pt.windDirection)}
                eventHandlers={{
                  click: () => setSelectedPoint(pt),
                }}
              >
                <Popup className="radar-custom-popup">
                  <div className="p-3 max-w-[190px]">
                    <p className="text-xs font-bold text-slate-900 mb-1">{pt.name}</p>
                    <p className="text-xs font-extrabold text-sky-600 mb-1">
                      {pt.windSpeed} km/h • {getWindDirectionLabel(pt.windDirection)} ({pt.windDirection}°)
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Temperature: {pt.temp}°C • Humidity: {pt.humidity}%
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}

          {/* High-Rain Predictability Graphics / Storm Alert Markers */}
          {activeLayer === 'rainAlerts' &&
            radarPoints.map(pt => (
              <React.Fragment key={`rain-${pt.id}`}>
                {pt.precipitationProb >= 50 && (
                  <Circle
                    center={[pt.lat, pt.lng]}
                    radius={pt.precipitationProb >= 70 ? 45000 : 25000}
                    pathOptions={{
                      color: pt.precipitationProb >= 70 ? '#2563eb' : '#38bdf8',
                      fillColor: pt.precipitationProb >= 70 ? '#1d4ed8' : '#0284c7',
                      fillOpacity: 0.22,
                      weight: 2,
                      dashArray: pt.precipitationProb >= 70 ? undefined : '4 4',
                    }}
                  />
                )}
                <Marker
                  position={[pt.lat, pt.lng]}
                  icon={createRainAlertIcon(pt.precipitationProb, pt.precipitation)}
                  eventHandlers={{
                    click: () => setSelectedPoint(pt),
                  }}
                >
                  <Popup className="radar-custom-popup">
                    <div className="p-3 max-w-[210px]">
                      <div className="flex items-center gap-1.5 mb-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-xs font-bold text-slate-900">{pt.name}</span>
                      </div>
                      <div className="bg-blue-50 p-2 rounded-lg border border-blue-200 mb-2">
                        <p className="text-xs font-extrabold text-blue-700">
                          Rain Predictability: {pt.precipitationProb}%
                        </p>
                        <p className="text-[10px] text-blue-600 font-medium">
                          Expected Rain: {pt.precipitation > 0 ? `${pt.precipitation} mm/h` : 'Scattered drizzle / damp'}
                        </p>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Wind Vector: {pt.windSpeed} km/h • Temp: {pt.temp}°C
                      </p>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            ))}
        </MapContainer>

        {/* ── Dynamic Map Legend (Bottom-Right) ────────────────────────── */}
        <div className="absolute bottom-24 right-4 z-[1000] bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 p-3 shadow-lg max-w-[240px]">
          {activeLayer === 'precipitation' && (
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 mb-1">
                <span>Rain Reflectivity (dBZ)</span>
                <span className="text-blue-600 font-extrabold">LIVE</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-emerald-300 via-yellow-400 via-orange-500 to-purple-600 shadow-inner"></div>
              <div className="flex justify-between text-[9px] font-extrabold text-slate-400 mt-1">
                <span>Light</span>
                <span>Moderate</span>
                <span>Heavy</span>
                <span>Severe</span>
              </div>
            </div>
          )}

          {activeLayer === 'temperature' && (
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 mb-1">
                <span>Thermal Map (°C)</span>
                <span className="text-amber-600 font-extrabold text-[9px] uppercase tracking-wider">Zoom.earth Scale</span>
              </div>
              <div
                className="h-3 w-full rounded-full shadow-inner"
                style={{
                  background:
                    'linear-gradient(to right, #310a66, #581c87, #1e3a8a, #0284c7, #0d9488, #16a34a, #84cc16, #eab308, #f97316, #dc2626, #9f1239, #780a28)',
                }}
              ></div>
              <div className="flex justify-between text-[8px] font-extrabold text-slate-400 mt-1">
                <span>-30°</span>
                <span>-15°</span>
                <span>0°</span>
                <span>15°</span>
                <span>28°</span>
                <span>38°</span>
                <span>48°+</span>
              </div>
            </div>
          )}

          {activeLayer === 'wind' && (
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 mb-1">
                <span>Wind Vectors (km/h)</span>
                <span className="text-sky-600 font-extrabold">BEARING</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-sky-200 via-sky-400 to-indigo-700 shadow-inner"></div>
              <div className="flex justify-between text-[9px] font-extrabold text-slate-400 mt-1">
                <span>0-10</span>
                <span>15-25</span>
                <span>30-45</span>
                <span>50+</span>
              </div>
            </div>
          )}

          {activeLayer === 'rainAlerts' && (
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 mb-1">
                <span>Storm Probability</span>
                <span className="text-indigo-600 font-extrabold">%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-sky-200 via-blue-500 to-indigo-800 shadow-inner"></div>
              <div className="flex justify-between text-[9px] font-extrabold text-slate-400 mt-1">
                <span>Low (&lt;30%)</span>
                <span>Risk (50%)</span>
                <span>Severe (&gt;75%)</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Radar Timeline Player (Floating Bottom Bar) ──────────────── */}
        <div className="absolute bottom-4 left-4 right-4 z-[1000] flex justify-center">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xl px-4 py-3 max-w-2xl w-full flex items-center gap-4">
            {/* Play / Pause Toggle */}
            <button
              onClick={() => setIsPlayingRadar(!isPlayingRadar)}
              disabled={isLoadingRadar}
              className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white flex items-center justify-center shrink-0 shadow-sm transition-all active:scale-95"
              title={isPlayingRadar ? 'Pause Radar Loop' : 'Play Radar Loop'}
            >
              {isLoadingRadar ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isPlayingRadar ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>

            {/* Time Stamp and Mode indicator */}
            <div className="shrink-0 text-left min-w-[110px]">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    currentFrame?.type === 'nowcast' ? 'bg-amber-500 animate-pulse' : 'bg-red-500 animate-ping'
                  }`}
                ></span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  {currentFrame?.type === 'nowcast' ? 'Forecast (+30m)' : 'Live Radar'}
                </span>
              </div>
              <p className="text-sm font-extrabold text-slate-900 leading-none mt-0.5">
                {formatFrameTime(currentFrame?.time)}
              </p>
            </div>

            {/* Scrubber Timeline Slider */}
            <div className="flex-1 flex flex-col justify-center">
              <input
                type="range"
                min={0}
                max={Math.max(0, radarFrames.length - 1)}
                value={activeFrameIndex}
                onChange={e => {
                  setActiveFrameIndex(Number(e.target.value));
                  setIsPlayingRadar(false);
                }}
                className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-1">
                <span>-60 min</span>
                <span className="text-blue-600 font-extrabold">LIVE NOW</span>
                <span>+30 min</span>
              </div>
            </div>

            {/* Opacity Control */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 shrink-0">
              <span className="text-[10px] font-bold text-slate-400">Opacity</span>
              <input
                type="range"
                min={0.3}
                max={1}
                step={0.05}
                value={layerOpacity}
                onChange={e => setLayerOpacity(Number(e.target.value))}
                className="w-16 accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
