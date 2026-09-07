import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cloud, Loader2, ChevronRight, SkipForward, ShieldCheck } from 'lucide-react';
import { onboardingService } from '../services/onboarding.service';

// ── Data ───────────────────────────────────────────────────────────────────────

const ALLERGIES = [
  { label: 'Dust', emoji: '🌫️' },
  { label: 'Pollen', emoji: '🌸' },
  { label: 'Smoke', emoji: '💨' },
  { label: 'Pet Dander', emoji: '🐾' },
  { label: 'Mold', emoji: '🍄' },
  { label: 'None', emoji: '✅' },
  { label: 'Other', emoji: '✏️' },
];

const HEALTH_CONDITIONS = [
  { label: 'None', emoji: '✅' },
  { label: 'Respiratory sensitivity', emoji: '🫁' },
  { label: 'Asthma', emoji: '💨' },
  { label: 'Diabetes', emoji: '💉' },
  { label: 'Heart-related condition', emoji: '❤️' },
  { label: 'Migraine', emoji: '🧠' },
  { label: 'Skin sensitivity', emoji: '🧴' },
  { label: 'Other', emoji: '✏️' },
];

const WEATHER_SENSITIVITIES = [
  { label: 'Extreme heat', emoji: '🌡️' },
  { label: 'Extreme cold', emoji: '🥶' },
  { label: 'High humidity', emoji: '💧' },
  { label: 'Rain', emoji: '🌧️' },
  { label: 'Strong wind', emoji: '💨' },
  { label: 'Dust', emoji: '🌫️' },
  { label: 'Poor air quality', emoji: '😷' },
  { label: 'Bright sunlight', emoji: '☀️' },
  { label: 'None', emoji: '✅' },
];

// ── Chip Component ─────────────────────────────────────────────────────────────

interface ChipProps {
  label: string;
  emoji?: string;
  selected: boolean;
  onClick: () => void;
}

function Chip({ label, emoji, selected, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all select-none cursor-pointer ${
        selected
          ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]'
          : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50'
      }`}
    >
      {emoji && <span className="text-base">{emoji}</span>}
      {label}
    </button>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function HealthProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergiesOther, setAllergiesOther] = useState('');
  const [healthConditions, setHealthConditions] = useState<string[]>([]);
  const [healthConditionsOther, setHealthConditionsOther] = useState('');
  const [weatherSensitivities, setWeatherSensitivities] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState('');

  const toggleMulti = (
    arr: string[],
    setArr: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) => {
    setArr(arr.includes(item) ? arr.filter(v => v !== item) : [...arr, item]);
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await onboardingService.saveHealth({
        allergies,
        allergiesOther: allergiesOther || undefined,
        healthConditions,
        healthConditionsOther: healthConditionsOther || undefined,
        weatherSensitivities,
        additionalInfo: additionalInfo || undefined,
      });
      navigate(res.nextStep);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await onboardingService.skipHealth();
      navigate(res.nextStep);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-16">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow">
            <Cloud className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-900">AetherWeather</span>
        </div>
        {/* Progress */}
        <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
          <span className="text-slate-400">About You</span>
          <span>→</span>
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700">2 of 2</span>
          <span className="text-blue-600">Health Profile</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-10">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Your Health Profile</h1>
          <p className="text-slate-500 text-base leading-relaxed">
            Help us make weather recommendations more relevant to you.
            <span className="font-semibold text-slate-700"> All fields are optional.</span>
          </p>
        </div>

        {/* Privacy note */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-10">
          <ShieldCheck className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-700 leading-relaxed font-medium">
            <span className="font-bold">Privacy Notice:</span> This information is only used for weather personalization.
            We do not provide medical advice. Your data is private and never shared.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl mb-6 font-medium">
            {error}
          </div>
        )}

        {/* Section: Allergies */}
        <section className="mb-10">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">
            Allergies affected by weather/environment
          </h2>
          <p className="text-xs text-slate-400 mb-4">Optional — select all that apply</p>
          <div className="flex flex-wrap gap-3">
            {ALLERGIES.map(({ label, emoji }) => (
              <Chip
                key={label}
                label={label}
                emoji={emoji}
                selected={allergies.includes(label)}
                onClick={() => toggleMulti(allergies, setAllergies, label)}
              />
            ))}
          </div>
          {allergies.includes('Other') && (
            <input
              type="text"
              value={allergiesOther}
              onChange={e => setAllergiesOther(e.target.value)}
              placeholder="Please specify your allergy..."
              className="mt-4 w-full border border-slate-200 rounded-xl p-3 text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          )}
        </section>

        {/* Section: Health Conditions */}
        <section className="mb-10">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">
            Health conditions to consider for personalization
          </h2>
          <p className="text-xs text-slate-400 mb-4">Optional — user-provided for personalization only, not medical advice</p>
          <div className="flex flex-wrap gap-3">
            {HEALTH_CONDITIONS.map(({ label, emoji }) => (
              <Chip
                key={label}
                label={label}
                emoji={emoji}
                selected={healthConditions.includes(label)}
                onClick={() => toggleMulti(healthConditions, setHealthConditions, label)}
              />
            ))}
          </div>
          {healthConditions.includes('Other') && (
            <input
              type="text"
              value={healthConditionsOther}
              onChange={e => setHealthConditionsOther(e.target.value)}
              placeholder="Please specify..."
              className="mt-4 w-full border border-slate-200 rounded-xl p-3 text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          )}
        </section>

        {/* Section: Weather Sensitivity */}
        <section className="mb-10">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">
            Weather conditions that usually affect your comfort
          </h2>
          <p className="text-xs text-slate-400 mb-4">Optional — select all that apply</p>
          <div className="flex flex-wrap gap-3">
            {WEATHER_SENSITIVITIES.map(({ label, emoji }) => (
              <Chip
                key={label}
                label={label}
                emoji={emoji}
                selected={weatherSensitivities.includes(label)}
                onClick={() => toggleMulti(weatherSensitivities, setWeatherSensitivities, label)}
              />
            ))}
          </div>
        </section>

        {/* Section: Additional info */}
        <section className="mb-10">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
            Anything else you'd like us to consider?
          </h2>
          <textarea
            value={additionalInfo}
            onChange={e => setAdditionalInfo(e.target.value)}
            placeholder="Optional — e.g. I prefer to avoid heavy rain during my commute..."
            rows={3}
            className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
          />
        </section>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={handleSkip}
            disabled={loading}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-semibold text-sm transition-colors disabled:opacity-50"
          >
            <SkipForward className="w-4 h-4" />
            Skip for now
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>Save & Continue <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
