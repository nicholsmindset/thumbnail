/**
 * Backend API Proxy for Gemini YouTube Metadata Generation
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
    const { image, context } = req.body;

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
            text: `You are a world-class YouTube Strategist (inspired by MrBeast, Paddy Galloway, and Veritasium).

            TASK:
            Based on the attached thumbnail visual and the context: "${context || 'No context provided. Base it on the visual.'}", generate high-CTR metadata.

            GUIDELINES:
            1. **Titles**: Provide 5 options using different viral psychological hooks:
               - Curiosity Gap (What they don't know)
               - Extreme/Negativity bias (Warnings, Mistakes)
               - Specific Benefit/How-To (The "Unlock" or "Secret")
               - Keep titles under 60 characters where possible.

            2. **Description**:
               - First 2 lines (150 chars) must be the "Hook" - compelling the user to click 'Show More'.
               - Include a brief outline.
               - Include a call to action.

            3. **Tags/Keywords**:
               - Mix broad (niche) and specific (video topic) tags.

            Return JSON:
            {
              "titles": [
                "Curiosity: Title here...",
                "Negative: Title here...",
                "Benefit: Title here...",
                "Title 4",
                "Title 5"
              ],
              "description": "Full video description...",
              "tags": ["tag1", "tag2", ...],
              "keywords": ["keyword1", "keyword2", ...]
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
    const metadata = JSON.parse(jsonStr);

    return res.json(metadata);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Metadata generation error:', message);
    return res.status(500).json({ error: 'Failed to generate metadata' });
  }
}
