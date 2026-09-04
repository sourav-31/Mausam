import { PersonalizationEngine } from '../PersonalizationEngine';
import { NormalizedWeatherData } from '../../types/weather.types';

describe('Personalization Engine', () => {
  let engine: PersonalizationEngine;
  let mockWeather: NormalizedWeatherData;

  beforeEach(() => {
    engine = new PersonalizationEngine();
    mockWeather = {
      location: { lat: 0, lon: 0, name: 'Test City' },
      current: {
        temperature: 25,
        feelsLike: 26,
        humidity: 60,
        windSpeed: 10,
        windDirection: 0,
        uvIndex: 5,
        visibility: 10000,
        precipitationProbability: 0,
        condition: { id: 800, main: 'Clear', description: 'Clear sky', icon: 'sunny' }
      },
      hourly: [],
      daily: [],
      alerts: []
    };
  });

  it('should generate different insights for Rain for Student vs Farmer', () => {
    // Set to rain
    mockWeather.current.precipitationProbability = 90;
    mockWeather.current.condition.main = 'Rain';

    const studentConfig = engine.generateHomepage(mockWeather, 'Student', 'Student', ['Rain Forecast']);
    const farmerConfig = engine.generateHomepage(mockWeather, 'Farmer', 'Farmer', ['Rain Forecast']);

    const studentInsight = studentConfig.components.find(c => c.component === 'personalizedInsight')?.data;
    const farmerInsight = farmerConfig.components.find(c => c.component === 'personalizedInsight')?.data;

    expect(studentInsight.title).toContain('Rain');
    expect(studentInsight.message).toContain('college hours');

    expect(farmerInsight.message).toContain('irrigation plans');
  });

  it('should prioritize Critical Alerts above all', () => {
    // Severe thunderstorm
    mockWeather.current.condition.main = 'Thunderstorm';
    mockWeather.current.windSpeed = 55;

    const config = engine.generateHomepage(mockWeather, 'User', 'General User', []);

    expect(config.components[0].component).toBe('priorityAlert');
    expect(config.components[0].priority).toBe(100);
    expect(config.components[1].component).toBe('personalizedInsight');
  });
});
