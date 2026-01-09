<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Creative Suite AI

An AI-powered creative suite that transforms your ideas into stories, images, and videos. Built with React, TypeScript, Google Gemini AI, and enhanced with AnyTool for autonomous multi-tool orchestration.

View your app in AI Studio: https://ai.studio/apps/drive/1C-LDWK0IU_U5AWVEJbZRmgTaaWvhakym

## ✨ Features

- **🎬 Story to Video**: Generate unique stories from a phrase and convert them into dynamic music videos
  - **NEW: Auto-Produce Mode**: Autonomous workflow execution with AnyTool backend
- **🎨 Image Genie**: Create stunning images from text prompts using Imagen 4.0
- **🔍 Image Analyzer**: Upload and analyze images with AI-powered insights
- **📹 Image to Video**: Animate your images with customizable prompts and aspect ratios
- **🎤 Live Transcriber**: Real-time audio transcription using Gemini's native audio capabilities
- **➕ Video Extension**: Extend generated videos with AI-suggested continuations

## 🏗️ Architecture

This project now features a **hybrid agent system** with:
- **Frontend**: React 19 + TypeScript + Vite (runs on port 3000)
- **Backend**: Python + Flask + AnyTool integration (runs on port 5001)
- **AI Services**: Google Gemini 2.5, Imagen 4.0, Veo 3.1

### Auto-Produce Mode

The new Auto-Produce mode leverages a Python backend service with AnyTool integration to autonomously orchestrate complex workflows:

1. **Define Workflow**: Describe a multi-step creative workflow
2. **Execute**: Backend coordinates tool usage (image generation, video creation, etc.)
3. **Monitor**: Watch real-time execution trajectory
4. **Results**: View generated artifacts and execution recordings

## 🚀 Quick Start

### Frontend Setup

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
   - Navigate to `http://localhost:3000` (or the port shown in your terminal)

### Backend Setup (Optional - for Auto-Produce Mode)

The backend service enables autonomous workflow orchestration. It's optional but recommended for the full Auto-Produce experience.

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create Python virtual environment**
   ```bash
   python -m venv venv
   
   # Activate on macOS/Linux:
   source venv/bin/activate
   
   # Activate on Windows:
   venv\Scripts\activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure backend environment**
   ```bash
   # Copy example environment file
   cp .env.example .env
   
   # Edit .env and add your Gemini API key
   # GEMINI_API_KEY=your_key_here
   ```

5. **Start the backend server**
   ```bash
   python server.py
   ```
   
   The backend will start on `http://localhost:5001`

6. **(Optional) Install AnyTool for full functionality**
   
   See [backend/README.md](backend/README.md) for detailed AnyTool installation instructions.

### Running Both Frontend and Backend

Use the convenient script to run both services simultaneously:

```bash
npm run dev:full
```

This starts:
- Frontend on `http://localhost:3000`
- Backend on `http://localhost:5001`

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

**Standard Mode:**
1. Enter a creative phrase or word
2. Choose from three AI-generated stories
3. Adjust BPM (60-180) to set the video's pace
4. Generate a video prompt and create your music video
5. Optionally extend your video with AI-suggested continuations

**Auto-Produce Mode** (requires backend):
1. Enter a creative phrase
2. Review the auto-generated workflow template
3. Click "Execute Workflow" to start autonomous production
4. Monitor real-time execution trajectory
5. View generated artifacts and download results

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
- **Backend**: Python 3.12+, Flask 3.0+
- **AI Services**: Google Gemini 2.5 (Flash & Pro), Imagen 4.0, Veo 3.1
- **Orchestration**: AnyTool (optional, for Auto-Produce mode)
- **Styling**: Tailwind CSS (via inline classes)

## 📝 Project Structure

```
Creative-Suite-AI-updated-/
├── backend/                # Python backend service (NEW)
│   ├── __init__.py
│   ├── server.py          # Flask server with REST API
│   ├── anytool_wrapper.py # AnyTool integration wrapper
│   ├── config.py          # Backend configuration
│   ├── requirements.txt   # Python dependencies
│   ├── .env.example       # Environment template
│   └── README.md          # Backend documentation
├── components/             # React components
│   ├── EnhancedStoryGenerator.tsx  # Enhanced with Auto-Produce (NEW)
│   ├── TrajectoryViewer.tsx        # Execution visualization (NEW)
│   ├── StoryGenerator.tsx
│   ├── ImageGenie.tsx
│   ├── ImageAnalyzer.tsx
│   ├── ImageToVideo.tsx
│   ├── AudioTranscriber.tsx
│   ├── Card.tsx
│   ├── Spinner.tsx
│   └── ApiKeySelector.tsx
├── hooks/                  # Custom React hooks
│   └── useVeo.ts
├── services/               # API service layers
│   ├── geminiService.ts
│   └── anytoolService.ts  # Backend API client (NEW)
├── types/                  # TypeScript type definitions
│   └── anytool.ts         # AnyTool types (NEW)
├── App.tsx                 # Main application component
├── types.ts                # Global TypeScript types
├── vite.config.ts          # Vite configuration with proxy (UPDATED)
└── package.json            # Dependencies and scripts (UPDATED)
```

## 🔐 API Key & Billing

Video generation features (Story to Video, Image to Video) require a Gemini API key with billing enabled. Learn more about [Gemini API billing](https://ai.google.dev/gemini-api/docs/billing).

Both frontend and backend need API keys configured:
- **Frontend**: `.env.local` in root directory
- **Backend**: `.env` in backend directory

## 📚 Additional Documentation

- [Backend Service Documentation](backend/README.md) - Comprehensive guide for backend setup and AnyTool integration
- [API Endpoints Reference](backend/README.md#api-endpoints) - REST API documentation

## 🔧 Development Scripts

```bash
# Start frontend only
npm run dev

# Start backend only (in backend directory)
cd backend && python server.py

# Start both frontend and backend
npm run dev:full

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## 📄 License

This project is licensed under the terms specified in the repository.

## 🙏 Acknowledgments

Powered by Google Gemini AI. Built for creative exploration and innovation.
