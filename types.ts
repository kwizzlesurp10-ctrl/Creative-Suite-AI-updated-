/**
 * Type definitions for the Creative Suite AI application
 */

export interface Story {
  title: string;
  text: string;
}

export type AppView = 'story' | 'imageGen' | 'imageAnalyze' | 'imageToVideo' | 'transcriber';

/**
 * Global window interface extensions
 * These are required for the AI Studio environment and browser compatibility
 */
declare global {
  interface Window {
    /**
     * AI Studio API for managing API keys in the AI Studio environment.
     * Used for video generation and other AI features that require authentication.
     */
    aistudio: {
      /** Check if an API key has been selected for the current session */
      hasSelectedApiKey: () => Promise<boolean>;
      /** Open the API key selection dialog for the user to choose/configure an API key */
      openSelectKey: () => Promise<void>;
    };
    webkitAudioContext: typeof AudioContext;
  }
}
