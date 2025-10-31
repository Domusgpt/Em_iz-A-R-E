import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import { Tone, PresentationStyle } from '../types';

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
    const prompt = `
        Based on the following resume text, write a compelling and professional script for a 2-minute audio/video self-introduction.
        The script should be ready to be spoken. Do not include any headers, titles, or formatting like "**Script:**".
        
        The desired tone is: "${tone}".
        The presentation style should be: "${style}".

        Here is the resume:
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
    const ai = getAiClient();
    const [header, data] = base64Image.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';

    const imagePart = {
        inlineData: {
            mimeType,
            data,
        },
    };

    const basePrompt = `From the provided oval-cropped headshot, generate a new image of the person's face. The new image must perfectly match the original's art style, lighting, oval crop, and transparent background. The only change should be the expression. The person should now have [EXPRESSION]. Only return the final image.`;

    // Prompts for a 10-frame South Park-style animation (A-J)
    // Frame A is the original image.
    const expressions = [
        "a closed mouth, but with the head tilted slightly to the left.", // Frame B
        "an open mouth, as if saying 'ah'.", // Frame C
        "an open mouth, as if saying 'oh'.", // Frame D
        "an open mouth, as if saying 'ee'.", // Frame E
        "lips together, as if saying 'm'.", // Frame F
        "a wide open mouth, as if shouting.", // Frame G
        "lips pursed, as if saying 'oo'.", // Frame H
        "showing teeth, as if making an 'f' sound.", // Frame I
        "a tongue sticking out slightly.", // Frame J
    ];

    try {
        const variationPromises = expressions.map(expression => {
            const prompt = basePrompt.replace('[EXPRESSION]', expression);
            return generateSingleVariation(ai, imagePart, prompt);
        });
        
        const generatedVariations = await Promise.all(variationPromises);

        if (generatedVariations.some(img => !img) || generatedVariations.length !== 9) {
            throw new Error("AI failed to return one or more required image variations.");
        }

        return [base64Image, ...generatedVariations];
    } catch (error) {
        console.error("Error generating avatar parts:", error);
        throw new Error("Failed to generate avatar variations. The AI may have had trouble processing the image. Try a different photo.");
    }
};
