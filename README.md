<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Creative Suite AI

An AI-powered creative suite that transforms your ideas into stories, images, and videos. Built with React, TypeScript, and Google Gemini AI.

View your app in AI Studio: https://ai.studio/apps/drive/1C-LDWK0IU_U5AWVEJbZRmgTaaWvhakym

## ✨ Features

- **🎬 Story to Video**: Generate unique stories from a phrase and convert them into dynamic music videos
- **🎨 Image Genie**: Create stunning images from text prompts using Imagen 4.0
- **🔍 Image Analyzer**: Upload and analyze images with AI-powered insights
- **📹 Image to Video**: Animate your images with customizable prompts and aspect ratios
- **🎤 Live Transcriber**: Real-time audio transcription using Gemini's native audio capabilities
- **➕ Video Extension**: Extend generated videos with AI-suggested continuations

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher recommended)
- **Gemini API Key** with billing enabled (for video generation features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Creative-Suite-AI-updated-
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your API key**
   - Create a `.env.local` file in the root directory
   - Add your Gemini API key:
     ```
     GEMINI_API_KEY=your_api_key_here
     ```
   - Get your API key from [Google AI Studio](https://ai.google.dev/)

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:5173` (or the port shown in your terminal)

## 🔨 Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

To preview the production build:
```bash
npm run preview
```

## 🎯 Usage Tips

### Story to Video
1. Enter a creative phrase or word
2. Choose from three AI-generated stories
3. Adjust BPM (60-180) to set the video's pace
4. Generate a video prompt and create your music video
5. Optionally extend your video with AI-suggested continuations

### Image Genie
- Be specific and descriptive in your prompts
- Example: "A bioluminescent forest at night with glowing mushrooms"

### Image Analyzer
- Upload any image format (JPEG, PNG, etc.)
- Ask specific questions about the image content
- Default prompt: "What is in this picture?"

### Image to Video
- Upload a starting image
- Describe the animation you want
- Choose aspect ratio: 16:9 (landscape) or 9:16 (portrait)

### Live Transcriber
- Grant microphone permissions when prompted
- Click "Start Transcribing" and speak naturally
- Real-time transcription appears instantly
- Click "Stop Transcribing" to end the session

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite 6
- **AI Services**: Google Gemini 2.5 (Flash & Pro), Imagen 4.0, Veo 3.1
- **Styling**: Tailwind CSS (via inline classes)

## 📝 Project Structure

```
Creative-Suite-AI-updated-/
├── components/          # React components
│   ├── StoryGenerator.tsx
│   ├── ImageGenie.tsx
│   ├── ImageAnalyzer.tsx
│   ├── ImageToVideo.tsx
│   ├── AudioTranscriber.tsx
│   ├── Card.tsx
│   ├── Spinner.tsx
│   └── ApiKeySelector.tsx
├── hooks/              # Custom React hooks
│   └── useVeo.ts
├── services/           # API service layers
│   └── geminiService.ts
├── App.tsx             # Main application component
├── types.ts            # TypeScript type definitions
└── package.json        # Dependencies and scripts
```

## 🔐 API Key & Billing

Video generation features (Story to Video, Image to Video) require a Gemini API key with billing enabled. Learn more about [Gemini API billing](https://ai.google.dev/gemini-api/docs/billing).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## 📄 License

This project is licensed under the terms specified in the repository.

## 🙏 Acknowledgments

Powered by Google Gemini AI. Built for creative exploration and innovation.
