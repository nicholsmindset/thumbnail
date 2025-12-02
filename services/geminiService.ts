
import { GoogleGenAI } from "@google/genai";
import { ThumbnailRequest, QualityLevel, AnalysisResult, YoutubeMetadataResult } from "../types";

// Helper to remove data URL prefix if present for the API call
const cleanBase64 = (dataUrl: string) => {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    return {
      mimeType: matches[1],
      data: matches[2]
    };
  }
  // Fallback if raw base64 is passed
  return {
    mimeType: 'image/jpeg',
    data: dataUrl
  };
};

export const checkApiKey = async (): Promise<boolean> => {
  if (window.aistudio && window.aistudio.hasSelectedApiKey) {
    return await window.aistudio.hasSelectedApiKey();
  }
  return true; // Fallback for environments where aistudio object might not be present (dev) but process.env is
};

export const selectApiKey = async (): Promise<void> => {
  if (window.aistudio && window.aistudio.openSelectKey) {
    await window.aistudio.openSelectKey();
  }
};

export const detectTextInImage = async (base64Image: string): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const image = cleanBase64(base64Image);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            text: `Analyze this image and extract all visible text strings. 
                   Return ONLY a JSON array of strings. 
                   Example: ["HOW TO", "GROW", "FAST"].
                   If no text is found, return [].`
          },
          {
            inlineData: {
              mimeType: image.mimeType,
              data: image.data,
            }
          }
        ]
      },
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || "[]";
    // Basic cleanup to ensure we parse JSON correctly if the model adds markdown ticks
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Text detection failed:", error);
    return [];
  }
};

export const enhancePrompt = async (originalPrompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert Prompt Engineer for AI Image Generators.
      Rewrite the following simple user request into a highly detailed, descriptive prompt suitable for a high-end photorealistic model.
      
      User Request: "${originalPrompt}"
      
      Instructions:
      - Add details about lighting (e.g., cinematic, rim lighting, softbox).
      - Add details about camera (e.g., 85mm lens, f/1.8, 4k).
      - Add details about expression and mood.
      - Keep it under 40 words.
      - Output ONLY the rewritten prompt string. No quotes.`,
    });

    return response.text?.trim() || originalPrompt;
  } catch (error) {
    console.error("Prompt enhancement failed:", error);
    return originalPrompt;
  }
};

export const analyzeThumbnail = async (base64Image: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const image = cleanBase64(base64Image);

  try {
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
            }`
          },
          {
            inlineData: {
              mimeType: image.mimeType,
              data: image.data,
            }
          }
        ]
      },
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || "{}";
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr) as AnalysisResult;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw new Error("Failed to analyze thumbnail.");
  }
};

export const generateYoutubeMetadata = async (base64Image: string, context: string): Promise<YoutubeMetadataResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const image = cleanBase64(base64Image);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            text: `You are a world-class YouTube Strategist (inspired by MrBeast, Paddy Galloway, and Veritasium).
            
            TASK:
            Based on the attached thumbnail visual and the context: "${context}", generate high-CTR metadata.

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
            }`
          },
          {
            inlineData: {
              mimeType: image.mimeType,
              data: image.data,
            }
          }
        ]
      },
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || "{}";
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr) as YoutubeMetadataResult;
  } catch (error) {
    console.error("Metadata generation failed:", error);
    throw new Error("Failed to generate metadata.");
  }
};

export const generateThumbnail = async (request: ThumbnailRequest): Promise<string> => {
  // Always create a new instance to ensure the latest key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const inspiration = cleanBase64(request.inspirationImage);
  const user = cleanBase64(request.userImage);

  let textStyleInstruction = "";
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

  // Advanced Prompting for Identity Preservation
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
    - Context/Override: ${request.prompt || "Perfectly match the style and energy of the original thumbnail."}

    Output ONLY the final image.
  `;

  // Map quality to imageSize
  const imageSizeMap: Record<QualityLevel, string> = {
    'standard': '1K',
    'high': '2K',
    'ultra': '4K'
  };

  const imageSize = imageSizeMap[request.quality || 'standard'];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            text: promptText,
          },
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
          aspectRatio: request.aspectRatio || "16:9",
          imageSize: imageSize,
        },
      },
    });

    // Extract image from response
    if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
    }
    
    throw new Error("No image generated.");

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};

export const generateVideoFromThumbnail = async (imageBase64: string, prompt: string, sourceAspectRatio: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const image = cleanBase64(imageBase64);
  
  let videoAspectRatio = '16:9';
  if (sourceAspectRatio === '9:16') {
      videoAspectRatio = '9:16';
  }
  
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt || "Cinematic movement, high quality, 4k",
      image: {
        imageBytes: image.data,
        mimeType: image.mimeType,
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: videoAspectRatio
      }
    });

    // Polling loop
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed: No URI returned.");

    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);

  } catch (error) {
    console.error("Video Generation Error:", error);
    throw error;
  }
};
