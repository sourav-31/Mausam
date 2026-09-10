import React, { useState, useEffect } from 'react';
import { 
  Cloud, Map, Wind, Settings, HelpCircle,
  MapPin, ChevronDown, Search, Bell, 
  Sun, Droplets, Sunrise, User, LogOut,
  ArrowUp, ArrowDown, PlayCircle, PauseCircle,
  Loader2, Activity, Compass, ShieldCheck,
  Sparkles, Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { weatherService, type WeatherData } from '../services/weather.service';
import { getWeatherDescription, getWeatherIcon } from '../lib/weather-utils';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);
  const [errorFetchingWeather, setErrorFetchingWeather] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [radarLayer, setRadarLayer] = useState<'rain' | 'wind'>('rain');
  const [isPlayingRadar, setIsPlayingRadar] = useState(false);
  
  const { user, logout } = useAuth();
  const { activeLocation, setActiveLocation, openLocationModal } = useLocation();

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  // Header search bar (quick inline search)
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
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reload weather whenever the global active location changes
  useEffect(() => {
    async function loadWeather() {
      setIsLoadingWeather(true);
      setWeatherData(null);
      try {
        const data = await weatherService.getForecast(
          activeLocation.latitude,
          activeLocation.longitude,
          activeLocation.timezone
        );
        setWeatherData(data);
        setErrorFetchingWeather(null);
      } catch (err: any) {
        console.error(err);
        setErrorFetchingWeather(err.message || 'Failed to load weather data');
      } finally {
        setIsLoadingWeather(false);
      }
    }
    loadWeather();
  }, [activeLocation]);

  const handleSelectLocation = (loc: any) => {
    setActiveLocation(loc);
    setSearchQuery('');
    setShowDropdown(false);
  };

  // Unit conversion helper
  const convertTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return Math.round(celsius);
  };

  // Helper formatting functions
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };
  const formatHour = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: 'numeric' });
  };
  const formatDay = (isoString: string) => {
    return new Date(isoString).toLocaleDateString([], { weekday: 'short' });
  };
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Dynamic greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
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
    <div className="flex h-screen bg-[#f8fafc] text-slate-700 font-sans overflow-hidden antialiased">
      {/* Sidebar Navigation */}
      <aside className="hidden lg:flex w-64 bg-white flex-col justify-between border-r border-slate-200/90 shrink-0 z-20 shadow-[1px_0_4px_rgba(0,0,0,0.02)]">
        <div className="p-5">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0 ring-4 ring-blue-50">
              <Cloud className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <div>
              <span className="text-lg font-extrabold text-slate-900 tracking-tight block leading-tight">
                Mausam <span className="text-blue-600 font-bold text-xs bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">2.0</span>
              </span>
              <span className="text-[11px] font-medium text-slate-400 tracking-wide block">Weather Intelligence</span>
            </div>
          </div>

          {/* Active Location Quick View */}
          <div className="mb-6">
            <div
              className="flex justify-between items-center bg-slate-50 hover:bg-blue-50/50 p-3 rounded-xl border border-slate-200/80 hover:border-blue-300 transition-all cursor-pointer group shadow-sm"
              onClick={openLocationModal}
              title="Change location"
            >
              <div className="min-w-0 flex-1 pr-2">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-xs text-slate-900 font-bold truncate">{activeLocation.name}</p>
                </div>
                <p className="text-[10px] text-slate-500 font-medium truncate">
                  {activeLocation.admin1 ? `${activeLocation.admin1}, ` : ''}{activeLocation.country_code}
                </p>
              </div>
              <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-blue-600 group-hover:border-blue-300 transition-colors shadow-xs">
                <MapPin className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            <NavItem 
              icon={<Cloud />} 
              label="Atmosphere" 
              active={activeTab === 'Dashboard'} 
              onClick={() => setActiveTab('Dashboard')} 
            />
            <NavItem 
              icon={<Map />} 
              label="Radar Maps" 
              active={activeTab === 'Radar'} 
              onClick={() => setActiveTab('Radar')} 
            />
            <NavItem 
              icon={<Sparkles />} 
              label="Smart Insights" 
              active={activeTab === 'Insights'} 
              onClick={() => setActiveTab('Insights')} 
            />
            <NavItem 
              icon={<Wind />} 
              label="Air & Pollen" 
              active={activeTab === 'Air'} 
              onClick={() => setActiveTab('Air')} 
            />
            <NavItem 
              icon={<Compass />} 
              label="Historic Trends" 
              active={activeTab === 'Trends'} 
              onClick={() => setActiveTab('Trends')} 
            />
          </nav>

          {/* Action Trigger Card */}
          <div className="mt-8 pt-5 border-t border-slate-100">
            <button 
              onClick={openLocationModal}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 font-semibold transition-all text-xs shadow-sm hover:shadow active:scale-[0.99]"
            >
              <MapPin className="w-4 h-4" />
              Change Station / GPS
            </button>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-5 border-t border-slate-100 space-y-1">
          <NavItem icon={<Settings />} label="Settings" />
          <NavItem icon={<HelpCircle />} label="Documentation" />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] relative z-10 overflow-hidden">
        {/* Sticky Header */}
        <header className="h-16 flex items-center justify-between px-6 lg:px-8 border-b border-slate-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-40 shrink-0">
          
          {/* Left: Location & Quick Navigation */}
          <div className="flex items-center gap-6">
            <button
              onClick={openLocationModal}
              className="flex items-center gap-2 hover:bg-slate-100 px-3 py-1.5 rounded-lg cursor-pointer transition-colors max-w-[240px] group border border-transparent hover:border-slate-200"
              title="Click to search or change location"
            >
              <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                {activeLocation.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
            </button>
            
            <nav className="hidden xl:flex items-center gap-1 text-xs font-semibold text-slate-500">
              <button 
                onClick={() => setActiveTab('Dashboard')}
                className={`px-3 py-1.5 rounded-md transition-all ${activeTab === 'Dashboard' ? 'bg-slate-100 text-slate-900 font-bold' : 'hover:text-slate-800 hover:bg-slate-50'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('Radar')}
                className={`px-3 py-1.5 rounded-md transition-all ${activeTab === 'Radar' ? 'bg-slate-100 text-slate-900 font-bold' : 'hover:text-slate-800 hover:bg-slate-50'}`}
              >
                Radar & Satellite
              </button>
              <button 
                onClick={() => setActiveTab('Insights')}
                className={`px-3 py-1.5 rounded-md transition-all ${activeTab === 'Insights' ? 'bg-slate-100 text-slate-900 font-bold' : 'hover:text-slate-800 hover:bg-slate-50'}`}
              >
                Lifestyle AI
              </button>
            </nav>
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative group hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search station, city or coordinates..." 
                className="pl-9 pr-8 py-1.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-md text-xs text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 w-60 lg:w-72 transition-all shadow-xs"
              />
              <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden lg:inline-block text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-xs">
                /
              </kbd>
              
              {/* Search Dropdown */}
              {showDropdown && searchQuery.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden z-50 max-h-80 overflow-y-auto divide-y divide-slate-100 animate-in fade-in-50 duration-150">
                  {isSearching ? (
                    <div className="p-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> Searching stations...
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map(result => (
                      <div 
                        key={result.id} 
                        onClick={() => handleSelectLocation(result)}
                        className="px-4 py-2.5 hover:bg-blue-50/60 cursor-pointer flex flex-col transition-colors group"
                      >
                        <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600">{result.name}</span>
                        <span className="text-[11px] text-slate-400">{result.admin1 ? `${result.admin1}, ` : ''}{result.country}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-xs text-slate-400 text-center">No location found matching "{searchQuery}"</div>
                  )}
                </div>
              )}
            </div>
            
            {/* Unit Switcher: Rectangular Segmented Control */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200">
              <button 
                onClick={() => setTempUnit('C')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${tempUnit === 'C' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                °C
              </button>
              <button 
                onClick={() => setTempUnit('F')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${tempUnit === 'F' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                °F
              </button>
            </div>

            {/* Notification Bell */}
            <button 
              className="relative p-2 rounded-md bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all shadow-xs"
              title="Weather alerts"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
            </button>

            {/* User Profile OR Rectangular Login/Signup Buttons */}
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1 bg-white border border-slate-200 hover:border-slate-300 rounded-md transition-all cursor-pointer shadow-xs focus:outline-none"
                >
                  <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 max-w-[90px] truncate">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50 animate-in fade-in-50 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>
                    <Link to="/home" className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 transition-colors">
                      <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Personalized Hub
                    </Link>
                    <button className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 transition-colors">
                      <User className="w-3.5 h-3.5 text-slate-400" /> Account Profile
                    </button>
                    <button className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 transition-colors">
                      <Settings className="w-3.5 h-3.5 text-slate-400" /> Preferences
                    </button>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button 
                      onClick={() => { logout(); setShowProfileMenu(false); }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* RECTANGULAR LOGIN & SIGN UP BUTTONS WITH ACCURATE POSITIONING */
              <div className="flex items-center gap-2">
                <Link 
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-md transition-all shadow-xs text-center"
                >
                  Log In
                </Link>
                <Link 
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md transition-all shadow-xs hover:shadow text-center"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Dashboard Main Scrollable Area */}
        <main 
          className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6" 
          onClick={() => { setShowDropdown(false); setShowProfileMenu(false); }}
        >
          {errorFetchingWeather ? (
            <div className="w-full h-80 flex flex-col items-center justify-center bg-white rounded-xl border border-red-200 p-6 shadow-sm text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <p className="font-bold text-sm text-slate-800 mb-1">Failed to fetch atmospheric telemetry</p>
              <p className="text-xs text-slate-500 max-w-md mb-4">{errorFetchingWeather}</p>
              <button 
                onClick={() => setActiveLocation({ ...activeLocation })} 
                className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-md shadow-sm hover:bg-blue-700 transition-colors"
              >
                Retry Connection
              </button>
            </div>
          ) : isLoadingWeather || !weatherData ? (
            <div className="w-full h-96 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200/80 p-8 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
              <p className="font-bold text-sm text-slate-800">Calibrating Satellite & Atmospheric Telemetry...</p>
              <p className="text-xs text-slate-400 mt-1">Connecting to Open-Meteo & DWD regional radar feeds</p>
            </div>
          ) : (
            <>
              {/* Premium Light Mode Hero Greeting Banner */}
              <div className="bg-gradient-to-r from-blue-50/90 via-sky-50/40 to-white rounded-xl p-5 lg:p-6 border border-blue-100/90 flex flex-col md:flex-row md:justify-between md:items-center gap-4 relative overflow-hidden shadow-xs">
                <div className="relative z-10">
                  <div className="flex flex-wrap items-center gap-2.5 mb-2">
                    <h1 className="text-xl lg:text-2xl font-extrabold text-slate-900 tracking-tight">
                      {getGreeting()}, {user ? user.name.split(' ')[0] : 'Explorer'}!
                    </h1>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 tracking-wide uppercase">
                      RUNNING OPTIMAL (9/10)
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 tracking-wide uppercase hidden sm:inline-block">
                      {weatherData.current.precipitation > 0 ? 'COMMUTE: WET ROAD' : 'COMMUTE: CLEAR'}
                    </span>
                  </div>
                  <p className="text-xs lg:text-sm text-slate-600 font-medium max-w-2xl leading-relaxed">
                    {weatherData.current.is_day ? 'Ideal outdoor conditions right now.' : 'Night conditions currently settling in.'} UV index will peak around {weatherData.daily.uv_index_max[0]} today — {weatherData.current.wind_speed_10m > 15 ? 'expect brisk breezes in exposed corridors.' : 'calm wind vector prevailing.'}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 relative z-10">
                  <div className="hidden sm:block text-right">
                    <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 justify-end uppercase tracking-wider mb-0.5">
                      <Activity className="w-3 h-3" /> Live Station Sync
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium">{activeLocation.name}</p>
                  </div>
                  <button 
                    onClick={openLocationModal}
                    className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-md flex items-center gap-2 text-xs font-semibold border border-slate-200 transition-all shadow-xs"
                  >
                    <Wind className="w-3.5 h-3.5 text-blue-500" /> Switch Station
                  </button>
                </div>
              </div>

              {/* Grid 1: Current Weather Card & Doppler Radar Card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Current Conditions Card (5 cols) */}
                <div className="lg:col-span-6 bg-white rounded-xl p-6 border border-slate-200/90 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                          {getWeatherIcon(weatherData.current.weather_code, "w-6 h-6", weatherData.current.is_day === 1)}
                        </div>
                        <div>
                          <span className="font-bold text-base text-slate-900 block leading-tight">
                            {getWeatherDescription(weatherData.current.weather_code)}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400">
                            {activeLocation.name}, {activeLocation.country_code}
                          </span>
                        </div>
                      </div>
                      
                      <div className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-emerald-500" /> 
                        <span>{weatherData.hourly.precipitation_probability[currentHourIndex]}% Rain Risk</span>
                      </div>
                    </div>

                    {/* Temperature hero */}
                    <div className="flex items-baseline gap-4 my-4">
                      <h2 className="text-6xl font-extrabold text-slate-900 tracking-tighter">
                        {convertTemp(weatherData.current.temperature_2m)}°
                      </h2>
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500 font-semibold">
                          Feels like <strong className="text-slate-800">{convertTemp(weatherData.current.apparent_temperature)}°{tempUnit}</strong>
                        </span>
                        <div className="flex items-center gap-3 text-xs font-bold mt-1">
                          <span className="text-amber-600 flex items-center bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                            <ArrowUp className="w-3 h-3 mr-0.5 stroke-[2.5]" /> 
                            {convertTemp(weatherData.daily.temperature_2m_max[0])}°
                          </span>
                          <span className="text-blue-600 flex items-center bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
                            <ArrowDown className="w-3 h-3 mr-0.5 stroke-[2.5]" /> 
                            {convertTemp(weatherData.daily.temperature_2m_min[0])}°
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Atmospheric barometric scale */}
                  <div className="pt-6 border-t border-slate-100">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-500 mb-2">
                      <span className="flex items-center gap-1.5">
                        <Cloud className="w-3.5 h-3.5 text-slate-400" /> Barometric Pressure
                      </span>
                      <span className="text-slate-800 font-bold">
                        {weatherData.hourly.pressure_msl[currentHourIndex]} hPa 
                        <span className="text-emerald-600 font-medium ml-1.5">(Stable)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 via-emerald-400 to-amber-500 w-[65%] rounded-full"></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-semibold text-slate-400 mt-2 uppercase tracking-wide">
                      <span>980 Low</span>
                      <span className="text-emerald-600 font-bold">1013 Standard</span>
                      <span>1040 High</span>
                    </div>
                  </div>
                </div>

                {/* Regional Doppler Radar Simulator Card (7 cols) */}
                <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/90 flex flex-col overflow-hidden shadow-xs hover:border-slate-300 transition-all">
                  <div className="p-4 flex justify-between items-center bg-white border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                      </span>
                      <span className="text-xs font-bold text-slate-900 tracking-tight">Regional Doppler Radar</span>
                      <span className="px-1.5 py-0.5 rounded bg-red-50 text-[10px] font-bold text-red-600 border border-red-200/80">LIVE</span>
                    </div>
                    
                    {/* Layer toggle buttons */}
                    <div className="flex bg-slate-100 rounded-md p-0.5 border border-slate-200">
                      <button 
                        onClick={() => setRadarLayer('rain')}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${radarLayer === 'rain' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        Precipitation
                      </button>
                      <button 
                        onClick={() => setRadarLayer('wind')}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${radarLayer === 'wind' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        Wind Stream
                      </button>
                    </div>
                  </div>
                  
                  {/* Radar Visual Canvas Container */}
                  <div className="flex-1 relative min-h-[220px] bg-slate-50 flex items-center justify-center overflow-hidden">
                    {/* Grid overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-40"></div>
                    
                    {/* Map illustration background */}
                    <svg viewBox="0 0 500 240" className="w-full h-full absolute inset-0 z-10 opacity-70" preserveAspectRatio="none">
                      {/* Radar sweep lines */}
                      <circle cx="250" cy="120" r="40" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
                      <circle cx="250" cy="120" r="90" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
                      <circle cx="250" cy="120" r="140" fill="none" stroke="#cbd5e1" strokeWidth="1" />
                      
                      {/* Weather cell echoes */}
                      <path d="M120,60 Q200,160 300,90 T420,150" fill="none" stroke="rgba(59, 130, 246, 0.45)" strokeWidth="32" filter="blur(8px)" />
                      <path d="M150,70 Q240,150 280,100 T380,140" fill="none" stroke="rgba(16, 185, 129, 0.55)" strokeWidth="20" filter="blur(5px)" />
                      <path d="M220,110 Q260,130 310,110" fill="none" stroke="rgba(245, 158, 11, 0.6)" strokeWidth="10" filter="blur(3px)" />
                      
                      {/* Station center pin */}
                      <circle cx="250" cy="120" r="4" fill="#2563eb" />
                      <circle cx="250" cy="120" r="12" fill="none" stroke="#2563eb" strokeWidth="1.5" className="animate-ping opacity-30" />
                    </svg>

                    {/* Controls overlay */}
                    <div className="absolute right-3 top-3 flex flex-col gap-1 z-20">
                      <button className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 shadow-xs font-bold text-sm">
                        +
                      </button>
                      <button className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 shadow-xs font-bold text-sm">
                        -
                      </button>
                    </div>

                    <div className="absolute bottom-3 left-4 z-20">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded border border-slate-200 shadow-xs">
                        RADAR ID: {activeLocation.name.toUpperCase().substring(0, 4)}-DOPPLER
                      </span>
                    </div>
                  </div>

                  {/* Radar Timeline Player */}
                  <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-3">
                    <button 
                      onClick={() => setIsPlayingRadar(!isPlayingRadar)}
                      className="p-1 rounded-md text-blue-600 hover:bg-blue-50 transition-colors shrink-0"
                      title={isPlayingRadar ? "Pause radar" : "Play radar"}
                    >
                      {isPlayingRadar ? <PauseCircle className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
                    </button>
                    
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>-45 min</span>
                        <span className="text-blue-600 font-extrabold">NOW (LIVE)</span>
                        <span>+60 min forecast</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 w-3/5 rounded-full relative"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 24-Hour Outlook Section */}
              <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs">
                <div className="flex justify-between items-center mb-5">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">Hourly Chronology</h3>
                    <span className="text-slate-400 font-medium text-xs hidden sm:inline-block">— Next 24 Hours Microforecast</span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-600"></span> Temp</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Precip %</span>
                  </div>
                </div>

                {/* Horizontal Hourly Scroller */}
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
                  {Array.from({ length: 24 }).map((_, i) => {
                    const idx = currentHourIndex + i;
                    if (idx >= weatherData.hourly.time.length) return null;
                    const hTime = weatherData.hourly.time[idx];
                    const isNow = i === 0;
                    
                    const hourDate = new Date(hTime);
                    const isDayHour = hourDate.getHours() >= 6 && hourDate.getHours() <= 19;

                    return (
                      <div 
                        key={idx}
                        className={`min-w-[84px] flex flex-col items-center p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isNow 
                            ? 'bg-blue-50/70 border-blue-300 shadow-xs ring-1 ring-blue-400/20' 
                            : 'bg-white border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <span className={`text-[11px] font-bold mb-2 uppercase tracking-wide ${isNow ? 'text-blue-700' : 'text-slate-400'}`}>
                          {isNow ? "NOW" : formatHour(hTime)}
                        </span>
                        
                        <div className="my-2 shrink-0">
                          {getWeatherIcon(
                            weatherData.hourly.weather_code?.[idx] || 0, 
                            `w-6 h-6 ${isDayHour ? 'text-amber-500' : 'text-slate-400'}`, 
                            isDayHour
                          )}
                        </div>
                        
                        <span className={`text-sm font-extrabold mb-3 ${isNow ? 'text-blue-900' : 'text-slate-800'}`}>
                          {convertTemp(weatherData.hourly.temperature_2m[idx])}°
                        </span>
                        
                        <div className="w-full space-y-1 text-center pt-1 border-t border-slate-100">
                          <p className="text-[10px] font-bold text-emerald-600">
                            {weatherData.hourly.precipitation_probability[idx]}%
                          </p>
                          <p className="text-[10px] font-semibold text-slate-400">
                            {Math.round(weatherData.hourly.wind_speed_10m[idx])}km/h
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lifestyle & Atmospheric Intelligence Header */}
              <div className="flex items-center gap-2 pt-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Environmental & Lifestyle Telemetry</span>
              </div>

              {/* Intelligence 4-Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* UV Index */}
                <InfoCard 
                  title="UV Radiation Index" 
                  icon={<Sun />} 
                  value={`Index ${weatherData.daily.uv_index_max[0]}`} 
                  label={weatherData.daily.uv_index_max[0] > 7 ? 'High' : weatherData.daily.uv_index_max[0] > 3 ? 'Moderate' : 'Low'} 
                  desc="Peak solar index expected midday. Apply SPF 30+ if outdoors." 
                  color={weatherData.daily.uv_index_max[0] > 7 ? 'orange' : 'emerald'} 
                  barValue={Math.min(100, (weatherData.daily.uv_index_max[0] / 11) * 100)} 
                />

                {/* Sunset & Daylight */}
                <InfoCard 
                  title="Daylight & Sunset" 
                  icon={<Sunrise />} 
                  value={formatTime(weatherData.daily.sunset[0])} 
                  label="Sunset" 
                  desc={`Sunrise was recorded at ${formatTime(weatherData.daily.sunrise[0])}. Clear dusk expected.`} 
                  color="blue" 
                />

                {/* Wind Vectors */}
                <InfoCard 
                  title="Wind Speed & Gusts" 
                  icon={<Wind />} 
                  value={`${Math.round(weatherData.current.wind_speed_10m)} km/h`} 
                  label={`Gusts ${Math.round(weatherData.current.wind_gusts_10m)} km/h`} 
                  desc="Atmospheric surface wind velocity. Normal aerodynamic conditions." 
                  color="blue" 
                />

                {/* Humidity & Dew Point */}
                <InfoCard 
                  title="Relative Humidity" 
                  icon={<Droplets />} 
                  value={`${weatherData.current.relative_humidity_2m}%`} 
                  label={`Dew ${convertTemp(weatherData.hourly.dew_point_2m[currentHourIndex])}°${tempUnit}`} 
                  desc="Surface moisture saturation. Comfortable ambient air quality." 
                  color="emerald" 
                  barValue={weatherData.current.relative_humidity_2m} 
                />
              </div>

              {/* 7-Day Extended Microclimate Forecast */}
              <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">7-Day Extended Outlook</h3>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline-block">
                    NOAA & ECMWF Ensemble Consensus
                  </span>
                </div>

                <div className="space-y-1">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-100">
                    <div className="col-span-3 sm:col-span-2">Day</div>
                    <div className="col-span-4 sm:col-span-4">Atmosphere</div>
                    <div className="col-span-2 text-center">Precipitation</div>
                    <div className="col-span-2 text-center hidden sm:block">Max Gusts</div>
                    <div className="col-span-3 sm:col-span-2 text-right">Thermal Spectrum</div>
                  </div>
                  
                  {/* Rows */}
                  {weatherData.daily.time.map((time, i) => {
                    const minTemp = weatherData.daily.temperature_2m_min[i];
                    const maxTemp = weatherData.daily.temperature_2m_max[i];
                    
                    const range = maxWeekTemp - minWeekTemp || 1;
                    const barStart = ((minTemp - minWeekTemp) / range) * 100;
                    const barEnd = 100 - (((maxTemp - minWeekTemp) / range) * 100);

                    return (
                      <div 
                        key={time}
                        className="grid grid-cols-12 items-center py-3.5 border-b border-slate-100 last:border-0 hover:bg-slate-50/80 rounded-lg px-2 -mx-2 transition-colors cursor-pointer group"
                      >
                        <div className="col-span-3 sm:col-span-2 flex flex-col">
                          <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                            {i === 0 ? "Today" : formatDay(time)}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400">{formatDate(time)}</span>
                        </div>

                        <div className="col-span-4 sm:col-span-4 flex items-center gap-3">
                          <div className="shrink-0">
                            {getWeatherIcon(weatherData.daily.weather_code[i], "w-5 h-5 text-slate-500", true)}
                          </div>
                          <span className="text-xs font-medium text-slate-700 truncate pr-2">
                            {getWeatherDescription(weatherData.daily.weather_code[i])}
                          </span>
                        </div>

                        <div className="col-span-2 text-center text-xs font-bold text-emerald-600">
                          {Math.round(weatherData.daily.precipitation_sum[i])} mm
                        </div>

                        <div className="col-span-2 text-center text-xs font-medium text-slate-500 hidden sm:block">
                          {Math.round(weatherData.daily.wind_speed_10m_max[i])} km/h
                        </div>

                        <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-2.5">
                          <span className="text-xs font-medium text-slate-400 w-6 text-right">
                            {convertTemp(minTemp)}°
                          </span>
                          <div className="w-14 sm:w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden relative border border-slate-200/60 shrink-0">
                            <div 
                              className="absolute h-full rounded-full bg-gradient-to-r from-blue-400 via-emerald-400 to-amber-400" 
                              style={{ left: `${Math.max(0, barStart)}%`, right: `${Math.max(0, barEnd)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-bold text-slate-800 w-6 text-left">
                            {convertTemp(maxTemp)}°
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Telemetry Footer */}
              <div className="flex flex-col sm:flex-row justify-between items-center pt-6 pb-2 border-t border-slate-200 text-[11px] text-slate-400 font-medium gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Mausam 2.0 Weather Intelligence — Open-Meteo & DWD Real-Time Telemetry</span>
                </div>
                <div className="flex items-center gap-5">
                  <span className="hover:text-slate-600 cursor-pointer transition-colors">Sensor Status: 100%</span>
                  <span className="hover:text-slate-600 cursor-pointer transition-colors">API Latency: 42ms</span>
                  <span className="hover:text-slate-600 cursor-pointer transition-colors">Privacy & Terms</span>
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
function NavItem({ 
  icon, 
  label, 
  active = false, 
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean; 
  onClick?: () => void;
}) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
        active 
          ? 'bg-blue-50 text-blue-700 border border-blue-200/70 shadow-xs' 
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
      }`}
    >
      <div className={`${active ? 'text-blue-600' : 'text-slate-400'}`}>
        {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-4 h-4' })}
      </div>
      <span>{label}</span>
    </button>
  );
}

function InfoCard({ 
  title, 
  icon, 
  value, 
  label, 
  desc, 
  color, 
  barValue 
}: { 
  title: string; 
  icon: React.ReactNode; 
  value: string; 
  label: string; 
  desc: string; 
  color: 'emerald' | 'blue' | 'yellow' | 'orange'; 
  barValue?: number;
}) {
  const colorTextMap = {
    emerald: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    blue: 'text-blue-700 bg-blue-50 border-blue-200',
    yellow: 'text-amber-700 bg-amber-50 border-amber-200',
    orange: 'text-orange-700 bg-orange-50 border-orange-200'
  };
  const barBgMap = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    yellow: 'bg-amber-400',
    orange: 'bg-orange-500'
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200/90 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all">
      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">{title}</h4>
          <div className="w-6 h-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
            {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-3.5 h-3.5' })}
          </div>
        </div>
        
        <div className="flex items-baseline gap-2 mb-1.5">
          <span className="text-xl font-extrabold text-slate-900 tracking-tight">{value}</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide ${colorTextMap[color]}`}>
            {label}
          </span>
        </div>
        
        <p className="text-xs text-slate-500 leading-relaxed font-normal mb-4">{desc}</p>
      </div>

      {barValue !== undefined && (
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-auto">
          <div className={`h-full ${barBgMap[color]} rounded-full`} style={{ width: `${barValue}%` }}></div>
        </div>
      )}
    </div>
  );
}
