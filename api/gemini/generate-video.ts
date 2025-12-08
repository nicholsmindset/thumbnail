/**
 * Backend API Proxy for Gemini Video Generation
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
    const { image, prompt, aspectRatio } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Missing image' });
    }

    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const imageData = cleanBase64(image);

    let videoAspectRatio = '16:9';
    if (aspectRatio === '9:16') {
      videoAspectRatio = '9:16';
    }

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt || 'Cinematic movement, high quality, 4k',
      image: {
        imageBytes: imageData.data,
        mimeType: imageData.mimeType,
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: videoAspectRatio,
      },
    });

    // Polling loop with timeout
    const maxAttempts = 60;
    let attempts = 0;

    while (!operation.done && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
      attempts++;
    }

    if (!operation.done) {
      return res.status(408).json({ error: 'Video generation timed out' });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      return res.status(500).json({ error: 'No video URI returned' });
    }

    // Fetch the video and return as base64 or provide download URL
    // For security, we proxy the download through our server
    const videoResponse = await fetch(`${downloadLink}&key=${getApiKey()}`);
    const videoBuffer = await videoResponse.arrayBuffer();
    const videoBase64 = Buffer.from(videoBuffer).toString('base64');

    return res.json({
      videoUrl: `data:video/mp4;base64,${videoBase64}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Video generation error:', message);
    return res.status(500).json({ error: 'Failed to generate video' });
  }
}
