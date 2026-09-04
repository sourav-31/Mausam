import axios from 'axios';
import { WeatherProvider } from './WeatherProvider';
import { NormalizedWeatherData, WeatherCondition } from '../types/weather.types';

export class OpenMeteoProvider implements WeatherProvider {
  private baseUrl = 'https://api.open-meteo.com/v1/forecast';

  async getWeatherData(lat: number, lon: number): Promise<NormalizedWeatherData> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          latitude: lat,
          longitude: lon,
          current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,snowfall,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
          hourly: 'temperature_2m,precipitation_probability,weather_code,visibility,uv_index',
          daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
          timezone: 'auto'
        }
      });

      return this.normalizeData(lat, lon, response.data);
    } catch (error) {
      console.error('Error fetching data from OpenMeteo', error);
      throw new Error('Failed to fetch weather data');
    }
  }

  private normalizeData(lat: number, lon: number, data: any): NormalizedWeatherData {
    const current = data.current;
    
    // Fallback if visibility or uv index is not in current (OpenMeteo has them in hourly)
    const currentHourIndex = 0; // Usually first hour in hourly is current or close
    const uvIndex = data.hourly.uv_index ? data.hourly.uv_index[currentHourIndex] : 0;
    const visibility = data.hourly.visibility ? data.hourly.visibility[currentHourIndex] : 10000;

    return {
      location: {
        lat,
        lon
      },
      current: {
        temperature: current.temperature_2m,
        feelsLike: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        windDirection: current.wind_direction_10m,
        uvIndex: uvIndex,
        visibility: visibility,
        precipitationProbability: data.hourly.precipitation_probability ? data.hourly.precipitation_probability[currentHourIndex] : 0,
        condition: this.mapWeatherCode(current.weather_code)
      },
      hourly: data.hourly.time.slice(0, 24).map((timeStr: string, index: number) => ({
        time: new Date(timeStr),
        temperature: data.hourly.temperature_2m[index],
        precipitationProbability: data.hourly.precipitation_probability[index],
        condition: this.mapWeatherCode(data.hourly.weather_code[index])
      })),
      daily: data.daily.time.map((timeStr: string, index: number) => ({
        date: new Date(timeStr),
        minTemperature: data.daily.temperature_2m_min[index],
        maxTemperature: data.daily.temperature_2m_max[index],
        precipitationProbability: data.daily.precipitation_probability_max[index],
        condition: this.mapWeatherCode(data.daily.weather_code[index])
      })),
      alerts: [] // OpenMeteo doesn't easily provide real-time alerts without a different API, we will mock or handle severe weather via our own engine
    };
  }

  private mapWeatherCode(code: number): WeatherCondition {
    // WMO Weather interpretation codes (WW)
    // Map to a simplified condition set
    if (code === 0) return { id: code, main: 'Clear', description: 'Clear sky', icon: 'sunny' };
    if ([1, 2, 3].includes(code)) return { id: code, main: 'Clouds', description: 'Partly cloudy', icon: 'cloudy' };
    if ([45, 48].includes(code)) return { id: code, main: 'Fog', description: 'Fog', icon: 'cloudy' }; // Simplification
    if ([51, 53, 55, 56, 57].includes(code)) return { id: code, main: 'Drizzle', description: 'Drizzle', icon: 'rain' };
    if ([61, 63, 65, 66, 67].includes(code)) return { id: code, main: 'Rain', description: 'Rain', icon: 'rain' };
    if ([71, 73, 75, 77, 85, 86].includes(code)) return { id: code, main: 'Snow', description: 'Snow', icon: 'cloudy' }; // Simplified
    if ([80, 81, 82].includes(code)) return { id: code, main: 'Rain', description: 'Rain showers', icon: 'rain' };
    if ([95, 96, 99].includes(code)) return { id: code, main: 'Thunderstorm', description: 'Thunderstorm', icon: 'thunderstorm' };
    
    return { id: code, main: 'Unknown', description: 'Unknown', icon: 'cloudy' };
  }
}
