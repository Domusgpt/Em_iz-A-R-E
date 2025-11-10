import React, { useRef } from 'react';
import { useContent, useAvatar, useUI } from '../contexts/AppContext';
import { voices, VoiceOption } from '../types';

export const VoiceAvatarPanel: React.FC = () => {
  const { content, setVoice } = useContent();
  const { avatar, setHeadshot } = useAvatar();
  const { ui, setError, getRandomCanadianPhrase } = useUI();
  const [imageForCropper, setImageForCropper] = React.useState<string | null>(null);
  const [videoStreamForCropper, setVideoStreamForCropper] = React.useState<MediaStream | null>(null);
  const [isCropperOpen, setIsCropperOpen] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isGenerating = ui.isLoading.script || ui.isLoading.audio || ui.isLoading.avatar;

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError("Sorry buddy, that's not an image file, eh?");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setImageForCropper(base64);
      setIsCropperOpen(true);
    };
    reader.onerror = () => setError(getRandomCanadianPhrase('apologies') + " Couldn't read that image.");
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCameraClick = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setVideoStreamForCropper(stream);
      setIsCropperOpen(true);
    } catch (err) {
      setError("Sorry friend, couldn't access the camera. Please check permissions, eh?");
    }
  };

  const handleRemoveAvatar = () => {
    setHeadshot(null);
    setError(null);
  };

  const handleCloseCropper = () => {
    setIsCropperOpen(false);
    setImageForCropper(null);
    if (videoStreamForCropper) {
      videoStreamForCropper.getTracks().forEach(track => track.stop());
      setVideoStreamForCropper(null);
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    setHeadshot(croppedImage);
    handleCloseCropper();
  };

  return (
    <div className="space-y-6">
      {/* Voice Selection */}
      <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-[#F5F5DC] mb-4 flex items-center gap-2">
          <span className="text-2xl">🎤</span>
          Voice Selection
        </h2>

        <div className="space-y-2">
          {voices.map((voice) => (
            <button
              key={voice.id}
              onClick={() => setVoice(voice)}
              disabled={isGenerating}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                content.voice.id === voice.id
                  ? 'bg-red-600 border-red-600 text-white'
                  : 'bg-gray-700/50 border-gray-600 text-[#F5F5DC] hover:border-red-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold">{voice.name}</div>
                  <div className="text-sm opacity-80">{voice.description} • {voice.gender === 'male' ? '♂' : '♀'}</div>
                </div>
                {content.voice.id === voice.id && (
                  <div className="text-2xl">✓</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Avatar Setup */}
      <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-[#F5F5DC] mb-4 flex items-center gap-2">
          <span className="text-2xl">🎨</span>
          Your Avatar
        </h2>

        {avatar.croppedHeadshot ? (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={avatar.croppedHeadshot}
                alt="Your avatar"
                className="w-full h-48 object-contain bg-gray-900/50 rounded-lg"
              />
              <button
                onClick={handleRemoveAvatar}
                disabled={isGenerating}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors disabled:opacity-50"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-green-400 text-center">
              ✓ Beauty! Avatar ready to go, eh?
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-400 mb-4">
              Upload a photo to create your personalized South Park-style avatar, buddy!
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isGenerating}
                className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-3xl mb-2">📁</div>
                <div className="text-sm font-medium">Upload Photo</div>
              </button>

              <button
                onClick={handleCameraClick}
                disabled={isGenerating}
                className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-3xl mb-2">📷</div>
                <div className="text-sm font-medium">Use Camera</div>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-300">
                <strong>💡 Tip:</strong> Use a clear, well-lit front-facing photo for best results, friend!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic import for ImageCropper when needed */}
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

// We'll need to import this component
import { ImageCropper } from './ImageCropper';
