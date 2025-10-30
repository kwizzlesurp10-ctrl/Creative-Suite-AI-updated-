import React, { useState, useCallback } from 'react';
import { generateImage } from '../services/geminiService';
import Spinner from './Spinner';
import Card from './Card';

const ImageGenie: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!prompt) {
            setError('Please enter a prompt.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setImageUrl(null);
        try {
            const result = await generateImage(prompt);
            setImageUrl(result);
        } catch (e: any) {
            setError(`Failed to generate image: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [prompt]);

    return (
        <div className="space-y-8">
            <Card>
                <h2 className="text-2xl font-bold mb-4 text-[#ff00ff]">Image Genie</h2>
                <p className="text-[#a09cc9] mb-4">Describe the image you want to create. Be as imaginative as you like!</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., 'A bioluminescent forest at night'"
                        className="flex-grow bg-[#0d0c1c] border border-[#4d4a8f] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff00ff]"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt}
                        className="bg-[#ff00ff] hover:bg-[#e600e6] text-[#0d0c1c] font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-[#4d4a8f] disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? <><Spinner className="w-5 h-5 mr-2" /> Generating...</> : 'Generate Image'}
                    </button>
                </div>
            </Card>

            {(isLoading || error || imageUrl) && (
                <Card>
                    <h3 className="text-xl font-bold mb-4 text-[#ff00ff]">Result</h3>
                    {isLoading && <div className="text-center p-8"><Spinner className="w-12 h-12 mx-auto" /></div>}
                    {error && <div className="bg-[#ff00ff]/10 border border-[#ff00ff] text-[#f8bbd0] px-4 py-3 rounded-lg">{error}</div>}
                    {imageUrl && (
                        <div className="flex flex-col items-center">
                            <img src={imageUrl} alt={prompt} className="rounded-lg max-w-full h-auto shadow-lg" />
                             <a href={imageUrl} download="creative_ai_image.jpg" className="mt-4 inline-block w-full sm:w-auto text-center bg-[#ff00ff] hover:bg-[#e600e6] text-[#0d0c1c] font-bold py-2 px-4 rounded-lg transition-colors">
                                Download Image
                            </a>
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
};

export default ImageGenie;