import { Router, Request, Response } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import prisma from '../services/prisma.service';
import { MAUSAM_SYSTEM_PROMPT, matchKnowledge } from '../services/knowledge';
import { weatherContextService, UserHealthContext, UserRoutineContext } from '../services/weatherContext.service';

const router = Router();

interface ChatMessage {
  role: 'user' | 'assistant' | 'model';
  content: string;
}

interface RequestLocation {
  latitude?: number;
  longitude?: number;
  cityName?: string;
}

/**
 * POST /api/chat
 * Handles conversational queries with contextual user health, routine,
 * and live weather telemetry for hyper-personalized recommendations.
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { messages, location } = req.body as {
      messages?: ChatMessage[];
      location?: RequestLocation;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    // 1. Resolve User Identity (if logged in)
    let user: any = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key') as any;
        const userId = decoded.userId || decoded.id;
        if (userId) {
          user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
              routine: true,
              healthProfile: true,
              profile: true,
              savedLocations: { where: { isPrimary: true } },
            },
          });
        }
      } catch (err) {
        // Invalid or expired token - proceed as guest
      }
    }

    // 2. Resolve Active Location
    let lat = location?.latitude ?? user?.savedLocations?.[0]?.latitude ?? 28.6139;
    let lon = location?.longitude ?? user?.savedLocations?.[0]?.longitude ?? 77.2090;
    let cityName = location?.cityName ?? user?.savedLocations?.[0]?.city ?? 'your area';

    // 3. Detect if the user is asking about outdoor activity, walks, workouts, or health
    const isOutdoorOrHealthQuery = /walk|running|jog|cycling|outdoor|workout|exercise|best time|go out|commute|routine|health|asthma|migraine|pollution|aqi/i.test(
      lastUserMessage
    );

    let outdoorAnalysisText: string | undefined;

    if (isOutdoorOrHealthQuery) {
      const healthContext: UserHealthContext = {
        healthConditions: user?.healthProfile?.healthConditions || [],
        allergies: user?.healthProfile?.allergies || [],
        weatherSensitivities: user?.healthProfile?.weatherSensitivities || [],
        additionalInfo: user?.healthProfile?.additionalInfo,
      };

      const routineContext: UserRoutineContext = {
        activities: user?.routine?.activities || [],
        activityFrequency: user?.routine?.activityFrequency,
        preferredTime: user?.routine?.preferredTime,
        commuteMethod: user?.routine?.commuteMethod,
      };

      const analysis = await weatherContextService.analyzeOutdoorConditions(
        lat,
        lon,
        cityName,
        healthContext,
        routineContext
      );

      outdoorAnalysisText = analysis.summaryText;
    }

    // 4. Build dynamic system context
    let dynamicSystemPrompt = MAUSAM_SYSTEM_PROMPT;

    if (user || isOutdoorOrHealthQuery) {
      dynamicSystemPrompt += `\n\n### ACTIVE LIVE CONTEXT FOR THIS USER:
- Current Location: ${cityName} (Coordinates: ${lat}, ${lon})
- User Status: ${user ? `Logged in as ${user.name}` : 'Guest User'}
${
  user?.routine
    ? `- Saved Routine: Preferred Time = ${user.routine.preferredTime || 'Not set'}, Activities = ${(user.routine.activities || []).join(', ') || 'General'}`
    : '- Saved Routine: Not configured yet'
}
${
  user?.healthProfile
    ? `- Health Profile: Conditions = ${(user.healthProfile.healthConditions || []).join(', ') || 'None'}, Allergies = ${(user.healthProfile.allergies || []).join(', ') || 'None'}, Sensitivities = ${(user.healthProfile.weatherSensitivities || []).join(', ') || 'None'}`
    : '- Health Profile: Not configured yet (General user advice)'
}
${
  outdoorAnalysisText
    ? `\n### REAL-TIME 24-HOUR ATMOSPHERIC & HEALTH ANALYSIS (OPEN-METEO VERIFIED):\n${outdoorAnalysisText}\n\nWhen answering questions about walking or outdoor activities, utilize this calculated optimal window, highlight the reasons (temperature, rain %, PM2.5), alert about any health sensitivities (such as asthma or migraine triggers), and warn about hours to avoid.`
    : ''
}`;
    }

    // 5. If no Gemini API key configured, use intelligent knowledge fallback with live analysis
    if (!apiKey) {
      const fallbackReply = matchKnowledge(lastUserMessage, outdoorAnalysisText);
      return res.json({
        reply: fallbackReply,
        model: 'local-knowledge-engine',
        isAiGenerated: false,
      });
    }

    // 6. Format messages for Google Gemini API
    const formattedContents = messages
      .filter((m) => m.content && m.content.trim().length > 0)
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    if (formattedContents.length > 0 && formattedContents[0].role !== 'user') {
      formattedContents.shift();
    }

    if (formattedContents.length === 0) {
      formattedContents.push({
        role: 'user',
        parts: [{ text: lastUserMessage || 'Hello' }],
      });
    }

    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const response = await axios.post(
        geminiUrl,
        {
          system_instruction: {
            parts: [{ text: dynamicSystemPrompt }],
          },
          contents: formattedContents,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 800,
          },
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        }
      );

      const candidate = response.data?.candidates?.[0];
      const text = candidate?.content?.parts?.[0]?.text;

      if (text) {
        return res.json({
          reply: text,
          model: 'gemini-1.5-flash',
          isAiGenerated: true,
        });
      }

      // Fallback if empty text returned
      const fallbackReply = matchKnowledge(lastUserMessage, outdoorAnalysisText);
      return res.json({
        reply: fallbackReply,
        model: 'local-knowledge-engine-fallback',
        isAiGenerated: false,
      });
    } catch (geminiError: any) {
      console.warn(
        'Gemini API call failed or rate-limited. Serving knowledge fallback:',
        geminiError?.response?.data || geminiError?.message
      );
      const fallbackReply = matchKnowledge(lastUserMessage, outdoorAnalysisText);
      return res.json({
        reply: fallbackReply,
        model: 'local-knowledge-engine-fallback',
        isAiGenerated: false,
      });
    }
  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: 'Internal server error while processing chat.' });
  }
});

export default router;
