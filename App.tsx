import React, { useState, useEffect } from 'react';
import { AppView } from './types';
import StoryGenerator from './components/StoryGenerator';
import ImageGenie from './components/ImageGenie';
import ImageAnalyzer from './components/ImageAnalyzer';
import ImageToVideo from './components/ImageToVideo';
import AudioTranscriber from './components/AudioTranscriber';
import ErrorBoundary from './components/ErrorBoundary';

// FIX: Changed JSX.Element to React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
const TABS: { id: AppView, label: string, icon: React.ReactElement }[] = [
    { id: 'story', label: 'Story to Video', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg> },
    { id: 'imageGen', label: 'Image Genie', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg> },
    { id: 'imageAnalyze', label: 'Image Analyzer', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg> },
    { id: 'imageToVideo', label: 'Image to Video', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 001.553.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>},
    { id: 'transcriber', label: 'Transcriber', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" /></svg> },
];

const App: React.FC = () => {
    const [activeView, setActiveView] = useState<AppView>('story');

    // Keyboard shortcuts for navigation (Alt + 1-5)
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.altKey && !e.ctrlKey && !e.metaKey) {
                const viewMap: { [key: string]: AppView } = {
                    '1': 'story',
                    '2': 'imageGen',
                    '3': 'imageAnalyze',
                    '4': 'imageToVideo',
                    '5': 'transcriber',
                };
                if (viewMap[e.key]) {
                    setActiveView(viewMap[e.key]);
                    e.preventDefault();
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    const renderActiveView = () => {
        switch (activeView) {
            case 'story': return <StoryGenerator />;
            case 'imageGen': return <ImageGenie />;
            case 'imageAnalyze': return <ImageAnalyzer />;
            case 'imageToVideo': return <ImageToVideo />;
            case 'transcriber': return <AudioTranscriber />;
            default: return <StoryGenerator />;
        }
    };
    
    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-[#0d0c1c] text-[#e0e0ff] font-sans">
                <header className="bg-[#1a183d]/80 backdrop-blur-sm sticky top-0 z-10 border-b border-[#ff00ff]">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col sm:flex-row items-center justify-between py-4">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#ff00ff] to-[#00ff00] mb-4 sm:mb-0">
                                Creative Suite AI
                            </h1>
                            <nav className="flex flex-wrap justify-center gap-2 sm:gap-4" role="navigation" aria-label="Main navigation">
                                {TABS.map((tab, index) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveView(tab.id)}
                                        className={`px-3 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-colors ${
                                            activeView === tab.id
                                                ? 'bg-[#00ff00] text-[#0d0c1c] font-bold'
                                                : 'text-[#a09cc9] hover:bg-[#2a275c] hover:text-[#00ff00]'
                                        }`}
                                        aria-label={`${tab.label} (Alt+${index + 1})`}
                                        aria-current={activeView === tab.id ? 'page' : undefined}
                                        title={`Switch to ${tab.label} (Alt+${index + 1})`}
                                    >
                                        {tab.icon}
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>
                </header>

                <main className="container mx-auto p-4 sm:p-6 lg:p-8" role="main">
                    {renderActiveView()}
                </main>

                <footer className="text-center py-6 text-[#6a669a] text-sm" role="contentinfo">
                    <p>Powered by Google Gemini. Built for creative exploration.</p>
                    <p className="mt-2 text-xs">Tip: Use Alt+1 through Alt+5 for quick navigation</p>
                </footer>
            </div>
        </ErrorBoundary>
    );
}

export default App;