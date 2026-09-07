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

const allowedOrigins = [
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
];

if (process.env.FRONTEND_URL) {
  // Add exactly the provided URL
  allowedOrigins.push(new RegExp(`^${process.env.FRONTEND_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`));
  // Optional: Also allow any vercel preview deployments if FRONTEND_URL is a vercel domain
  if (process.env.FRONTEND_URL.includes('vercel.app')) {
    allowedOrigins.push(/^https:\/\/.*\.vercel\.app$/);
  }
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

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;
