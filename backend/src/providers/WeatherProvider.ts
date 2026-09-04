import { NormalizedWeatherData } from '../types/weather.types';

export interface WeatherProvider {
  /**
   * Fetches the complete normalized weather data for a given location.
   */
  getWeatherData(lat: number, lon: number): Promise<NormalizedWeatherData>;
}
