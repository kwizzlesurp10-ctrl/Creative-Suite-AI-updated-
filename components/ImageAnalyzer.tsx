import React, { useState, useCallback, useRef, useEffect } from 'react';
import { analyzeImage } from '../services/geminiService';
import Spinner from './Spinner';
import Card from './Card';
import { fileToPart } from '../utils/fileUtils';

const ImageAnalyzer: React.FC = () => {
    const [prompt, setPrompt] = useState('What is in this picture?');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<string | null>(null);
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
            setAnalysis(null);
            setError(null);
        }
    };
    
    const handleAnalyze = useCallback(async () => {
        const trimmedPrompt = prompt.trim();
        
        if (!trimmedPrompt) {
            setError('Please enter a question or prompt.');
            return;
        }
        if (!imageFile) {
            setError('Please upload an image.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        try {
            const imagePart = await fileToPart(imageFile);
            const result = await analyzeImage(trimmedPrompt, imagePart);
            setAnalysis(result);
        } catch (e: any) {
            setError(`Failed to analyze image: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [prompt, imageFile]);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isLoading && prompt.trim() && imageFile) {
            handleAnalyze();
        }
    };

    return (
        <div className="space-y-8">
            <Card>
                <h2 className="text-2xl font-bold mb-4 text-[#00ff00]">Image Analyzer</h2>
                <p className="text-[#a09cc9] mb-4">Upload an image and ask Gemini anything about it.</p>
                <div className="space-y-4">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        ref={fileInputRef}
                        aria-label="Upload image file"
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-[#2a275c] hover:bg-[#4d4a8f] text-white font-bold py-3 px-4 rounded-lg transition-colors"
                        aria-label={imageFile ? `Change image: ${imageFile.name}` : 'Upload image'}
                    >
                        {imageFile ? `Selected: ${imageFile.name}` : 'Upload Image'}
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
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask a question about the image..."
                        className="w-full bg-[#0d0c1c] border border-[#4d4a8f] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff00]"
                        disabled={isLoading || !imageFile}
                        aria-label="Question or prompt about the image"
                    />
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading || !prompt.trim() || !imageFile}
                        className="w-full bg-[#00ff00] hover:bg-[#00e600] text-[#0d0c1c] font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-[#4d4a8f] disabled:cursor-not-allowed flex items-center justify-center"
                        aria-label="Analyze uploaded image"
                    >
                        {isLoading ? <><Spinner className="w-5 h-5 mr-2" /> Analyzing...</> : 'Analyze Image'}
                    </button>
                    <p className="text-xs text-[#6a669a]">
                        Supported formats: JPEG, PNG, GIF, WebP • Max size: 10MB • Press Enter to analyze
                    </p>
                </div>
            </Card>
            
            {error && (
                <div className="bg-[#ff00ff]/10 border border-[#ff00ff] text-[#f8bbd0] px-4 py-3 rounded-lg" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span>{error}</span>
                </div>
            )}
            
            {(isLoading || analysis) && (
                <Card>
                    <h3 className="text-xl font-bold mb-4 text-[#00ff00]">Analysis Result</h3>
                    {isLoading && (
                        <div className="text-center p-8">
                            <Spinner className="w-12 h-12 mx-auto" />
                            <p className="mt-4 text-[#a09cc9]">Analyzing your image...</p>
                        </div>
                    )}
                    {analysis && <div className="text-[#e0e0ff] whitespace-pre-wrap">{analysis}</div>}
                </Card>
            )}
        </div>
    );
};

export default ImageAnalyzer;