"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number; // seconds
  audioLevel: number; // 0-1 (for waveform viz)
  error: string | null;
}

export interface AudioRecorderActions {
  start: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => Promise<Blob | null>;
  cancel: () => void;
}

export interface AudioChunkCallback {
  (chunk: Blob, chunkIndex: number): void;
}

interface UseAudioRecorderOptions {
  onChunk?: AudioChunkCallback; // called every ~1s with audio chunk for live transcription
  mimeType?: string;
  chunkInterval?: number; // ms between chunks (default 1000)
}

export function useAudioRecorder(options: UseAudioRecorderOptions = {}): AudioRecorderState & AudioRecorderActions {
  const {
    onChunk,
    mimeType = "audio/webm;codecs=opus",
    chunkInterval = 1000,
  } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const chunkIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const levelRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (levelRef.current) cancelAnimationFrame(levelRef.current);
    if (mediaRecorderRef.current?.state !== "inactive") {
      try { mediaRecorderRef.current?.stop(); } catch { /* ignore */ }
    }
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioContextRef.current?.close().catch(() => {});
    mediaRecorderRef.current = null;
    streamRef.current = null;
    analyserRef.current = null;
    audioContextRef.current = null;
    chunksRef.current = [];
    chunkIndexRef.current = 0;
  }, []);

  // Audio level monitor (for waveform visualization)
  const startLevelMonitor = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteTimeDomainData(dataArray);
      // Calculate RMS level
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const val = (dataArray[i] - 128) / 128;
        sum += val * val;
      }
      const rms = Math.sqrt(sum / dataArray.length);
      setAudioLevel(Math.min(1, rms * 3)); // amplify for better visual
      levelRef.current = requestAnimationFrame(tick);
    };
    tick();
  }, []);

  const start = useCallback(async () => {
    setError(null);
    chunksRef.current = [];
    chunkIndexRef.current = 0;
    setDuration(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });
      streamRef.current = stream;

      // Setup audio analyser for level monitoring
      const ctx = new AudioContext();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Determine supported mime type
      const actualMime = MediaRecorder.isTypeSupported(mimeType)
        ? mimeType
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4";

      const recorder = new MediaRecorder(stream, {
        mimeType: actualMime,
        audioBitsPerSecond: 128000,
      });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
          if (onChunk) {
            onChunk(e.data, chunkIndexRef.current++);
          }
        }
      };

      recorder.onerror = () => {
        setError("Recording failed");
        cleanup();
        setIsRecording(false);
        setIsPaused(false);
      };

      // Start recording with timeslice for chunked output
      recorder.start(chunkInterval);
      setIsRecording(true);
      setIsPaused(false);

      // Duration timer
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 200);

      // Audio level monitoring
      startLevelMonitor();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Microphone access denied";
      setError(msg.includes("Permission") || msg.includes("NotAllowed")
        ? "Microphone permission denied. Please allow microphone access."
        : `Recording error: ${msg}`);
    }
  }, [mimeType, chunkInterval, onChunk, cleanup, startLevelMonitor]);

  const pause = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (levelRef.current) cancelAnimationFrame(levelRef.current);
    }
  }, []);

  const resume = useCallback(() => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      startLevelMonitor();
    }
  }, [startLevelMonitor]);

  const stop = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        cleanup();
        setIsRecording(false);
        setIsPaused(false);
        resolve(null);
        return;
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        cleanup();
        setIsRecording(false);
        setIsPaused(false);
        setAudioLevel(0);
        resolve(blob);
      };

      recorder.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      if (levelRef.current) cancelAnimationFrame(levelRef.current);
    });
  }, [cleanup]);

  const cancel = useCallback(() => {
    cleanup();
    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
    setAudioLevel(0);
  }, [cleanup]);

  return {
    isRecording,
    isPaused,
    duration,
    audioLevel,
    error,
    start,
    pause,
    resume,
    stop,
    cancel,
  };
}

/** Format seconds as MM:SS */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
