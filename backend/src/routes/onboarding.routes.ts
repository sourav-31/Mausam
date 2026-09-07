import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import {
  getOnboardingStatus,
  saveRoutine,
  skipRoutine,
  saveHealthProfile,
  skipHealth,
} from '../controllers/onboarding.controller';

const router = Router();

// All routes require authentication — userId is extracted from JWT, never from body
router.get('/status', authenticateJWT, getOnboardingStatus);
router.post('/routine', authenticateJWT, saveRoutine);
router.post('/routine/skip', authenticateJWT, skipRoutine);
router.post('/health', authenticateJWT, saveHealthProfile);
router.post('/health/skip', authenticateJWT, skipHealth);

export default router;
