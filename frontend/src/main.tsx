import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { LocationProvider } from './contexts/LocationContext'
import LocationModal from './components/LocationModal'
import { useLocation } from './contexts/LocationContext'

// Renders the modal globally so it floats above any page
function GlobalModal() {
  const { showLocationModal } = useLocation();
  return showLocationModal ? <LocationModal /> : null;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <LocationProvider>
        <App />
        <GlobalModal />
      </LocationProvider>
    </AuthProvider>
  </StrictMode>,
)
