import React, { useState } from 'react';
import { useApp, useUI } from '../contexts/AppContext';

export const Onboarding: React.FC = () => {
  const [step, setStep] = useState(0);
  const { completeOnboarding } = useApp();
  const { hideOnboarding, showModeSelector } = useUI();

  const steps = [
    {
      title: "Welcome to TalkingHead Pro! 🎉",
      description: "Hey there, buddy! Ready to create amazing animated presentations?",
      content: (
        <div className="space-y-4">
          <p className="text-lg">TalkingHead Pro brings your content to life with:</p>
          <ul className="space-y-2 ml-6">
            <li className="flex items-start">
              <span className="text-2xl mr-3">🎭</span>
              <span>Canadian South Park-style animations with personality</span>
            </li>
            <li className="flex items-start">
              <span className="text-2xl mr-3">🎤</span>
              <span>Professional text-to-speech with multiple voices</span>
            </li>
            <li className="flex items-start">
              <span className="text-2xl mr-3">📄</span>
              <span>Multiple modes: Resumes, Documents, and Quick Intros</span>
            </li>
            <li className="flex items-start">
              <span className="text-2xl mr-3">🎨</span>
              <span>Custom avatars from your photos</span>
            </li>
          </ul>
        </div>
      )
    },
    {
      title: "Choose Your Mode 🎯",
      description: "Pick the perfect mode for what you need, eh?",
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="text-2xl mb-2">📄 Professional Resume</div>
            <p className="text-sm text-gray-300">Transform your resume into an engaging video introduction</p>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="text-2xl mb-2">📝 Document Presenter</div>
            <p className="text-sm text-gray-300">Turn any document into an animated presentation</p>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="text-2xl mb-2">👋 Quick Introduction</div>
            <p className="text-sm text-gray-300">Create fast, professional self-introductions</p>
          </div>
        </div>
      )
    },
    {
      title: "The Magic Process ✨",
      description: "Here's how easy it is, don't you know!",
      content: (
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">1</div>
            <div>
              <h4 className="font-bold">Input Your Content</h4>
              <p className="text-sm text-gray-300">Paste your text or upload a document</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">2</div>
            <div>
              <h4 className="font-bold">Generate AI Script</h4>
              <p className="text-sm text-gray-300">Let AI create a professional script (or write your own!)</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">3</div>
            <div>
              <h4 className="font-bold">Customize Avatar</h4>
              <p className="text-sm text-gray-300">Upload a photo to create your personalized avatar</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">4</div>
            <div>
              <h4 className="font-bold">Generate & Export</h4>
              <p className="text-sm text-gray-300">Watch your animated presentation come to life!</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "You're All Set, Buddy! 🚀",
      description: "Beauty! Let's get started, eh?",
      content: (
        <div className="space-y-4 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-lg">
            You're ready to create amazing animated presentations!
          </p>
          <p className="text-gray-300">
            Don't worry if you get stuck - we've got helpful tips throughout the app.
          </p>
          <div className="mt-6 p-4 bg-blue-900/30 border border-blue-500/50 rounded-lg">
            <p className="text-sm">
              <strong>Pro Tip:</strong> For best results, use clear, well-lit photos for your avatar,
              and keep your content focused and engaging, eh?
            </p>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      completeOnboarding();
      hideOnboarding();
      showModeSelector();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    hideOnboarding();
    showModeSelector();
  };

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-red-600/30">
        <div className="p-8">
          {/* Progress indicator */}
          <div className="flex justify-center space-x-2 mb-8">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === step ? 'w-8 bg-red-600' : 'w-2 bg-gray-600'
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2 text-[#F5F5DC]">{currentStep.title}</h2>
            <p className="text-xl text-gray-400 mb-6">{currentStep.description}</p>
            <div className="text-[#F5F5DC]">{currentStep.content}</div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Skip Tutorial
            </button>
            <div className="flex space-x-3">
              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-bold"
              >
                {step === steps.length - 1 ? "Let's Go!" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
