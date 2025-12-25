import React, { useState, useCallback, useMemo } from 'react';
import { generateStories, generateVideoPrompt } from '../services/geminiService';
import { useVeo } from '../hooks/useVeo';
import { Story } from '../types';
import Spinner from './Spinner';
import Card from './Card';
import ApiKeySelector from './ApiKeySelector';

const StoryGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [stories, setStories] = useState<Story[]>([]);
    const [selectedStory, setSelectedStory] = useState<Story | null>(null);
    const [videoPrompt, setVideoPrompt] = useState('');
    const [bpm, setBpm] = useState(120);
    const [isGeneratingStories, setIsGeneratingStories] = useState(false);
    const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { 
        isLoading: isGeneratingVideo, 
        error: videoError, 
        videoUrl, 
        startVideoGeneration,
        apiKeySelected,
        selectApiKey,
        loadingMessage,
        isGeneratingPrompts,
        extensionError,
        extensionPrompts,
        getAndSetExtensionPrompts,
        startVideoExtension,
    } = useVeo();

    const handleGenerateStories = useCallback(async () => {
        const trimmedPrompt = prompt.trim();
        
        if (!trimmedPrompt) {
            setError('Please enter a word or phrase.');
            return;
        }
        
        if (trimmedPrompt.length < 2) {
            setError('Please enter at least 2 characters.');
            return;
        }
        
        setIsGeneratingStories(true);
        setError(null);
        setStories([]);
        setSelectedStory(null);
        setVideoPrompt('');
        try {
            const result = await generateStories(trimmedPrompt);
            setStories(result);
        } catch (e: any) {
            setError(`Failed to generate stories: ${e.message}`);
        } finally {
            setIsGeneratingStories(false);
        }
    }, [prompt]);

    const handleSelectStory = useCallback((story: Story) => {
        setSelectedStory(story);
        setVideoPrompt('');
    }, []);

    const handleGenerateVideoPrompt = useCallback(async () => {
        if (!selectedStory) return;
        setIsGeneratingPrompt(true);
        setError(null);
        try {
            const result = await generateVideoPrompt(selectedStory.text, bpm);
            setVideoPrompt(result);
        } catch (e: any) {
            setError(`Failed to generate video prompt: ${e.message}`);
        } finally {
            setIsGeneratingPrompt(false);
        }
    }, [selectedStory, bpm]);

    const handleGenerateVideo = useCallback(() => {
        if (!videoPrompt.trim()) return;
        startVideoGeneration({prompt: videoPrompt.trim(), aspectRatio: '16:9'});
    }, [videoPrompt, startVideoGeneration]);

    // Memoize button disabled state for performance
    const isGenerateStoriesDisabled = useMemo(
        () => isGeneratingStories || !prompt.trim(),
        [isGeneratingStories, prompt]
    );

    const isGenerateVideoDisabled = useMemo(
        () => isGeneratingVideo || !videoPrompt.trim(),
        [isGeneratingVideo, videoPrompt]
    );

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isGeneratingStories && prompt.trim()) {
            handleGenerateStories();
        }
    };

    return (
        <div className="space-y-8">
            {/* Step 1: Input Prompt */}
            <Card>
                <h2 className="text-2xl font-bold mb-4 text-[#00ff00]">Step 1: Spark Your Idea</h2>
                <p className="text-[#a09cc9] mb-4">Enter a word or a phrase to generate three unique stories.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="e.g., 'The last sunset'"
                        className="flex-grow bg-[#0d0c1c] border border-[#4d4a8f] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff00]"
                        disabled={isGeneratingStories}
                        maxLength={200}
                        aria-label="Story generation prompt"
                        aria-describedby="story-prompt-help"
                    />
                    <button
                        onClick={handleGenerateStories}
                        disabled={isGenerateStoriesDisabled}
                        className="bg-[#ff00ff] hover:bg-[#e600e6] text-[#0d0c1c] font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-[#4d4a8f] disabled:cursor-not-allowed flex items-center justify-center"
                        aria-label="Generate three stories from prompt"
                    >
                        {isGeneratingStories ? <><Spinner className="w-5 h-5 mr-2" /> Generating...</> : 'Generate Stories'}
                    </button>
                </div>
                <p id="story-prompt-help" className="text-xs text-[#6a669a] mt-2">
                    {prompt.length}/200 characters • Press Enter to generate
                </p>
            </Card>

            {error && (
                <div className="bg-[#ff00ff]/10 border border-[#ff00ff] text-[#f8bbd0] px-4 py-3 rounded-lg" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span>{error}</span>
                </div>
            )}

            {/* Step 2: Select a Story */}
            {isGeneratingStories && (
                <div className="text-center">
                    <Spinner className="w-10 h-10 mx-auto" />
                    <p className="mt-4 text-[#a09cc9]">Crafting unique stories for you...</p>
                </div>
            )}
            {stories.length > 0 && (
                 <Card>
                    <h2 className="text-2xl font-bold mb-4 text-[#00ff00]">Step 2: Choose a Narrative</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {stories.map((story, index) => (
                            <div
                                key={index}
                                onClick={() => handleSelectStory(story)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        handleSelectStory(story);
                                        e.preventDefault();
                                    }
                                }}
                                tabIndex={0}
                                role="button"
                                aria-pressed={selectedStory?.title === story.title}
                                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${selectedStory?.title === story.title ? 'bg-[#ff00ff]/20 border-[#ff00ff]' : 'bg-[#1a183d]/50 border-[#4d4a8f] hover:border-[#00ff00]'}`}
                            >
                                <h3 className="font-bold text-lg mb-2">{story.title}</h3>
                                <p className="text-[#a09cc9] text-sm line-clamp-6">{story.text}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Step 3: Create Video Prompt */}
            {selectedStory && (
                <Card>
                    <h2 className="text-2xl font-bold mb-4 text-[#00ff00]">Step 3: Set the Scene</h2>
                    <div className="bg-[#0d0c1c]/50 p-4 rounded-lg mb-4">
                        <h3 className="font-bold text-lg mb-2">{selectedStory.title}</h3>
                        <p className="text-[#e0e0ff]">{selectedStory.text}</p>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-grow w-full">
                            <label htmlFor="bpm" className="block text-[#a09cc9] mb-2">Beats Per Minute (BPM): <span className="font-bold text-white">{bpm}</span></label>
                            <input
                                id="bpm"
                                type="range"
                                min="60"
                                max="180"
                                value={bpm}
                                onChange={(e) => setBpm(Number(e.target.value))}
                                className="w-full h-2 bg-[#2a275c] rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        <button
                            onClick={handleGenerateVideoPrompt}
                            disabled={isGeneratingPrompt}
                            className="w-full md:w-auto bg-[#ff00ff] hover:bg-[#e600e6] text-[#0d0c1c] font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-[#4d4a8f] flex items-center justify-center"
                        >
                            {isGeneratingPrompt ? <><Spinner className="w-5 h-5 mr-2" /> Creating Prompt...</> : 'Create Video Prompt'}
                        </button>
                    </div>
                    {videoPrompt && (
                        <div className="mt-6 bg-[#0d0c1c]/50 p-4 rounded-lg">
                            <h4 className="font-bold text-md text-[#a09cc9] mb-2">Generated Video Prompt:</h4>
                            <p className="text-[#e0e0ff] italic">{videoPrompt}</p>
                        </div>
                    )}
                </Card>
            )}

            {/* Step 4: Generate Music Video */}
            {videoPrompt && (
                <Card>
                    <h2 className="text-2xl font-bold mb-4 text-[#00ff00]">Step 4: Action!</h2>
                    <p className="text-[#a09cc9] mb-4">Generate your music video based on the prompt.</p>
                    <ApiKeySelector apiKeySelected={apiKeySelected} onSelectApiKey={selectApiKey} featureName="Video Generation" />
                    {apiKeySelected && (
                        <button
                            onClick={handleGenerateVideo}
                            disabled={isGenerateVideoDisabled}
                            className="w-full bg-[#00ff00] hover:bg-[#00e600] text-[#0d0c1c] font-bold py-3 px-6 rounded-lg transition-colors disabled:bg-[#4d4a8f] flex items-center justify-center text-lg"
                            aria-label="Generate music video from prompt"
                        >
                            {isGeneratingVideo ? <><Spinner className="w-6 h-6 mr-3" /> Generating Video...</> : 'Generate Music Video'}
                        </button>
                    )}
                </Card>
            )}

            {/* Video Result */}
            {(isGeneratingVideo || videoUrl || videoError) && (
                 <Card>
                    <h2 className="text-2xl font-bold mb-4 text-[#00ff00]">Result</h2>
                    {isGeneratingVideo && (
                        <div className="text-center p-8">
                            <Spinner className="w-12 h-12 mx-auto mb-4" />
                            <p className="text-lg text-[#a09cc9]">{loadingMessage}</p>
                        </div>
                    )}
                     {videoError && (
                        <div className="bg-[#ff00ff]/10 border border-[#ff00ff] text-[#f8bbd0] px-4 py-3 rounded-lg" role="alert">
                            <strong className="font-bold">Error: </strong>
                            <span>{videoError}</span>
                        </div>
                    )}
                    {videoUrl && (
                        <div>
                            <video src={videoUrl} controls className="w-full rounded-lg" aria-label="Generated music video" />
                            <a 
                                href={videoUrl} 
                                download="creative_ai_video.mp4" 
                                className="mt-4 inline-block w-full text-center bg-[#ff00ff] hover:bg-[#e600e6] text-[#0d0c1c] font-bold py-2 px-4 rounded-lg transition-colors"
                                aria-label="Download generated video"
                            >
                                Download Video
                            </a>
                        </div>
                    )}
                </Card>
            )}

            {/* Extend Video Section */}
            {videoUrl && !isGeneratingVideo && (
                <Card>
                    <h3 className="text-xl font-bold mb-4 text-[#00ff00]">Extend Your Video</h3>
                    <p className="text-[#a09cc9] mb-4">Generate a 7-second continuation of your video.</p>
                    <button
                        onClick={() => getAndSetExtensionPrompts()}
                        disabled={isGeneratingPrompts}
                        className="w-full bg-[#ff00ff] hover:bg-[#e600e6] text-[#0d0c1c] font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-[#4d4a8f] flex items-center justify-center"
                    >
                        {isGeneratingPrompts ? <><Spinner className="w-5 h-5 mr-2" /> Getting Ideas...</> : 'Get Extension Ideas'}
                    </button>
                    
                    {extensionError && (
                        <div className="mt-4 bg-[#ff00ff]/10 border border-[#ff00ff] text-[#f8bbd0] px-4 py-3 rounded-lg" role="alert">
                            <strong className="font-bold">Error: </strong>
                            <span>{extensionError}</span>
                        </div>
                    )}
                    
                    {extensionPrompts && (
                        <div className="mt-6 space-y-3">
                            <h4 className="font-bold text-md text-[#a09cc9]">Choose what happens next:</h4>
                            {extensionPrompts.map((p, i) => (
                                <button
                                    key={i}
                                    onClick={() => startVideoExtension(p)}
                                    className="w-full text-left p-3 bg-[#2a275c] hover:bg-[#4d4a8f] rounded-lg transition-colors text-white"
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
};

export default StoryGenerator;