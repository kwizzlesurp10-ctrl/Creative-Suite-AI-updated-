/**
 * EnhancedStoryGenerator Component
 * Extends StoryGenerator with AnyTool Auto-Produce functionality
 */

import React, { useState, useCallback, useMemo } from 'react';
import { generateStories, generateVideoPrompt } from '../services/geminiService';
import { useVeo } from '../hooks/useVeo';
import { anytoolService } from '../services/anytoolService';
import { Story } from '../types';
import { WorkflowResult, TrajectoryData } from '../types/anytool';
import Spinner from './Spinner';
import Card from './Card';
import ApiKeySelector from './ApiKeySelector';
import TrajectoryViewer from './TrajectoryViewer';

type TabMode = 'standard' | 'auto-produce';

const EnhancedStoryGenerator: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabMode>('standard');
    const [prompt, setPrompt] = useState('');
    const [stories, setStories] = useState<Story[]>([]);
    const [selectedStory, setSelectedStory] = useState<Story | null>(null);
    const [videoPrompt, setVideoPrompt] = useState('');
    const [bpm, setBpm] = useState(120);
    const [isGeneratingStories, setIsGeneratingStories] = useState(false);
    const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Auto-Produce state
    const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);
    const [workflowTemplate, setWorkflowTemplate] = useState('');
    const [isExecutingWorkflow, setIsExecutingWorkflow] = useState(false);
    const [workflowResult, setWorkflowResult] = useState<WorkflowResult | null>(null);
    const [trajectoryData, setTrajectoryData] = useState<TrajectoryData | null>(null);
    const [isLoadingTrajectory, setIsLoadingTrajectory] = useState(false);

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

    // Check backend availability on mount
    React.useEffect(() => {
        const checkBackend = async () => {
            const available = await anytoolService.isBackendAvailable();
            setBackendAvailable(available);
        };
        checkBackend();
    }, []);

    // Update workflow template when prompt or bpm changes
    React.useEffect(() => {
        if (prompt.trim()) {
            setWorkflowTemplate(
                `Generate a music video from "${prompt}":\n` +
                `1. Create an engaging story (${bpm} BPM pacing)\n` +
                `2. Generate 5 keyframe images using Imagen 4.0\n` +
                `3. Create video with Veo 3.1\n` +
                `4. Generate thumbnail variations\n` +
                `5. Optimize video file size\n` +
                `6. Create social media descriptions`
            );
        }
    }, [prompt, bpm]);

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

    const handleExecuteWorkflow = useCallback(async () => {
        if (!workflowTemplate.trim()) {
            setError('Please enter a workflow description.');
            return;
        }

        setIsExecutingWorkflow(true);
        setError(null);
        setWorkflowResult(null);
        setTrajectoryData(null);

        try {
            const result = await anytoolService.executeWorkflow({
                task: workflowTemplate,
                config: {
                    backend_scope: ['mcp', 'shell', 'web'],
                    enable_recording: true,
                    max_iterations: 20
                }
            });

            setWorkflowResult(result);

            // Poll for status updates
            anytoolService.pollStatus(
                result.task_id,
                (updatedResult) => {
                    setWorkflowResult(updatedResult);
                    
                    // Load trajectory when complete
                    if (updatedResult.status === 'completed') {
                        loadTrajectory(result.task_id);
                    }
                },
                2000,
                600000 // 10 minutes timeout
            ).catch((e) => {
                setError(`Polling failed: ${e.message}`);
            }).finally(() => {
                setIsExecutingWorkflow(false);
            });

        } catch (e: any) {
            setError(`Failed to execute workflow: ${e.message}`);
            setIsExecutingWorkflow(false);
        }
    }, [workflowTemplate]);

    const loadTrajectory = useCallback(async (taskId: string) => {
        setIsLoadingTrajectory(true);
        try {
            const trajectory = await anytoolService.getRecording(taskId);
            setTrajectoryData(trajectory);
        } catch (e: any) {
            console.error('Failed to load trajectory:', e);
        } finally {
            setIsLoadingTrajectory(false);
        }
    }, []);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isGeneratingStories && prompt.trim()) {
            handleGenerateStories();
        }
    };

    const isGenerateStoriesDisabled = useMemo(
        () => isGeneratingStories || !prompt.trim(),
        [isGeneratingStories, prompt]
    );

    const isGenerateVideoDisabled = useMemo(
        () => isGeneratingVideo || !videoPrompt.trim(),
        [isGeneratingVideo, videoPrompt]
    );

    return (
        <div className="max-w-7xl mx-auto">
            <Card>
                <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#ff00ff] to-[#00ff00]">
                    Story to Video Generator
                </h2>

                {/* Tab Selector */}
                <div className="flex gap-2 mb-6 border-b border-[#ff00ff]/30 pb-2">
                    <button
                        onClick={() => setActiveTab('standard')}
                        className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                            activeTab === 'standard'
                                ? 'bg-[#00ff00] text-[#0d0c1c]'
                                : 'bg-[#1a183d] text-[#a09cc9] hover:bg-[#2a275c]'
                        }`}
                    >
                        Standard Mode
                    </button>
                    <button
                        onClick={() => setActiveTab('auto-produce')}
                        className={`px-4 py-2 rounded-t-lg font-medium transition-colors flex items-center gap-2 ${
                            activeTab === 'auto-produce'
                                ? 'bg-[#00ff00] text-[#0d0c1c]'
                                : 'bg-[#1a183d] text-[#a09cc9] hover:bg-[#2a275c]'
                        }`}
                    >
                        Auto-Produce
                        {backendAvailable === false && (
                            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                                Backend Offline
                            </span>
                        )}
                        {backendAvailable === true && (
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                                ✓
                            </span>
                        )}
                    </button>
                </div>

                {/* Standard Mode */}
                {activeTab === 'standard' && (
                    <div className="space-y-6">
                        {/* Input Section */}
                        <div>
                            <label htmlFor="story-prompt" className="block text-sm font-medium mb-2 text-[#a09cc9]">
                                Enter a word or phrase to inspire stories:
                            </label>
                            <div className="flex gap-2">
                                <input
                                    id="story-prompt"
                                    type="text"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="e.g., 'dancing robot', 'ocean sunset'..."
                                    className="flex-1 px-4 py-2 bg-[#0d0c1c] border border-[#ff00ff]/30 rounded-lg focus:outline-none focus:border-[#00ff00] text-[#e0e0ff] placeholder-[#6a669a]"
                                    disabled={isGeneratingStories}
                                />
                                <button
                                    onClick={handleGenerateStories}
                                    disabled={isGenerateStoriesDisabled}
                                    className="px-6 py-2 bg-gradient-to-r from-[#ff00ff] to-[#00ff00] text-[#0d0c1c] font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                                >
                                    {isGeneratingStories ? 'Generating...' : 'Generate Stories'}
                                </button>
                            </div>
                        </div>

                        {/* BPM Slider */}
                        <div>
                            <label htmlFor="bpm-slider" className="block text-sm font-medium mb-2 text-[#a09cc9]">
                                Video Pacing (BPM): <span className="text-[#00ff00] font-bold">{bpm}</span>
                            </label>
                            <input
                                id="bpm-slider"
                                type="range"
                                min="60"
                                max="180"
                                value={bpm}
                                onChange={(e) => setBpm(Number(e.target.value))}
                                className="w-full accent-[#00ff00]"
                            />
                            <div className="flex justify-between text-xs text-[#6a669a] mt-1">
                                <span>Slow (60)</span>
                                <span>Medium (120)</span>
                                <span>Fast (180)</span>
                            </div>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
                                {error}
                            </div>
                        )}

                        {/* Stories Display */}
                        {isGeneratingStories ? (
                            <div className="flex items-center justify-center py-8">
                                <Spinner className="w-8 h-8" />
                                <span className="ml-3 text-[#a09cc9]">Generating stories...</span>
                            </div>
                        ) : stories.length > 0 ? (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-[#00ff00]">Choose a Story:</h3>
                                <div className="grid gap-4">
                                    {stories.map((story, index) => (
                                        <div
                                            key={index}
                                            onClick={() => handleSelectStory(story)}
                                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                                selectedStory === story
                                                    ? 'border-[#00ff00] bg-[#00ff00]/10'
                                                    : 'border-[#ff00ff]/30 hover:border-[#ff00ff] hover:bg-[#1a183d]/80'
                                            }`}
                                        >
                                            <h4 className="font-semibold text-[#ff00ff] mb-2">{story.title}</h4>
                                            <p className="text-[#e0e0ff] text-sm">{story.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        {/* Video Generation Section */}
                        {selectedStory && (
                            <div className="space-y-4 border-t border-[#ff00ff]/30 pt-6">
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleGenerateVideoPrompt}
                                        disabled={isGeneratingPrompt}
                                        className="px-6 py-2 bg-[#ff00ff] text-[#0d0c1c] font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                                    >
                                        {isGeneratingPrompt ? 'Generating...' : 'Generate Video Prompt'}
                                    </button>
                                </div>

                                {videoPrompt && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-[#a09cc9]">
                                                Video Prompt (you can edit this):
                                            </label>
                                            <textarea
                                                value={videoPrompt}
                                                onChange={(e) => setVideoPrompt(e.target.value)}
                                                className="w-full px-4 py-2 bg-[#0d0c1c] border border-[#ff00ff]/30 rounded-lg focus:outline-none focus:border-[#00ff00] text-[#e0e0ff] min-h-[100px]"
                                            />
                                        </div>

                                        {!apiKeySelected ? (
                                            <ApiKeySelector onSelectKey={selectApiKey} />
                                        ) : (
                                            <button
                                                onClick={handleGenerateVideo}
                                                disabled={isGenerateVideoDisabled}
                                                className="px-6 py-3 bg-gradient-to-r from-[#ff00ff] to-[#00ff00] text-[#0d0c1c] font-bold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                                            >
                                                {isGeneratingVideo ? loadingMessage : 'Generate Video'}
                                            </button>
                                        )}
                                    </div>
                                )}

                                {videoError && (
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
                                        {videoError}
                                    </div>
                                )}

                                {videoUrl && (
                                    <div className="space-y-4">
                                        <div className="border border-[#00ff00]/30 rounded-lg overflow-hidden">
                                            <video src={videoUrl} controls className="w-full" />
                                        </div>
                                        <button
                                            onClick={() => getAndSetExtensionPrompts(videoUrl)}
                                            disabled={isGeneratingPrompts}
                                            className="px-4 py-2 bg-[#ff00ff] text-[#0d0c1c] font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                                        >
                                            {isGeneratingPrompts ? 'Generating...' : 'Generate Extension Prompts'}
                                        </button>

                                        {extensionError && (
                                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
                                                {extensionError}
                                            </div>
                                        )}

                                        {extensionPrompts && extensionPrompts.length > 0 && (
                                            <div className="space-y-2">
                                                <h4 className="font-semibold text-[#00ff00]">Extension Prompts:</h4>
                                                {extensionPrompts.map((extPrompt, idx) => (
                                                    <div key={idx} className="flex gap-2">
                                                        <p className="flex-1 p-3 bg-[#1a183d]/60 border border-[#ff00ff]/30 rounded-lg text-sm text-[#e0e0ff]">
                                                            {extPrompt}
                                                        </p>
                                                        <button
                                                            onClick={() => startVideoExtension(videoUrl, extPrompt)}
                                                            className="px-4 py-2 bg-[#00ff00] text-[#0d0c1c] font-semibold rounded-lg hover:opacity-90"
                                                        >
                                                            Extend
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Auto-Produce Mode */}
                {activeTab === 'auto-produce' && (
                    <div className="space-y-6">
                        {backendAvailable === false && (
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-yellow-400">
                                ⚠️ Backend service is not available. Please start the backend server to use Auto-Produce mode.
                                <br />
                                <code className="text-xs mt-2 block">cd backend && python server.py</code>
                            </div>
                        )}

                        <div>
                            <label htmlFor="auto-prompt" className="block text-sm font-medium mb-2 text-[#a09cc9]">
                                Enter your creative prompt:
                            </label>
                            <input
                                id="auto-prompt"
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., 'dancing robot', 'ocean sunset'..."
                                className="w-full px-4 py-2 bg-[#0d0c1c] border border-[#ff00ff]/30 rounded-lg focus:outline-none focus:border-[#00ff00] text-[#e0e0ff] placeholder-[#6a669a]"
                            />
                        </div>

                        <div>
                            <label htmlFor="bpm-slider-auto" className="block text-sm font-medium mb-2 text-[#a09cc9]">
                                Video Pacing (BPM): <span className="text-[#00ff00] font-bold">{bpm}</span>
                            </label>
                            <input
                                id="bpm-slider-auto"
                                type="range"
                                min="60"
                                max="180"
                                value={bpm}
                                onChange={(e) => setBpm(Number(e.target.value))}
                                className="w-full accent-[#00ff00]"
                            />
                        </div>

                        <div>
                            <label htmlFor="workflow-template" className="block text-sm font-medium mb-2 text-[#a09cc9]">
                                Workflow Template (you can edit this):
                            </label>
                            <textarea
                                id="workflow-template"
                                value={workflowTemplate}
                                onChange={(e) => setWorkflowTemplate(e.target.value)}
                                className="w-full px-4 py-2 bg-[#0d0c1c] border border-[#ff00ff]/30 rounded-lg focus:outline-none focus:border-[#00ff00] text-[#e0e0ff] min-h-[150px] font-mono text-sm"
                                placeholder="Describe the workflow steps..."
                            />
                        </div>

                        <button
                            onClick={handleExecuteWorkflow}
                            disabled={!backendAvailable || isExecutingWorkflow || !workflowTemplate.trim()}
                            className="px-6 py-3 bg-gradient-to-r from-[#ff00ff] to-[#00ff00] text-[#0d0c1c] font-bold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                        >
                            {isExecutingWorkflow ? 'Executing Workflow...' : 'Execute Workflow'}
                        </button>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
                                {error}
                            </div>
                        )}

                        {/* Workflow Status */}
                        {workflowResult && (
                            <div className="space-y-4">
                                <div className="bg-[#1a183d]/60 border border-[#ff00ff]/30 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-lg font-semibold text-[#00ff00]">Workflow Status</h3>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            workflowResult.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                            workflowResult.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                                            workflowResult.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                                            'bg-gray-500/20 text-gray-400'
                                        }`}>
                                            {workflowResult.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[#a09cc9] mb-2">Task ID: {workflowResult.task_id}</p>
                                    {workflowResult.response && (
                                        <div className="mt-3 p-3 bg-[#0d0c1c] rounded border border-[#00ff00]/30">
                                            <p className="text-[#e0e0ff] whitespace-pre-wrap">{workflowResult.response}</p>
                                        </div>
                                    )}
                                    {workflowResult.error && (
                                        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded">
                                            <p className="text-red-400">{workflowResult.error}</p>
                                        </div>
                                    )}
                                    {isExecutingWorkflow && (
                                        <div className="mt-3 flex items-center">
                                            <Spinner className="w-5 h-5" />
                                            <span className="ml-3 text-[#a09cc9]">Workflow in progress...</span>
                                        </div>
                                    )}
                                </div>

                                {/* Trajectory Viewer */}
                                {(trajectoryData || workflowResult.status === 'completed') && (
                                    <TrajectoryViewer 
                                        trajectoryData={trajectoryData} 
                                        isLoading={isLoadingTrajectory}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default EnhancedStoryGenerator;
