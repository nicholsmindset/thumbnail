import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Create mock functions that we can control per-test
const mockGenerateContent = vi.fn();
const mockGenerateVideos = vi.fn();
const mockGetVideosOperation = vi.fn();

// Mock the @google/genai module at the top level
vi.mock('@google/genai', () => ({
  GoogleGenAI: class MockGoogleGenAI {
    models = {
      generateContent: mockGenerateContent,
      generateVideos: mockGenerateVideos,
    };
    operations = {
      getVideosOperation: mockGetVideosOperation,
    };
  },
}));

// Import after mocking
import {
  checkApiKey,
  selectApiKey,
  detectTextInImage,
  enhancePrompt,
  analyzeThumbnail,
  generateYoutubeMetadata,
  generateThumbnail,
  generateVideoFromThumbnail,
} from './geminiService';

// Sample base64 image data
const sampleBase64DataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
const sampleRawBase64 = '/9j/4AAQSkZJRg==';

describe('geminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.aistudio
    (global as Record<string, unknown>).window = {
      aistudio: {
        hasSelectedApiKey: vi.fn(),
        openSelectKey: vi.fn(),
      },
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('checkApiKey', () => {
    it('should return true when aistudio.hasSelectedApiKey returns true', async () => {
      (window.aistudio.hasSelectedApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const result = await checkApiKey();

      expect(result).toBe(true);
      expect(window.aistudio.hasSelectedApiKey).toHaveBeenCalled();
    });

    it('should return false when aistudio.hasSelectedApiKey returns false', async () => {
      (window.aistudio.hasSelectedApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      const result = await checkApiKey();

      expect(result).toBe(false);
    });

    it('should return true when aistudio object is not available', async () => {
      (global as Record<string, unknown>).window = {};

      const result = await checkApiKey();

      expect(result).toBe(true);
    });
  });

  describe('selectApiKey', () => {
    it('should call aistudio.openSelectKey when available', async () => {
      (window.aistudio.openSelectKey as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await selectApiKey();

      expect(window.aistudio.openSelectKey).toHaveBeenCalled();
    });

    it('should not throw when aistudio is not available', async () => {
      (global as Record<string, unknown>).window = {};

      await expect(selectApiKey()).resolves.toBeUndefined();
    });
  });

  describe('detectTextInImage', () => {
    it('should parse JSON response correctly', async () => {
      mockGenerateContent.mockResolvedValue({
        text: '["HOW TO", "GROW", "FAST"]',
      });

      const result = await detectTextInImage(sampleBase64DataUrl);

      expect(result).toEqual(['HOW TO', 'GROW', 'FAST']);
    });

    it('should handle response with markdown code blocks', async () => {
      mockGenerateContent.mockResolvedValue({
        text: '```json\n["TEXT", "HERE"]\n```',
      });

      const result = await detectTextInImage(sampleBase64DataUrl);

      expect(result).toEqual(['TEXT', 'HERE']);
    });

    it('should return empty array on error', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API Error'));

      const result = await detectTextInImage(sampleBase64DataUrl);

      expect(result).toEqual([]);
    });

    it('should handle raw base64 without data URL prefix', async () => {
      mockGenerateContent.mockResolvedValue({
        text: '["TEXT"]',
      });

      const result = await detectTextInImage(sampleRawBase64);

      expect(result).toEqual(['TEXT']);
    });
  });

  describe('enhancePrompt', () => {
    it('should return enhanced prompt', async () => {
      mockGenerateContent.mockResolvedValue({
        text: 'Cinematic portrait with soft rim lighting, 85mm lens at f/1.8',
      });

      const result = await enhancePrompt('make it look cool');

      expect(result).toBe('Cinematic portrait with soft rim lighting, 85mm lens at f/1.8');
    });

    it('should return original prompt on error', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API Error'));

      const result = await enhancePrompt('original prompt');

      expect(result).toBe('original prompt');
    });
  });

  describe('analyzeThumbnail', () => {
    it('should return analysis result', async () => {
      const mockAnalysis = {
        score: 85,
        critique: 'Great thumbnail with high CTR potential',
        strengths: ['Good contrast', 'Clear text'],
        improvements: ['Add more emotion', 'Increase saturation'],
      };

      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify(mockAnalysis),
      });

      const result = await analyzeThumbnail(sampleBase64DataUrl);

      expect(result).toEqual(mockAnalysis);
    });

    it('should throw error on API failure', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API Error'));

      await expect(analyzeThumbnail(sampleBase64DataUrl)).rejects.toThrow(
        'Failed to analyze thumbnail.'
      );
    });
  });

  describe('generateYoutubeMetadata', () => {
    it('should return metadata result', async () => {
      const mockMetadata = {
        titles: ['Title 1', 'Title 2', 'Title 3', 'Title 4', 'Title 5'],
        description: 'This is a test description',
        tags: ['tag1', 'tag2'],
        keywords: ['keyword1', 'keyword2'],
      };

      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify(mockMetadata),
      });

      const result = await generateYoutubeMetadata(sampleBase64DataUrl, 'test context');

      expect(result).toEqual(mockMetadata);
    });

    it('should throw error on API failure', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API Error'));

      await expect(generateYoutubeMetadata(sampleBase64DataUrl, 'test')).rejects.toThrow(
        'Failed to generate metadata.'
      );
    });
  });

  describe('generateThumbnail', () => {
    const mockRequest = {
      inspirationImage: sampleBase64DataUrl,
      userImage: sampleBase64DataUrl,
      prompt: 'Test prompt',
      aspectRatio: '16:9',
      quality: 'standard' as const,
    };

    it('should return generated image as data URL', async () => {
      mockGenerateContent.mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    data: 'generatedImageBase64Data',
                  },
                },
              ],
            },
          },
        ],
      });

      const result = await generateThumbnail(mockRequest);

      expect(result).toBe('data:image/png;base64,generatedImageBase64Data');
    });

    it('should throw error when no image is generated', async () => {
      mockGenerateContent.mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [],
            },
          },
        ],
      });

      await expect(generateThumbnail(mockRequest)).rejects.toThrow('No image generated.');
    });

    it('should include text replacement instructions when provided', async () => {
      const requestWithText = {
        ...mockRequest,
        textReplacement: 'NEW TEXT',
        textStyle: {
          font: 'Bold Impact',
          color: '#FF0000',
          effect: 'Glow',
        },
      };

      mockGenerateContent.mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    data: 'imageData',
                  },
                },
              ],
            },
          },
        ],
      });

      await generateThumbnail(requestWithText);

      // Verify the prompt includes text replacement instructions
      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.contents.parts[0].text).toContain('NEW TEXT');
      expect(callArgs.contents.parts[0].text).toContain('Bold Impact');
    });
  });

  describe('generateVideoFromThumbnail', () => {
    it('should poll until video is ready and return blob URL', async () => {
      vi.useFakeTimers();

      const mockOperation = {
        done: false,
      };

      const mockCompletedOperation = {
        done: true,
        response: {
          generatedVideos: [
            {
              video: {
                uri: 'https://example.com/video.mp4',
              },
            },
          ],
        },
      };

      const mockBlob = new Blob(['video data'], { type: 'video/mp4' });

      global.fetch = vi.fn().mockResolvedValue({
        blob: () => Promise.resolve(mockBlob),
      });

      global.URL.createObjectURL = vi.fn().mockReturnValue('blob:video-url');

      mockGenerateVideos.mockResolvedValue(mockOperation);
      mockGetVideosOperation.mockResolvedValue(mockCompletedOperation);

      const resultPromise = generateVideoFromThumbnail(
        sampleBase64DataUrl,
        'test prompt',
        '16:9'
      );

      // Advance timers to skip the polling delay
      await vi.advanceTimersByTimeAsync(5000);

      const result = await resultPromise;

      expect(result).toBe('blob:video-url');
      expect(mockGetVideosOperation).toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('should throw error when no video URI is returned', async () => {
      const mockCompletedOperation = {
        done: true,
        response: {
          generatedVideos: [],
        },
      };

      mockGenerateVideos.mockResolvedValue(mockCompletedOperation);

      await expect(generateVideoFromThumbnail(sampleBase64DataUrl, 'test', '16:9')).rejects.toThrow(
        'Video generation failed: No URI returned.'
      );
    });

    it('should use 9:16 aspect ratio for vertical videos', async () => {
      const mockOperation = {
        done: true,
        response: {
          generatedVideos: [
            {
              video: {
                uri: 'https://example.com/video.mp4',
              },
            },
          ],
        },
      };

      const mockBlob = new Blob(['video data'], { type: 'video/mp4' });

      global.fetch = vi.fn().mockResolvedValue({
        blob: () => Promise.resolve(mockBlob),
      });

      global.URL.createObjectURL = vi.fn().mockReturnValue('blob:video-url');

      mockGenerateVideos.mockResolvedValue(mockOperation);

      await generateVideoFromThumbnail(sampleBase64DataUrl, 'test prompt', '9:16');

      expect(mockGenerateVideos).toHaveBeenCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({
            aspectRatio: '9:16',
          }),
        })
      );
    });
  });
});
