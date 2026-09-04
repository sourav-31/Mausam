export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string; // e.g. "sunny", "rain", "cloudy"
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  uvIndex: number;
  visibility: number; // in meters
  precipitationProbability: number;
  condition: WeatherCondition;
}

export interface HourlyForecast {
  time: Date;
  temperature: number;
  precipitationProbability: number;
  condition: WeatherCondition;
}

export interface DailyForecast {
  date: Date;
  minTemperature: number;
  maxTemperature: number;
  precipitationProbability: number;
  condition: WeatherCondition;
}

export interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  severity: 'INFO' | 'ADVISORY' | 'WARNING' | 'CRITICAL';
  startTime: Date;
  endTime: Date;
}

export interface NormalizedWeatherData {
  location: {
    lat: number;
    lon: number;
    name?: string;
  };
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  alerts: WeatherAlert[];
}
