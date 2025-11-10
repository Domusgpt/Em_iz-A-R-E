import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import { Tone, PresentationStyle } from '../types/index';

const SCRIPT_MODEL = 'gemini-2.5-pro';
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';
const IMAGE_MODEL = 'gemini-2.5-flash-image';

const getAiClient = () => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateScript = async (
    resumeText: string,
    tone: Tone,
    style: PresentationStyle
): Promise<string> => {
    const ai = getAiClient();

    // Add Canadian personality for the Friendly Canadian tone
    const canadianFlair = tone === "Friendly Canadian (Polite & Warm)"
        ? "\n\nIMPORTANT: Add subtle Canadian personality with phrases like 'eh', occasional polite language, and warm friendly tone. Keep it professional but personable, don't you know!"
        : "";

    const prompt = `
        Based on the following content, write a compelling and professional script for a 2-minute audio/video presentation.
        The script should be ready to be spoken. Do not include any headers, titles, or formatting like "**Script:**".

        The desired tone is: "${tone}".
        The presentation style should be: "${style}".${canadianFlair}

        Here is the content:
        ---
        ${resumeText}
        ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: SCRIPT_MODEL,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating script:", error);
        throw new Error("Failed to generate script. Please check your API key and network connection.");
    }
};

export const generateAudio = async (
    script: string,
    voice: string
): Promise<string> => {
    const ai = getAiClient();
    try {
        const response = await ai.models.generateContent({
            model: TTS_MODEL,
            contents: [{ parts: [{ text: script }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voice },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data received from API.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error generating audio:", error);
        throw new Error("Failed to generate audio.");
    }
};

const generateSingleVariation = async (
    ai: GoogleGenAI,
    imagePart: { inlineData: { mimeType: string; data: string } },
    prompt: string
): Promise<string> => {
    const textPart = { text: prompt };
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: IMAGE_MODEL,
        contents: { parts: [imagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    throw new Error(`AI failed to return a valid image for prompt: "${prompt}"`);
};


export const generateAvatarParts = async (
    base64Image: string
): Promise<string[]> => {
    // NEW ELEGANT APPROACH:
    // We don't need to generate multiple mouth shapes anymore!
    // The AnimatedAvatar component now handles jaw movement programmatically
    // by splitting the image in half and moving the bottom part.
    // This is more authentic to South Park style and much faster!

    // Just return the base image - the animation handles the rest, eh?
    return [base64Image];

    /*
    Future enhancement: We could optionally use AI to:
    - Convert photo to more South Park-like style
    - Add outline/cartoon effect
    - Adjust colors to be more vibrant
    - But for now, the original photo works great, buddy!
    */
};