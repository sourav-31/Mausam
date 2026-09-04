import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../services/prisma.service';
import { PersonalizationEngine } from '../engines/PersonalizationEngine';
import { OpenMeteoProvider } from '../providers/OpenMeteoProvider';

const personalizationEngine = new PersonalizationEngine();
const weatherProvider = new OpenMeteoProvider();

export const getPersonalizedHome = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        profile: true,
        preferences: true,
        savedLocations: { where: { isPrimary: true } }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Default to a central location if no primary saved location
    let lat = 22.7196; // Indore
    let lon = 75.8577;
    let locationName = 'Indore';

    if (user.savedLocations.length > 0) {
      lat = user.savedLocations[0].latitude;
      lon = user.savedLocations[0].longitude;
      locationName = user.savedLocations[0].city;
    }

    const weatherData = await weatherProvider.getWeatherData(lat, lon);
    weatherData.location.name = locationName;

    const prefs = user.preferences.map(p => p.category);
    const profileName = user.profile?.primaryProfile || 'General User';

    const config = personalizationEngine.generateHomepage(
      weatherData,
      user.name,
      profileName,
      prefs
    );

    res.json({
       config,
       locationName
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
