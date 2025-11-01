
export enum Tone {
  PROFESSIONAL = "Professional & Authoritative",
  ENTHUSIASTIC = "Enthusiastic & Passionate",
  CONCISE = "Concise & Direct",
  STORYTELLING = "Storytelling & Engaging"
}

export enum PresentationStyle {
  SUMMARY = "Executive Summary",
  PROJECT_SPOTLIGHT = "Project Spotlight",
  SKILLS_OVERVIEW = "Skills Overview",
  CAREER_JOURNEY = "Career Journey"
}

export interface VoiceOption {
  id: string;
  name: string;
  description: string;
}

export const voices: VoiceOption[] = [
  { id: "Zephyr", name: "Zephyr", description: "Female, Warm & Gentle" },
  { id: "Kore", name: "Kore", description: "Male, Deep & Authoritative" },
  { id: "Puck", name: "Puck", description: "Male, Youthful & Energetic" },
  { id: "Charon", name: "Charon", description: "Female, Professional & Crisp" },
  { id: "Fenrir", name: "Fenrir", description: "Male, Raspy & Mature" },
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

// Replaced the complex AvatarParts interface with a simple array of base64 strings
export type AvatarParts = string[];