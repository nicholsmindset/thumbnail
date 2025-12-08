/**
 * Backend API Proxy for Gemini Text Detection
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

const cleanBase64 = (dataUrl: string) => {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    return {
      mimeType: matches[1],
      data: matches[2],
    };
  }
  return {
    mimeType: 'image/jpeg',
    data: dataUrl,
  };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Missing image' });
    }

    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const imageData = cleanBase64(image);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            text: `Analyze this image and extract all visible text strings.
                   Return ONLY a JSON array of strings.
                   Example: ["HOW TO", "GROW", "FAST"].
                   If no text is found, return [].`,
          },
          {
            inlineData: {
              mimeType: imageData.mimeType,
              data: imageData.data,
            },
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '[]';
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const texts = JSON.parse(jsonStr);

    return res.json({ texts });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Text detection error:', message);
    return res.status(500).json({ error: 'Failed to detect text', texts: [] });
  }
}
