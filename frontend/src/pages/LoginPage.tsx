import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/home');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (profile: string) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/explore-demo', { profile });
      localStorage.setItem('token', res.data.token);
      navigate('/home');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-2xl font-bold text-center mb-6">Welcome Back</h2>
        
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              type="email" 
              className="w-full border rounded-md p-2 bg-transparent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input 
              type="password" 
              className="w-full border rounded-md p-2 bg-transparent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </Button>
        </form>

        <div className="mt-8 border-t pt-6">
          <p className="text-center text-sm text-slate-500 mb-4">Or quickly explore using a Demo Profile for SIH Judging</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => handleDemoLogin('Student')}>🎓 Student</Button>
            <Button variant="outline" size="sm" onClick={() => handleDemoLogin('Farmer')}>🌾 Farmer</Button>
            <Button variant="outline" size="sm" onClick={() => handleDemoLogin('Driver')}>🚗 Driver</Button>
            <Button variant="outline" size="sm" onClick={() => handleDemoLogin('Traveller')}>✈️ Traveller</Button>
            <Button variant="outline" size="sm" onClick={() => handleDemoLogin('Fitness')}>🏃 Fitness</Button>
            <Button variant="outline" size="sm" onClick={() => handleDemoLogin('General')}>🏠 General</Button>
          </div>
        </div>

        <p className="text-center text-sm mt-6 text-slate-500">
          Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
