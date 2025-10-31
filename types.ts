
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

export enum Voice {
  KORE = "Kore (Male, Deep)",
  PUCK = "Puck (Male, Youthful)",
  ZEPHYR = "Zephyr (Female, Warm)",
  CHARON = "Charon (Female, Professional)"
}

export interface GenerationState {
  script: boolean;
  audio: boolean;
  video: boolean;
}
