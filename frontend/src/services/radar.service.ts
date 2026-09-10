import axios from 'axios';

export interface RainViewerFrame {
  time: number;
  path: string;
  type: 'past' | 'nowcast';
}

export interface RainViewerData {
  version: string;
  generated: number;
  host: string;
  radar: {
    past: RainViewerFrame[];
    nowcast: RainViewerFrame[];
  };
}

export interface RadarPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  precipitationProb: number;
  weatherCode: number;
  condition: string;
}

/**
 * Fetch real-time radar timestamps & tile paths from RainViewer API
 */
export async function getRainViewerData(): Promise<RainViewerData | null> {
  try {
    const response = await axios.get<RainViewerData>('https://api.rainviewer.com/public/weather-maps.json', {
      timeout: 8000,
    });
    return response.data;
  } catch (err) {
    console.warn('RainViewer API unreachable, using simulated radar stream', err);
    return null;
  }
}

/**
 * Generate standard RainViewer radar tile URL
 * Color scheme 2 = Universal Blue-Green-Yellow-Red reflectivity
 */
export function getRadarTileUrl(
  host: string,
  path: string,
  colorScheme = 2,
  smooth = 1,
  snow = 1
): string {
  return `${host}${path}/256/{z}/{x}/{y}/${colorScheme}/${smooth}_${snow}.png`;
}

/**
 * Maps temperature in Celsius to an atmospheric thermal gradient color
 */
export function getTemperatureColor(tempC: number): string {
  if (tempC <= 0) return '#2563eb'; // Deep Frost Blue
  if (tempC <= 10) return '#06b6d4'; // Cool Cyan
  if (tempC <= 18) return '#0d9488'; // Teal
  if (tempC <= 24) return '#10b981'; // Mild Emerald
  if (tempC <= 30) return '#eab308'; // Warm Amber
  if (tempC <= 36) return '#f97316'; // Hot Orange
  return '#dc2626'; // Scorching Crimson
}

/**
 * Convert wind bearing in degrees to cardinal direction string
 */
export function getWindDirectionLabel(deg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((deg % 360) / 22.5) % 16;
  return directions[index];
}

/**
 * Fallback regional radar stations for smooth coverage around active coordinate
 */
export function getSurroundingStations(centerLat: number, centerLng: number): { name: string; lat: number; lng: number }[] {
  const offsets = [
    { name: 'North Sector', dLat: 0.95, dLng: 0.15 },
    { name: 'East Sector', dLat: 0.12, dLng: 1.15 },
    { name: 'South Sector', dLat: -0.92, dLng: -0.15 },
    { name: 'West Sector', dLat: -0.05, dLng: -1.1 },
    { name: 'North-East Basin', dLat: 0.7, dLng: 0.9 },
    { name: 'South-West Ridge', dLat: -0.75, dLng: -0.85 },
  ];

  return offsets.map(o => ({
    name: o.name,
    lat: +(centerLat + o.dLat).toFixed(4),
    lng: +(centerLng + o.dLng).toFixed(4),
  }));
}
