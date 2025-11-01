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

    const basePrompt = `You are an expert photo editor. From the provided oval-cropped headshot with a transparent background, generate a new, highly realistic image. The new image must perfectly match the original's oval crop, lighting, and transparent background. Do not change the art style. The ONLY modification should be to the person's expression as described. Only return the final PNG image with no extra text or explanations. The person should now have [EXPRESSION].`;

    const expressions = [
        // Frame B
        "a neutral, closed mouth, but with their entire head tilted slightly to their left (from the viewer's perspective, this is a tilt to the right). The tilt should be subtle, about 2-3 degrees.",
        // Frame C
        "their jaw dropped for an 'ah' sound. The mouth should be a relaxed oval, with visible space between the teeth. The cheeks should be soft.",
        // Frame D
        "their mouth forming a small, round 'o' shape. The lips should be pursed slightly, but not tense. Imagine the start of the word 'oh'.",
        // Frame E
        "their mouth in a wide shape for an 'ee' sound. The corners of the mouth are pulled back slightly, and the lips are parted to show the edges of the teeth.",
        // Frame F
        "their lips pressed together gently for an 'm' sound. The jaw is closed, and there's slight tension at the corners of the mouth.",
        // Frame G
        "their mouth open in a natural, mid-sized oval, as if in the middle of a normal conversation. It's larger than 'ah' but not a full yawn.",
        // Frame H
        "their upper teeth gently resting on the center of their lower lip, as if making an 'f' or 'v' sound. The jaw should be slightly ajar.",
        // Frame I
        "their lips rounded and pushed forward into a tight 'ooh' sound. The cheeks might be slightly hollowed.",
        // Frame J
        "a neutral expression but with the mouth slightly agape, as if taking a brief pause while speaking. The jaw is relaxed and dropped a tiny amount.",
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