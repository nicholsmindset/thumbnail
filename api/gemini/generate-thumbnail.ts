/**
 * Backend API Proxy for Gemini Thumbnail Generation
 * Keeps API key secure on server-side
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

// Server-side only API key
const getApiKey = (): string => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY not configured on server');
  }
  return key;
};

interface ThumbnailRequest {
  inspirationImage: string;
  userImage: string;
  prompt: string;
  textReplacement?: string;
  textStyle?: {
    font: string;
    color: string;
    effect: string;
  };
  aspectRatio: string;
  quality: 'standard' | 'high' | 'ultra';
}

// Helper to clean base64 data
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
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting headers (basic)
  res.setHeader('X-RateLimit-Limit', '10');
  res.setHeader('X-RateLimit-Remaining', '9');

  try {
    const request = req.body as ThumbnailRequest;

    // Validate required fields
    if (!request.inspirationImage || !request.userImage) {
      return res.status(400).json({ error: 'Missing required images' });
    }

    const ai = new GoogleGenAI({ apiKey: getApiKey() });

    const inspiration = cleanBase64(request.inspirationImage);
    const user = cleanBase64(request.userImage);

    let textStyleInstruction = '';
    if (request.textReplacement && request.textStyle) {
      textStyleInstruction = `
       - Font Style: ${request.textStyle.font}
       - Text Color: ${request.textStyle.color}
       - Text Effect: ${request.textStyle.effect}`;
    }

    const textInstruction = request.textReplacement
      ? `CRITICAL - TEXT REPLACEMENT:
       - You MUST detect any text present in "Image 1" (Inspiration).
       - You MUST REPLACE that text with the new text: "${request.textReplacement}".
       ${textStyleInstruction}
       - Maintain the perspective and placement of the original text unless the style dictates otherwise.
       - Do NOT include the original text anywhere. Only the new text should be visible.`
      : `CRITICAL - TEXT PRESERVATION:
       - You MUST PRESERVE the text from "Image 1" exactly as it appears.
       - Do NOT change the words.
       - Reconstruct the text exactly with the same font, style, and placement.`;

    const promptText = `
    ROLE: Expert Digital Artist & YouTuber specializing in photorealistic face swaps and thumbnail composition.

    TASK:
    Create a high-CTR YouTube thumbnail by performing a precision "Face Swap" and "Style Transfer".

    INPUTS:
    - IMAGE 1 (Style/Layout Reference): Defines the composition, background, text, lighting, pose, and facial expression.
    - IMAGE 2 (Identity Reference): Defines the person's face/identity.

    CRITICAL INSTRUCTION - IDENTITY PRESERVATION:
    - The face in the final image **MUST** be the person from **IMAGE 2**.
    - **DO NOT** create a new face. **DO NOT** blend the features of Image 1 and Image 2.
    - You must **rigidly preserve** the following features from Image 2:
      1. **Eye shape**: The exact curvature and corner shape of Image 2's eyes.
      2. **Nose shape**: The width of the bridge, the shape of the tip, and the nostrils of Image 2.
      3. **Jawline & Chin**: The exact bone structure and face outline of Image 2.
      4. **Mouth & Lips**: The thickness and width of the lips from Image 2.
      5. **Skin Details**: Moles, texture, and unique markers from Image 2.

    CRITICAL INSTRUCTION - STYLE & EXPRESSION ADAPTATION:
    - Take the **facial expression** (e.g., shock, mouth open, eyebrows raised) from Image 1 and apply it to the face structure of Image 2.
    - Take the **lighting direction** (shadows, highlights) and **color grading** from Image 1 and apply them to the skin of Image 2.
    - The body pose, clothing, and background must match Image 1 exactly (unless the prompt specifies otherwise).

    ${textInstruction}

    EXECUTION STEPS:
    1. Recreate the entire scene from Image 1.
    2. Replace the head/face of the subject in Image 1 with the head/face from Image 2.
    3. Morph the expression of Image 2 to match Image 1, but KEEP THE IDENTITY FIXED.
    4. Relight the face of Image 2 to match the environment of Image 1.
    5. Apply the text instructions (Preserve or Replace).

    OUTPUT QUALITY:
    - Photorealistic, 8K, highly detailed.
    - Skin texture must look real and high-definition.
    - Context/Override: ${request.prompt || 'Perfectly match the style and energy of the original thumbnail.'}

    Output ONLY the final image.
  `;

    const imageSizeMap: Record<string, string> = {
      standard: '1K',
      high: '2K',
      ultra: '4K',
    };

    const imageSize = imageSizeMap[request.quality || 'standard'];

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          { text: promptText },
          {
            inlineData: {
              mimeType: inspiration.mimeType,
              data: inspiration.data,
            },
          },
          {
            inlineData: {
              mimeType: user.mimeType,
              data: user.data,
            },
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: request.aspectRatio || '16:9',
          imageSize: imageSize,
        },
      },
    });

    // Extract image from response
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return res.json({
            imageUrl: `data:image/png;base64,${part.inlineData.data}`,
          });
        }
      }
    }

    return res.status(500).json({ error: 'No image generated' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Gemini generation error:', message);
    return res.status(500).json({ error: message });
  }
}
