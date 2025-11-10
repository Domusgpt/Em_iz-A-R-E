import React, { useState, useCallback } from 'react';
import { Tone, PresentationStyle, GenerationState, AvatarParts, voices, VoiceOption } from './types';
import { generateScript, generateAudio, generateAvatarParts } from './services/geminiService';
import { decode, decodeAudioData } from './utils/audioUtils';

import { Header } from './components/Header';
import { ResumeInput } from './components/ResumeInput';
import { OutputDisplay } from './components/OutputDisplay';
import { AvatarSetup } from './components/AvatarSetup';
import { ImageCropper } from './components/ImageCropper';
import { ScriptStudio } from './components/ScriptStudio';
import { VocalVisuals } from './components/VocalVisuals';
import { HolographicBorder } from './components/HolographicBorder';


// Assume window.webkitAudioContext exists for Safari
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

const App: React.FC = () => {
  const [resumeText, setResumeText] = useState('');
  const [script, setScript] = useState('');
  const [tone, setTone] = useState<Tone>(Tone.PROFESSIONAL);
  const [style, setStyle] = useState<PresentationStyle>(PresentationStyle.SUMMARY);
  const [voice, setVoice] = useState<VoiceOption>(voices[0]);
  
  const [imageForCropper, setImageForCropper] = useState<string | null>(null);
  const [videoStreamForCropper, setVideoStreamForCropper] = useState<MediaStream | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [croppedHeadshot, setCroppedHeadshot] = useState<string | null>(null);
  const [avatarParts, setAvatarParts] = useState<AvatarParts | null>(null);

  const [isLoading, setIsLoading] = useState<GenerationState>({ script: false, audio: false, avatar: false });
  const [error, setError] = useState<string | null>(null);

  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);

  const handleScriptGeneration = useCallback(async () => {
    if (!resumeText.trim()) {
      setError("Please paste or upload your resume text before generating a script.");
      return;
    }
    setError(null);
    setIsLoading(prev => ({ ...prev, script: true }));
    try {
      const generated = await generateScript(resumeText, tone, style);
      setScript(generated);
    } catch (err: any) {
      setError(err.message || 'Failed to generate script.');
    } finally {
      setIsLoading(prev => ({ ...prev, script: false }));
    }
  }, [resumeText, tone, style]);

  const handleFinalGeneration = async () => {
    if (!script.trim()) {
      setError("Please generate or write a script before creating the final presentation.");
      return;
    }
    
    setError(null);
    setGeneratedAudioUrl(null);
    setAvatarParts(null);
    setIsLoading({ script: false, audio: true, avatar: !!croppedHeadshot });

    try {
      // Parallelize audio and avatar generation
      const promises = [
          generateAudio(script, voice.id),
          croppedHeadshot ? generateAvatarParts(croppedHeadshot) : Promise.resolve(null)
      ];

      const [base64Audio, generatedAvatarParts] = await Promise.all(promises);
      
      if (generatedAvatarParts) {
        setAvatarParts(generatedAvatarParts as AvatarParts);
      }

      const outputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      const audioBytes = decode(base64Audio as string);
      const audioBuffer = await decodeAudioData(audioBytes, outputAudioContext, 24000, 1);
      
      const wav = audioBufferToWav(audioBuffer);
      const blob = new Blob([wav], { type: 'audio/wav' });
      const newAudioUrl = URL.createObjectURL(blob);

      // Clean up old object URL to prevent memory leaks
      if (generatedAudioUrl) {
          URL.revokeObjectURL(generatedAudioUrl);
      }
      setGeneratedAudioUrl(newAudioUrl);

    } catch (err: any) {
      setError(err.message || 'An unknown error occurred during final generation.');
    } finally {
      setIsLoading({ script: false, audio: false, avatar: false });
    }
  };
  
  const handleResumeFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (e) => setResumeText(e.target?.result as string);
        reader.onerror = () => setError("Failed to read the file.");
        reader.readAsText(file);
      } else {
        setError("Please upload a .txt file.");
      }
    }
    event.target.value = '';
  };

  const handleCameraSelected = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setVideoStreamForCropper(stream);
        setIsCropperOpen(true);
    } catch (err) {
        setError("Could not access the camera. Please check your browser permissions.");
    }
  };

  const handleImageSelected = (base64: string) => {
      setImageForCropper(base64);
      setIsCropperOpen(true);
  };

  const handleCropComplete = (croppedImage: string) => {
      setCroppedHeadshot(croppedImage);
      handleCloseCropper();
  };

  const handleCloseCropper = () => {
      setIsCropperOpen(false);
      setImageForCropper(null);
      if (videoStreamForCropper) {
          videoStreamForCropper.getTracks().forEach(track => track.stop());
          setVideoStreamForCropper(null);
      }
  };
  
  const handleRemoveHeadshot = () => {
      setCroppedHeadshot(null);
  };

  const isGenerating = isLoading.script || isLoading.audio;

  return (
    <HolographicBorder>
      <div className="min-h-screen bg-transparent text-[#F5F5DC] flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            
            {/* LEFT PANEL: CONTROLS */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <ResumeInput 
                resumeText={resumeText} 
                setResumeText={setResumeText} 
                handleFileChange={handleResumeFileChange}
                disabled={isGenerating} 
              />
              <ScriptStudio
                script={script}
                setScript={setScript}
                tone={tone}
                setTone={setTone}
                style={style}
                setStyle={setStyle}
                onGenerateScript={handleScriptGeneration}
                isLoading={isLoading.script}
                disabled={isGenerating}
              />
              <VocalVisuals
                selectedVoice={voice}
                onVoiceChange={setVoice}
                disabled={isGenerating}
              >
                  <AvatarSetup 
                    croppedHeadshot={croppedHeadshot}
                    onImageSelected={handleImageSelected}
                    onCameraSelected={handleCameraSelected}
                    onRemoveImage={handleRemoveHeadshot}
                    disabled={isGenerating}
                    setError={setError}
                  />
              </VocalVisuals>
              <div className="mt-auto">
                  <button
                      onClick={handleFinalGeneration}
                      disabled={isGenerating || !script}
                      className="w-full bg-red-800 text-white font-bold py-4 px-4 rounded-lg hover:bg-red-700 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center text-lg"
                      >
                      {isLoading.audio || isLoading.avatar ? (
                          <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating Presentation...
                          </>
                      ) : (
                          "Generate Resu-M is R-E"
                      )}
                  </button>
              </div>
            </div>
            
            {/* RIGHT PANEL: OUTPUT */}
            <div className="lg:col-span-2 min-h-[600px] xl:min-h-0">
              <OutputDisplay 
                isLoading={isLoading}
                audioUrl={generatedAudioUrl}
                avatarParts={avatarParts}
                error={error}
              />
            </div>
          </div>
        </main>
        {isCropperOpen && (
            <ImageCropper
                imageSrc={imageForCropper}
                videoStream={videoStreamForCropper}
                onCropComplete={handleCropComplete}
                onClose={handleCloseCropper}
            />
        )}
      </div>
    </HolographicBorder>
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