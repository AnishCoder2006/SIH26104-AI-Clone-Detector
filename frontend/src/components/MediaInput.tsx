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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
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
    setCurrentTime(0);
    setDuration(0);
    setError('');
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetTime = pos * duration;
    audioRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const formatAudioTime = (sec: number) => {
    if (!sec || isNaN(sec) || sec <= 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
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
    <div className="relative rounded-2xl p-6 lg:p-8 bg-gradient-to-b from-[#161D2F]/95 via-[#161D2F]/85 to-[#0B0F19] border border-white/10 shadow-[0_20px_50px_rgba(11,15,25,0.85)] flex flex-col overflow-hidden transition-all">
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


      </div>

      {/* Ingestion Mode Switcher */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#0B0F19]/90 rounded-xl border border-white/10 mb-5 shadow-inner backdrop-blur-md">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-karla text-xs font-bold tracking-wide ${
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
          className={`py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-karla text-xs font-bold tracking-wide ${
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
            className={`relative rounded-xl p-7 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 border-2 border-dashed ${
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
          <div className="rounded-xl p-7 bg-[#0B0F19]/60 border border-white/15 flex flex-col items-center justify-center text-center relative overflow-hidden">
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

      {/* Payload Manifest Preview (Redesigned Cyber Audio Module) */}
      {hasPayload && mediaUrl && (
        <div className="mb-5 rounded-xl p-4 bg-gradient-to-b from-[#141B2D] via-[#101726] to-[#0B0F19] border border-[#00D2FF]/25 shadow-[0_10px_35px_rgba(0,0,0,0.7),0_0_25px_rgba(0,245,160,0.08)] relative overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Subtle Top Glowing Cyber Accent */}
          <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-primary/60 to-transparent pointer-events-none" />

          {/* Top Metadata Header */}
          <div className="flex items-center justify-between gap-3 mb-3.5">
            <div className="flex items-center gap-3 min-w-0">
              {/* Animated Wave Icon Orb */}
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 via-[#161D2F] to-[#0B0F19] border border-primary/40 flex items-center justify-center text-primary shadow-[0_0_12px_rgba(0,245,160,0.2)] shrink-0">
                <Volume2 className={`w-4 h-4 ${isPlaying ? 'text-primary' : 'text-primary'}`} />
                {isPlaying && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary animate-ping" />
                )}
              </div>

              {/* Title & Technical Metadata */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-karla font-bold text-sm text-white truncate tracking-wide">
                    {file ? file.name : `Live_Audio_Capture_${formatSeconds(recordingSeconds)}.wav`}
                  </p>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30 uppercase font-semibold shrink-0">
                    <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                    Buffered
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-silver mt-0.5">
                  <span className="text-slate-300 font-medium">16.0 kHz Mono</span>
                  <span>•</span>
                  <span>{file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'Linear PCM'}</span>
                  <span className="hidden md:inline">•</span>
                  <span className="hidden md:inline text-accent font-semibold">Verified Spec</span>
                </div>
              </div>
            </div>

            {/* Reset / Discard Pill */}
            <button
              type="button"
              onClick={clearPayload}
              title="Discard and select new media"
              className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-rose-500/15 border border-white/10 hover:border-rose-500/40 text-silver hover:text-rose-400 transition-all text-xs font-karla font-semibold flex items-center gap-1.5 shadow-sm shrink-0 group"
            >
              <RotateCcw className="w-3.5 h-3.5 transition-transform group-hover:-rotate-90 duration-200" />
              <span>Reset</span>
            </button>
          </div>

          {/* Interactive Player Console */}
          <div className="bg-[#0B0F19]/90 p-3 rounded-xl border border-white/[0.08] shadow-inner flex items-center gap-3.5">
            {/* Play/Pause Cyber Dial */}
            <button
              type="button"
              onClick={togglePlayAudio}
              className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-[#0B0F19] flex items-center justify-center shrink-0 transition-all duration-200 shadow-[0_0_16px_rgba(0,245,160,0.35)] hover:scale-105 active:scale-95"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <audio
              ref={audioRef}
              src={mediaUrl}
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              onEnded={() => { setIsPlaying(false); setCurrentTime(0); }}
              className="hidden"
            />

            {/* Waveform Scrubber & Telemetry Data */}
            <div className="flex-1 flex flex-col justify-center gap-1.5">
              {/* Timeline Header */}
              <div className="flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-200 tracking-wider">
                    {formatAudioTime(currentTime)}
                  </span>
                  <span className="text-slate-500">/</span>
                  <span className="text-silver">
                    {formatAudioTime(duration || (file ? 0 : recordingSeconds))}
                  </span>

                  {/* Dancing EQ Bars while playing */}
                  {isPlaying && (
                    <div className="flex items-end gap-0.5 h-3 ml-2">
                      {[60, 100, 40, 80, 50, 90].map((h, i) => (
                        <div
                          key={i}
                          className="w-1 bg-primary rounded-full animate-pulse"
                          style={{ height: `${h}%`, animationDuration: `${0.2 + (i % 3) * 0.1}s` }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="text-accent font-semibold">16.0 kHz Spec</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-silver font-medium">Float32</span>
                </div>
              </div>

              {/* Clickable Seekable Audio Scrubber Track */}
              <div
                onClick={handleSeek}
                className="h-2 rounded-full bg-[#161D2F] border border-white/10 relative overflow-hidden cursor-pointer group/scrub"
              >
                {/* Background Guide Bars */}
                <div className="absolute inset-0 flex items-center justify-between px-1 opacity-20 pointer-events-none">
                  {[...Array(24)].map((_, i) => (
                    <div key={i} className="w-[1px] h-full bg-white" />
                  ))}
                </div>

                {/* Progress Bar with Glow Head */}
                <div
                  className="h-full bg-gradient-to-r from-primary via-primary to-accent transition-all duration-100 rounded-full relative"
                  style={{
                    width: duration > 0 ? `${Math.min(100, (currentTime / duration) * 100)}%` : isPlaying ? '100%' : '0%',
                  }}
                >
                  <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full shadow-[0_0_8px_#ffffff]" />
                </div>
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
        className="relative group w-full bg-gradient-to-r from-[#00F5A0] via-[#00F5A0] to-[#00D2FF] hover:from-[#00F5A0]/90 hover:to-[#00D2FF]/90 text-[#0B0F19] font-karla font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-[0_0_25px_rgba(0,245,160,0.3)] hover:shadow-[0_0_35px_rgba(0,245,160,0.5)] hover:scale-[1.005] active:scale-[0.995] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none flex items-center justify-center gap-2.5 select-none overflow-hidden"
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
