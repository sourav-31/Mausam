import api from './api';

export interface RoutinePayload {
  routineTypes: string[];
  activities: string[];
  activityFrequency?: string;
  preferredTime?: string;
  commuteMethod?: string;
}

export interface HealthPayload {
  allergies: string[];
  allergiesOther?: string;
  healthConditions: string[];
  healthConditionsOther?: string;
  weatherSensitivities: string[];
  additionalInfo?: string;
}

export interface OnboardingStatus {
  onboardingStatus: string;
  routineSkipped: boolean | null;
  healthSkipped: boolean | null;
}

export const onboardingService = {
  async getStatus(): Promise<OnboardingStatus> {
    const res = await api.get('/onboarding/status');
    return res.data;
  },

  async saveRoutine(payload: RoutinePayload): Promise<{ nextStep: string }> {
    const res = await api.post('/onboarding/routine', payload);
    return res.data;
  },

  async skipRoutine(): Promise<{ nextStep: string }> {
    const res = await api.post('/onboarding/routine/skip');
    return res.data;
  },

  async saveHealth(payload: HealthPayload): Promise<{ nextStep: string }> {
    const res = await api.post('/onboarding/health', payload);
    return res.data;
  },

  async skipHealth(): Promise<{ nextStep: string }> {
    const res = await api.post('/onboarding/health/skip');
    return res.data;
  },
};
