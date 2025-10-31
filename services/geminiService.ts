
import { GoogleGenAI, Modality } from "@google/genai";
import { Tone, PresentationStyle } from '../types';

const SCRIPT_MODEL = 'gemini-2.5-pro';
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';
const VIDEO_MODEL = 'veo-3.1-fast-generate-preview';

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

export const generateVideo = async (): Promise<string> => {
    // Re-instantiate the client to ensure the latest key is used.
    const ai = getAiClient();
    const prompt = "An abstract, professional, and elegant motion graphics background. Use a corporate color palette of dark slate blue, charcoal gray, and a touch of metallic gold. The animation should be subtle, slow-moving, and not distracting, suitable for a professional presentation. High-quality 1080p cinematic rendering.";

    try {
        let operation = await ai.models.generateVideos({
            model: VIDEO_MODEL,
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                resolution: '1080p',
                aspectRatio: '16:9'
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("Video generation completed but no download link was found.");
        }
        
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!response.ok) {
            throw new Error(`Failed to download video file: ${response.statusText}`);
        }
        const videoBlob = await response.blob();
        return URL.createObjectURL(videoBlob);

    } catch (error) {
        console.error("Error generating video:", error);
        if (error instanceof Error && error.message.includes("Requested entity was not found")) {
            throw new Error("Video generation failed. Your API key might be invalid or missing permissions. Please select a valid key.");
        }
        throw new Error("Failed to generate video.");
    }
};
