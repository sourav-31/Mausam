import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Loader2, Cloud } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '@/services/api';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();
  
  const [isLoginMode, setIsLoginMode] = useState(location.pathname === '/login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  // Update mode if URL changes manually
  useEffect(() => {
    setIsLoginMode(location.pathname === '/login');
    setError('');
  }, [location.pathname]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLoginMode && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      if (isLoginMode) {
        const res = await api.post('/auth/login', { 
          email: formData.email, 
          password: formData.password 
        });
        await login(res.data.token);
        // Redirect based on onboarding status returned in the user object
        const status = res.data.user?.onboardingStatus;
        redirectAfterAuth(status);
      } else {
        const res = await api.post('/auth/register', { 
          name: formData.name,
          email: formData.email, 
          password: formData.password 
        });
        await login(res.data.token);
        // New users always go to onboarding step 1
        navigate('/onboarding');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const redirectAfterAuth = (status?: string) => {
    if (!status || status === 'not_started' || status === 'routine_pending') {
      navigate('/onboarding');
    } else if (status === 'health_pending') {
      navigate('/onboarding/health');
    } else {
      navigate('/');
    }
  };

  const handleDemoLogin = async (profile: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/explore-demo', { profile });
      await login(res.data.token);
      redirectAfterAuth(res.data.user?.onboardingStatus);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 py-8 relative overflow-hidden font-sans text-slate-800">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-3xl opacity-50 z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-100 rounded-full blur-3xl opacity-50 z-0"></div>

      {/* Logo */}
      <Link to="/" className="mb-8 z-10 flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 ring-4 ring-blue-50 group-hover:scale-105 transition-transform">
          <Cloud className="w-5 h-5 text-white stroke-[2.2]" />
        </div>
        <div>
          <span className="text-xl font-extrabold text-slate-900 tracking-tight block leading-none">
            Mausam <span className="text-blue-600 font-bold text-xs bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">2.0</span>
          </span>
          <span className="text-[11px] font-medium text-slate-400 tracking-wide block mt-0.5">Weather Intelligence</span>
        </div>
      </Link>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-xs border border-slate-200/90 p-8 z-10">
        
        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-lg mb-6 border border-slate-200/80">
          <button 
            type="button"
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${isLoginMode ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            onClick={() => { setIsLoginMode(true); window.history.pushState({}, '', '/login'); }}
          >
            Log In
          </button>
          <button 
            type="button"
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${!isLoginMode ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            onClick={() => { setIsLoginMode(false); window.history.pushState({}, '', '/register'); }}
          >
            Sign Up
          </button>
        </div>

        <h2 className="text-xl font-extrabold text-slate-900 mb-6 text-center tracking-tight">
          {isLoginMode ? 'Welcome back' : 'Create an account'}
        </h2>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 mb-6 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginMode && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Full Name</label>
              <input 
                name="name"
                type="text" 
                placeholder="Alex Morgan"
                className="w-full border border-slate-200 rounded-md p-2.5 bg-slate-50/70 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
                value={formData.name}
                onChange={handleChange}
                required={!isLoginMode}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Email Address</label>
            <input 
              name="email"
              type="email" 
              placeholder="you@example.com"
              className="w-full border border-slate-200 rounded-md p-2.5 bg-slate-50/70 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-end mb-1.5">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Password</label>
              {isLoginMode && (
                <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">Forgot Password?</a>
              )}
            </div>
            <div className="relative">
              <input 
                name="password"
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                className="w-full border border-slate-200 rounded-md p-2.5 bg-slate-50/70 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium pr-10"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {!isLoginMode && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Confirm Password</label>
              <input 
                name="confirmPassword"
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                className="w-full border border-slate-200 rounded-md p-2.5 bg-slate-50/70 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
                value={formData.confirmPassword}
                onChange={handleChange}
                required={!isLoginMode}
              />
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-11 mt-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-md font-semibold text-sm shadow-xs hover:shadow transition-all" 
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isLoginMode ? 'Log In' : 'Create Account')}
          </Button>
        </form>

        {isLoginMode && (
          <div className="mt-8 border-t border-slate-100 pt-6">
            <p className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Explore Demo</p>
            <div className="grid grid-cols-2 gap-2.5">
              <button onClick={() => handleDemoLogin('Student')} className="p-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors">🎓 Student</button>
              <button onClick={() => handleDemoLogin('Farmer')} className="p-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors">🌾 Farmer</button>
              <button onClick={() => handleDemoLogin('Driver')} className="p-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors">🚗 Driver</button>
              <button onClick={() => handleDemoLogin('Traveller')} className="p-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors">✈️ Traveller</button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 text-center text-sm font-medium text-slate-500 z-10">
        <Link to="/" className="hover:text-slate-800 transition-colors flex items-center justify-center gap-2">
          ← Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
