import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [location, setLocation] = useState<{ name: string; lat: number; lon: number }>({ name: '', lat: 0, lon: 0 });
  const [profile, setProfile] = useState('');
  const [preferences, setPreferences] = useState<string[]>([]);

  const handleLocationSelect = async (city: string) => {
    // Simple geocoding call via backend (mocked)
    const res = await api.get('/weather/location/search', { params: { name: city } });
    const loc = res.data[0];
    setLocation({ name: loc.name, lat: loc.latitude, lon: loc.longitude });
  };

  const handleNext = async () => {
    if (step === 3) {
      // Persist onboarding data (placeholder) and go to home
      navigate('/home');
      return;
    }
    setStep(step + 1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="max-w-lg w-full bg-white dark:bg-slate-800 p-6 rounded-2xl shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">Onboarding – Step {step}</h2>
        {step === 1 && (
          <div>
            <p className="mb-2">Where are you?</p>
            <input
              type="text"
              placeholder="Enter city name"
              className="w-full border rounded p-2 mb-4"
              onBlur={e => handleLocationSelect(e.target.value)}
            />
            {location.name && <p>Selected: {location.name}</p>}
          </div>
        )}
        {step === 2 && (
          <div>
            <p className="mb-2">What best describes you?</p>
            <div className="grid grid-cols-2 gap-2">
              {['Student', 'Farmer', 'Traveller', 'Driver', 'Fitness Enthusiast', 'General User'].map(p => (
                <Button
                  key={p}
                  variant={profile === p ? 'default' : 'outline'}
                  onClick={() => setProfile(p)}
                >
                  {p}
                </Button>
              ))}
            </div>
          </div>
        )}
        {step === 3 && (
          <div>
            <p className="mb-2">What weather information matters most to you?</p>
            <div className="grid grid-cols-2 gap-2">
              {['Temperature', 'Rain Forecast', 'Severe Weather', 'Wind', 'UV Index', 'Outdoor Conditions', 'Travel Conditions', 'Agriculture Weather'].map(p => (
                <Button
                  key={p}
                  variant={preferences.includes(p) ? 'default' : 'outline'}
                  onClick={() => {
                    setPreferences(prev =>
                      prev.includes(p) ? prev.filter(v => v !== p) : [...prev, p]
                    );
                  }}
                >
                  {p}
                </Button>
              ))}
            </div>
          </div>
        )}
        <div className="mt-6 flex justify-between">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          <Button onClick={handleNext}>{step === 3 ? 'Finish' : 'Next'}</Button>
        </div>
      </div>
    </div>
  );
}

