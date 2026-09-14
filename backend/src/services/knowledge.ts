/**
 * Mausam 2.0 Knowledge Base & Intelligent Heuristic Fallback Engine
 * 
 * Contains complete website documentation, feature explanations, telemetry science,
 * data sources, and navigation guides for Mausam 2.0.
 */

export const MAUSAM_SYSTEM_PROMPT = `You are "Mausam AI", the official intelligent atmospheric assistant for Mausam 2.0 (an advanced, next-generation hyper-local weather intelligence platform).

Your primary purpose is to help users navigate the website, understand weather telemetry, utilize live radar, interpret health & lifestyle advisories, configure settings, and answer any atmospheric or meteorological questions accurately, politely, and concisely.

### Complete Knowledge of Mausam 2.0:

1. **What is Mausam 2.0?**
   - Mausam 2.0 is a modern, high-precision weather and atmospheric intelligence application.
   - It combines high-resolution numerical weather prediction, live Doppler precipitation radar, air quality indexing (AQI), and personalized health/routine impact forecasts.
   - Designed with an ultra-sleek glassmorphic interface, dark/light theme dynamics, and instant global search.

2. **Core Pages & Navigation**:
   - **Homepage / Weather Dashboard ('/')**:
     - Live atmospheric conditions: Temperature, Feels-like (apparent temp), Humidity, Dew point, Atmospheric Pressure, Visibility, Wind speed & direction, UV Index, Sunrise & Sunset times.
     - Search Bar: Quick autocomplete powered by OpenStreetMap Photon geocoder to search any city, locality, or landmark worldwide. Also has a GPS button to detect current location.
     - Hourly Forecast Curve: Interactive hourly temperature trend, precipitation probability (%), and WMO weather condition icons for the next 24 hours.
     - 7-Day Extended Forecast: Daily max/min temperatures, precipitation likelihood, weather summary.
     - Air Quality Card: Real-time AQI score with European/US standards, particulate levels (PM2.5, PM10, Nitrogen Dioxide NO2, Ozone O3, Sulphur Dioxide SO2).
     - Weather Alerts & Health Advisory preview cards.
     - Unit switcher: Easily toggle between Celsius (°C) and Fahrenheit (°F) via the header button.
   - **Live Radar Page ('/radar')**:
     - Interactive RainViewer Doppler precipitation radar and cloud layers on a Leaflet map.
     - Features: Time scrubber (replay past radar frames and forecast precipitation), Play/Pause animation, layer opacity slider, color scheme selection, tile zoom, and fullscreen mode.
   - **Documentation Page ('/documentation')**:
     - Deep dive into telemetry models, open data sources, license attributions (CC BY 4.0), and numerical weather prediction equations.
   - **Personalized Home & Routine Planner ('/home' & '/onboarding')**:
     - Available for registered/logged-in users.
     - Customized widgets tailored to your health profile:
       * Asthma & Respiratory: Alerts for elevated PM2.5, ozone peaks, humidity changes.
       * Migraine & Weather Sensitivity: Barometric pressure drop alerts.
       * Arthritis & Joint Pain: Cold snaps and high humidity warnings.
       * Outdoor Fitness & Daily Commute: Optimal hours for running, cycling, or avoiding rain.
   - **Authentication ('/login' & '/register')**:
     - Secure account login, password encryption via bcrypt, JWT tokens, persistent user preferences.

3. **Data Sources & Scientific Providers**:
   - **Atmospheric Forecasts**: Open-Meteo Weather API combining numerical models:
     * ECMWF (IFS 9km - European Centre for Medium-Range Weather Forecasts)
     * NOAA GFS (13km - Global Forecast System)
     * DWD ICON (2km Central Europe & 13km Global - German Weather Service)
     * Météo-France ARPEGE
   - **Precipitation Radar**: RainViewer Global Radar API (Doppler radar composites updated every 10 minutes).
   - **Air Quality**: Copernicus Atmosphere Monitoring Service (CAMS) & Open-Meteo Air Quality.
   - **Geocoding & Search**: Photon API powered by OpenStreetMap (OSM) geographic database.

4. **Tone & Style Guidelines**:
   - Be helpful, polite, concise, and enthusiastic about meteorology and Mausam 2.0.
   - When suggesting actions, refer to specific UI elements (e.g. "Click the 'Radar' tab in the navigation bar", "Use the °C / °F toggle in the top header", "Search for your city in the top search bar").
   - Format responses using clean markdown (bullet points, bold text).
   - If a user asks a general weather question (e.g. "Why is humidity high today?" or "What causes rain?"), answer accurately based on meteorological principles.
`;

