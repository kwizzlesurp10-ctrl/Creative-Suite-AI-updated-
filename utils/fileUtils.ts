import type { Part } from '@google/genai';

/**
 * Converts a File object to a Part object for use with Gemini API
 * @param file - The image file to convert
 * @returns Promise resolving to a Part object with base64-encoded image data
 */
export const fileToPart = async (file: File): Promise<Part> => {
    const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (error) => reject(error);
    });
    return {
        inlineData: {
            mimeType: file.type,
            data: base64,
        },
    };
};
