import React, { useState, useEffect, useCallback } from 'react';
import { 
  Cloud, Map, Lightbulb, Wind, Settings, HelpCircle, Activity, 
  MapPin, ChevronDown, Search, Bell, User, 
  Sun, CloudRain, Droplets, Leaf, Eye, Umbrella, Sunrise,
  ArrowUp, ArrowDown, ChevronRight, PlayCircle,
  Loader2
} from 'lucide-react';
import { weatherService, type LocationSearchResult, type WeatherData } from '../services/weather.service';
import { getWeatherDescription, getWeatherIcon } from '../lib/weather-utils';

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [activeLocation, setActiveLocation] = useState<LocationSearchResult>({
    id: 5391959,
    name: 'San Francisco',
    latitude: 37.7749,
    longitude: -122.4194,
    elevation: 16,
    feature_code: 'PPLA2',
    country_code: 'US',
    timezone: 'America/Los_Angeles',
    country_id: 6252001,
    country: 'United States',
    admin1: 'California'
  });

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);

  // Use a ref or simple debounce for searching
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await weatherService.searchLocation(searchQuery);
        setSearchResults(results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    async function loadWeather() {
      setIsLoadingWeather(true);
      try {
        const data = await weatherService.getForecast(activeLocation.latitude, activeLocation.longitude, activeLocation.timezone);
        setWeatherData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingWeather(false);
      }
    }
    loadWeather();
  }, [activeLocation]);

  const handleSelectLocation = (loc: LocationSearchResult) => {
    setActiveLocation(loc);
    setSearchQuery('');
    setShowDropdown(false);
  };

  // Helper formatting functions
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };
  const formatHour = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: 'numeric' });
  };
  const formatDay = (isoString: string) => {
    return new Date(isoString).toLocaleDateString([], { weekday: 'long' });
  };
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // derived values
  let currentHourIndex = 0;
  let minWeekTemp = 0;
  let maxWeekTemp = 100;

  if (weatherData) {
    const currentHourStr = weatherData.current.time.substring(0, 13) + ":00";
    currentHourIndex = weatherData.hourly.time.findIndex(t => t === currentHourStr);
    if (currentHourIndex === -1) currentHourIndex = 0;

    minWeekTemp = Math.min(...weatherData.daily.temperature_2m_min);
    maxWeekTemp = Math.max(...weatherData.daily.temperature_2m_max);
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-600 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[240px] bg-white flex flex-col justify-between border-r border-slate-200 flex-shrink-0 z-20">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight truncate">AetherWeather</span>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center bg-slate-100 p-3 rounded-xl mb-4 border border-slate-200 shadow-sm cursor-pointer hover:border-slate-300 transition-colors overflow-hidden">
               <div className="min-w-0 flex-1 pr-2">
                 <p className="text-xs text-slate-900 font-bold mb-0.5 truncate">{activeLocation.name}</p>
                 <p className="text-[9px] text-slate-500 font-medium truncate">{activeLocation.admin1 ? `${activeLocation.admin1}, ` : ''}{activeLocation.country_code}</p>
               </div>
               <Activity className="w-4 h-4 text-emerald-500 shrink-0" />
            </div>
            
            <nav className="space-y-1">
              <NavItem icon={<Cloud />} label="Atmosphere" active />
              <NavItem icon={<Map />} label="Radar Maps" />
              <NavItem icon={<Lightbulb />} label="Smart Insights" />
              <NavItem icon={<Wind />} label="Air & Pollen" />
              <NavItem icon={<Settings />} label="Settings" />
            </nav>
          </div>

          <button className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl flex items-center justify-center gap-2 font-bold transition-colors text-xs shadow-lg shadow-blue-500/20">
            <MapPin className="w-4 h-4" />
            Live Satellite
          </button>
        </div>

        <div className="p-6 border-t border-slate-100 space-y-4">
          <NavItem icon={<HelpCircle />} label="Support" minimal />
          <NavItem icon={<Activity />} label="System Status" minimal />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 relative z-10">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50 shrink-0">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 hover:bg-slate-100 p-2 rounded-lg cursor-pointer transition-colors max-w-[200px]">
               <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
               <span className="text-sm font-bold text-slate-800 truncate">{activeLocation.name}</span>
               <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
             </div>
             
             <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-500">
                <a href="#" className="text-slate-900 border-b-2 border-blue-600 py-5">Dashboard</a>
                <a href="#" className="hover:text-slate-700 transition-colors py-5">Radar & Satellite</a>
                <a href="#" className="hover:text-slate-700 transition-colors py-5">Lifestyle AI</a>
                <a href="#" className="hover:text-slate-700 transition-colors py-5">Historic Trends</a>
             </nav>
          </div>

          <div className="flex items-center gap-4">
             <div className="relative group hidden lg:block">
               <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
               <input 
                 type="text" 
                 value={searchQuery}
                 onChange={(e) => {
                   setSearchQuery(e.target.value);
                   setShowDropdown(true);
                 }}
                 onFocus={() => setShowDropdown(true)}
                 placeholder="Search global stations, cities..." 
                 className="pl-9 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-full text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-72 transition-all"
               />
               
               {/* Search Dropdown */}
               {showDropdown && searchQuery.length >= 2 && (
                 <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 max-h-80 overflow-y-auto">
                   {isSearching ? (
                     <div className="p-4 flex justify-center text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /></div>
                   ) : searchResults.length > 0 ? (
                     searchResults.map(result => (
                       <div 
                         key={result.id} 
                         onClick={() => handleSelectLocation(result)}
                         className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex flex-col border-b border-slate-100 last:border-0"
                       >
                         <span className="text-sm font-bold text-slate-800">{result.name}</span>
                         <span className="text-xs text-slate-500">{result.admin1 ? `${result.admin1}, ` : ''}{result.country}</span>
                       </div>
                     ))
                   ) : (
                     <div className="p-4 text-xs text-slate-500 text-center">No locations found.</div>
                   )}
                 </div>
               )}
             </div>
             
             <div className="flex items-center bg-slate-100 rounded-full p-1 border border-slate-200">
               <button className="px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-bold shadow-sm">°C</button>
               <button className="px-3 py-1 rounded-full text-slate-500 text-[10px] font-bold hover:text-slate-700 transition-colors">°F</button>
             </div>
             <button className="relative p-2 rounded-full bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-all">
               <Bell className="w-4 h-4" />
               <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full border-2 border-white"></span>
             </button>
             <button className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center border-2 border-white hover:border-slate-200 transition-all cursor-pointer shadow-sm">
                <span className="text-xs font-bold text-white tracking-wider">AX</span>
             </button>
          </div>
        </header>

        {/* Dashboard Area */}
        <main className="flex-1 overflow-y-auto p-8 space-y-6" onClick={() => setShowDropdown(false)}>
          
          {isLoadingWeather || !weatherData ? (
             <div className="w-full h-64 flex flex-col items-center justify-center text-slate-400">
               <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
               <p className="font-bold text-sm">Syncing with orbital telemetry...</p>
             </div>
          ) : (
            <>
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-blue-50 to-white rounded-2xl p-6 border border-blue-100 flex flex-col md:flex-row md:justify-between md:items-center gap-4 relative overflow-hidden shadow-sm">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Good Morning, Alex!</h1>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 tracking-wide uppercase">RUNNING OPTIMAL (9/10)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 tracking-wide uppercase hidden sm:inline-block">
                      {weatherData.current.precipitation > 0 ? 'COMMUTE: WET' : 'COMMUTE: SMOOTH'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 font-medium">
                    {weatherData.current.is_day ? 'Ideal time for outdoor activities.' : 'Evening conditions setting in.'} UV peaks at {weatherData.daily.uv_index_max[0]} today — {weatherData.current.wind_speed_10m > 15 ? 'pack a light jacket for breezy winds.' : 'enjoy the calm weather.'}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-right relative z-10 shrink-0">
                  <div className="hidden sm:block">
                    <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 justify-end uppercase tracking-wider mb-0.5"><Activity className="w-3 h-3" /> Updated just now</p>
                    <p className="text-[11px] text-slate-500 font-medium">{activeLocation.name} Station</p>
                  </div>
                  <button className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 rounded-lg flex items-center gap-2 text-xs font-bold border border-slate-200 transition-colors shadow-sm">
                     <Wind className="w-4 h-4 text-blue-500" /> Full Briefing
                  </button>
                </div>
              </div>

              {/* Grid 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Current Weather Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col justify-between shadow-lg shadow-slate-200/50">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3 text-slate-700">
                      <div className="text-blue-500">
                        {getWeatherIcon(weatherData.current.weather_code, "w-6 h-6", weatherData.current.is_day === 1)}
                      </div>
                      <span className="font-bold text-sm tracking-wide text-slate-900">{getWeatherDescription(weatherData.current.weather_code)}</span>
                    </div>
                    <div className="px-2 py-1 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600 flex items-center gap-1 tracking-wider uppercase">
                       <Activity className="w-3 h-3 text-emerald-500" /> {weatherData.hourly.precipitation_probability[currentHourIndex]}% Rain Prob.
                    </div>
                  </div>
                  
                  <div className="flex items-end gap-6 mt-6 mb-8">
                    <h2 className="text-7xl font-bold text-slate-900 tracking-tighter leading-none">{Math.round(weatherData.current.temperature_2m)}°</h2>
                    <div className="pb-2">
                      <p className="text-sm text-slate-500 font-bold tracking-wide">Feels like <span className="text-slate-900">{Math.round(weatherData.current.apparent_temperature)}°</span></p>
                      <div className="flex items-center gap-3 text-sm font-bold mt-1.5">
                        <span className="text-orange-500 flex items-center"><ArrowUp className="w-3 h-3 mr-0.5 stroke-[3]"/> {Math.round(weatherData.daily.temperature_2m_max[0])}°</span>
                        <span className="text-blue-500 flex items-center"><ArrowDown className="w-3 h-3 mr-0.5 stroke-[3]"/> {Math.round(weatherData.daily.temperature_2m_min[0])}°</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                      <span className="flex items-center gap-1.5"><Cloud className="w-3.5 h-3.5 text-slate-400"/> Barometer Pressure</span>
                      <span className="text-slate-900 flex items-center gap-2">{weatherData.hourly.pressure_msl[currentHourIndex]} hPa <span className="text-emerald-600">(Steady)</span></span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 via-emerald-400 to-orange-400 w-[65%] rounded-full shadow-sm"></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">
                      <span>980 - Low</span>
                      <span className="text-emerald-600">1013 - Steady</span>
                      <span>1050 - High</span>
                    </div>
                  </div>
                </div>

                {/* Radar Map Card - Keep this static map driven as placeholder */}
                <div className="bg-slate-100 rounded-2xl border border-slate-200 flex flex-col overflow-hidden relative min-h-[280px] shadow-lg shadow-slate-200/50">
                  <div className="absolute inset-0 bg-slate-50 z-0"></div>
                  
                  <div className="relative z-10 p-4 flex justify-between items-start bg-white/80 backdrop-blur-md border-b border-slate-200/50">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-sm"></div>
                      <span className="text-xs font-bold text-slate-900 tracking-wide">Regional Doppler Radar</span>
                      <span className="px-1.5 py-0.5 rounded bg-red-100 text-[9px] font-bold text-red-600 border border-red-200 ml-2 tracking-wider">LIVE</span>
                    </div>
                    <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200 shadow-sm">
                      <button className="px-3 py-1.5 rounded-md bg-white text-slate-900 text-[10px] font-bold shadow-sm border border-slate-200">Rain</button>
                      <button className="px-3 py-1.5 rounded-md text-slate-500 text-[10px] font-bold hover:text-slate-800 transition-colors">Wind</button>
                    </div>
                  </div>
                  
                  {/* Radar Placeholder Image or Map container */}
                  <div className="flex-1 relative z-10 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-multiply scale-110 grayscale"></div>
                    <div className="absolute inset-0 bg-blue-50/50"></div>
                    
                    <svg viewBox="0 0 400 200" className="w-full h-full absolute inset-0 z-20 opacity-80" preserveAspectRatio="none">
                       <path d="M80,40 Q150,150 220,70 T320,130" fill="none" stroke="rgba(16,185,129,0.8)" strokeWidth="20" filter="blur(6px)" />
                       <path d="M100,50 Q160,130 200,80 T290,120" fill="none" stroke="rgba(234,179,8,0.9)" strokeWidth="12" filter="blur(3px)" />
                       <circle cx="200" cy="80" r="3" fill="#1e293b" />
                       <circle cx="200" cy="80" r="10" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="2 2" className="animate-spin-slow" />
                    </svg>

                    <div className="absolute right-4 top-4 flex flex-col gap-1 z-30">
                      <button className="w-7 h-7 rounded bg-white/90 backdrop-blur-md border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"><span className="text-lg leading-none mt-[-2px]">+</span></button>
                      <button className="w-7 h-7 rounded bg-white/90 backdrop-blur-md border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"><span className="text-lg leading-none mt-[-2px]">-</span></button>
                    </div>
                  </div>

                  {/* Radar Timeline Footer */}
                  <div className="relative z-20 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 flex items-end gap-4 pb-4">
                    <button className="p-1 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md shrink-0">
                      <PlayCircle className="w-6 h-6 fill-blue-600 text-white" />
                    </button>
                    <div className="flex-1 flex flex-col gap-1.5 mb-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 px-1 tracking-widest uppercase">
                        <span>-45 min</span>
                        <span className="text-blue-600">LIVE</span>
                        <span>+60 min</span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 w-1/2 rounded-full relative">
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-sm border border-blue-500"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hourly Outlook */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg shadow-slate-200/50 overflow-hidden flex flex-col relative z-0">
                <div className="flex justify-between items-center mb-6 shrink-0">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 tracking-wide">
                    <Activity className="w-4 h-4 text-blue-500" /> Hourly Outlook 
                    <span className="text-slate-400 font-medium ml-2 text-xs hidden sm:inline-block">— Next 24 Hours</span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] font-bold tracking-wider uppercase">
                    <span className="flex items-center gap-1.5 text-slate-500"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"></span> Temp</span>
                    <span className="flex items-center gap-1.5 text-slate-500"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></span> Rain %</span>
                  </div>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                  {Array.from({ length: 24 }).map((_, i) => {
                    const idx = currentHourIndex + i;
                    if (idx >= weatherData.hourly.time.length) return null;
                    const hTime = weatherData.hourly.time[idx];
                    const isNow = i === 0;
                    
                    // Determine if day for icon mapping in hourly (simple check based on time for now, or use `is_day` if we had it per hour)
                    const hourDate = new Date(hTime);
                    const isDayHour = hourDate.getHours() > 6 && hourDate.getHours() < 19; 

                    return (
                      <HourlyItem 
                        key={idx}
                        time={isNow ? "NOW" : formatHour(hTime)} 
                        temp={`${Math.round(weatherData.hourly.temperature_2m[idx])}°`} 
                        icon={getWeatherIcon(weatherData.hourly.weather_code?.[idx] || 0, `w-7 h-7 drop-shadow-sm ${isDayHour ? 'text-yellow-500 fill-yellow-400' : 'text-slate-400 fill-slate-300'}`, isDayHour)} 
                        rain={`${weatherData.hourly.precipitation_probability[idx]}%`} 
                        wind={`${Math.round(weatherData.hourly.wind_speed_10m[idx])}mph`} 
                        active={isNow} 
                      />
                    );
                  })}
                </div>
              </div>

              {/* Lifestyle & Routing Intelligence headers */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 tracking-widest uppercase">
                  <Activity className="w-4 h-4 text-emerald-500" /> Lifestyle & Routine Intelligence
                </div>
                <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-500 tracking-widest uppercase">
                  <Wind className="w-4 h-4 text-blue-500" /> Atmospheric Telemetry
                </div>
              </div>

              {/* Intelligence Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <InfoCard 
                  title="UV Protection" 
                  icon={<Sun />} 
                  value={`Index ${weatherData.daily.uv_index_max[0]}`} 
                  label={weatherData.daily.uv_index_max[0] > 7 ? 'High' : weatherData.daily.uv_index_max[0] > 3 ? 'Moderate' : 'Low'} 
                  desc="Peak UV index for the day. Protect skin if outdoors for extended periods." 
                  color="yellow" 
                  barValue={(weatherData.daily.uv_index_max[0] / 11) * 100} 
                />
                <InfoCard 
                  title="Sunset & Solar" 
                  icon={<Sunrise />} 
                  value={formatTime(weatherData.daily.sunset[0])} 
                  label="Sunset" 
                  desc={`Sunrise was at ${formatTime(weatherData.daily.sunrise[0])}. Enjoy the daylight.`} 
                  color="orange" 
                />
                
                <div className="hidden md:block col-span-2 lg:hidden">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 tracking-widest uppercase mb-4 mt-2">
                    <Wind className="w-4 h-4 text-blue-500" /> Atmospheric Telemetry
                  </div>
                </div>

                <InfoCard 
                  title="Wind & Gusts" 
                  icon={<Wind />} 
                  value={`${Math.round(weatherData.current.wind_speed_10m)} km/h`} 
                  label={`Gusts to ${Math.round(weatherData.current.wind_gusts_10m)}`} 
                  desc="Current wind speeds and peak gusts recorded recently." 
                  color="blue" 
                />
                <InfoCard 
                  title="Humidity & Dew" 
                  icon={<Droplets />} 
                  value={`${weatherData.current.relative_humidity_2m}%`} 
                  label={`Dew ${Math.round(weatherData.hourly.dew_point_2m[currentHourIndex])}°`} 
                  desc="Relative humidity and dew point for comfort tracking." 
                  color="blue" 
                  barValue={weatherData.current.relative_humidity_2m} 
                />
              </div>

              {/* 7-Day Forecast */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg shadow-slate-200/50">
                <div className="flex justify-between items-center mb-6">
                   <div className="flex items-center gap-2 text-sm font-bold text-slate-900 tracking-wide">
                     <Settings className="w-4 h-4 text-indigo-500" /> 7-Day Extended Microclimate Forecast
                   </div>
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
                     NOAA Ensemble Data / Mixed
                   </div>
                </div>

                <div className="space-y-1">
                  <div className="grid grid-cols-12 text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-100 mb-2">
                    <div className="col-span-3 sm:col-span-2">Day</div>
                    <div className="col-span-4 sm:col-span-4">Conditions</div>
                    <div className="col-span-2 text-center">Precipitation</div>
                    <div className="col-span-2 text-center hidden sm:block">Wind Max</div>
                    <div className="col-span-3 sm:col-span-2 text-right">Thermal Spectrum <span className="hidden sm:inline">(Min/Max)</span></div>
                  </div>
                  
                  {weatherData.daily.time.map((time, i) => {
                    const minTemp = weatherData.daily.temperature_2m_min[i];
                    const maxTemp = weatherData.daily.temperature_2m_max[i];
                    
                    const range = maxWeekTemp - minWeekTemp || 1;
                    const barStart = ((minTemp - minWeekTemp) / range) * 100;
                    const barEnd = 100 - (((maxTemp - minWeekTemp) / range) * 100);

                    return (
                      <ForecastRow 
                        key={time}
                        day={i === 0 ? "Today" : formatDay(time)} 
                        date={formatDate(time).toUpperCase()} 
                        icon={getWeatherIcon(weatherData.daily.weather_code[i], "w-5 h-5 drop-shadow-sm text-slate-500", true)} 
                        desc={getWeatherDescription(weatherData.daily.weather_code[i])} 
                        precip={`${Math.round(weatherData.daily.precipitation_sum[i])}mm`} 
                        hum={`${Math.round(weatherData.daily.wind_speed_10m_max[i])} km/h`} 
                        min={`${Math.round(minTemp)}°`} 
                        max={`${Math.round(maxTemp)}°`} 
                        barStart={barStart} 
                        barEnd={barEnd} 
                      />
                    );
                  })}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-center pt-8 pb-4 border-t border-slate-200 text-[10px] text-slate-400 font-bold uppercase tracking-wider gap-4">
                 <p>Aether Weather Engine — Telemetry Processed by Open-Meteo & DWD API</p>
                 <div className="flex gap-6">
                   <span className="hover:text-slate-600 cursor-pointer transition-colors">API Status</span>
                   <span className="hover:text-slate-600 cursor-pointer transition-colors">Station Log</span>
                   <span className="hover:text-slate-600 cursor-pointer transition-colors">Privacy</span>
                 </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// Sub-components
function NavItem({ icon, label, active = false, minimal = false }: { icon: React.ReactNode, label: string, active?: boolean, minimal?: boolean }) {
  return (
    <a href="#" className={`flex items-center gap-3 px-3 py-3 rounded-xl text-[13px] font-bold transition-all ${active ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent'}`}>
      <div className={`${active ? 'text-blue-600' : 'text-slate-400'}`}>
        {React.cloneElement(icon as React.ReactElement, { className: 'w-4 h-4' })}
      </div>
      {label}
    </a>
  );
}

function HourlyItem({ time, temp, icon, rain, wind, active = false }: { time: string, temp: string, icon: React.ReactNode, rain: string, wind: string, active?: boolean }) {
  return (
    <div className={`min-w-[80px] flex flex-col items-center p-4 rounded-2xl border ${active ? 'bg-blue-50 border-blue-200 shadow-md ring-1 ring-blue-500/10' : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm'} transition-all cursor-pointer`}>
      <span className={`text-[11px] font-bold mb-3 uppercase tracking-wider ${active ? 'text-blue-700' : 'text-slate-400'}`}>{time}</span>
      <div className="mb-3 shrink-0">
        {icon}
      </div>
      <span className={`text-base font-bold mb-4 ${active ? 'text-blue-900' : 'text-slate-900'}`}>{temp}</span>
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between text-[10px] font-bold text-emerald-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shrink-0 mr-1"></span>
          <span>{rain}</span>
        </div>
        <div className="flex items-center justify-between text-[10px] font-bold text-blue-500">
          <Wind className="w-3 h-3 shrink-0 mr-1" />
          <span>{wind}</span>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, icon, value, label, desc, color, barValue }: { title: string, icon: React.ReactNode, value: string, label: string, desc: string, color: 'emerald' | 'blue' | 'yellow' | 'orange', barValue?: number }) {
  const colorMap = {
    emerald: 'text-emerald-600',
    blue: 'text-blue-600',
    yellow: 'text-yellow-600',
    orange: 'text-orange-600'
  };
  const bgMap = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-400',
    orange: 'bg-orange-500'
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col justify-between shadow-md shadow-slate-200/50 hover:border-slate-300 hover:shadow-lg transition-all cursor-default">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{title}</h3>
          <div className="w-6 h-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shadow-sm shrink-0">
             {React.cloneElement(icon as React.ReactElement, { className: 'w-3.5 h-3.5' })}
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1.5">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">{value}</span>
          <span className={`text-[11px] font-bold tracking-wide uppercase ${colorMap[color]}`}>{label}</span>
        </div>
        <p className="text-[12px] text-slate-500 leading-relaxed font-medium mb-4">{desc}</p>
      </div>
      {barValue !== undefined && (
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-auto border border-slate-200/50">
          <div className={`h-full ${bgMap[color]} rounded-full`} style={{ width: `${barValue}%` }}></div>
        </div>
      )}
    </div>
  );
}

function ForecastRow({ day, date, icon, desc, precip, hum, min, max, barStart, barEnd }: { day: string, date: string, icon: React.ReactNode, desc: string, precip: string, hum: string, min: string, max: string, barStart: number, barEnd: number }) {
  return (
    <div className="grid grid-cols-12 items-center py-3.5 border-b border-slate-100 last:border-0 hover:bg-slate-50 rounded-xl px-3 -mx-3 transition-colors cursor-pointer group">
      <div className="col-span-3 sm:col-span-2 flex flex-col gap-0.5">
        <span className="text-[13px] font-bold text-slate-800 group-hover:text-slate-900 transition-colors">{day}</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{date}</span>
      </div>
      <div className="col-span-4 sm:col-span-4 flex items-center gap-4">
        <div className="w-8 h-8 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <span className="text-[13px] font-bold text-slate-700 group-hover:text-slate-900 truncate pr-2">{desc}</span>
      </div>
      <div className="col-span-2 text-center text-[13px] font-bold text-emerald-600">{precip}</div>
      <div className="col-span-2 text-center text-[13px] font-bold text-slate-500 hidden sm:block">{hum}</div>
      <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-3 sm:gap-4">
        <span className="text-[13px] font-bold text-slate-500 w-6 text-right shrink-0">{min}</span>
        <div className="w-16 sm:w-28 h-2 bg-slate-100 rounded-full overflow-hidden relative border border-slate-200 shrink-0">
          <div 
            className="absolute h-full rounded-full bg-gradient-to-r from-blue-400 via-emerald-400 to-yellow-400 shadow-sm" 
            style={{ left: `${barStart}%`, right: `${barEnd}%` }}
          ></div>
        </div>
        <span className="text-[13px] font-bold text-slate-900 w-6 text-left shrink-0">{max}</span>
      </div>
    </div>
  );
}

