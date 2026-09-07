import React from 'react';
import { 
  Sun, Cloud, CloudRain, CloudLightning, CloudSnow, CloudDrizzle, 
  Wind, Droplets, Snowflake, Eye, Moon
} from 'lucide-react';

export function getWeatherDescription(code: number): string {
  switch (code) {
    case 0: return 'Clear sky';
    case 1: return 'Mainly clear';
    case 2: return 'Partly cloudy';
    case 3: return 'Overcast';
    case 45: return 'Fog';
    case 48: return 'Depositing rime fog';
    case 51: return 'Light drizzle';
    case 53: return 'Moderate drizzle';
    case 55: return 'Dense drizzle';
    case 56: return 'Light freezing drizzle';
    case 57: return 'Dense freezing drizzle';
    case 61: return 'Slight rain';
    case 63: return 'Moderate rain';
    case 65: return 'Heavy rain';
    case 66: return 'Light freezing rain';
    case 67: return 'Heavy freezing rain';
    case 71: return 'Slight snow fall';
    case 73: return 'Moderate snow fall';
    case 75: return 'Heavy snow fall';
    case 77: return 'Snow grains';
    case 80: return 'Slight rain showers';
    case 81: return 'Moderate rain showers';
    case 82: return 'Violent rain showers';
    case 85: return 'Slight snow showers';
    case 86: return 'Heavy snow showers';
    case 95: return 'Thunderstorm';
    case 96: return 'Thunderstorm with slight hail';
    case 99: return 'Thunderstorm with heavy hail';
    default: return 'Unknown';
  }
}

export function getWeatherIcon(code: number, className?: string, isDay: boolean = true): React.ReactNode {
  // Clear
  if (code === 0 || code === 1) {
    return isDay ? React.createElement(Sun, { className }) : React.createElement(Moon, { className });
  }
  // Cloudy
  if (code === 2 || code === 3 || code === 45 || code === 48) {
    return React.createElement(Cloud, { className });
  }
  // Drizzle / Rain
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return React.createElement(CloudRain, { className });
  }
  // Snow
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return React.createElement(CloudSnow, { className });
  }
  // Thunderstorm
  if ([95, 96, 99].includes(code)) {
    return React.createElement(CloudLightning, { className });
  }
  
  return React.createElement(Cloud, { className });
}
