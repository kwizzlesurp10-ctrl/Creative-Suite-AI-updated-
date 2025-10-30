
export interface Story {
  title: string;
  text: string;
}

export type AppView = 'story' | 'imageGen' | 'imageAnalyze' | 'imageToVideo' | 'transcriber';

// Extend the Window interface for TypeScript
declare global {
  interface Window {
    // FIX: The 'aistudio' property was removed to resolve a conflicting TypeScript declaration error.
    // The error message implies that 'window.aistudio' is already typed in another global declaration.
    webkitAudioContext: typeof AudioContext;
  }
}
