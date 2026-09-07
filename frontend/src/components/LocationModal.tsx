import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Search, X, Loader2, Navigation, AlertCircle } from 'lucide-react';
import { weatherService, type LocationSearchResult } from '../services/weather.service';
import { useLocation } from '../contexts/LocationContext';

// ── GPS states ─────────────────────────────────────────────────────────────────
type GpsState =
  | 'idle'
  | 'requesting'
  | 'geocoding'
  | 'success'
  | 'denied'
  | 'unavailable'
  | 'unsupported';

// ── Main Component ─────────────────────────────────────────────────────────────
export default function LocationModal() {
  const { closeLocationModal, setActiveLocation } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [gpsState, setGpsState] = useState<GpsState>('idle');
  const [gpsMessage, setGpsMessage] = useState('');
  const [highlightedIdx, setHighlightedIdx] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const searchAbortRef = useRef<AbortController | null>(null);

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLocationModal();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closeLocationModal]);

  // Debounced search with abort controller to prevent stale results
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setSearchError('');
      return;
    }

    // Cancel any in-flight request
    if (searchAbortRef.current) searchAbortRef.current.abort();

    const timer = setTimeout(async () => {
      const controller = new AbortController();
      searchAbortRef.current = controller;

      setIsSearching(true);
      setSearchError('');
      setHighlightedIdx(-1);

      try {
        const results = await weatherService.searchLocation(searchQuery);
        // Guard: ignore result if this search was cancelled
        if (controller.signal.aborted) return;

        // Sort alphabetically and deduplicate by name+country
        const seen = new Set<string>();
        const sorted = results
          .filter(r => {
            const key = `${r.name}-${r.country_code}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .sort((a, b) => a.name.localeCompare(b.name));

        setSearchResults(sorted);
        if (sorted.length === 0) setSearchError('No cities found.');
      } catch (err: any) {
        if (err.name === 'CanceledError' || err.name === 'AbortError') return;
        setSearchError('Search failed. Please try again.');
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      searchAbortRef.current?.abort();
    };
  }, [searchQuery]);

  // Select a location, close modal
  const selectLocation = useCallback((loc: LocationSearchResult) => {
    setActiveLocation(loc);
    closeLocationModal();
  }, [setActiveLocation, closeLocationModal]);

  // GPS detection
  const handleGps = () => {
    if (!navigator.geolocation) {
      setGpsState('unsupported');
      return;
    }
    setGpsState('requesting');
    setGpsMessage('Detecting your location...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setGpsState('geocoding');
        setGpsMessage('Finding your city...');
        try {
          const loc = await weatherService.reverseGeocode(latitude, longitude);
          setGpsState('success');
          selectLocation(loc);
        } catch {
          setGpsState('unavailable');
          setGpsMessage('Could not identify your city. Please search manually.');
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGpsState('denied');
        } else {
          setGpsState('unavailable');
          setGpsMessage('Unable to determine your location.');
        }
      },
      { timeout: 10000 }
    );
  };

  // Keyboard navigation in results
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!searchResults.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIdx(i => Math.min(i + 1, searchResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && highlightedIdx >= 0) {
      e.preventDefault();
      selectLocation(searchResults[highlightedIdx]);
    }
  };

  const isGpsLoading = gpsState === 'requesting' || gpsState === 'geocoding';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
        onClick={closeLocationModal}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Choose your location"
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] w-full max-w-md bg-white rounded-2xl shadow-2xl shadow-slate-900/20 border border-slate-100 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Choose your location</h2>
            <p className="text-xs text-slate-500 mt-0.5">Select via GPS or search a city manually.</p>
          </div>
          <button
            onClick={closeLocationModal}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Option 1 — GPS */}
          <div>
            <button
              onClick={handleGps}
              disabled={isGpsLoading}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all font-medium text-sm ${
                isGpsLoading
                  ? 'bg-blue-50 border-blue-200 cursor-not-allowed'
                  : gpsState === 'denied' || gpsState === 'unavailable' || gpsState === 'unsupported'
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-slate-50 border-slate-200 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 text-slate-700'
              }`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                isGpsLoading ? 'bg-blue-100' :
                gpsState === 'denied' || gpsState === 'unavailable' ? 'bg-red-100' : 'bg-white border border-slate-200'
              }`}>
                {isGpsLoading
                  ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  : gpsState === 'denied' || gpsState === 'unavailable' || gpsState === 'unsupported'
                  ? <AlertCircle className="w-4 h-4 text-red-500" />
                  : <Navigation className="w-4 h-4 text-blue-600" />
                }
              </div>
              <div className="text-left min-w-0">
                <p className="font-bold">
                  {gpsState === 'denied' ? 'Location access denied' :
                   gpsState === 'unavailable' ? 'Location unavailable' :
                   gpsState === 'unsupported' ? 'GPS not supported' :
                   isGpsLoading ? gpsMessage :
                   '📍 Use My Location'}
                </p>
                <p className={`text-xs mt-0.5 ${
                  gpsState === 'denied' || gpsState === 'unavailable' ? 'text-red-500' : 'text-slate-400'
                }`}>
                  {gpsState === 'denied' ? 'Search for a city manually below.' :
                   gpsState === 'unavailable' ? (gpsMessage || 'Please search manually.') :
                   gpsState === 'unsupported' ? 'Your browser does not support GPS.' :
                   isGpsLoading ? 'Please wait...' :
                   'Detect location using your device GPS'}
                </p>
              </div>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Option 2 — Manual search */}
          <div>
            <label htmlFor="city-search" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              Search for a city
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
              )}
              <input
                id="city-search"
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setSearchError(''); }}
                onKeyDown={handleKeyDown}
                placeholder="Enter city name..."
                autoComplete="off"
                className="w-full pl-9 pr-9 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                aria-label="Search for a city"
                aria-autocomplete="list"
                aria-activedescendant={highlightedIdx >= 0 ? `city-result-${highlightedIdx}` : undefined}
              />
            </div>

            {/* Search Results */}
            {(searchResults.length > 0 || searchError) && (
              <div
                role="listbox"
                aria-label="City suggestions"
                className="mt-2 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-lg max-h-56 overflow-y-auto"
              >
                {searchError && !searchResults.length ? (
                  <div className="px-4 py-3 text-sm text-slate-400 text-center">{searchError}</div>
                ) : (
                  searchResults.map((result, idx) => (
                    <div
                      key={`${result.id}-${idx}`}
                      id={`city-result-${idx}`}
                      role="option"
                      aria-selected={highlightedIdx === idx}
                      onClick={() => selectLocation(result)}
                      onMouseEnter={() => setHighlightedIdx(idx)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-slate-50 last:border-0 transition-colors ${
                        highlightedIdx === idx ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{result.name}</p>
                        <p className="text-xs text-slate-500 truncate">
                          {[result.admin1, result.country].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex justify-end">
          <button
            onClick={closeLocationModal}
            className="px-5 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
