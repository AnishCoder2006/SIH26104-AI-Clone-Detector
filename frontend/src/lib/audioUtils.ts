/**
 * Utility functions for extracting and encoding audio using Web Audio API.
 * The model requires uncompressed 16kHz Mono .wav audio.
 */

// Encodes Float32Array PCM data into a valid WAV file Blob
export function encodeWAV(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunksize
  view.setUint16(20, 1, true); // audio format (1 = PCM)
  view.setUint16(22, 1, true); // channels (1 = Mono)
  view.setUint32(24, sampleRate, true); // sample rate
  view.setUint32(28, sampleRate * 2, true); // byte rate (sampleRate * blockAlign)
  view.setUint16(32, 2, true); // block align (channels * bytes/sample)
  view.setUint16(34, 16, true); // bits per sample
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true); // data chunk length

  // Write PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    // 16-bit PCM
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

// Extracts audio from a File (video or audio) and converts to 16kHz Mono WAV Blob
export async function extractAndEncodeAudio(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  
  // Use 16000Hz as required by the backend ML model
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
    sampleRate: 16000,
  });

  // Decode the audio data (browser handles all supported video/audio codecs)
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  // Extract the first channel (mono)
  const pcmData = audioBuffer.getChannelData(0);
  
  // Encode back to uncompressed WAV
  const wavBlob = encodeWAV(pcmData, 16000);
  return wavBlob;
}
