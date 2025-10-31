
import React, { useState, useCallback } from 'react';
import { Tone, PresentationStyle, GenerationState } from './types';
import { generateScript, generateAudio, generateVideo } from './services/geminiService';
import { decode, decodeAudioData } from './utils/audioUtils';

import { Header } from './components/Header';
import { ResumeInput } from './components/ResumeInput';
import { Controls } from './components/Controls';
import { OutputDisplay } from './components/OutputDisplay';
import { ApiKeySelector } from './components/ApiKeySelector';

// Assume window.webkitAudioContext exists for Safari
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

const App: React.FC = () => {
  const [resumeText, setResumeText] = useState('');
  const [tone, setTone] = useState<Tone>(Tone.PROFESSIONAL);
  const [style, setStyle] = useState<PresentationStyle>(PresentationStyle.SUMMARY);
  const [voice, setVoice] = useState('Zephyr');
  const [generateVideoOption, setGenerateVideoOption] = useState(false);

  const [isLoading, setIsLoading] = useState<GenerationState>({ script: false, audio: false, video: false });
  const [error, setError] = useState<string | null>(null);

  const [generatedScript, setGeneratedScript] = useState('');
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  
  const [isApiKeyReady, setIsApiKeyReady] = useState(false);

  const handleGeneration = async () => {
    if (!resumeText.trim()) {
      setError("Please paste or upload your resume text before generating.");
      return;
    }
    
    if(generateVideoOption && !isApiKeyReady){
      setError("Please select an API Key to enable video generation.");
      return;
    }

    // Reset state
    setError(null);
    setGeneratedScript('');
    setGeneratedAudioUrl(null);
    setGeneratedVideoUrl(null);
    setIsLoading({ script: true, audio: false, video: false });

    try {
      // Step 1: Generate Script
      const script = await generateScript(resumeText, tone, style);
      setGeneratedScript(script);
      setIsLoading({ script: false, audio: true, video: generateVideoOption });

      // Step 2: Generate Audio and (optionally) Video in parallel
      const generationPromises = [];

      // Audio promise
      generationPromises.push(
        (async () => {
          try {
            const base64Audio = await generateAudio(script, voice);
            const outputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
            const audioBytes = decode(base64Audio);
            const audioBuffer = await decodeAudioData(audioBytes, outputAudioContext, 24000, 1);
            
            const wav = audioBufferToWav(audioBuffer);
            const blob = new Blob([wav], { type: 'audio/wav' });
            setGeneratedAudioUrl(URL.createObjectURL(blob));
          } finally {
            setIsLoading(prev => ({ ...prev, audio: false }));
          }
        })()
      );

      // Video promise (optional)
      if (generateVideoOption) {
        generationPromises.push(
          (async () => {
            try {
              const videoUrl = await generateVideo();
              setGeneratedVideoUrl(videoUrl);
            } catch(videoError: any) {
              if (videoError?.message?.includes("Your API key might be invalid")) {
                  setIsApiKeyReady(false);
              }
              throw videoError;
            } finally {
              setIsLoading(prev => ({ ...prev, video: false }));
            }
          })()
        );
      }

      await Promise.all(generationPromises);

    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      setIsLoading({ script: false, audio: false, video: false });
    }
  };
  
  const handleKeySelected = useCallback(() => {
    setIsApiKeyReady(true);
    // If user selects key, re-trigger generation if they were blocked by it.
    if(error?.includes("Please select an API Key")){
      setError(null);
      handleGeneration();
    }
  }, [error]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setResumeText(text);
        };
        reader.onerror = () => {
          setError("Failed to read the file.");
        }
        reader.readAsText(file);
      } else {
        setError("Please upload a .txt file.");
      }
    }
    // Reset file input to allow uploading the same file again
    event.target.value = '';
  };

  const isGenerating = isLoading.script || isLoading.audio || isLoading.video;
  const shouldShowApiKeySelector = generateVideoOption && !isApiKeyReady;

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#F5F5DC] flex flex-col">
      {shouldShowApiKeySelector && <ApiKeySelector onKeySelected={handleKeySelected} />}
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full">
          {/* Left Column */}
          <div className="flex flex-col gap-6">
            <div className="flex-grow" style={{minHeight: '400px'}}>
              <ResumeInput 
                resumeText={resumeText} 
                setResumeText={setResumeText} 
                handleFileChange={handleFileChange}
                disabled={isGenerating} 
              />
            </div>
            <div>
              <Controls 
                tone={tone} setTone={setTone}
                style={style} setStyle={setStyle}
                voice={voice} setVoice={setVoice}
                generateVideo={generateVideoOption} setGenerateVideo={setGenerateVideoOption}
                onGenerate={handleGeneration}
                isLoading={isLoading}
              />
            </div>
          </div>
          {/* Right Column */}
          <div className="min-h-[600px] xl:min-h-0">
            <OutputDisplay 
              isLoading={isLoading}
              script={generatedScript}
              audioUrl={generatedAudioUrl}
              videoUrl={generatedVideoUrl}
              error={error}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

// Helper to convert AudioBuffer to a WAV Blob
function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const bufferOut = new ArrayBuffer(length);
  const view = new DataView(bufferOut);
  const channels = [];
  let i = 0;
  let sample = 0;
  let offset = 0;
  let pos = 0;

  // write WAVE header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  for (i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < length) {
    for (i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return bufferOut;

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
}

export default App;
