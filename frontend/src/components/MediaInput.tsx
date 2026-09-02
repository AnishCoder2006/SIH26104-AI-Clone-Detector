'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Mic, Square, Play, ShieldAlert, DollarSign, Loader2 } from 'lucide-react';
import { extractAndEncodeAudio, encodeWAV } from '../lib/audioUtils';

interface MediaInputProps {
  onAnalyze: (payload: { file: Blob; transaction_value: number; known_contact: boolean }) => Promise<void>;
  isAnalyzing: boolean;
}

export function MediaInput({ onAnalyze, isAnalyzing }: MediaInputProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  
  const [transactionValue, setTransactionValue] = useState<string>('');
  const [knownContact, setKnownContact] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const recordingDataRef = useRef<Float32Array[]>([]);

  // Cleanup URLs
  useEffect(() => {
    return () => {
      if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    };
  }, [mediaUrl]);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) processFile(droppedFile);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) processFile(selectedFile);
  };

  const processFile = (newFile: File) => {
    const validTypes = ['audio/wav', 'audio/flac', 'video/mp4', 'video/quicktime', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/webm'];
    // We are flexible on MIME since we decode it anyway, but let's check extension roughly
    setFile(newFile);
    setRecordingBlob(null);
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    setMediaUrl(URL.createObjectURL(newFile));
    setError('');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const processor = ctx.createScriptProcessor(4096, 1, 1);
      
      processorRef.current = processor;
      recordingDataRef.current = [];

      processor.onaudioprocess = (e) => {
        const channelData = e.inputBuffer.getChannelData(0);
        recordingDataRef.current.push(new Float32Array(channelData));
      };

      source.connect(processor);
      processor.connect(ctx.destination);
      
      setFile(null);
      if (mediaUrl) URL.revokeObjectURL(mediaUrl);
      setMediaUrl(null);
      setIsRecording(true);
      setError('');
    } catch (err) {
      setError('Microphone access denied or unavailable.');
    }
  };

  const stopRecording = () => {
    if (!isRecording) return;
    
    if (processorRef.current && audioContextRef.current) {
      processorRef.current.disconnect();
      const source = audioContextRef.current.createBufferSource();
      source.disconnect();
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }

    // Flatten chunks
    const chunks = recordingDataRef.current;
    const length = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const flatData = new Float32Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      flatData.set(chunk, offset);
      offset += chunk.length;
    }

    const wavBlob = encodeWAV(flatData, 16000);
    setRecordingBlob(wavBlob);
    setMediaUrl(URL.createObjectURL(wavBlob));
    setIsRecording(false);
  };

  const handleSubmit = async () => {
    if (!file && !recordingBlob) {
      setError('Please provide an audio/video file or record a sample.');
      return;
    }

    setError('');
    try {
      let finalWavBlob: Blob;
      
      if (recordingBlob) {
        finalWavBlob = recordingBlob;
      } else if (file) {
        // Extract and encode from file (Video/Audio) using Web Audio API
        finalWavBlob = await extractAndEncodeAudio(file);
      } else {
        throw new Error('No media source');
      }

      await onAnalyze({
        file: finalWavBlob,
        transaction_value: parseFloat(transactionValue) || 0,
        known_contact: knownContact
      });

    } catch (err) {
      console.error(err);
      setError('Failed to process media for analysis.');
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col h-full">
      <h2 className="text-xl font-bold font-serif mb-6">Media Input</h2>
      
      {/* Upload Zone */}
      <div 
        className="border-2 border-dashed border-white/10 rounded-xl p-8 mb-6 flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors bg-white/5 cursor-pointer relative"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFileDrop}
      >
        <input 
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          accept="audio/*,video/*"
          onChange={handleFileInput}
        />
        <UploadCloud className="w-10 h-10 text-slate-500 mb-3" />
        <p className="text-sm font-medium text-slate-300">Drag & drop Media File</p>
        <p className="text-xs text-slate-500 mt-1">Supports WAV, FLAC, MP4, MOV</p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="h-px bg-white/10 flex-1" />
        <span className="text-xs text-slate-500 font-medium">OR</span>
        <div className="h-px bg-white/10 flex-1" />
      </div>

      {/* Mic Recorder */}
      <div className="flex justify-center mb-8">
        {!isRecording ? (
          <button 
            onClick={startRecording}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full py-2.5 px-6 transition-all"
          >
            <Mic className="w-5 h-5 text-accent" />
            <span className="text-sm font-medium">Start Live Recording</span>
          </button>
        ) : (
          <button 
            onClick={stopRecording}
            className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-full py-2.5 px-6 transition-all relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-red-500/20 animate-pulse" />
            <Square className="w-4 h-4 text-red-400 fill-red-400 z-10" />
            <span className="text-sm font-medium text-red-100 z-10">Stop Recording</span>
            
            {/* Simple CSS Visualizer */}
            <div className="flex items-end gap-1 h-4 ml-2 z-10">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-1 bg-red-400 animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDuration: `${0.2 + Math.random() * 0.3}s` }} />
              ))}
            </div>
          </button>
        )}
      </div>

      {/* Dynamic Player */}
      {mediaUrl && (
        <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs text-slate-400 mb-2 truncate">
            {file ? `File: ${file.name}` : 'Recorded Audio'}
          </p>
          {file && file.type.startsWith('video/') ? (
            <video src={mediaUrl} controls className="w-full rounded bg-black max-h-40" />
          ) : (
            <audio src={mediaUrl} controls className="w-full h-10" />
          )}
        </div>
      )}

      {/* Metadata Inputs */}
      <div className="space-y-4 mb-8 mt-auto">
        <div>
          <label className="block font-mono text-[11px] tracking-[0.15em] text-slate-400 uppercase mb-2">Transaction Amount (USD)</label>
          <div className="relative group">
            <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
            <input
              type="number"
              value={transactionValue}
              onChange={(e) => setTransactionValue(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-base font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-100 transition-all placeholder:text-slate-600"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <label className="flex items-center gap-4 cursor-pointer group w-fit mt-6">
          <div className="relative inline-flex items-center">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={knownContact}
              onChange={(e) => setKnownContact(e.target.checked)}
            />
            <div className="w-11 h-6 bg-white/10 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/50 peer-checked:bg-primary transition-colors duration-300 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform peer-checked:after:translate-x-full shadow-inner"></div>
          </div>
          <span className="font-mono text-xs tracking-[0.15em] text-slate-400 uppercase group-hover:text-slate-300 transition-colors">Known Contact Identity</span>
        </label>
      </div>

      {error && (
        <div className="mb-4 text-xs text-red-400 flex items-center gap-1.5 bg-red-400/10 p-2 rounded">
          <ShieldAlert className="w-4 h-4" />
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isAnalyzing || (!file && !recordingBlob)}
        className="w-full bg-primary hover:bg-primary/90 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(0,255,204,0.2)] hover:shadow-[0_0_30px_rgba(0,255,204,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 select-none"
      >
        {isAnalyzing ? (
          <span key="state-analyzing" className="inline-flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin shrink-0 text-slate-950" />
            <span>Analyzing Voice Safety...</span>
          </span>
        ) : (
          <span key="state-idle" className="inline-flex items-center justify-center gap-2">
            <ShieldAlert className="w-5 h-5 shrink-0 text-slate-950" />
            <span>Analyze Voice Safety</span>
          </span>
        )}
      </button>
    </div>
  );
}
