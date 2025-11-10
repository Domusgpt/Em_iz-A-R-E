# 🎬 TalkingHead Pro - Canadian Edition

<div align="center">

![TalkingHead Pro Banner](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

**Your Professional Animated Avatar Platform with Canadian Charm, eh?** 🍁

Transform any content into engaging South Park-style animated presentations with personality!

[![Version](https://img.shields.io/badge/version-1.0.0-red.svg)](https://github.com/yourusername/talkinghead-pro)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Made with](https://img.shields.io/badge/made%20with-❤️%20%26%20🍁-red.svg)](https://github.com/yourusername/talkinghead-pro)

</div>

## ✨ What's TalkingHead Pro?

TalkingHead Pro is a professional-grade animated avatar platform that brings your content to life with Canadian South Park-style animations. Whether you're creating a resume video, presenting a document, or making a quick introduction, we've got you covered, buddy!

### 🎯 Three Powerful Modes

#### 📄 Professional Resume Mode
Transform your resume into an engaging video introduction that stands out from the crowd, eh?
- Perfect for job applications
- Highlights your achievements naturally
- Professional yet personable delivery

#### 📝 Document Presenter Mode
Turn any document or content into an animated presentation, don't you know!
- Present reports with personality
- Explain concepts engagingly
- Make any content memorable

#### 👋 Quick Introduction Mode
Create fast, professional self-introductions with style, friend!
- Perfect for networking
- Quick elevator pitches
- Personal branding made easy

## 🚀 Key Features

### 🎭 Canadian South Park-Style Animation
- Authentic 2D cut-out animation style
- 10 mouth shapes for realistic lip-sync
- Audio-reactive head movements and expressions
- Smooth transitions with personality

### 🎤 Professional Text-to-Speech
- Multiple voice options (male & female)
- Natural-sounding audio generation
- Adjustable tone and presentation style
- Real-time audio analysis for animation

### 🤖 AI-Powered Script Generation
- Smart script creation from your content
- Multiple tones: Professional, Enthusiastic, Friendly Canadian, and more
- Various presentation styles to choose from
- Fully editable scripts

### 🎨 Custom Avatar Creation
- Upload your photo to create personalized avatars
- Camera capture support
- Professional image cropping
- South Park-style transformation

### 🎁 Canadian Personality Throughout
- Polite and friendly interface copy
- Warm, welcoming tone
- Occasional "eh?" for authenticity
- Apologetic error messages ("Sorry aboot that!")

## 🛠️ Getting Started

### Prerequisites
- Node.js (v16 or higher)
- A Gemini API key ([Get one here](https://ai.google.dev/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/talkinghead-pro.git
   cd talkinghead-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your API key**
   Create a `.env.local` file in the root directory:
   ```env
   API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

### Building for Production

```bash
npm run build
npm run preview
```

## 📖 How to Use

### First Time Setup
1. **Welcome Tour**: On your first visit, you'll see our friendly onboarding flow
2. **Choose Your Mode**: Select Resume, Document, or Quick Intro mode
3. **Follow the Steps**: We'll guide you through creating your first presentation!

### Creating a Presentation

#### Step 1: Input Your Content
- Paste your text directly or upload a .txt file
- Each mode has different character limits and tips

#### Step 2: Generate or Write Your Script
- Choose your desired tone (Professional, Enthusiastic, Friendly Canadian, etc.)
- Select a presentation style
- Let AI generate a script, or write your own!
- Edit the script as needed

#### Step 3: Customize Your Avatar & Voice
- Select from 5 professional voices
- Upload a photo or use your camera for a custom avatar
- Preview your choices

#### Step 4: Generate & Preview
- Click "Generate Presentation"
- Watch your animated avatar come to life!
- Play, pause, and scrub through your presentation

#### Step 5: Export & Share
- Download audio (WAV format)
- Video export coming soon!
- Share your amazing creation

## 🎨 Customization Options

### Tone Options
- **Professional & Authoritative**: For serious business presentations
- **Enthusiastic & Passionate**: For energetic, exciting content
- **Concise & Direct**: For quick, to-the-point messages
- **Storytelling & Engaging**: For narrative-driven content
- **Friendly Canadian**: Polite, warm, and personable (with occasional "eh?")

### Presentation Styles
- **Executive Summary**: High-level overview
- **Project Spotlight**: Deep dive into specific projects
- **Skills Overview**: Comprehensive skills showcase
- **Career Journey**: Narrative career progression
- **Elevator Pitch**: Quick, impactful introduction
- **Documentary Style**: Story-driven presentation

### Voice Options
- **Zephyr**: Female, Warm & Gentle
- **Kore**: Male, Deep & Authoritative
- **Puck**: Male, Youthful & Energetic
- **Charon**: Female, Professional & Crisp
- **Fenrir**: Male, Raspy & Mature

## 🏗️ Technical Architecture

### Tech Stack
- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS with custom animations
- **State Management**: Context API
- **AI Services**: Google Gemini (Script, TTS, Image Generation)
- **Build Tool**: Vite
- **Animation**: Custom South Park-style 2D system

### Project Structure
```
talkinghead-pro/
├── components/          # React components
│   ├── Onboarding.tsx
│   ├── ModeSelector.tsx
│   ├── ContentInput.tsx
│   ├── ScriptStudioNew.tsx
│   ├── VoiceAvatarPanel.tsx
│   ├── PreviewExport.tsx
│   ├── AnimatedAvatar.tsx
│   └── ImageCropper.tsx
├── contexts/           # State management
│   └── AppContext.tsx
├── services/           # API services
│   └── geminiService.ts
├── types/              # TypeScript definitions
│   └── index.ts
├── utils/              # Utility functions
│   └── audioUtils.ts
└── App.tsx             # Main application
```

## 🎯 Use Cases

### Job Seekers
Create standout video resumes that make recruiters remember you, buddy!

### Content Creators
Turn blog posts, scripts, or ideas into engaging animated videos.

### Professionals
Make memorable introductions for LinkedIn, conferences, or networking events.

### Educators
Present educational content with personality and engagement.

### Marketers
Create unique product presentations or explainer videos.

## 🤝 Contributing

We'd love your help making TalkingHead Pro even better, eh? Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Share your creations!

## 📝 License

MIT License - feel free to use TalkingHead Pro for personal or commercial projects!

## 🙏 Acknowledgments

- Built with [Google Gemini](https://ai.google.dev/) for AI capabilities
- Inspired by the iconic South Park animation style
- Made with ❤️ and maple syrup in Canada 🍁

## 💬 Support

Having trouble, friend? We're here to help!
- Check the [FAQ](docs/FAQ.md)
- Read the [User Guide](docs/USER_GUIDE.md)
- Open an issue on GitHub

## 🗺️ Roadmap

- [ ] Video export functionality
- [ ] GIF export
- [ ] More voice options
- [ ] Custom animation speeds
- [ ] Subtitle generation
- [ ] Multiple language support
- [ ] Team collaboration features
- [ ] Cloud storage integration
- [ ] Mobile app versions

---

<div align="center">

**Made with love and maple syrup in Canada, eh?** 🍁

[Website](https://talkinghead.pro) • [Documentation](docs/) • [Report Bug](https://github.com/yourusername/talkinghead-pro/issues) • [Request Feature](https://github.com/yourusername/talkinghead-pro/issues)

</div>
