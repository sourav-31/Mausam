import { Request, Response } from 'express';
import axios from 'axios';

export const searchLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.query;
    if (!name) {
      res.status(400).json({ error: 'Location name is required' });
      return;
    }

    // Using OpenMeteo Geocoding API
    const response = await axios.get(`https://geocoding-api.open-meteo.com/v1/search`, {
      params: {
        name: name,
        count: 10,
        language: 'en',
        format: 'json'
      }
    });

    const results = response.data.results || [];
    res.json(results);
  } catch (error) {
    console.error('Error searching location:', error);
    res.status(500).json({ error: 'Failed to search location' });
  }
};

export const getForecast = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lon, timezone } = req.query;
    if (!lat || !lon) {
      res.status(400).json({ error: 'Latitude (lat) and longitude (lon) are required' });
      return;
    }

    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: lat,
        longitude: lon,
        hourly: 'temperature_2m,relative_humidity_2m,dew_point_2m,rain,showers,precipitation,snowfall,snow_depth,apparent_temperature,precipitation_probability,pressure_msl,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,visibility,vapour_pressure_deficit,wind_speed_80m,wind_speed_10m,wind_direction_10m,wind_direction_80m,wind_gusts_10m,temperature_80m,direct_radiation_instant,shortwave_radiation_instant',
        models: 'best_match',
        minutely_15: 'temperature_2m,relative_humidity_2m,dew_point_2m,wind_gusts_10m,wind_speed_10m,wind_speed_80m,wind_direction_10m,wind_direction_80m,rain,snowfall,apparent_temperature,precipitation,visibility,lightning_potential,is_day,shortwave_radiation,direct_radiation,direct_radiation_instant,shortwave_radiation_instant,sunshine_duration,freezing_level_height,snowfall_height',
        daily: 'uv_index_clear_sky_max,uv_index_max,moonrise,moonset,moon_phase,sunshine_duration,daylight_duration,sunrise,sunset,showers_sum,rain_sum,snowfall_sum,temperature_2m_min,temperature_2m_max,weather_code,apparent_temperature_min,apparent_temperature_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,shortwave_radiation_sum,et0_fao_evapotranspiration,precipitation_sum,precipitation_hours',
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,wind_speed_10m,wind_direction_10m,snowfall,showers,rain,precipitation,weather_code,cloud_cover,wind_gusts_10m',
        timezone: timezone || 'auto',
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching forecast:', error);
    res.status(500).json({ error: 'Failed to fetch weather forecast' });
  }
};
