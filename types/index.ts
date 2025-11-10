// Core Application Types

export enum AppMode {
  RESUME = "resume",
  DOCUMENT = "document",
  QUICK_INTRO = "quick_intro"
}

export enum Tone {
  PROFESSIONAL = "Professional & Authoritative",
  ENTHUSIASTIC = "Enthusiastic & Passionate",
  CONCISE = "Concise & Direct",
  STORYTELLING = "Storytelling & Engaging",
  FRIENDLY_CANADIAN = "Friendly Canadian (Polite & Warm)"
}

export enum PresentationStyle {
  SUMMARY = "Executive Summary",
  PROJECT_SPOTLIGHT = "Project Spotlight",
  SKILLS_OVERVIEW = "Skills Overview",
  CAREER_JOURNEY = "Career Journey",
  ELEVATOR_PITCH = "Elevator Pitch",
  DOCUMENTARY = "Documentary Style"
}

export interface VoiceOption {
  id: string;
  name: string;
  description: string;
  gender: "male" | "female";
  accent: string;
}

export const voices: VoiceOption[] = [
  { id: "Zephyr", name: "Zephyr", description: "Warm & Gentle", gender: "female", accent: "North American" },
  { id: "Kore", name: "Kore", description: "Deep & Authoritative", gender: "male", accent: "North American" },
  { id: "Puck", name: "Puck", description: "Youthful & Energetic", gender: "male", accent: "North American" },
  { id: "Charon", name: "Charon", description: "Professional & Crisp", gender: "female", accent: "North American" },
  { id: "Fenrir", name: "Fenrir", description: "Raspy & Mature", gender: "male", accent: "North American" },
];

export interface GenerationState {
  script: boolean;
  audio: boolean;
  avatar: boolean;
}

export interface AudioData {
  bass: number;
  mid: number;
  high: number;
  energy: number;
  rhythm: number;
}

export type AvatarParts = string[];

// App State Types
export interface AppSettings {
  mode: AppMode;
  hasCompletedOnboarding: boolean;
  preferredVoice: string;
  autoPlay: boolean;
  showTutorials: boolean;
}

export interface ContentState {
  inputText: string;
  script: string;
  tone: Tone;
  style: PresentationStyle;
  voice: VoiceOption;
  generatedAudioUrl: string | null;
}

export interface AvatarState {
  croppedHeadshot: string | null;
  avatarParts: AvatarParts | null;
  isAnimating: boolean;
  currentFrame: number;
}

export interface UIState {
  isLoading: GenerationState;
  error: string | null;
  showOnboarding: boolean;
  showModeSelector: boolean;
  activePanel: 'input' | 'preview' | 'export';
}

// Mode-specific configurations
export interface ModeConfig {
  id: AppMode;
  name: string;
  description: string;
  icon: string;
  placeholder: string;
  defaultTone: Tone;
  defaultStyle: PresentationStyle;
  maxLength: number;
  canadianGreeting: string;
}

export const modeConfigs: Record<AppMode, ModeConfig> = {
  [AppMode.RESUME]: {
    id: AppMode.RESUME,
    name: "Professional Resume",
    description: "Transform your resume into an engaging video introduction, eh?",
    icon: "📄",
    placeholder: "Paste your resume text here, buddy...",
    defaultTone: Tone.PROFESSIONAL,
    defaultStyle: PresentationStyle.SUMMARY,
    maxLength: 5000,
    canadianGreeting: "Hey there! Let's make your resume shine, friend!"
  },
  [AppMode.DOCUMENT]: {
    id: AppMode.DOCUMENT,
    name: "Document Presenter",
    description: "Turn any document into an animated presentation, don't you know!",
    icon: "📝",
    placeholder: "Paste any document or content here...",
    defaultTone: Tone.STORYTELLING,
    defaultStyle: PresentationStyle.DOCUMENTARY,
    maxLength: 10000,
    canadianGreeting: "Alright, let's bring your document to life!"
  },
  [AppMode.QUICK_INTRO]: {
    id: AppMode.QUICK_INTRO,
    name: "Quick Introduction",
    description: "Create a fast, professional self-introduction. Beauty, eh?",
    icon: "👋",
    placeholder: "Tell us aboot yourself in a few sentences...",
    defaultTone: Tone.FRIENDLY_CANADIAN,
    defaultStyle: PresentationStyle.ELEVATOR_PITCH,
    maxLength: 1000,
    canadianGreeting: "Hi there, buddy! Let's create your intro!"
  }
};

// Animation constants
export const ANIMATION_CONFIG = {
  FRAME_SEQUENCE: [0, 2, 1, 3, 0, 4, 1, 5, 0, 6, 1, 7, 0, 8, 1, 9],
  FRAME_RATE: 15,
  IDLE_SWAY_SPEED: 0.2,
  ACTIVE_SWAY_SPEED: 0.6,
  HEAD_TILT_RANGE: 3,
  MOUTH_FLAP_MULTIPLIER: 4.5
};

// Canadian phrases for personality
export const CANADIAN_PHRASES = {
  greetings: [
    "Hey there, buddy!",
    "How's it going, eh?",
    "Good to see you, friend!",
    "Welcome, don't you know!"
  ],
  apologies: [
    "Sorry aboot that, eh?",
    "Oops! My apologies, friend.",
    "Pardon me, let's try that again!",
    "Sorry, that's on me, buddy!"
  ],
  success: [
    "Beauty! You're all set!",
    "Perfect, eh? Looking good!",
    "That's the way, bud!",
    "Outstanding work, friend!"
  ],
  encouragement: [
    "You've got this, buddy!",
    "Looking great so far, eh?",
    "Keep it up, friend!",
    "Doing wonderful, don't you know!"
  ]
};

// Export types
export interface ExportOptions {
  format: 'video' | 'audio' | 'gif';
  quality: 'low' | 'medium' | 'high';
  includeSubtitles: boolean;
}
