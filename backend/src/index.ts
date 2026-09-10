import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import weatherRoutes from './routes/weather.routes';
import personalizationRoutes from './routes/personalization.routes';
import onboardingRoutes from './routes/onboarding.routes';
// import locationRoutes from './routes/location.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const allowedOrigins: (RegExp | string)[] = [
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
  /^https:\/\/.*\.vercel\.app$/,
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(new RegExp(`^${process.env.FRONTEND_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`));
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/personalized-home', personalizationRoutes);
app.use('/api/onboarding', onboardingRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;
