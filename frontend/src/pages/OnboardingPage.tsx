import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cloud, Loader2, ChevronRight, SkipForward } from 'lucide-react';
import { onboardingService } from '../services/onboarding.service';

// ── Data ───────────────────────────────────────────────────────────────────────

const ROUTINE_TYPES = [
  { label: 'College/School', emoji: '🎓' },
  { label: 'Office/Work', emoji: '💼' },
  { label: 'Work from Home', emoji: '🏠' },
  { label: 'Outdoor Work', emoji: '🌿' },
  { label: 'Travelling/Commute', emoji: '🚌' },
  { label: 'Sports', emoji: '⚽' },
  { label: 'Gym/Fitness', emoji: '💪' },
  { label: 'Walking', emoji: '🚶' },
  { label: 'Running', emoji: '🏃' },
  { label: 'Cycling', emoji: '🚴' },
  { label: 'Shopping', emoji: '🛍️' },
  { label: 'Social Activities', emoji: '👥' },
  { label: 'Mostly Indoors', emoji: '🏡' },
  { label: 'Mostly Outdoors', emoji: '☀️' },
  { label: 'Other', emoji: '✨' },
];

const ACTIVITIES = [
  { label: 'Morning Walk', emoji: '🌅' },
  { label: 'Evening Walk', emoji: '🌆' },
  { label: 'Running', emoji: '🏃' },
  { label: 'Cycling', emoji: '🚴' },
  { label: 'Gym', emoji: '🏋️' },
  { label: 'Outdoor Sports', emoji: '🏏' },
  { label: 'Travelling', emoji: '✈️' },
  { label: 'Bike Ride', emoji: '🏍️' },
  { label: 'Photography', emoji: '📷' },
  { label: 'Gardening', emoji: '🌱' },
  { label: 'Hiking', emoji: '⛰️' },
  { label: 'Shopping', emoji: '🛒' },
  { label: 'Commute', emoji: '🚇' },
  { label: 'Events', emoji: '🎉' },
  { label: 'Outdoor Work', emoji: '🔨' },
];

const FREQUENCIES = ['Daily', 'Several times a week', 'Weekly', 'Occasionally'];
const TIMES = ['Morning', 'Afternoon', 'Evening', 'Night'];
const COMMUTES = ['Walking', 'Bicycle', 'Bike/Scooter', 'Car', 'Public Transport'];

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

function SingleChip({ label, selected, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
        selected
          ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
          : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50'
      }`}
    >
      {label}
    </button>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [routineTypes, setRoutineTypes] = useState<string[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [frequency, setFrequency] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [commuteMethod, setCommuteMethod] = useState('');

  const toggleMulti = (
    arr: string[],
    setArr: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) => {
    setArr(arr.includes(item) ? arr.filter(v => v !== item) : [...arr, item]);
  };

  const handleContinue = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await onboardingService.saveRoutine({
        routineTypes,
        activities,
        activityFrequency: frequency || undefined,
        preferredTime: preferredTime || undefined,
        commuteMethod: commuteMethod || undefined,
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
      const res = await onboardingService.skipRoutine();
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
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700">1 of 2</span>
          <span className="text-blue-600">About You</span>
          <span>→</span>
          <span className="text-slate-400">Health Profile</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-10">
        {/* Hero */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Tell us about your routine</h1>
          <p className="text-slate-500 text-base leading-relaxed">
            Help us personalize your weather experience based on how you spend your day.
            Just tap the options that apply to you — no typing needed!
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl mb-6 font-medium">
            {error}
          </div>
        )}

        {/* Section: Daily Routine */}
        <section className="mb-10">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
            What does your typical day look like?
          </h2>
          <div className="flex flex-wrap gap-3">
            {ROUTINE_TYPES.map(({ label, emoji }) => (
              <Chip
                key={label}
                label={label}
                emoji={emoji}
                selected={routineTypes.includes(label)}
                onClick={() => toggleMulti(routineTypes, setRoutineTypes, label)}
              />
            ))}
          </div>
        </section>

        {/* Section: Activities */}
        <section className="mb-10">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
            What activities do you usually do?
          </h2>
          <div className="flex flex-wrap gap-3">
            {ACTIVITIES.map(({ label, emoji }) => (
              <Chip
                key={label}
                label={label}
                emoji={emoji}
                selected={activities.includes(label)}
                onClick={() => toggleMulti(activities, setActivities, label)}
              />
            ))}
          </div>
        </section>

        {/* Section: Frequency */}
        <section className="mb-10">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
            How often do you do these activities?
          </h2>
          <p className="text-xs text-slate-400 mb-4">Optional</p>
          <div className="flex flex-wrap gap-3">
            {FREQUENCIES.map(f => (
              <Chip
                key={f}
                label={f}
                selected={frequency === f}
                onClick={() => setFrequency(frequency === f ? '' : f)}
              />
            ))}
          </div>
        </section>

        {/* Section: Preferred time */}
        <section className="mb-10">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
            When do you usually go out?
          </h2>
          <p className="text-xs text-slate-400 mb-4">Optional</p>
          <div className="flex gap-3">
            {TIMES.map(t => (
              <SingleChip
                key={t}
                label={t}
                selected={preferredTime === t}
                onClick={() => setPreferredTime(preferredTime === t ? '' : t)}
              />
            ))}
          </div>
        </section>

        {/* Section: Commute */}
        <section className="mb-10">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
            How do you usually commute?
          </h2>
          <p className="text-xs text-slate-400 mb-4">Optional</p>
          <div className="flex flex-wrap gap-3">
            {COMMUTES.map(c => (
              <Chip
                key={c}
                label={c}
                selected={commuteMethod === c}
                onClick={() => setCommuteMethod(commuteMethod === c ? '' : c)}
              />
            ))}
          </div>
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
            onClick={handleContinue}
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>Continue <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
