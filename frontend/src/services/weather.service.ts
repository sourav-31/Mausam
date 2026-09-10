import axios from 'axios';
import api from './api';

export interface LocationSearchResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation: number;
  feature_code: string;
  country_code: string;
  admin1_id?: number;
  admin2_id?: number;
  admin3_id?: number;
  timezone: string;
  population?: number;
  postcodes?: string[];
  country_id: number;
  country: string;
  admin1?: string;
  admin2?: string;
  admin3?: string;
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    snowfall: number;
    showers: number;
    rain: number;
    precipitation: number;
    weather_code: number;
    cloud_cover: number;
    wind_gusts_10m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    dew_point_2m: number[];
    rain: number[];
    showers: number[];
    precipitation: number[];
    snowfall: number[];
    snow_depth: number[];
    apparent_temperature: number[];
    precipitation_probability: number[];
    pressure_msl: number[];
    cloud_cover: number[];
    cloud_cover_low: number[];
    cloud_cover_mid: number[];
    cloud_cover_high: number[];
    visibility: number[];
    vapour_pressure_deficit: number[];
    wind_speed_80m: number[];
    wind_speed_10m: number[];
    wind_direction_10m: number[];
    wind_direction_80m: number[];
    wind_gusts_10m: number[];
    temperature_80m: number[];
    direct_radiation_instant: number[];
    shortwave_radiation_instant: number[];
    weather_code: number[];
  };
  daily: {
    time: string[];
    uv_index_clear_sky_max: number[];
    uv_index_max: number[];
    moonrise: string[];
    moonset: string[];
    moon_phase: number[];
    sunshine_duration: number[];
    daylight_duration: number[];
    sunrise: string[];
    sunset: string[];
    showers_sum: number[];
    rain_sum: number[];
    snowfall_sum: number[];
    temperature_2m_min: number[];
    temperature_2m_max: number[];
    weather_code: number[];
    apparent_temperature_min: number[];
    apparent_temperature_max: number[];
    wind_speed_10m_max: number[];
    wind_gusts_10m_max: number[];
    wind_direction_10m_dominant: number[];
    shortwave_radiation_sum: number[];
    et0_fao_evapotranspiration: number[];
    precipitation_sum: number[];
    precipitation_hours: number[];
  };
}

const FORECAST_PARAMS = {
  hourly: 'temperature_2m,relative_humidity_2m,dew_point_2m,rain,showers,precipitation,snowfall,snow_depth,apparent_temperature,precipitation_probability,pressure_msl,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,visibility,vapour_pressure_deficit,wind_speed_80m,wind_speed_10m,wind_direction_10m,wind_direction_80m,wind_gusts_10m,temperature_80m,direct_radiation_instant,shortwave_radiation_instant',
  models: 'best_match',
  minutely_15: 'temperature_2m,relative_humidity_2m,dew_point_2m,wind_gusts_10m,wind_speed_10m,wind_speed_80m,wind_direction_10m,wind_direction_80m,rain,snowfall,apparent_temperature,precipitation,visibility,lightning_potential,is_day,shortwave_radiation,direct_radiation,direct_radiation_instant,shortwave_radiation_instant,sunshine_duration,freezing_level_height,snowfall_height',
  daily: 'uv_index_clear_sky_max,uv_index_max,moonrise,moonset,moon_phase,sunshine_duration,daylight_duration,sunrise,sunset,showers_sum,rain_sum,snowfall_sum,temperature_2m_min,temperature_2m_max,weather_code,apparent_temperature_min,apparent_temperature_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,shortwave_radiation_sum,et0_fao_evapotranspiration,precipitation_sum,precipitation_hours',
  current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,wind_speed_10m,wind_direction_10m,snowfall,showers,rain,precipitation,weather_code,cloud_cover,wind_gusts_10m',
};

export const weatherService = {
  async searchLocation(name: string): Promise<LocationSearchResult[]> {
    try {
      const response = await api.get('/weather/location/search', {
        params: { name },
        timeout: 4000
      });
      return response.data;
    } catch (err) {
      console.warn('Backend search failed, falling back directly to Open-Meteo geocoding:', err);
      const directResponse = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
        params: {
          name,
          count: 10,
          language: 'en',
          format: 'json'
        }
      });
      return directResponse.data.results || [];
    }
  },

  async reverseGeocode(lat: number, lon: number): Promise<LocationSearchResult> {
    try {
      const response = await api.get('/weather/location/reverse', {
        params: { lat, lon },
        timeout: 4000
      });
      return response.data;
    } catch (err) {
      console.warn('Backend reverse geocode failed, falling back to BigDataCloud:', err);
      const directResponse = await axios.get('https://api.bigdatacloud.net/data/reverse-geocode-client', {
        params: {
          latitude: lat,
          longitude: lon,
          localityLanguage: 'en',
        }
      });
      const data = directResponse.data;
      return {
        id: Math.floor(Math.random() * 1000000),
        name: data.city || data.locality || data.principalSubdivision || 'Unknown',
        latitude: lat,
        longitude: lon,
        elevation: 0,
        feature_code: 'GPS',
        country_code: data.countryCode || '',
        timezone: 'auto',
        country_id: 0,
        country: data.countryName || '',
        admin1: data.principalSubdivision || '',
      };
    }
  },

  async getForecast(lat: number, lon: number, timezone: string = 'auto'): Promise<WeatherData> {
    try {
      const response = await api.get('/weather/forecast', {
        params: { lat, lon, timezone },
        timeout: 5000
      });
      return response.data;
    } catch (err) {
      console.warn('Backend weather API unreachable, seamlessly falling back to Open-Meteo direct telemetry:', err);
      const directResponse = await axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude: lat,
          longitude: lon,
          ...FORECAST_PARAMS,
          timezone: timezone || 'auto'
        }
      });
      return directResponse.data;
    }
  }
};
