
import React, { useState } from 'react';
import { Tone, PresentationStyle, GenerationState, AvatarParts } from './types';
import { generateScript, generateAudio, generateAvatarParts } from './services/geminiService';
import { decode, decodeAudioData } from './utils/audioUtils';

import { Header } from './components/Header';
import { ResumeInput } from './components/ResumeInput';
import { Controls } from './components/Controls';
import { OutputDisplay } from './components/OutputDisplay';
import { AvatarSetup } from './components/AvatarSetup';
import { ImageCropper } from './components/ImageCropper';

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
  
  const [imageForCropper, setImageForCropper] = useState<string | null>(null);
  const [videoStreamForCropper, setVideoStreamForCropper] = useState<MediaStream | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [croppedHeadshot, setCroppedHeadshot] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<GenerationState>({ script: false, audio: false, avatar: false });
  const [error, setError] = useState<string | null>(null);

  const [generatedScript, setGeneratedScript] = useState('');
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [avatarParts, setAvatarParts] = useState<AvatarParts | null>(null);

  const handleGeneration = async () => {
    if (!resumeText.trim()) {
      setError("Please paste or upload your resume text before generating.");
      return;
    }
    
    setError(null);
    setGeneratedScript('');
    setGeneratedAudioUrl(null);
    setAvatarParts(null);
    setIsLoading({ script: true, audio: false, avatar: false });

    try {
      const script = await generateScript(resumeText, tone, style);
      setGeneratedScript(script);
      setIsLoading({ script: false, audio: true, avatar: !!croppedHeadshot });

      const audioPromise = generateAudio(script, voice);
      const avatarPromise = croppedHeadshot ? generateAvatarParts(croppedHeadshot) : Promise.resolve(null);
      
      const [base64Audio, avatarResult] = await Promise.all([audioPromise, avatarPromise]);

      const outputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      const audioBytes = decode(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, outputAudioContext, 24000, 1);
      
      const wav = audioBufferToWav(audioBuffer);
      const blob = new Blob([wav], { type: 'audio/wav' });
      setGeneratedAudioUrl(URL.createObjectURL(blob));

      if (avatarResult) {
        setAvatarParts(avatarResult);
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
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
      setAvatarParts(null);
  };

  const isGenerating = isLoading.script || isLoading.audio || isLoading.avatar;

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#F5F5DC] flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full">
          <div className="flex flex-col gap-6">
            <div className="flex-grow" style={{minHeight: '300px'}}>
              <ResumeInput 
                resumeText={resumeText} 
                setResumeText={setResumeText} 
                handleFileChange={handleResumeFileChange}
                disabled={isGenerating} 
              />
            </div>
             <AvatarSetup 
                croppedHeadshot={croppedHeadshot}
                onImageSelected={handleImageSelected}
                onCameraSelected={handleCameraSelected}
                onRemoveImage={handleRemoveHeadshot}
                disabled={isGenerating}
                setError={setError}
              />
            <div>
              <Controls 
                tone={tone} setTone={setTone}
                style={style} setStyle={setStyle}
                voice={voice} setVoice={setVoice}
                onGenerate={handleGeneration}
                isLoading={isLoading}
              />
            </div>
          </div>
          <div className="min-h-[600px] xl:min-h-0">
            <OutputDisplay 
              isLoading={isLoading}
              script={generatedScript}
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