import { NormalizedWeatherData } from '../types/weather.types';
import { User, UserProfile } from '@prisma/client';

export interface WeatherInsight {
  title: string;
  message: string;
  recommendation: string;
  reasoning: string;
}

export class InsightEngine {
  
  public generateInsights(
    weather: NormalizedWeatherData,
    userProfile: string
  ): WeatherInsight | null {
    
    const { current } = weather;
    
    // Check for severe weather first
    if (current.condition.main === 'Thunderstorm' || current.windSpeed > 40) {
      return this.generateSevereInsight(weather, userProfile);
    }
    
    // Check for rain
    if (current.precipitationProbability > 50 || current.condition.main === 'Rain') {
      return this.generateRainInsight(weather, userProfile);
    }
    
    // Check for heat
    if (current.temperature > 38) {
      return this.generateHeatInsight(weather, userProfile);
    }
    
    // Check for high UV
    if (current.uvIndex >= 7) {
      return this.generateUVInsight(weather, userProfile);
    }
    
    // Default pleasant weather
    return {
      title: "Pleasant Weather",
      message: "The weather is looking good today.",
      recommendation: "Great time to be outside.",
      reasoning: "Current conditions are clear with comfortable temperatures and low rain probability."
    };
  }
  
  private generateRainInsight(weather: NormalizedWeatherData, profile: string): WeatherInsight {
    const defaultReasoning = `This insight is shown because rainfall probability is at ${weather.current.precipitationProbability}% today.`;
    
    switch (profile) {
      case 'Student':
        return {
          title: "Rain Expected Today",
          message: "Rain is expected during college hours. Consider leaving earlier for your commute.",
          recommendation: "Carry an umbrella and wear water-resistant shoes.",
          reasoning: defaultReasoning
        };
      case 'Farmer':
        return {
          title: "Rainfall Expected",
          message: "Moderate to heavy rainfall is expected today. Review your irrigation plans before watering crops.",
          recommendation: "Review irrigation plans and postpone field spraying.",
          reasoning: defaultReasoning
        };
      case 'Traveller':
        return {
          title: "Rain During Travel",
          message: "Rainfall may affect road conditions and sightseeing plans.",
          recommendation: "Plan indoor activities or keep rain gear handy.",
          reasoning: defaultReasoning
        };
      case 'Driver':
        return {
          title: "Wet Roads Expected",
          message: "Wet roads and reduced visibility may affect driving conditions.",
          recommendation: "Drive cautiously and maintain safe distance.",
          reasoning: defaultReasoning
        };
      case 'Fitness Enthusiast':
        return {
          title: "Rain Affecting Workout",
          message: "Outdoor workout conditions will be affected by rain.",
          recommendation: "Consider moving your workout indoors today.",
          reasoning: defaultReasoning
        };
      default:
        return {
          title: "Rain Expected",
          message: "Rain is expected later today.",
          recommendation: "Consider carrying an umbrella if you are heading out.",
          reasoning: defaultReasoning
        };
    }
  }
  
  private generateSevereInsight(weather: NormalizedWeatherData, profile: string): WeatherInsight {
     return {
        title: "Severe Weather Alert",
        message: "Dangerous weather conditions are expected in your area.",
        recommendation: "Avoid unnecessary travel and stay safe.",
        reasoning: `This alert is generated due to high wind speeds (${weather.current.windSpeed} km/h) or thunderstorm conditions.`
     };
  }

  private generateHeatInsight(weather: NormalizedWeatherData, profile: string): WeatherInsight {
    return {
       title: "High Temperature Advisory",
       message: `Temperatures are expected to reach ${weather.current.temperature}°C today.`,
       recommendation: "Stay hydrated and avoid direct sunlight during peak hours.",
       reasoning: `Current temperature is ${weather.current.temperature}°C which exceeds the comfort threshold.`
    };
  }

  private generateUVInsight(weather: NormalizedWeatherData, profile: string): WeatherInsight {
    return {
       title: "High UV Index",
       message: `UV levels are high (${weather.current.uvIndex}).`,
       recommendation: "Apply sunscreen and wear protective clothing if outdoors.",
       reasoning: `The UV index is ${weather.current.uvIndex}, which can cause skin damage quickly.`
    };
  }
}
