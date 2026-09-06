import { Request, Response } from 'express';
import axios from 'axios';

export const searchLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.query;
    if (!name) {
      res.status(400).json({ error: 'Location name is required' });
      return;
    }

    // Using OpenMeteo Geocoding API
    const response = await axios.get(`https://geocoding-api.open-meteo.com/v1/search`, {
      params: {
        name: name,
        count: 10,
        language: 'en',
        format: 'json'
      }
    });

    const results = response.data.results || [];
    res.json(results);
  } catch (error) {
    console.error('Error searching location:', error);
    res.status(500).json({ error: 'Failed to search location' });
  }
};
