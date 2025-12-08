/**
 * Backend API Proxy for Gemini Thumbnail Analysis
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
            text: `You are a YouTube Analytics expert and Graphic Design Auditor.
            Analyze the attached thumbnail image for "Click-Through Rate" (CTR) potential.

            Evaluate based on:
            1. Facial Expression & Emotion (Is it intense? Eye contact?)
            2. Text Readability (Contrast, size, font weight)
            3. Composition (Rule of thirds, clutter, focal point)
            4. Color Theory (Saturation, complementary colors)
            5. Curiosity Gap (Does it make you want to click?)

            Return a JSON object with this exact structure:
            {
              "score": number, // 0 to 100 integer
              "critique": "string", // A 1-sentence summary of the vibe
              "strengths": ["string", "string"], // Top 3 things done well
              "improvements": ["string", "string"] // Top 3 specific actionable fixes
            }`,
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

    const text = response.text || '{}';
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const analysis = JSON.parse(jsonStr);

    return res.json(analysis);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Analysis error:', message);
    return res.status(500).json({ error: 'Failed to analyze thumbnail' });
  }
}
