import { Router } from 'express';
import { searchLocation } from '../controllers/weather.controller';

const router = Router();

router.get('/location/search', searchLocation);

export default router;
