import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import weatherRoutes from './routes/weather.routes';
import personalizationRoutes from './routes/personalization.routes';
// import locationRoutes from './routes/location.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: [
    /^http:\/\/localhost:\d+$/,
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ],
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/personalized-home', personalizationRoutes);
// app.use('/api/locations', locationRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
