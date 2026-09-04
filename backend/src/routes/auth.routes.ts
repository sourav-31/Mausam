import { Router } from 'express';
import { register, login, getMe, exploreDemo } from '../controllers/auth.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateJWT, getMe);
router.post('/explore-demo', exploreDemo);

export default router;
