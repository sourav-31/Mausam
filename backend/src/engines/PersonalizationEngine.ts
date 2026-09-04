import { NormalizedWeatherData } from '../types/weather.types';
import { InsightEngine, WeatherInsight } from './InsightEngine';
import { PriorityEngine } from './PriorityEngine';

export interface ComponentConfig {
  component: string;
  priority: number;
  data: any;
}

export interface PersonalizedHomepageConfig {
  greeting: string;
  components: ComponentConfig[];
  impactScore?: {
    title: string;
    score: number;
    description: string;
  };
}

export class PersonalizationEngine {
  private insightEngine: InsightEngine;
  private priorityEngine: PriorityEngine;

  constructor() {
    this.insightEngine = new InsightEngine();
    this.priorityEngine = new PriorityEngine();
  }

  public generateHomepage(
    weather: NormalizedWeatherData,
    userName: string,
    userProfile: string,
    userPreferences: string[]
  ): PersonalizedHomepageConfig {
    const currentHour = new Date().getHours();
    let greeting = "Good Morning";
    if (currentHour >= 12 && currentHour < 17) greeting = "Good Afternoon";
    else if (currentHour >= 17) greeting = "Good Evening";

    greeting = `${greeting}, ${userName.split(' ')[0]} 👋`;

    const insight = this.insightEngine.generateInsights(weather, userProfile);
    const scores = this.priorityEngine.calculateScores(weather, userPreferences);

    const components: ComponentConfig[] = [
      { component: 'weatherHero', priority: scores.weatherHero, data: weather.current },
      { component: 'personalizedInsight', priority: scores.personalizedInsight, data: insight },
      { component: 'dayTimeline', priority: scores.dayTimeline, data: weather.hourly },
      { component: 'hourlyForecast', priority: scores.hourlyForecast, data: weather.hourly },
      { component: 'weeklyForecast', priority: scores.weeklyForecast, data: weather.daily },
      { component: 'savedLocations', priority: scores.savedLocations, data: null }, // Handled by frontend via dedicated endpoint
    ];

    if (scores.priorityAlert > 0) {
      components.push({
        component: 'priorityAlert',
        priority: scores.priorityAlert,
        data: {
          title: "WEATHER WARNING",
          message: insight?.title,
          details: insight?.message,
          recommendation: insight?.recommendation
        }
      });
    }

    // Sort by priority descending
    components.sort((a, b) => b.priority - a.priority);

    // Calculate generic impact score based on profile
    let impactScore = 85;
    let scoreTitle = "Outdoor Comfort Score";
    if (userProfile === 'Driver') {
       scoreTitle = "Travel Safety Score";
       if (weather.current.precipitationProbability > 50) impactScore -= 20;
    } else if (userProfile === 'Farmer') {
       scoreTitle = "Agriculture Weather Score";
       if (weather.current.temperature > 35) impactScore -= 10;
    }

    if (weather.current.condition.main === 'Thunderstorm') impactScore -= 40;

    return {
      greeting,
      components,
      impactScore: {
        title: scoreTitle,
        score: impactScore,
        description: impactScore > 70 ? "Favorable conditions" : "Moderate to poor conditions"
      }
    };
  }
}
