import { useEffect, useRef, useState, useCallback } from 'react';

export interface LiveRiskData {
  prob: number;
  isFake: boolean;
  model: string;
}

export const useLiveDetection = (backendUrl: string, language: 'indian' | 'english' = 'indian') => {
  const [isRecording, setIsRecording] = useState(false);
  const [liveRisk, setLiveRisk] = useState<LiveRiskData | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up function to stop tracks
  const stopMicrophone = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
    setIsRecording(false);
  }, []);

  const startListening = async () => {
    try {
      const wsUrl = backendUrl.replace('http', 'ws');
      wsRef.current = new WebSocket(`${wsUrl}/ws/detect?language=${language}`);
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.status === 'success') {
          setLiveRisk({
            prob: data.synthetic_probability,
            isFake: data.alert,
            model: data.model_used
          });
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Using webm; backend sf/librosa decodes it in-memory
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(event.data);
        }
      };

      mediaRecorder.start(1000); // 1-second chunks
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access denied or error:', err);
      alert('Could not access microphone.');
    }
  };

  useEffect(() => {
    return () => stopMicrophone();
  }, [stopMicrophone]);

  return { isRecording, startListening, stopListening: stopMicrophone, liveRisk };
};