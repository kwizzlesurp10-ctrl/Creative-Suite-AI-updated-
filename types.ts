
export interface Story {
  title: string;
  text: string;
}

export type AppView = 'story' | 'imageGen' | 'imageAnalyze' | 'imageToVideo' | 'transcriber';

// Extend the Window interface for TypeScript
declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
    webkitAudioContext: typeof AudioContext;
  }
}
