import { GoogleGenAI, Type, Part } from "@google/genai";
import { Story } from '../types';

// This function should not be called directly. It's used by other functions.
// A new instance is created before each API call to use the most up-to-date API key.
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Text Generation ---
export const generateStories = async (prompt: string): Promise<Story[]> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: `Based on the phrase "${prompt}", generate three distinct, short stories. Each story should have a title.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: 'The title of the story.',
            },
            text: {
              type: Type.STRING,
              description: 'The content of the story.',
            },
          },
          required: ['title', 'text'],
        },
      },
    },
  });
  
  const jsonText = response.text.trim();
  return JSON.parse(jsonText);
};

export const generateVideoPrompt = async (story: string, bpm: number): Promise<string> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Convert the following story into a single, concise paragraph that is a visually descriptive prompt for a video generation AI. The prompt should evoke the mood and key scenes of the story. The video should have a rhythm and pacing equivalent to a music video with ${bpm} BPM. Focus on visual elements, camera movements, and atmosphere. Story: "${story}"`,
  });
  return response.text;
};

export const generateExtensionPrompts = async (context: string): Promise<string[]> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Based on the following video description, generate three distinct and concise prompts for a 7-second extension of the video. The prompts should describe what happens next. Return only a JSON array of three strings. Description: "${context}"`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.STRING,
                },
            },
        },
    });
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};


// --- Image Generation ---
export const generateImage = async (prompt: string): Promise<string> => {
  const ai = getAiClient();
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio: '1:1',
    },
  });

  if (response.generatedImages && response.generatedImages.length > 0) {
    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  }
  throw new Error("No image was generated.");
};


// --- Image Understanding ---
export const analyzeImage = async (prompt: string, imagePart: Part): Promise<string> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: prompt }] },
    });
    return response.text;
};


// --- Video Generation ---
interface GenerateVideoOptions {
    prompt: string;
    aspectRatio: '16:9' | '9:16';
    imagePart?: Part | null;
    videoToExtend?: any;
}

export const generateVideo = async (options: GenerateVideoOptions) => {
    const { prompt, aspectRatio, imagePart, videoToExtend } = options;
    const ai = getAiClient();

    if (videoToExtend) {
        // Handle video extension
        const payload = {
            model: 'veo-3.1-generate-preview',
            prompt,
            video: videoToExtend,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio,
            },
        };
        return await ai.models.generateVideos(payload);
    }
    
    // Handle initial video generation
    const config = {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio,
    };
    
    const model = 'veo-3.1-fast-generate-preview';
    
    const imagePayload = imagePart?.inlineData 
        ? { imageBytes: imagePart.inlineData.data, mimeType: imagePart.inlineData.mimeType }
        : undefined;

    const payload = imagePayload
        ? { model, prompt, image: imagePayload, config }
        : { model, prompt, config };

    return await ai.models.generateVideos(payload);
};


export const pollVideoOperation = async (operation: any) => {
    const ai = getAiClient();
    return await ai.operations.getVideosOperation({ operation });
};