import { Router } from 'express';
import { searchLocation, getForecast, reverseGeocode } from '../controllers/weather.controller';

const router = Router();

router.get('/location/search', searchLocation);
router.get('/location/reverse', reverseGeocode);
router.get('/forecast', getForecast);

export default router;