interface KnowledgeEntry {
  id: string;
  title: string;
  keywords: string[];
  response: string;
}

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    id: 'radar',
    title: 'Live Precipitation Radar',
    keywords: ['radar', 'rain', 'map', 'doppler', 'storm', 'cloud', 'precipitation', 'satellite', 'track rain'],
    response: `🌧️ **Live Radar on Mausam 2.0**

You can access the live interactive precipitation radar directly by navigating to the **[Radar](/radar)** page in the top navigation bar!

**Key Features of the Radar:**
• **Doppler Rain Tracking**: Powered by the RainViewer global composite radar network, updated every 10 minutes.
• **Time Scrubber & Animation**: Click the **Play** button to animate the storm trajectory over the past 2 hours to see where rain is heading.
• **Layer Controls**: Toggle between precipitation radar and satellite cloud coverage.
• **Opacity & Zoom**: Adjust the transparency slider to overlay weather conditions clearly on geographical roads and terrain.`,
  },
  {
    id: 'unit_toggle',
    title: 'Switching Units (°C / °F)',
    keywords: ['unit', 'celsius', 'fahrenheit', 'temperature', 'switch temp', 'degree', 'change to f', 'change to c'],
    response: `🌡️ **How to Switch Temperature Units (°C / °F)**

On the **Homepage Dashboard**, look at the top navigation header:
1. Locate the **°C / °F** toggle button near the search bar and location selector.
2. Click it once to instantly convert all temperatures across the dashboard (current temperature, hourly forecast, 7-day forecast, and feels-like temperature) to your preferred unit.`,
  },
  {
    id: 'health_advisory',
    title: 'Health & Personalized Alerts',
    keywords: ['health', 'asthma', 'migraine', 'arthritis', 'allergy', 'air quality', 'aqi', 'breathe', 'headache', 'pain'],
    response: `🏥 **Health & Weather Sensitivity Advisories**

Mausam 2.0 correlates atmospheric conditions with health triggers:
• **Asthma & Respiratory**: Monitors PM2.5, PM10, and Ozone (O3) spikes. Recommends wearing an N95 mask or staying indoors during poor air quality.
• **Migraine & Barometric Pressure**: Sudden drops in atmospheric pressure (below 1010 hPa) often trigger weather headaches; Mausam provides early warnings.
• **Arthritis & Joint Sensitivity**: Notifies you when cold fronts combine with high humidity (>80%).

👉 Log in and complete your **Health Profile** during onboarding to get personalized daily recommendations!`,
  },
  {
    id: 'air_quality',
    title: 'Air Quality Index (AQI)',
    keywords: ['aqi', 'air quality', 'pollution', 'pm2.5', 'pm10', 'ozone', 'no2', 'smog'],
    response: `💨 **Air Quality Index (AQI) Telemetry**

Mausam 2.0 retrieves real-time air quality metrics powered by the Copernicus Atmosphere Monitoring Service (CAMS) & Open-Meteo:
• **AQI Score**: Color-coded from Good (0-50, Green) to Hazardous (300+, Purple).
• **Particulate Matter (PM2.5 & PM10)**: Fine microscopic inhalable particles from traffic, smoke, and industrial activity.
• **Trace Gases**: Real-time measurements of Nitrogen Dioxide ($NO_2$), Ozone ($O_3$), and Sulphur Dioxide ($SO_2$).
• Check the Air Quality card on the main dashboard for your location's current status and health recommendations.`,
  },
  {
    id: 'search_location',
    title: 'Searching Cities & GPS Location',
    keywords: ['search', 'city', 'location', 'gps', 'find place', 'change city', 'pin', 'town', 'country'],
    response: `📍 **Finding Weather for Any Location**

You can check weather conditions anywhere in the world:
1. **Search Bar**: Type any city, town, or neighborhood into the search bar at the top of the dashboard. Autocomplete suggestions will appear via OpenStreetMap Photon.
2. **Current GPS Location**: Click the **Locate Me / Compass** icon next to the search bar to automatically retrieve high-precision weather for your current GPS coordinates.`,
  },
  {
    id: 'data_sources',
    title: 'Data Sources & Scientific Transparency',
    keywords: ['data source', 'api', 'model', 'provider', 'open-meteo', 'accuracy', 'ecmwf', 'gfs', 'rainviewer', 'reliable'],
    response: `🔬 **Where Does Mausam 2.0 Get Its Data?**

Mausam 2.0 integrates top-tier open scientific datasets:
• **Atmospheric Numerical Models**: Open-Meteo combining **ECMWF** (European 9km IFS), **NOAA GFS** (13km), and German **DWD ICON**.
• **Live Precipitation Radar**: **RainViewer API** (real-time Doppler radar composites).
• **Air Quality**: **Copernicus Atmosphere Monitoring Service (CAMS)**.
• **Geocoding**: **OpenStreetMap Photon** database.

You can inspect all API endpoints and mathematical resolutions on our **[Documentation](/documentation)** page.`,
  },
  {
    id: 'forecast_features',
    title: 'Hourly & 7-Day Forecasts',
    keywords: ['hourly', 'forecast', '7-day', 'weekly', 'tomorrow', 'precipitation chance', 'sunrise', 'sunset', 'uv index'],
    response: `📅 **Forecasts & Atmospheric Indicators**

On your main dashboard:
• **Hourly Breakdown**: Continuous 24-hour temperature and rain probability graphs.
• **7-Day Trend**: Day-by-day temperature range (Highs & Lows), expected weather conditions, and rain likelihood.
• **UV Index**: Daily peak ultraviolet radiation ratings with sun safety recommendations (SPF, shades, peak avoidance hours).
• **Solar Telemetry**: Exact sunrise, solar noon, and sunset timings calculated for your specific latitude & longitude.`,
  },
  {
    id: 'account_profile',
    title: 'Account, Login & Personalized Dashboard',
    keywords: ['login', 'register', 'account', 'profile', 'save', 'password', 'sign in', 'signup'],
    response: `👤 **Accounts & Personalization on Mausam 2.0**

Creating a free account lets you:
• Save your favorite cities and default location.
• Unlock the **Personalized Home** dashboard with custom widgets for your daily commute and workout schedule.
• Set up custom health trigger alerts (allergies, asthma, arthritis).
• Click **Sign In** or **Register** in the top navigation to get started!`,
  },
];

