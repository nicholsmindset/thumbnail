/**
 * Backend API Proxy for Gemini Prompt Enhancement
 * Keeps API key secure on server-side
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const getApiKey = (): string => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY not configured on server');
  }
  return key;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    const ai = new GoogleGenAI({ apiKey: getApiKey() });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert Prompt Engineer for AI Image Generators.
      Rewrite the following simple user request into a highly detailed, descriptive prompt suitable for a high-end photorealistic model.

      User Request: "${prompt}"

      Instructions:
      - Add details about lighting (e.g., cinematic, rim lighting, softbox).
      - Add details about camera (e.g., 85mm lens, f/1.8, 4k).
      - Add details about expression and mood.
      - Keep it under 40 words.
      - Output ONLY the rewritten prompt string. No quotes.`,
    });

    const enhancedPrompt = response.text?.trim() || prompt;

    return res.json({ prompt: enhancedPrompt });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Prompt enhancement error:', message);
    return res.status(500).json({ error: 'Failed to enhance prompt', prompt: req.body.prompt });
  }
}
