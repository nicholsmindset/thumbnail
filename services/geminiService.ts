/**
 * Gemini Service - Client-side wrapper for backend API proxy
 * All API calls are proxied through the server to keep the API key secure
 */

import { ThumbnailRequest, AnalysisResult, YoutubeMetadataResult } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Check if API key is configured (via AI Studio integration)
 */
export const checkApiKey = async (): Promise<boolean> => {
  if (window.aistudio && window.aistudio.hasSelectedApiKey) {
    return await window.aistudio.hasSelectedApiKey();
  }
  // When using backend proxy, always return true as key is server-side
  return true;
};

/**
 * Open API key selection dialog (AI Studio integration)
 */
export const selectApiKey = async (): Promise<void> => {
  if (window.aistudio && window.aistudio.openSelectKey) {
    await window.aistudio.openSelectKey();
  }
};

/**
 * Detect text in an image using OCR
 */
export const detectTextInImage = async (base64Image: string): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/gemini/detect-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image }),
    });

    if (!response.ok) {
      throw new Error('Failed to detect text');
    }

    const data = await response.json();
    return data.texts || [];
  } catch (error) {
    console.error('Text detection failed:', error);
    return [];
  }
};

/**
 * Enhance a simple prompt into a detailed AI prompt
 */
export const enhancePrompt = async (originalPrompt: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/gemini/enhance-prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: originalPrompt }),
    });

    if (!response.ok) {
      throw new Error('Failed to enhance prompt');
    }

    const data = await response.json();
    return data.prompt || originalPrompt;
  } catch (error) {
    console.error('Prompt enhancement failed:', error);
    return originalPrompt;
  }
};

/**
 * Analyze a thumbnail for CTR potential
 */
export const analyzeThumbnail = async (base64Image: string): Promise<AnalysisResult> => {
  const response = await fetch(`${API_BASE_URL}/gemini/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to analyze thumbnail');
  }

  return response.json();
};

/**
 * Generate YouTube metadata from a thumbnail
 */
export const generateYoutubeMetadata = async (
  base64Image: string,
  context: string
): Promise<YoutubeMetadataResult> => {
  const response = await fetch(`${API_BASE_URL}/gemini/metadata`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image, context }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to generate metadata');
  }

  return response.json();
};

/**
 * Generate a thumbnail using AI
 */
export const generateThumbnail = async (request: ThumbnailRequest): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/gemini/generate-thumbnail`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to generate thumbnail');
  }

  const data = await response.json();
  return data.imageUrl;
};

/**
 * Generate a video from a thumbnail
 */
export const generateVideoFromThumbnail = async (
  imageBase64: string,
  prompt: string,
  sourceAspectRatio: string
): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/gemini/generate-video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: imageBase64,
      prompt,
      aspectRatio: sourceAspectRatio,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to generate video');
  }

  const data = await response.json();
  return data.videoUrl;
};

// Type declaration for AI Studio integration
declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey?: () => Promise<boolean>;
      openSelectKey?: () => Promise<void>;
    };
  }
}
