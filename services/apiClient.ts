/**
 * API Client for communicating with the backend proxy
 * This service replaces direct Gemini API calls with calls to our secure backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function apiCall<T>(endpoint: string, body: object): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API call failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Detect text in an image using OCR
 */
export async function detectTextInImage(image: string): Promise<string[]> {
  try {
    const result = await apiCall<string[]>('/detect-text', { image });
    return result;
  } catch (error) {
    console.error('Text detection failed:', error);
    return [];
  }
}

/**
 * Enhance a prompt using AI
 */
export async function enhancePrompt(prompt: string): Promise<string> {
  try {
    const result = await apiCall<{ enhancedPrompt: string }>('/enhance-prompt', { prompt });
    return result.enhancedPrompt;
  } catch (error) {
    console.error('Prompt enhancement failed:', error);
    return prompt;
  }
}

/**
 * Analyze a thumbnail for CTR potential
 */
export interface AnalysisResult {
  score: number;
  critique: string;
  strengths: string[];
  improvements: string[];
}

export async function analyzeThumbnail(image: string): Promise<AnalysisResult> {
  const result = await apiCall<AnalysisResult>('/analyze', { image });
  return result;
}

/**
 * Generate YouTube metadata (titles, description, tags)
 */
export interface YoutubeMetadataResult {
  titles: string[];
  description: string;
  tags: string[];
  keywords: string[];
}

export async function generateYoutubeMetadata(
  image: string,
  context: string
): Promise<YoutubeMetadataResult> {
  const result = await apiCall<YoutubeMetadataResult>('/metadata', { image, context });
  return result;
}

/**
 * Generate a thumbnail by combining inspiration and user images
 */
export interface ThumbnailRequest {
  inspirationImage: string;
  userImage: string;
  prompt?: string;
  textReplacement?: string;
  textStyle?: {
    font: string;
    color: string;
    effect: string;
  };
  aspectRatio?: string;
  quality?: 'standard' | 'high' | 'ultra';
}

export async function generateThumbnail(request: ThumbnailRequest): Promise<string> {
  const result = await apiCall<{ imageUrl: string }>('/generate', request);
  return result.imageUrl;
}

/**
 * Generate a video from a thumbnail
 */
export async function generateVideoFromThumbnail(
  image: string,
  prompt: string,
  aspectRatio: string
): Promise<string> {
  const result = await apiCall<{ videoUrl: string }>('/generate-video', {
    image,
    prompt,
    aspectRatio,
  });
  return result.videoUrl;
}

/**
 * Check API health status
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
