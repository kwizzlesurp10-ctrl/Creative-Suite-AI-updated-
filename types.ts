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
    // FIX: The 'aistudio' property was removed to resolve a conflicting TypeScript declaration error.
    // The error message implies that 'window.aistudio' is already typed in another global declaration.
    webkitAudioContext: typeof AudioContext;
  }
}
