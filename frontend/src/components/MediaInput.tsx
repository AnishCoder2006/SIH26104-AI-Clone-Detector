'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  Mic, 
  Square, 
  Play, 
  Pause, 
  ShieldAlert, 
  Loader2, 
  FileAudio, 
  RotateCcw, 
  Volume2, 
  CheckCircle2, 
  Sparkles,
  Layers
} from 'lucide-react';
import { extractAndEncodeAudio, encodeWAV } from '../lib/audioUtils';

interface MediaInputProps {
  onAnalyze: (payload: { file: Blob; transaction_value: number; known_contact: boolean }) => Promise<void>;
  isAnalyzing: boolean;
  onMediaChange?: (hasMedia: boolean) => void;
}

export function MediaInput({ onAnalyze, isAnalyzing, onMediaChange }: MediaInputProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'record'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const recordingDataRef = useRef<Float32Array[]>([]);

  // Notify parent of media availability
  useEffect(() => {
    onMediaChange?.(Boolean(file || recordingBlob));
  }, [file, recordingBlob, onMediaChange]);

  // Clean object URLs
  useEffect(() => {
    return () => {
      if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    };
  }, [mediaUrl]);

  // Recording Timer
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) processFile(droppedFile);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) processFile(selectedFile);
  };

  const processFile = (newFile: File) => {
    setFile(newFile);
    setRecordingBlob(null);
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    setMediaUrl(URL.createObjectURL(newFile));
    setError('');
  };

  const clearPayload = () => {
    setFile(null);
    setRecordingBlob(null);
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    setMediaUrl(null);
    setIsPlaying(false);
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

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
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
        finalWavBlob = await extractAndEncodeAudio(file);
      } else {
        throw new Error('No media source');
      }

      await onAnalyze({
        file: finalWavBlob,
        transaction_value: 0,
        known_contact: false,
      });

    } catch (err) {
      console.error(err);
      setError('Failed to process media for analysis.');
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const hasPayload = Boolean(file || recordingBlob);

  return (
    <div className="relative rounded-3xl p-6 lg:p-7 bg-gradient-to-b from-[#161D2F]/95 via-[#161D2F]/85 to-[#0B0F19] border border-white/10 shadow-[0_20px_50px_rgba(11,15,25,0.85)] flex flex-col overflow-hidden transition-all">
      {/* Ambient Top Glow Line */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[1.5px] bg-gradient-to-r from-transparent via-primary/70 to-transparent rounded-full pointer-events-none" />

      {/* Card Header & Ingestion Status */}
      <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl lg:text-3xl font-cormorant font-medium text-white tracking-normal leading-tight">
              Acoustic Payload Ingestion
            </h2>
          </div>
          <p className="text-xs font-karla text-silver">
            Secure ephemeral buffer · Zero-persistence neural clone dissection
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B0F19] border border-white/10 text-[10px] font-mono text-silver shrink-0 shadow-inner">
          <span className={`w-2 h-2 rounded-full ${hasPayload ? 'bg-primary shadow-[0_0_8px_rgba(0,245,160,0.8)]' : 'bg-emerald-400 animate-pulse'}`} />
          <span className="font-semibold tracking-wider uppercase text-slate-200">
            {hasPayload ? 'Buffer Ready' : 'Vault Active'}
          </span>
        </div>
      </div>

      {/* Ingestion Mode Switcher */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#0B0F19]/90 rounded-2xl border border-white/10 mb-5 shadow-inner backdrop-blur-md">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`py-2 px-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-karla text-xs font-bold tracking-wide ${
            activeTab === 'upload'
              ? 'bg-gradient-to-r from-primary to-accent text-[#0B0F19] shadow-[0_0_15px_rgba(0,245,160,0.35)]'
              : 'text-silver hover:text-white hover:bg-white/5'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>File Ingestion</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('record')}
          className={`py-2 px-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-karla text-xs font-bold tracking-wide ${
            activeTab === 'record'
              ? 'bg-gradient-to-r from-primary to-accent text-[#0B0F19] shadow-[0_0_15px_rgba(0,245,160,0.35)]'
              : 'text-silver hover:text-white hover:bg-white/5'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Live Capture</span>
        </button>
      </div>

      {/* Main Mode Content */}
      <div className="mb-5">
        {activeTab === 'upload' ? (
          /* High-Tech Upload Zone */
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            className={`relative rounded-2xl p-7 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 border-2 border-dashed ${
              isDragging
                ? 'border-primary bg-primary/10 scale-[1.01] shadow-[0_0_30px_rgba(0,245,160,0.2)]'
                : 'border-white/15 bg-[#0B0F19]/60 hover:border-primary/60 hover:bg-[#0B0F19]/80'
            }`}
          >
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              accept="audio/*,video/*"
              onChange={handleFileInput}
            />

            {/* Glowing Icon Radar Badge */}
            <div className="relative mb-4">
              <div className="absolute -inset-2 bg-gradient-to-r from-primary/30 to-accent/30 rounded-full blur-md opacity-40 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-b from-[#161D2F] to-[#0B0F19] border border-white/15 flex items-center justify-center shadow-lg text-primary">
                <FileAudio className="w-7 h-7 drop-shadow-[0_0_8px_rgba(0,245,160,0.6)]" />
              </div>
            </div>

            <p className="text-base font-karla font-semibold text-white mb-1 tracking-wide">
              Drop Voice Payload or Browse Disk
            </p>
            <p className="text-xs font-karla text-silver mb-4 max-w-sm leading-relaxed">
              Auto-resamples to 16.0 kHz mono FP32 for neural spectral coherence & temporal feature extraction
            </p>

            {/* Codec Spec Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono font-medium text-slate-300">
                WAV · 16kHz
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono font-medium text-slate-300">
                FLAC · Lossless
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono font-medium text-slate-300">
                MP4 / MOV Extract
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono font-medium text-slate-300">
                MP3 / M4A
              </span>
            </div>
          </div>
        ) : (
          /* High-Tech Live Microphone Console */
          <div className="rounded-2xl p-7 bg-[#0B0F19]/60 border border-white/15 flex flex-col items-center justify-center text-center relative overflow-hidden">
            {!isRecording ? (
              <div className="flex flex-col items-center py-2">
                <button
                  type="button"
                  onClick={startRecording}
                  className="relative group w-20 h-20 rounded-full bg-gradient-to-b from-[#161D2F] to-[#0B0F19] border-2 border-primary/40 hover:border-primary flex items-center justify-center transition-all duration-300 shadow-[0_0_25px_rgba(0,245,160,0.2)] hover:shadow-[0_0_35px_rgba(0,245,160,0.4)] hover:scale-105 mb-4"
                >
                  <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-25" />
                  <Mic className="w-8 h-8 text-primary transition-transform group-hover:scale-110" />
                </button>
                <p className="text-sm font-karla font-semibold text-white tracking-wide">
                  Start Live Microphone Capture
                </p>
                <p className="text-xs font-karla text-silver mt-1">
                  16,000 Hz Linear PCM audio stream with zero server persistence
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center py-2 w-full">
                {/* Active Recording Pulse Indicator */}
                <div className="flex items-center gap-2.5 mb-4 px-4 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="font-mono text-xs font-bold tracking-widest uppercase">
                    CAPTURING AUDIO · {formatSeconds(recordingSeconds)}
                  </span>
                </div>

                {/* Animated Cyber Audio Visualizer */}
                <div className="flex items-center justify-center gap-1.5 h-16 w-full max-w-xs mb-6 px-4 py-2 bg-[#0B0F19] rounded-xl border border-white/10">
                  {[40, 75, 55, 90, 60, 100, 70, 85, 45, 95, 65, 80, 50, 90, 70, 60].map((height, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-gradient-to-t from-primary via-accent to-rose-400 rounded-full animate-pulse"
                      style={{
                        height: `${Math.max(20, (height * (0.4 + Math.sin(i + recordingSeconds * 4) * 0.6)))}%`,
                        animationDuration: `${0.3 + (i % 5) * 0.1}s`,
                      }}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={stopRecording}
                  className="px-6 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-karla font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(244,63,94,0.4)] flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>Stop & Commit Buffer</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payload Manifest Preview (Rendered when media exists) */}
      {hasPayload && mediaUrl && (
        <div className="mb-5 p-4 rounded-2xl bg-[#0B0F19]/90 border border-primary/30 shadow-lg relative overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                <Volume2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-karla font-bold text-white truncate">
                  {file ? file.name : `Live_Audio_Capture_${formatSeconds(recordingSeconds)}.wav`}
                </p>
                <p className="text-[10px] font-mono text-silver">
                  {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB · Auto Ingest` : '16.0 kHz Mono WAV'}
                </p>
              </div>
            </div>

            {/* Clear & Replace Action */}
            <button
              type="button"
              onClick={clearPayload}
              title="Discard & replace payload"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-silver hover:text-rose-400 border border-white/10 hover:border-rose-500/40 transition-all text-xs flex items-center gap-1 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="text-[10px] font-karla font-medium">Reset</span>
            </button>
          </div>

          {/* Interactive Player Controller */}
          <div className="flex items-center gap-3 bg-[#161D2F] p-2.5 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={togglePlayAudio}
              className="w-8 h-8 rounded-lg bg-primary hover:bg-primary/90 text-[#0B0F19] flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-sm"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            <audio
              ref={audioRef}
              src={mediaUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />

            <div className="flex-1 flex flex-col justify-center">
              <div className="h-2 rounded-full bg-[#0B0F19] border border-white/10 overflow-hidden relative">
                <div className={`h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ${isPlaying ? 'w-full animate-pulse' : 'w-1/3'}`} />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-silver mt-1">
                <span>Audio Stream Active</span>
                <span className="text-primary font-semibold">16.0 kHz Spec</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Notice */}
      {error && (
        <div className="mb-4 text-xs font-karla text-rose-300 flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary Analyze CTA Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isAnalyzing || !hasPayload}
        className="relative group w-full bg-gradient-to-r from-[#00F5A0] via-[#00F5A0] to-[#00D2FF] hover:from-[#00F5A0]/90 hover:to-[#00D2FF]/90 text-[#0B0F19] font-karla font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-[0_0_25px_rgba(0,245,160,0.3)] hover:shadow-[0_0_35px_rgba(0,245,160,0.5)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none flex items-center justify-center gap-2.5 select-none overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        
        {isAnalyzing ? (
          <span key="state-analyzing" className="inline-flex items-center justify-center gap-2 text-sm">
            <Loader2 className="w-5 h-5 animate-spin shrink-0 text-[#0B0F19]" />
            <span>Intercepting Neural Clone Artifacts...</span>
          </span>
        ) : (
          <span key="state-idle" className="inline-flex items-center justify-center gap-2 text-sm tracking-wide">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Analyze Voice Safety & Synthesis</span>
          </span>
        )}
      </button>
    </div>
  );
}
