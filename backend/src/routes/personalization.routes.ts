import { Router } from 'express';
import { getPersonalizedHome } from '../controllers/personalization.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateJWT, getPersonalizedHome);

export default router;
