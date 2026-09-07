import { Router } from 'express';
import { searchLocation, getForecast } from '../controllers/weather.controller';

const router = Router();

router.get('/location/search', searchLocation);
router.get('/forecast', getForecast);

export default router;
