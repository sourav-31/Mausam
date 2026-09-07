import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { type LocationSearchResult } from '../services/weather.service';

// ── Storage key ────────────────────────────────────────────────────────────────
const LOCATION_KEY = 'aetherweather_location';

// ── Default location (San Francisco) ──────────────────────────────────────────
export const DEFAULT_LOCATION: LocationSearchResult = {
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
  admin1: 'California',
};

// ── Context types ──────────────────────────────────────────────────────────────
interface LocationContextType {
  activeLocation: LocationSearchResult;
  setActiveLocation: (loc: LocationSearchResult) => void;
  showLocationModal: boolean;
  openLocationModal: () => void;
  closeLocationModal: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// ── Provider ───────────────────────────────────────────────────────────────────
export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Restore persisted location or fall back to default
  const [activeLocation, setActiveLocationState] = useState<LocationSearchResult>(() => {
    try {
      const stored = localStorage.getItem(LOCATION_KEY);
      if (stored) return JSON.parse(stored) as LocationSearchResult;
    } catch {}
    return DEFAULT_LOCATION;
  });

  const setActiveLocation = (loc: LocationSearchResult) => {
    setActiveLocationState(loc);
    try {
      localStorage.setItem(LOCATION_KEY, JSON.stringify(loc));
    } catch {}
  };

  const openLocationModal = () => setShowLocationModal(true);
  const closeLocationModal = () => setShowLocationModal(false);

  return (
    <LocationContext.Provider value={{
      activeLocation,
      setActiveLocation,
      showLocationModal,
      openLocationModal,
      closeLocationModal,
    }}>
      {children}
    </LocationContext.Provider>
  );
};

// ── Hook ───────────────────────────────────────────────────────────────────────
export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
};
