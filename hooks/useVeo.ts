import { useState, useCallback, useRef, useEffect } from 'react';
import { generateVideo, pollVideoOperation, generateExtensionPrompts } from '../services/geminiService';
import type { Part } from '@google/genai';

const VEO_POLLING_INTERVAL = 10000; // 10 seconds

const loadingMessages = [
    "Warming up the digital director's chair...",
    "Assembling pixels into a masterpiece...",
    "Teaching the AI about cinematography...",
    "Rendering the first few frames...",
    "This can take a few minutes, hang tight!",
    "Choreographing the dance of light and shadow...",
    "Applying the final touches of digital magic...",
    "Extending the scene, frame by frame...",
    "Adding a new chapter to your visual story..."
];

interface GenerateVideoOptions {
    prompt: string;
    aspectRatio: '16:9' | '9:16';
    imagePart?: Part | null;
}

export const useVeo = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [apiKeySelected, setApiKeySelected] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    const [lastSuccessfulOperation, setLastSuccessfulOperation] = useState<any | null>(null);
    const [extensionPrompts, setExtensionPrompts] = useState<string[] | null>(null);
    const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);
    const [extensionError, setExtensionError] = useState<string | null>(null);
    const [videoContext, setVideoContext] = useState<string>('');
    
    const intervalIdRef = useRef<number | null>(null);
    const messageIntervalIdRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (intervalIdRef.current) clearInterval(intervalIdRef.current);
            if (messageIntervalIdRef.current) clearInterval(messageIntervalIdRef.current);
        };
    }, []);

    const checkApiKey = useCallback(async () => {
        try {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setApiKeySelected(hasKey);
            return hasKey;
        } catch (e) {
            console.error("Error checking API key:", e);
            setError("Could not verify API key status. Please ensure you are in the correct environment.");
            return false;
        }
    }, []);
    
    useEffect(() => {
        checkApiKey();
    }, [checkApiKey]);

    const selectApiKey = useCallback(async () => {
        try {
            await window.aistudio.openSelectKey();
            setApiKeySelected(true); // Assume success to avoid race conditions
            setError(null);
        } catch (e) {
            console.error("Error opening API key selection:", e);
            setError("Failed to open the API key selection dialog.");
        }
    }, []);

    const runGeneration = useCallback(async (generationFn: () => Promise<any>, contextUpdater?: (prevContext: string) => string) => {
        const hasKey = await checkApiKey();
        if (!hasKey) {
            setError("Please select an API key to generate videos.");
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setVideoUrl(null);
        setExtensionPrompts(null);
        setExtensionError(null);
        setLoadingMessage(loadingMessages[0]);

        if (messageIntervalIdRef.current) clearInterval(messageIntervalIdRef.current);
        messageIntervalIdRef.current = window.setInterval(() => {
            setLoadingMessage(prev => {
                const currentIndex = loadingMessages.indexOf(prev);
                const nextIndex = (currentIndex + 1) % loadingMessages.length;
                return loadingMessages[nextIndex];
            });
        }, 5000);

        try {
            let operation = await generationFn();

            const poll = async () => {
                if (!operation) return;
                try {
                    operation = await pollVideoOperation(operation);
                    if (operation.done) {
                        if (intervalIdRef.current) clearInterval(intervalIdRef.current);
                        if (messageIntervalIdRef.current) clearInterval(messageIntervalIdRef.current);

                        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
                        if (downloadLink) {
                            const url = new URL(downloadLink);
                            url.searchParams.append('key', process.env.API_KEY);
                            const response = await fetch(url.toString());
                            const blob = await response.blob();
                            setVideoUrl(URL.createObjectURL(blob));
                            setLastSuccessfulOperation(operation);
                            if (contextUpdater) {
                                setVideoContext(contextUpdater);
                            }
                        } else {
                            setError(operation.error?.message || "Video generation finished, but no video URL was found.");
                        }
                        setIsLoading(false);
                    }
                } catch (e: any) {
                    console.error("Polling error:", e);
                    if (intervalIdRef.current) clearInterval(intervalIdRef.current);
                    if (messageIntervalIdRef.current) clearInterval(messageIntervalIdRef.current);
                    setIsLoading(false);

                    if (e.message.includes("Requested entity was not found")) {
                        setError("API Key not found. Please re-select your API key.");
                        setApiKeySelected(false);
                        return;
                    }
                    
                    try {
                        const errorObj = JSON.parse(e.message);
                        const code = errorObj?.error?.code;
                        const status = errorObj?.error?.status;
                        const message = errorObj?.error?.message;

                        if (code === 500 || status === "Internal Server Error") {
                             setError("A temporary server error occurred (500 Internal Server Error). This is usually a transient issue on Google's side. Please wait a few minutes and try generating the video again.");
                        } else {
                             setError(`An error occurred while checking video status: ${message || status || e.message}`);
                        }
                    } catch (parseError) {
                        setError(`An error occurred while checking video status: ${e.message}`);
                    }
                }
            };
            
            intervalIdRef.current = window.setInterval(poll, VEO_POLLING_INTERVAL);
            poll();

        } catch (e: any) {
            console.error("Video generation error:", e);
            if (e.message.includes("Requested entity was not found")) {
                setError("API Key not found. Please re-select your API key.");
                setApiKeySelected(false);
            } else {
                setError(`Failed to start video generation: ${e.message}`);
            }
            setIsLoading(false);
            if (messageIntervalIdRef.current) clearInterval(messageIntervalIdRef.current);
        }
    }, [checkApiKey]);

    const startVideoGeneration = useCallback(async (options: GenerateVideoOptions) => {
        setLastSuccessfulOperation(null);
        runGeneration(() => generateVideo(options), () => options.prompt);
    }, [runGeneration]);

    const getAndSetExtensionPrompts = useCallback(async () => {
        setIsGeneratingPrompts(true);
        setExtensionError(null);
        setExtensionPrompts(null);
        try {
            const prompts = await generateExtensionPrompts(videoContext);
            setExtensionPrompts(prompts);
        } catch (e: any) {
            setExtensionError(`Failed to get extension ideas: ${e.message}`);
        } finally {
            setIsGeneratingPrompts(false);
        }
    }, [videoContext]);

    const startVideoExtension = useCallback(async (prompt: string) => {
        if (!lastSuccessfulOperation) {
            setError("Cannot extend video: previous generation data not found.");
            return;
        }
        const videoToExtend = lastSuccessfulOperation.response?.generatedVideos?.[0]?.video;
        if (!videoToExtend) {
            setError("Cannot extend video: previous video object is invalid.");
            return;
        }
        const aspectRatio = videoToExtend.aspectRatio as '16:9' | '9:16';

        runGeneration(
            () => generateVideo({ prompt, videoToExtend, aspectRatio }),
            (prevContext) => `${prevContext}. Then, ${prompt}.`
        );
    }, [lastSuccessfulOperation, runGeneration]);
    
    return { 
        isLoading, 
        error, 
        videoUrl, 
        startVideoGeneration, 
        apiKeySelected, 
        selectApiKey, 
        loadingMessage, 
        checkApiKey,
        isGeneratingPrompts,
        extensionError,
        extensionPrompts,
        getAndSetExtensionPrompts,
        startVideoExtension,
    };
};