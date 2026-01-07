import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useVeo } from '../hooks/useVeo';
import Spinner from './Spinner';
import Card from './Card';
import ApiKeySelector from './ApiKeySelector';
import { fileToPart } from '../utils/fileUtils';

const ImageToVideo: React.FC = () => {
    const [prompt, setPrompt] = useState('Animate this image with a gentle breeze.');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
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

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Cleanup object URL on unmount or when file changes to prevent memory leaks
    useEffect(() => {
        return () => {
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [imageUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please upload a valid image file (JPEG, PNG, GIF, WebP, etc.)');
                return;
            }
            
            // Validate file size (max 10MB)
            const maxSize = 10 * 1024 * 1024; // 10MB in bytes
            if (file.size > maxSize) {
                setError('Image file is too large. Please upload an image smaller than 10MB.');
                return;
            }
            
            // Cleanup old URL before creating new one
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }
            
            setImageFile(file);
            setImageUrl(URL.createObjectURL(file));
            setError(null);
        }
    };
    
    const handleGenerate = useCallback(async () => {
        if (!imageFile) {
            setError('Please upload an image.');
            return;
        }
        
        const trimmedPrompt = prompt.trim();
        if (!trimmedPrompt) {
            setError('Please enter a description for the animation.');
            return;
        }

        setError(null);
        try {
            const imagePart = await fileToPart(imageFile);
            startVideoGeneration({prompt: trimmedPrompt, imagePart, aspectRatio});
        } catch (e: any) {
            setError(`Failed to process image: ${e.message}`);
        }
    }, [prompt, imageFile, aspectRatio, startVideoGeneration]);
    
    return (
        <div className="space-y-8">
            <Card>
                <h2 className="text-2xl font-bold mb-4 text-[#ff00ff]">Image to Video</h2>
                <p className="text-[#a09cc9] mb-4">Upload an image, describe the animation, and bring it to life.</p>
                <div className="space-y-4">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        ref={fileInputRef}
                        aria-label="Upload starting image for video"
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-[#2a275c] hover:bg-[#4d4a8f] text-white font-bold py-3 px-4 rounded-lg transition-colors"
                        aria-label={imageFile ? `Change image: ${imageFile.name}` : 'Upload starting image'}
                    >
                        {imageFile ? `Selected: ${imageFile.name}` : 'Upload Starting Image'}
                    </button>
                     {imageUrl && (
                        <div className="p-4 bg-[#0d0c1c]/50 rounded-lg flex justify-center">
                            <img 
                                src={imageUrl} 
                                alt="Upload preview" 
                                className="max-h-64 rounded-md" 
                                loading="lazy"
                            />
                        </div>
                    )}
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe what should happen in the video..."
                        className="w-full h-24 bg-[#0d0c1c] border border-[#4d4a8f] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff00ff]"
                        disabled={isGeneratingVideo || !imageFile}
                        maxLength={500}
                        aria-label="Video animation description"
                    />
                    <p className="text-xs text-[#6a669a]">
                        {prompt.length}/500 characters • Supported: JPEG, PNG, GIF, WebP • Max size: 10MB
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-grow">
                             <label className="block text-[#a09cc9] mb-2">Aspect Ratio</label>
                             <select 
                                value={aspectRatio} 
                                onChange={(e) => setAspectRatio(e.target.value as '16:9' | '9:16')}
                                className="w-full bg-[#0d0c1c] border border-[#4d4a8f] rounded-lg px-4 py-2"
                             >
                                 <option value="16:9">16:9 (Landscape)</option>
                                 <option value="9:16">9:16 (Portrait)</option>
                             </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleGenerate}
                                disabled={isGeneratingVideo || !imageFile || !prompt.trim()}
                                className="w-full h-fit bg-[#ff00ff] hover:bg-[#e600e6] text-[#0d0c1c] font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-[#4d4a8f] disabled:cursor-not-allowed flex items-center justify-center"
                                aria-label="Generate video from image"
                            >
                                {isGeneratingVideo ? <><Spinner className="w-5 h-5 mr-2" /> Generating...</> : 'Generate Video'}
                            </button>
                        </div>
                    </div>
                </div>
            </Card>

            <ApiKeySelector apiKeySelected={apiKeySelected} onSelectApiKey={selectApiKey} featureName="Image to Video Generation" />
            
            {error && (
                <div className="bg-[#ff00ff]/10 border border-[#ff00ff] text-[#f8bbd0] px-4 py-3 rounded-lg" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span>{error}</span>
                </div>
            )}
           
            {(isGeneratingVideo || videoUrl || videoError) && (
                 <Card>
                    <h2 className="text-2xl font-bold mb-4 text-[#ff00ff]">Result</h2>
                    {isGeneratingVideo && (
                        <div className="text-center p-8">
                            <Spinner className="w-12 h-12 mx-auto mb-4" />
                            <p className="text-lg text-[#a09cc9]">{loadingMessage}</p>
                            <p className="text-sm text-[#6a669a] mt-2">This may take a few minutes...</p>
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
                            <video src={videoUrl} controls className="w-full rounded-lg" aria-label="Generated video" />
                            <a 
                                href={videoUrl} 
                                download="creative_ai_image_to_video.mp4" 
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
                    <h3 className="text-xl font-bold mb-4 text-[#ff00ff]">Extend Your Video</h3>
                    <p className="text-[#a09cc9] mb-4">Generate a 7-second continuation of your video.</p>
                    <button
                        onClick={() => getAndSetExtensionPrompts()}
                        disabled={isGeneratingPrompts}
                        className="w-full bg-[#ff00ff] hover:bg-[#e600e6] text-[#0d0c1c] font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-[#4d4a8f] flex items-center justify-center"
                    >
                        {isGeneratingPrompts ? <><Spinner className="w-5 h-5 mr-2" /> Getting Ideas...</> : 'Get Extension Ideas'}
                    </button>
                    
                    {extensionError && <div className="mt-4 bg-[#ff00ff]/10 border border-[#ff00ff] text-[#f8bbd0] px-4 py-3 rounded-lg">{extensionError}</div>}
                    
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

export default ImageToVideo;