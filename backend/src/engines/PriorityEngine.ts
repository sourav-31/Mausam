import { NormalizedWeatherData } from '../types/weather.types';

export class PriorityEngine {
  
  public calculateScores(
    weather: NormalizedWeatherData,
    userPreferences: string[]
  ): { [key: string]: number } {
    const scores: { [key: string]: number } = {
      weatherHero: 75,
      personalizedInsight: 80,
      dayTimeline: 50,
      hourlyForecast: 45,
      weeklyForecast: 40,
      savedLocations: 30,
      priorityAlert: 0
    };

    const { current } = weather;

    // Severity checks
    if (current.condition.main === 'Thunderstorm') {
      scores.priorityAlert = 100;
      scores.personalizedInsight = 90;
    } else if (current.windSpeed > 50) {
      scores.priorityAlert = 95;
    } else if (current.precipitationProbability > 80) {
      scores.priorityAlert = 85;
      if (userPreferences.includes('Rain Forecast')) {
        scores.personalizedInsight += 15;
      }
    } else if (current.uvIndex > 8) {
       scores.priorityAlert = 65;
       if (userPreferences.includes('UV Index')) {
          scores.personalizedInsight += 10;
       }
    }

    // Boost scores based on preferences
    if (userPreferences.includes('Temperature') && current.temperature > 35) {
      scores.personalizedInsight += 10;
    }

    return scores;
  }
}
