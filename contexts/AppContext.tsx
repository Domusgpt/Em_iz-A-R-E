import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import {
  AppMode,
  AppSettings,
  ContentState,
  AvatarState,
  UIState,
  Tone,
  PresentationStyle,
  VoiceOption,
  voices,
  modeConfigs,
  CANADIAN_PHRASES,
  GenerationState,
  AvatarParts
} from '../types';

// App Context
interface AppContextType {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setMode: (mode: AppMode) => void;
  completeOnboarding: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('talkinghead-settings');
    return saved ? JSON.parse(saved) : {
      mode: AppMode.RESUME,
      hasCompletedOnboarding: false,
      preferredVoice: voices[0].id,
      autoPlay: true,
      showTutorials: true
    };
  });

  useEffect(() => {
    localStorage.setItem('talkinghead-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const setMode = useCallback((mode: AppMode) => {
    updateSettings({ mode });
  }, [updateSettings]);

  const completeOnboarding = useCallback(() => {
    updateSettings({ hasCompletedOnboarding: true });
  }, [updateSettings]);

  return (
    <AppContext.Provider value={{ settings, updateSettings, setMode, completeOnboarding }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

// Content Context
interface ContentContextType {
  content: ContentState;
  updateContent: (content: Partial<ContentState>) => void;
  setInputText: (text: string) => void;
  setScript: (script: string) => void;
  setTone: (tone: Tone) => void;
  setStyle: (style: PresentationStyle) => void;
  setVoice: (voice: VoiceOption) => void;
  setAudioUrl: (url: string | null) => void;
  resetContent: () => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<ContentState>({
    inputText: '',
    script: '',
    tone: Tone.PROFESSIONAL,
    style: PresentationStyle.SUMMARY,
    voice: voices[0],
    generatedAudioUrl: null
  });

  const updateContent = useCallback((newContent: Partial<ContentState>) => {
    setContent(prev => ({ ...prev, ...newContent }));
  }, []);

  const setInputText = useCallback((text: string) => updateContent({ inputText: text }), [updateContent]);
  const setScript = useCallback((script: string) => updateContent({ script }), [updateContent]);
  const setTone = useCallback((tone: Tone) => updateContent({ tone }), [updateContent]);
  const setStyle = useCallback((style: PresentationStyle) => updateContent({ style }), [updateContent]);
  const setVoice = useCallback((voice: VoiceOption) => updateContent({ voice }), [updateContent]);
  const setAudioUrl = useCallback((url: string | null) => updateContent({ generatedAudioUrl: url }), [updateContent]);

  const resetContent = useCallback(() => {
    setContent({
      inputText: '',
      script: '',
      tone: Tone.PROFESSIONAL,
      style: PresentationStyle.SUMMARY,
      voice: voices[0],
      generatedAudioUrl: null
    });
  }, []);

  return (
    <ContentContext.Provider value={{
      content,
      updateContent,
      setInputText,
      setScript,
      setTone,
      setStyle,
      setVoice,
      setAudioUrl,
      resetContent
    }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) throw new Error('useContent must be used within ContentProvider');
  return context;
};

// Avatar Context
interface AvatarContextType {
  avatar: AvatarState;
  setHeadshot: (headshot: string | null) => void;
  setAvatarParts: (parts: AvatarParts | null) => void;
  setAnimating: (isAnimating: boolean) => void;
  resetAvatar: () => void;
}

const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

export const AvatarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [avatar, setAvatar] = useState<AvatarState>({
    croppedHeadshot: null,
    avatarParts: null,
    isAnimating: false,
    currentFrame: 0
  });

  const setHeadshot = useCallback((headshot: string | null) => {
    setAvatar(prev => ({ ...prev, croppedHeadshot: headshot }));
  }, []);

  const setAvatarParts = useCallback((parts: AvatarParts | null) => {
    setAvatar(prev => ({ ...prev, avatarParts: parts }));
  }, []);

  const setAnimating = useCallback((isAnimating: boolean) => {
    setAvatar(prev => ({ ...prev, isAnimating }));
  }, []);

  const resetAvatar = useCallback(() => {
    setAvatar({
      croppedHeadshot: null,
      avatarParts: null,
      isAnimating: false,
      currentFrame: 0
    });
  }, []);

  return (
    <AvatarContext.Provider value={{ avatar, setHeadshot, setAvatarParts, setAnimating, resetAvatar }}>
      {children}
    </AvatarContext.Provider>
  );
};

export const useAvatar = () => {
  const context = useContext(AvatarContext);
  if (!context) throw new Error('useAvatar must be used within AvatarProvider');
  return context;
};

// UI Context
interface UIContextType {
  ui: UIState;
  setLoading: (loading: Partial<GenerationState>) => void;
  setError: (error: string | null) => void;
  showOnboarding: () => void;
  hideOnboarding: () => void;
  showModeSelector: () => void;
  hideModeSelector: () => void;
  setActivePanel: (panel: 'input' | 'preview' | 'export') => void;
  getRandomCanadianPhrase: (type: keyof typeof CANADIAN_PHRASES) => string;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ui, setUI] = useState<UIState>({
    isLoading: { script: false, audio: false, avatar: false },
    error: null,
    showOnboarding: false,
    showModeSelector: false,
    activePanel: 'input'
  });

  const setLoading = useCallback((loading: Partial<GenerationState>) => {
    setUI(prev => ({ ...prev, isLoading: { ...prev.isLoading, ...loading } }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setUI(prev => ({ ...prev, error }));
  }, []);

  const showOnboarding = useCallback(() => {
    setUI(prev => ({ ...prev, showOnboarding: true }));
  }, []);

  const hideOnboarding = useCallback(() => {
    setUI(prev => ({ ...prev, showOnboarding: false }));
  }, []);

  const showModeSelector = useCallback(() => {
    setUI(prev => ({ ...prev, showModeSelector: true }));
  }, []);

  const hideModeSelector = useCallback(() => {
    setUI(prev => ({ ...prev, showModeSelector: false }));
  }, []);

  const setActivePanel = useCallback((panel: 'input' | 'preview' | 'export') => {
    setUI(prev => ({ ...prev, activePanel: panel }));
  }, []);

  const getRandomCanadianPhrase = useCallback((type: keyof typeof CANADIAN_PHRASES) => {
    const phrases = CANADIAN_PHRASES[type];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }, []);

  return (
    <UIContext.Provider value={{
      ui,
      setLoading,
      setError,
      showOnboarding,
      hideOnboarding,
      showModeSelector,
      hideModeSelector,
      setActivePanel,
      getRandomCanadianPhrase
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
};

// Combined Provider
export const AppProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AppProvider>
      <ContentProvider>
        <AvatarProvider>
          <UIProvider>
            {children}
          </UIProvider>
        </AvatarProvider>
      </ContentProvider>
    </AppProvider>
  );
};
