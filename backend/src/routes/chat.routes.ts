import { Router, Request, Response } from 'express';
import axios from 'axios';
import { MAUSAM_SYSTEM_PROMPT, matchKnowledge } from '../services/knowledge';

const router = Router();

interface ChatMessage {
  role: 'user' | 'assistant' | 'model';
  content: string;
}

/**
 * POST /api/chat
 * Handles conversational queries using Google Gemini 1.5 Flash (free tier)
 * with a reliable, instant local knowledge base fallback.
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { messages } = req.body as { messages?: ChatMessage[] };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    // If no Gemini API key is configured in backend/.env, use the instant heuristic engine
    if (!apiKey) {
      const fallbackReply = matchKnowledge(lastUserMessage);
      return res.json({
        reply: fallbackReply,
        model: 'local-knowledge-engine',
        isAiGenerated: false,
      });
    }

    // Format messages for Gemini API
    // Map 'assistant' to 'model' for Gemini spec, filter out empty messages
    const formattedContents = messages
      .filter((m) => m.content && m.content.trim().length > 0)
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    // Ensure first message has role 'user'
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
      // Use Gemini 1.5 Flash (free tier via Google AI Studio)
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const response = await axios.post(
        geminiUrl,
        {
          system_instruction: {
            parts: [{ text: MAUSAM_SYSTEM_PROMPT }],
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
          timeout: 10000, // 10 second timeout
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

      // If empty response, fallback
      const fallbackReply = matchKnowledge(lastUserMessage);
      return res.json({
        reply: fallbackReply,
        model: 'local-knowledge-engine-fallback',
        isAiGenerated: false,
      });
    } catch (geminiError: any) {
      console.warn('Gemini API call failed or rate-limited. Serving knowledge fallback:', geminiError?.response?.data || geminiError?.message);
      const fallbackReply = matchKnowledge(lastUserMessage);
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
