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

export const weatherService = {
  async searchLocation(name: string): Promise<LocationSearchResult[]> {
    const response = await api.get('/weather/location/search', {
      params: { name }
    });
    return response.data;
  },

  async reverseGeocode(lat: number, lon: number): Promise<LocationSearchResult> {
    const response = await api.get('/weather/location/reverse', {
      params: { lat, lon }
    });
    return response.data;
  },

  async getForecast(lat: number, lon: number, timezone: string = 'auto'): Promise<WeatherData> {
    const response = await api.get('/weather/forecast', {
      params: { lat, lon, timezone }
    });
    return response.data;
  }
};
