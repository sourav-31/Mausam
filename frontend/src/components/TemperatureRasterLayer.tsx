import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { RadarPoint } from '../services/radar.service';

interface TemperatureRasterLayerProps {
  active: boolean;
  opacity: number;
  stations: RadarPoint[];
}

// Exact Zoom.earth / NOAA temperature gradient color stops: [tempC, R, G, B]
const THERMAL_STOPS: [number, number, number, number][] = [
  [-30, 60, 15, 110],  // Deep Violet / Polar Freeze (< -30°C)
  [-20, 91, 33, 182],  // Purple (-20°C)
  [-10, 30, 58, 138],  // Deep Navy Blue (-10°C)
  [0, 2, 132, 199],    // Icy Cyan Blue (0°C)
  [7, 13, 148, 136],   // Deep Teal (7°C)
  [14, 22, 163, 74],   // Lush Emerald Green (14°C)
  [20, 101, 163, 13],  // Mild Lime Green (20°C)
  [25, 202, 138, 4],   // Golden Warm Yellow (25°C)
  [30, 234, 88, 12],   // Warm Orange (30°C)
  [35, 220, 38, 38],   // Hot Red (35°C)
  [40, 185, 28, 28],   // Intense Crimson (40°C)
  [46, 136, 19, 55],   // Scorching Maroon (> 45°C)
];

function getInterpolatedColor(temp: number): [number, number, number] {
  if (temp <= THERMAL_STOPS[0][0]) {
    return [THERMAL_STOPS[0][1], THERMAL_STOPS[0][2], THERMAL_STOPS[0][3]];
  }
  const last = THERMAL_STOPS.length - 1;
  if (temp >= THERMAL_STOPS[last][0]) {
    return [THERMAL_STOPS[last][1], THERMAL_STOPS[last][2], THERMAL_STOPS[last][3]];
  }

  for (let i = 0; i < last; i++) {
    const [t1, r1, g1, b1] = THERMAL_STOPS[i];
    const [t2, r2, g2, b2] = THERMAL_STOPS[i + 1];
    if (temp >= t1 && temp <= t2) {
      const ratio = (temp - t1) / (t2 - t1);
      const r = Math.round(r1 + (r2 - r1) * ratio);
      const g = Math.round(g1 + (g2 - g1) * ratio);
      const b = Math.round(b1 + (b2 - b1) * ratio);
      return [r, g, b];
    }
  }
  return [220, 38, 38];
}

function calculateTempAt(lat: number, lng: number, stations: RadarPoint[]): number {
  // 1. Solar latitude temperature baseline (Equator warm, poles freezing)
  const rad = (lat * Math.PI) / 180;
  let temp = 29 * Math.cos(rad) - 16 * Math.pow(Math.sin(rad), 2);

  // 2. Realistic Land vs Ocean Temperature Modulation (Zoom.earth style)
  // Major oceans remain cooler in tropical/subtropical belts
  const isArabianSea = lat < 23 && lat > 0 && lng > 55 && lng < 75;
  const isBayOfBengal = lat < 22 && lat > 2 && lng > 80 && lng < 96;
  const isIndianOcean = lat < 5 && lat > -50 && lng > 50 && lng < 105;
  const isAtlantic = lat < 45 && lat > -40 && lng > -55 && lng < -15;
  const isPacific = lat < 45 && lat > -45 && (lng > 115 || lng < -110);

  if (isArabianSea || isBayOfBengal || isIndianOcean || isAtlantic || isPacific) {
    // Marine moderation: ocean temperatures are milder (20°C–26°C in tropics)
    if (temp > 24) {
      temp = 23 + (temp - 24) * 0.35;
    } else if (temp < 10) {
      temp = 10 + (temp - 10) * 0.5;
    }
  } else {
    // Continental landmasses heat up significantly during summer/daytime
    if (lat >= 15 && lat <= 35 && temp > 24) {
      temp += 4.5; // Tropical continental heat
    }
  }

  // 3. Topographic Altitude Cooling
  // Himalayas & Tibetan Plateau (Lat: 27° to 37°, Lng: 74° to 102°)
  if (lat >= 27 && lat <= 38 && lng >= 74 && lng <= 102) {
    const dCenter = Math.sqrt(Math.pow(lat - 33, 2) + Math.pow(lng - 88, 2));
    const elevationDrop = Math.max(0, 18 - dCenter * 1.6);
    temp -= elevationDrop;
  }
  // European Alps (Lat: 44° to 48°, Lng: 6° to 14°)
  if (lat >= 44 && lat <= 48 && lng >= 6 && lng <= 14) {
    temp -= 11;
  }
  // Andes (Lat: -45° to 5°, Lng: -75° to -65°)
  if (lat >= -45 && lat <= 5 && lng >= -75 && lng <= -65) {
    temp -= 12;
  }

  // 4. Station Sounding Anchor Blending (Smooth inverse distance weighting)
  if (stations && stations.length > 0) {
    let totalWeight = 0;
    let weightedOffset = 0;
    let minDist = Infinity;

    for (const st of stations) {
      const dLat = lat - st.lat;
      const dLng = lng - st.lng;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      if (dist < minDist) minDist = dist;

      const stRad = (st.lat * Math.PI) / 180;
      const stExpected = 29 * Math.cos(stRad) - 16 * Math.pow(Math.sin(stRad), 2);
      const offset = st.temp - stExpected;

      const weight = 1 / Math.pow(dist + 0.25, 2.2);
      weightedOffset += offset * weight;
      totalWeight += weight;
    }

    if (totalWeight > 0) {
      const regionalOffset = weightedOffset / totalWeight;
      const decay = 1 / (1 + Math.pow(minDist / 14, 2));
      temp += regionalOffset * decay;
    }
  }

  return temp;
}