/**
 * Intelligent Heuristic Matcher:
 * Used as an instant fallback when GEMINI_API_KEY is not configured or during network hiccups.
 */
export function matchKnowledge(userQuery: string): string {
  const queryLower = userQuery.toLowerCase().trim();

  // Greetings
  if (/^(hi|hello|hey|greetings|hola|namaste|good (morning|afternoon|evening))/i.test(queryLower)) {
    return `👋 Hello! I'm your **Mausam AI Assistant**. 

I have complete knowledge about **Mausam 2.0**! You can ask me about:
• 🌧️ How to use the **Live Radar** & track rain storms
• 🌡️ Switching between **°C and °F**
• 🏥 **Health alerts** for asthma, migraines & joint sensitivity
• 💨 Understanding **Air Quality (AQI)** & PM2.5
• 🔬 Our scientific **data sources** & Open-Meteo models
• 📍 Searching cities or using GPS location

How can I help you today?`;
  }

  // Thanks
  if (/^(thanks|thank you|awesome|great|cool|perfect|good job)/i.test(queryLower)) {
    return `You're very welcome! Let me know if you have any more questions about weather forecasts, the radar, or health alerts on Mausam 2.0. Have a wonderful day! ☀️`;
  }

  // Score knowledge entries based on keyword matches
  let bestEntry: KnowledgeEntry | null = null;
  let maxScore = 0;

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (queryLower.includes(keyword.toLowerCase())) {
        score += keyword.length > 4 ? 3 : 1;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestEntry = entry;
    }
  }

  if (bestEntry && maxScore >= 2) {
    return bestEntry.response;
  }

  // Default intelligent fallback if no specific topic match
  return `🤖 **Mausam AI Assistant**

I'm here to help with anything on **Mausam 2.0**! Here are popular topics you can explore:

1. **[Live Radar](/radar)**: Track real-time rain and cloud movements with time animation.
2. **Temperature Units**: Click the **°C / °F** button in the top navigation header to toggle units.
3. **Air Quality & Health**: View AQI, PM2.5 ratings, and health warnings for asthma or migraines.
4. **Data Sources**: Read our **[Documentation](/documentation)** to learn about ECMWF, NOAA GFS, and RainViewer models.
5. **Location Search**: Use the search bar at the top to find any city worldwide, or click the GPS icon.

*Tip: You can ask me specific questions like "How does the radar work?" or "Explain AQI"!*`;
}
