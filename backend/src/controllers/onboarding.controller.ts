import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../services/prisma.service';

// GET /api/onboarding/status
export const getOnboardingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        onboardingStatus: true,
        routine: { select: { skipped: true } },
        healthProfile: { select: { skipped: true } },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      onboardingStatus: user.onboardingStatus,
      routineSkipped: user.routine?.skipped ?? null,
      healthSkipped: user.healthProfile?.skipped ?? null,
    });
  } catch (error) {
    console.error('[onboarding/status]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/onboarding/routine
export const saveRoutine = async (req: AuthRequest, res: Response) => {
  try {
    const {
      routineTypes,
      activities,
      activityFrequency,
      preferredTime,
      commuteMethod,
    } = req.body;

    await prisma.userRoutine.upsert({
      where: { userId: req.userId! },
      update: {
        routineTypes: routineTypes ?? [],
        activities: activities ?? [],
        activityFrequency: activityFrequency ?? null,
        preferredTime: preferredTime ?? null,
        commuteMethod: commuteMethod ?? null,
        skipped: false,
      },
      create: {
        userId: req.userId!,
        routineTypes: routineTypes ?? [],
        activities: activities ?? [],
        activityFrequency: activityFrequency ?? null,
        preferredTime: preferredTime ?? null,
        commuteMethod: commuteMethod ?? null,
        skipped: false,
      },
    });

    await prisma.user.update({
      where: { id: req.userId },
      data: { onboardingStatus: 'health_pending' },
    });

    res.json({ success: true, nextStep: '/onboarding/health' });
  } catch (error) {
    console.error('[onboarding/routine]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/onboarding/routine/skip
export const skipRoutine = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.userRoutine.upsert({
      where: { userId: req.userId! },
      update: { skipped: true, routineTypes: [], activities: [] },
      create: { userId: req.userId!, skipped: true, routineTypes: [], activities: [] },
    });

    await prisma.user.update({
      where: { id: req.userId },
      data: { onboardingStatus: 'health_pending' },
    });

    res.json({ success: true, nextStep: '/onboarding/health' });
  } catch (error) {
    console.error('[onboarding/routine/skip]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/onboarding/health
export const saveHealthProfile = async (req: AuthRequest, res: Response) => {
  try {
    const {
      allergies,
      allergiesOther,
      healthConditions,
      healthConditionsOther,
      weatherSensitivities,
      additionalInfo,
    } = req.body;

    await prisma.userHealthProfile.upsert({
      where: { userId: req.userId! },
      update: {
        allergies: allergies ?? [],
        allergiesOther: allergiesOther ?? null,
        healthConditions: healthConditions ?? [],
        healthConditionsOther: healthConditionsOther ?? null,
        weatherSensitivities: weatherSensitivities ?? [],
        additionalInfo: additionalInfo ?? null,
        skipped: false,
      },
      create: {
        userId: req.userId!,
        allergies: allergies ?? [],
        allergiesOther: allergiesOther ?? null,
        healthConditions: healthConditions ?? [],
        healthConditionsOther: healthConditionsOther ?? null,
        weatherSensitivities: weatherSensitivities ?? [],
        additionalInfo: additionalInfo ?? null,
        skipped: false,
      },
    });

    await prisma.user.update({
      where: { id: req.userId },
      data: { onboardingStatus: 'completed' },
    });

    res.json({ success: true, nextStep: '/' });
  } catch (error) {
    console.error('[onboarding/health]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/onboarding/health/skip
export const skipHealth = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.userHealthProfile.upsert({
      where: { userId: req.userId! },
      update: { skipped: true, allergies: [], healthConditions: [], weatherSensitivities: [] },
      create: {
        userId: req.userId!,
        skipped: true,
        allergies: [],
        healthConditions: [],
        weatherSensitivities: [],
      },
    });

    await prisma.user.update({
      where: { id: req.userId },
      data: { onboardingStatus: 'completed' },
    });

    res.json({ success: true, nextStep: '/' });
  } catch (error) {
    console.error('[onboarding/health/skip]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
