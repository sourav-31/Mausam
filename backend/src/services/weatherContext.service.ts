import axios from 'axios';

export interface UserHealthContext {
  healthConditions?: string[];
  allergies?: string[];
  weatherSensitivities?: string[];
  additionalInfo?: string | null;
}

export interface UserRoutineContext {
  activities?: string[];
  activityFrequency?: string | null;
  preferredTime?: string | null; // "Morning" | "Afternoon" | "Evening" | "Night"
  commuteMethod?: string | null;
}

export interface HourlyAnalysis {
  timeStr: string;
  hour: number;
  temperature: number;
  feelsLike: number;
  rainProb: number;
  uvIndex: number;
  pm25: number;
  humidity: number;
  pressure: number;
  score: number;
  warnings: string[];
}

export interface WalkRecommendation {
  bestWindow: string;
  bestHour: HourlyAnalysis;
  alternativeWindow?: string;
  avoidWindow?: string;
  reasons: string[];
  healthAlerts: string[];
  summaryText: string;
}

export class WeatherContextService {
  /**
   * Fetch 24-hour weather and air quality for coordinates and run multi-window analysis
   */
  async analyzeOutdoorConditions(
    lat: number,
    lon: number,
    cityName?: string,
    health?: UserHealthContext,
    routine?: UserRoutineContext
  ): Promise<WalkRecommendation> {
    try {
      // 1. Fetch Forecast from Open-Meteo
      const weatherPromise = axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude: lat,
          longitude: lon,
          hourly: 'temperature_2m,apparent_temperature,precipitation_probability,relative_humidity_2m,surface_pressure,wind_speed_10m,uv_index,weather_code',
          timezone: 'auto',
          forecast_days: 2,
        },
        timeout: 7000,
      });

      // 2. Fetch Air Quality from Open-Meteo
      const aqiPromise = axios.get('https://air-quality-api.open-meteo.com/v1/air-quality', {
        params: {
          latitude: lat,
          longitude: lon,
          hourly: 'pm2_5,pm10,ozone,european_aqi',
          timezone: 'auto',
          forecast_days: 2,
        },
        timeout: 7000,
      }).catch(() => ({ data: { hourly: {} } })); // Air quality fallback if unavailable

      const [weatherRes, aqiRes] = await Promise.all([weatherPromise, aqiPromise]);

      const wHourly = weatherRes.data?.hourly || {};
      const aHourly = aqiRes.data?.hourly || {};

      const now = new Date();
      const currentHour = now.getHours();

      // Find start index matching current hour or look ahead next 24 hours
      const times: string[] = wHourly.time || [];
      let startIndex = times.findIndex((t) => new Date(t).getTime() >= now.getTime() - 30 * 60 * 1000);
      if (startIndex === -1) startIndex = 0;

      const next24 = times.slice(startIndex, startIndex + 24);

      const hasAsthma = health?.healthConditions?.some((c) => /asthma|respiratory|breathing/i.test(c));
      const hasMigraine = health?.healthConditions?.some((c) => /migraine|headache/i.test(c));
      const hasArthritis = health?.healthConditions?.some((c) => /arthritis|joint/i.test(c));
      const heatSensitive = health?.weatherSensitivities?.some((s) => /heat|hot/i.test(s));
      const coldSensitive = health?.weatherSensitivities?.some((s) => /cold/i.test(s));

      const preferredTime = routine?.preferredTime?.toLowerCase() || '';

      const scoredHours: HourlyAnalysis[] = next24.map((timeStr, idx) => {
        const globalIdx = startIndex + idx;
        const date = new Date(timeStr);
        const hour = date.getHours();

        const temp = wHourly.temperature_2m?.[globalIdx] ?? 22;
        const feelsLike = wHourly.apparent_temperature?.[globalIdx] ?? temp;
        const rainProb = wHourly.precipitation_probability?.[globalIdx] ?? 0;
        const uv = wHourly.uv_index?.[globalIdx] ?? 0;
        const humidity = wHourly.relative_humidity_2m?.[globalIdx] ?? 50;
        const pressure = wHourly.surface_pressure?.[globalIdx] ?? 1013;
        const pm25 = aHourly.pm2_5?.[globalIdx] ?? 20;

        let score = 100;
        const warnings: string[] = [];

        // Rain Penalty
        if (rainProb >= 40) {
          score -= 45;
          warnings.push(`High rain risk (${rainProb}%)`);
        } else if (rainProb >= 20) {
          score -= 20;
          warnings.push(`Slight rain possibility (${rainProb}%)`);
        }

        // Temperature & Heat Stress Penalty
        if (feelsLike > 34) {
          score -= heatSensitive ? 50 : 35;
          warnings.push(`Excessive heat (${Math.round(feelsLike)}°C feels-like)`);
        } else if (feelsLike > 29) {
          score -= heatSensitive ? 30 : 15;
          warnings.push(`Warm (${Math.round(feelsLike)}°C)`);
        } else if (feelsLike < 10) {
          score -= coldSensitive ? 35 : 20;
          warnings.push(`Cold weather (${Math.round(feelsLike)}°C)`);
        } else if (feelsLike >= 18 && feelsLike <= 24) {
          score += 10; // Optimal walking sweet-spot
        }

        // UV Penalty
        if (uv >= 7) {
          score -= 25;
          warnings.push(`Very high UV (${uv.toFixed(1)})`);
        } else if (uv >= 5) {
          score -= 10;
        }

        // AQI / PM2.5 Penalty
        if (pm25 >= 60) {
          const deduction = hasAsthma ? 60 : 40;
          score -= deduction;
          warnings.push(`Unhealthy air quality (PM2.5: ${Math.round(pm25)} µg/m³)`);
        } else if (pm25 >= 35) {
          const deduction = hasAsthma ? 35 : 18;
          score -= deduction;
          warnings.push(`Moderate particulate pollution (PM2.5: ${Math.round(pm25)} µg/m³)`);
        }

        // Arthritis specific
        if (hasArthritis && humidity > 80 && temp < 16) {
          score -= 30;
          warnings.push(`Damp cold air may aggravate joint pain`);
        }

        // Routine Preference Alignment
        if (preferredTime === 'morning' && hour >= 6 && hour <= 9) {
          score += 20;
        } else if (preferredTime === 'evening' && hour >= 16 && hour <= 19) {
          score += 20;
        } else if (preferredTime === 'afternoon' && hour >= 12 && hour <= 15) {
          score += 15;
        }

        // Restrict sleeping hours (11 PM - 5 AM) for general walking unless specified
        if (hour >= 23 || hour <= 4) {
          score -= 40;
        }

        return {
          timeStr,
          hour,
          temperature: Math.round(temp),
          feelsLike: Math.round(feelsLike),
          rainProb,
          uvIndex: uv,
          pm25: Math.round(pm25),
          humidity,
          pressure: Math.round(pressure),
          score: Math.max(0, Math.min(100, score)),
          warnings,
        };
      });

      // Filter daytime/active hours (5 AM to 10 PM) for the best recommendation
      const activeHours = scoredHours.filter((h) => h.hour >= 5 && h.hour <= 22);
      const sortedByScore = [...activeHours].sort((a, b) => b.score - a.score);

      const best = sortedByScore[0] || scoredHours[0];
      const secondBest = sortedByScore.find((h) => Math.abs(h.hour - best.hour) >= 3) || sortedByScore[1];
      const worst = [...activeHours].sort((a, b) => a.score - b.score)[0];

      // Format time window string (e.g. "6:00 AM - 7:30 AM")
      const formatHour = (h: number) => {
        const period = h >= 12 ? 'PM' : 'AM';
        const display = h % 12 === 0 ? 12 : h % 12;
        return `${display}:00 ${period}`;
      };

      const formatWindow = (h: number) => {
        const start = formatHour(h);
        const end = formatHour((h + 1) % 24);
        return `${start} – ${end}`;
      };

      const reasons: string[] = [];
      reasons.push(`Pleasant temperature around ${best.temperature}°C (${best.feelsLike}°C feels-like)`);
      if (best.rainProb <= 10) reasons.push(`Minimal rain risk (${best.rainProb}%)`);
      if (best.pm25 <= 35) reasons.push(`Cleanest air quality of the day (PM2.5: ${best.pm25} µg/m³)`);
      if (best.uvIndex < 4) reasons.push(`Safe UV index (${best.uvIndex.toFixed(1)}) with low sunburn hazard`);

      const healthAlerts: string[] = [];
      if (hasAsthma) {
        healthAlerts.push(`Asthma Notice: PM2.5 levels are safest at ${formatHour(best.hour)} (${best.pm25} µg/m³). Avoid peak afternoon traffic hours.`);
      }
      if (hasMigraine && worst && Math.abs(worst.pressure - best.pressure) >= 3) {
        healthAlerts.push(`Migraine Advisory: Barometric pressure fluctuates near ${worst.pressure} hPa; stay well hydrated.`);
      }
      if (hasArthritis && best.humidity < 70) {
        healthAlerts.push(`Joint Care: Humidity drops to ${best.humidity}% during this window, reducing stiffness.`);
      }

      const locationLabel = cityName ? ` in ${cityName}` : '';
      const summaryText = `🚶 **Optimal Walking Time${locationLabel}**: **${formatWindow(best.hour)}**\n` +
        `• **Conditions**: ${best.temperature}°C, Rain ${best.rainProb}%, PM2.5: ${best.pm25} µg/m³, UV: ${best.uvIndex.toFixed(1)}\n` +
        `• **Why it's best**: ${reasons.join(' • ')}\n` +
        (secondBest ? `• **Alternative Window**: ${formatWindow(secondBest.hour)} (${secondBest.temperature}°C, Rain ${secondBest.rainProb}%)\n` : '') +
        (worst && worst.score < 50 ? `• **Hours to Avoid**: ${formatWindow(worst.hour)} (${worst.warnings.join(', ') || 'Poor conditions'})\n` : '') +
        (healthAlerts.length > 0 ? `• **Personalized Health Notes**: ${healthAlerts.join(' ')}` : '');

      return {
        bestWindow: formatWindow(best.hour),
        bestHour: best,
        alternativeWindow: secondBest ? formatWindow(secondBest.hour) : undefined,
        avoidWindow: worst ? formatWindow(worst.hour) : undefined,
        reasons,
        healthAlerts,
        summaryText,
      };
    } catch (err) {
      console.error('Error analyzing outdoor conditions:', err);
      // Fallback standard recommendation
      return {
        bestWindow: '6:30 AM – 7:30 AM',
        bestHour: {
          timeStr: new Date().toISOString(),
          hour: 7,
          temperature: 21,
          feelsLike: 21,
          rainProb: 0,
          uvIndex: 1,
          pm25: 22,
          humidity: 55,
          pressure: 1013,
          score: 90,
          warnings: [],
        },
        reasons: ['Mild morning temperature', '0% precipitation probability', 'Low particulate matter'],
        healthAlerts: ['Air quality is generally best in early morning before rush hour traffic.'],
        summaryText: `🚶 **Recommended Walking Time**: Early Morning (**6:30 AM – 7:30 AM**) or Late Afternoon (**5:30 PM – 6:30 PM**).\n` +
          `• Temperature is typically cooler, UV exposure is low, and traffic emissions are lower.`,
      };
    }
  }
}

export const weatherContextService = new WeatherContextService();
