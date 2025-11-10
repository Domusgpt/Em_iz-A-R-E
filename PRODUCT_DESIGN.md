# TalkingHead Pro - Product Design Document

## Overview
A professional Canadian South Park-style animated avatar platform that speaks any content with personality and charm.

## Core Features

### 1. Three Operating Modes
- **Professional Resume Mode**: Convert resumes into engaging video introductions
- **Document Presenter Mode**: Turn any document/text into an animated presentation
- **Quick Intro Mode**: Create fast personal introductions with customizable scripts

### 2. Canadian Personality Traits
- Polite and friendly language ("please", "thank you", "sorry aboot that")
- Warm, welcoming tone throughout the interface
- Apologetic and helpful error messages
- Occasional "eh?" for authenticity
- Professional but approachable demeanor

### 3. Animation System
- South Park-style 2D cut-out animation
- 10 mouth shapes for realistic lip-sync
- Audio-reactive head movements (tilt, sway, nod)
- Smooth transitions between expressions
- Idle animations when not speaking

### 4. User Experience Flow
1. Welcome/Onboarding (first-time users)
2. Mode Selection
3. Content Input (mode-specific)
4. Avatar Customization (upload photo)
5. Voice & Style Selection
6. Generate & Preview
7. Export & Share

## Technical Architecture

### State Management
- Context API for global app state
- Separate contexts for:
  - App settings (mode, onboarding status)
  - Content (input, script, audio)
  - Avatar (parts, animations)
  - UI (loading states, errors, modals)

### Component Structure
```
App
├── OnboardingFlow
├── ModeSelector
├── ContentInput
│   ├── ResumeMode
│   ├── DocumentMode
│   └── QuickIntroMode
├── AvatarCreator
├── VoiceStudiot
├── PreviewStage
└── ExportPanel
```

### Services
- AI Service (script generation, TTS, image processing)
- Storage Service (localStorage for settings)
- Analytics Service (usage tracking)
- Export Service (download, share)

## Design Principles
1. **Clarity**: Clear labeling and intuitive navigation
2. **Feedback**: Immediate response to all user actions
3. **Guidance**: Helpful hints and tooltips throughout
4. **Polish**: Smooth animations and professional styling
5. **Accessibility**: Keyboard navigation, screen reader support

## Canadian Personality Implementation
- UI copy uses Canadian English spellings (colour, favour)
- Friendly greetings ("Hey there, buddy!")
- Apologetic errors ("Sorry aboot that, eh?")
- Polite confirmations ("Would you mind if we...?")
- Warm success messages ("Beauty! You're all set, friend!")
