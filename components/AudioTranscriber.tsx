import React, { useState, useRef, useEffect, useCallback } from 'react';
// FIX: Removed 'LiveSession' as it is not an exported member of '@google/genai'.
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import Spinner from './Spinner';
import Card from './Card';

// --- Audio Helper Functions ---
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const AudioTranscriber: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState<string>('');
    const [history, setHistory] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    // FIX: Changed the ref's type to 'Promise<any>' because 'LiveSession' is not exported.
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    
    const currentInputTranscriptionRef = useRef('');

    const stopRecording = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
            sessionPromiseRef.current = null;
        }
        if (currentInputTranscriptionRef.current) {
            setHistory(prev => [...prev, `You: ${currentInputTranscriptionRef.current}`]);
            currentInputTranscriptionRef.current = '';
        }
        setTranscription('');
        setIsRecording(false);
    }, []);

    const startRecording = useCallback(async () => {
        setError(null);
        setIsRecording(true);
        setTranscription('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        if (!audioContextRef.current || !streamRef.current) return;
                        mediaStreamSourceRef.current = audioContextRef.current.createMediaStreamSource(streamRef.current);
                        scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
                        
                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const l = inputData.length;
                            const int16 = new Int16Array(l);
                            for (let i = 0; i < l; i++) {
                                int16[i] = inputData[i] * 32768;
                            }
                            const pcmBlob: Blob = {
                                data: encode(new Uint8Array(int16.buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            
                            if (sessionPromiseRef.current) {
                                sessionPromiseRef.current.then((session) => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            }
                        };
                        mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(audioContextRef.current.destination);
                    },
                    onmessage: (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            const text = message.serverContent.inputTranscription.text;
                            currentInputTranscriptionRef.current += text;
                            setTranscription(currentInputTranscriptionRef.current);
                        }
                         if (message.serverContent?.turnComplete) {
                            setHistory(prev => [...prev, `You: ${currentInputTranscriptionRef.current}`]);
                            currentInputTranscriptionRef.current = '';
                            setTranscription('');
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                        setError('An error occurred during the session. Please try again.');
                        stopRecording();
                    },
                    onclose: () => {
                        // This might be called when stop is initiated, so avoid setting error here.
                    },
                },
                config: {
                    // FIX: Added responseModalities as it's required by the Live API guidelines.
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                },
            });

        } catch (e: any) {
            console.error("Failed to start recording:", e);
            setError(`Could not start audio transcription: ${e.message}. Please grant microphone permissions.`);
            setIsRecording(false);
        }
    }, [stopRecording]);
    
    useEffect(() => {
        // Cleanup on component unmount
        return () => {
            stopRecording();
        };
    }, [stopRecording]);

    return (
        <div className="space-y-8">
            <Card>
                <h2 className="text-2xl font-bold mb-4 text-[#00ff00]">Live Transcriber</h2>
                <p className="text-[#a09cc9] mb-4">Click "Start Transcribing" and speak into your microphone. Your words will appear in real-time.</p>
                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-full font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center text-lg text-[#0d0c1c] ${
                        isRecording 
                        ? 'bg-[#ff00ff] hover:bg-[#e600e6]' 
                        : 'bg-[#00ff00] hover:bg-[#00e600]'
                    }`}
                >
                    {isRecording ? (
                        <>
                            <span className="relative flex h-3 w-3 mr-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                            </span>
                            Stop Transcribing
                        </>
                    ) : 'Start Transcribing'}
                </button>
                {error && <div className="mt-4 bg-[#ff00ff]/10 border border-[#ff00ff] text-[#f8bbd0] px-4 py-3 rounded-lg">{error}</div>}
            </Card>

            <Card className="min-h-[20rem]">
                <h3 className="text-xl font-bold mb-4 text-[#00ff00]">Transcription</h3>
                <div className="space-y-2 text-[#a09cc9]">
                    {history.map((line, index) => (
                        <p key={index}>{line}</p>
                    ))}
                    {isRecording && (
                        <p className="text-[#e0e0ff] font-semibold">
                            You: {transcription}<span className="inline-block w-2 h-4 bg-[#00ff00] animate-pulse ml-1"></span>
                        </p>
                    )}
                     {!isRecording && history.length === 0 && <p className="text-[#6a669a]">Transcription will appear here...</p>}
                </div>
            </Card>
        </div>
    );
};

export default AudioTranscriber;