import React, { useState, useCallback, useRef } from 'react';
import { analyzeImage } from '../services/geminiService';
import Spinner from './Spinner';
import Card from './Card';
import type { Part } from '@google/genai';

const fileToPart = async (file: File): Promise<Part> => {
    const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (error) => reject(error);
    });
    return {
        inlineData: {
            mimeType: file.type,
            data: base64,
        },
    };
};

const ImageAnalyzer: React.FC = () => {
    const [prompt, setPrompt] = useState('What is in this picture?');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImageUrl(URL.createObjectURL(file));
            setAnalysis(null);
            setError(null);
        }
    };
    
    const handleAnalyze = useCallback(async () => {
        if (!prompt) {
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
            const result = await analyzeImage(prompt, imagePart);
            setAnalysis(result);
        } catch (e: any) {
            setError(`Failed to analyze image: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [prompt, imageFile]);

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
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-[#2a275c] hover:bg-[#4d4a8f] text-white font-bold py-3 px-4 rounded-lg transition-colors"
                    >
                        {imageFile ? `Selected: ${imageFile.name}` : 'Upload Image'}
                    </button>
                    {imageUrl && (
                        <div className="p-4 bg-[#0d0c1c]/50 rounded-lg flex justify-center">
                            <img src={imageUrl} alt="upload preview" className="max-h-64 rounded-md" />
                        </div>
                    )}
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ask a question about the image..."
                        className="w-full bg-[#0d0c1c] border border-[#4d4a8f] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff00]"
                        disabled={isLoading || !imageFile}
                    />
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading || !prompt || !imageFile}
                        className="w-full bg-[#00ff00] hover:bg-[#00e600] text-[#0d0c1c] font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-[#4d4a8f] disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? <><Spinner className="w-5 h-5 mr-2" /> Analyzing...</> : 'Analyze Image'}
                    </button>
                </div>
            </Card>
            
            {(isLoading || error || analysis) && (
                <Card>
                    <h3 className="text-xl font-bold mb-4 text-[#00ff00]">Analysis Result</h3>
                    {isLoading && <div className="text-center p-8"><Spinner className="w-12 h-12 mx-auto" /></div>}
                    {error && <div className="bg-[#ff00ff]/10 border border-[#ff00ff] text-[#f8bbd0] px-4 py-3 rounded-lg">{error}</div>}
                    {analysis && <div className="text-[#e0e0ff] whitespace-pre-wrap">{analysis}</div>}
                </Card>
            )}
        </div>
    );
};

export default ImageAnalyzer;