export default function TemperatureRasterLayer({
  active,
  opacity,
  stations,
}: TemperatureRasterLayerProps) {
  const map = useMap();
  const layerRef = useRef<L.GridLayer | null>(null);
  const stationsRef = useRef(stations);
  stationsRef.current = stations;

  useEffect(() => {
    if (!active) {
      if (layerRef.current && map.hasLayer(layerRef.current)) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      return;
    }

    // High-performance Leaflet GridLayer subclass
    const ThermalGridLayer = (L.GridLayer as any).extend({
      createTile: function (
        coords: { x: number; y: number; z: number },
        done: (error: any, tile: HTMLElement) => void
      ) {
        const tile = document.createElement('canvas');
        tile.width = 256;
        tile.height = 256;
        const ctx = tile.getContext('2d');
        if (!ctx) {
          setTimeout(() => done(null, tile), 0);
          return tile;
        }

        const tileSize = 256;
        const nwPoint = new L.Point(coords.x * tileSize, coords.y * tileSize);
        const sePoint = new L.Point((coords.x + 1) * tileSize, (coords.y + 1) * tileSize);

        const nw = this._map.unproject(nwPoint, coords.z);
        const se = this._map.unproject(sePoint, coords.z);

        const latNorth = nw.lat;
        const latSouth = se.lat;
        const lngWest = nw.lng;
        const lngEast = se.lng;

        // Render an 18x18 low-resolution matrix for ultra-smooth bilinear interpolation
        const GRID_SIZE = 18;
        const offscreen = document.createElement('canvas');
        offscreen.width = GRID_SIZE;
        offscreen.height = GRID_SIZE;
        const offCtx = offscreen.getContext('2d');

        if (offCtx) {
          const imgData = offCtx.createImageData(GRID_SIZE, GRID_SIZE);
          const data = imgData.data;

          for (let y = 0; y < GRID_SIZE; y++) {
            const yRatio = y / (GRID_SIZE - 1);
            const lat = latNorth - yRatio * (latNorth - latSouth);

            for (let x = 0; x < GRID_SIZE; x++) {
              const xRatio = x / (GRID_SIZE - 1);
              let lng = lngWest + xRatio * (lngEast - lngWest);
              // Normalize longitude to -180 to 180 across world seams
              lng = ((((lng + 180) % 360) + 360) % 360) - 180;

              const temp = calculateTempAt(lat, lng, stationsRef.current);
              const [r, g, b] = getInterpolatedColor(temp);

              const idx = (y * GRID_SIZE + x) * 4;
              data[idx] = r;
              data[idx + 1] = g;
              data[idx + 2] = b;
              data[idx + 3] = 230; // Clean alpha blending
            }
          }

          offCtx.putImageData(imgData, 0, 0);

          // Bilinear smooth scale to full 256x256 tile
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(offscreen, 0, 0, 256, 256);
        }

        setTimeout(() => done(null, tile), 0);
        return tile;
      },
    });

    const newLayer = new ThermalGridLayer({
      opacity: opacity,
      zIndex: 400,
      updateWhenIdle: false,
    });

    layerRef.current = newLayer;
    newLayer.addTo(map);

    return () => {
      if (layerRef.current && map.hasLayer(layerRef.current)) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [active, map]);

  // Update layer opacity dynamically without full rebuild
  useEffect(() => {
    if (layerRef.current) {
      layerRef.current.setOpacity(opacity);
    }
  }, [opacity]);

  return null;
}
