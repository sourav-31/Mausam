import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import HealthProfilePage from './pages/HealthProfilePage';
import PersonalizedHome from './pages/PersonalizedHome';
import { useAuth } from './contexts/AuthContext';

// ── Route Protection ───────────────────────────────────────────────────────────

/** Redirects unauthenticated users to /login */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null; // Wait for auth check to resolve
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/** Redirects already-authenticated users away from auth page */
function RequireGuest({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    // Route based on onboarding status
    return <Navigate to={getRedirectPath(user.onboardingStatus)} replace />;
  }
  return <>{children}</>;
}

/** Maps onboarding status to the correct destination route */
function getRedirectPath(status: string): string {
  if (status === 'routine_pending' || status === 'not_started') return '/onboarding';
  if (status === 'health_pending') return '/onboarding/health';
  return '/'; // completed
}

/** Redirects a logged-in user to the correct next onboarding step or homepage */
function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.onboardingStatus === 'completed') return <Navigate to="/" replace />;
  return <>{children}</>;
}

// ── App ────────────────────────────────────────────────────────────────────────

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background font-sans antialiased text-foreground">
        <Routes>
          {/* Public — main dashboard (accessible to all) */}
          <Route path="/" element={<LandingPage />} />

          {/* Public — auth pages (redirect if already logged in) */}
          <Route path="/login" element={<RequireGuest><AuthPage /></RequireGuest>} />
          <Route path="/register" element={<RequireGuest><AuthPage /></RequireGuest>} />

          {/* Onboarding — requires auth, skips if already completed */}
          <Route path="/onboarding" element={<OnboardingGuard><OnboardingPage /></OnboardingGuard>} />
          <Route path="/onboarding/health" element={<RequireAuth><HealthProfilePage /></RequireAuth>} />

          {/* Protected — personalized home */}
          <Route path="/home" element={<RequireAuth><PersonalizedHome /></RequireAuth>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
