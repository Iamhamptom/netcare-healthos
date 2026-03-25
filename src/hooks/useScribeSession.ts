"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { parseVoiceCommands } from "@/lib/scribe/voice-commands";
import type { TranscriptSegment, ScribeAnalysis, VoiceCommand, SOAPNote } from "@/lib/scribe/types";

type ScribeState = "idle" | "listening" | "paused" | "completed";

interface UseScribeSessionReturn {
  state: ScribeState;
  segments: TranscriptSegment[];
  analysis: ScribeAnalysis | null;
  voiceCommands: VoiceCommand[];
  duration: number;
  audioLevel: number;
  isAnalyzing: boolean;
  error: string | null;
  start: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => Promise<void>;
  reset: () => void;
  updateSOAP: (section: keyof SOAPNote, value: string) => void;
}

export function useScribeSession(): UseScribeSessionReturn {
  const [state, setState] = useState<ScribeState>("idle");
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [analysis, setAnalysis] = useState<ScribeAnalysis | null>(null);
  const [voiceCommands, setVoiceCommands] = useState<VoiceCommand[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chunksBuffer = useRef<Blob[]>([]);
  const wordsSinceAnalysis = useRef(0);
  const lastAnalysisTime = useRef(0);
  const sendIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptRef = useRef("");

  const recorder = useAudioRecorder({
    chunkInterval: 1000,
    onChunk: (chunk: Blob) => {
      chunksBuffer.current.push(chunk);
    },
  });

  const triggerAnalysis = useCallback(async () => {
    if (isAnalyzing || transcriptRef.current.length < 20) return;

    setIsAnalyzing(true);
    wordsSinceAnalysis.current = 0;
    lastAnalysisTime.current = Date.now();

    try {
      const res = await fetch("/api/scribe/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: transcriptRef.current }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.analysis) {
          setAnalysis(data.analysis);
        }
      }
    } catch {
      // Analysis errors are non-fatal
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing]);

  const sendChunks = useCallback(async () => {
    if (chunksBuffer.current.length === 0) return;

    const chunks = [...chunksBuffer.current];
    chunksBuffer.current = [];

    const blob = new Blob(chunks, { type: "audio/webm" });
    if (blob.size < 100) return;

    try {
      const formData = new FormData();
      formData.append("audio", blob, "chunk.webm");

      const res = await fetch("/api/scribe/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) return;
      const data = await res.json();
      const text = data.transcript || "";

      if (text && text !== "[silence]") {
        const segment: TranscriptSegment = {
          text,
          timestamp: Date.now(),
          speaker: text.startsWith("Doctor:") ? "doctor" : text.startsWith("Patient:") ? "patient" : "unknown",
        };

        setSegments(prev => [...prev, segment]);
        transcriptRef.current += (transcriptRef.current ? "\n" : "") + text;

        const commands = parseVoiceCommands(text);
        if (commands.length > 0) {
          setVoiceCommands(prev => [...prev, ...commands]);
        }

        const wordCount = text.split(/\s+/).length;
        wordsSinceAnalysis.current += wordCount;

        const timeSinceLastAnalysis = Date.now() - lastAnalysisTime.current;
        if (wordsSinceAnalysis.current >= 50 || timeSinceLastAnalysis > 30000) {
          triggerAnalysis();
        }
      }
    } catch {
      // Silently handle transcription errors during live session
    }
  }, [triggerAnalysis]);

  const start = useCallback(async () => {
    setError(null);
    setState("listening");
    chunksBuffer.current = [];
    wordsSinceAnalysis.current = 0;
    lastAnalysisTime.current = Date.now();

    await recorder.start();
    sendIntervalRef.current = setInterval(sendChunks, 5000);
  }, [recorder, sendChunks]);

  const pause = useCallback(() => {
    recorder.pause();
    setState("paused");
    sendChunks();
  }, [recorder, sendChunks]);

  const resume = useCallback(() => {
    recorder.resume();
    setState("listening");
  }, [recorder]);

  const stop = useCallback(async () => {
    if (sendIntervalRef.current) clearInterval(sendIntervalRef.current);

    await recorder.stop();
    setState("completed");

    await sendChunks();
    await triggerAnalysis();
  }, [recorder, sendChunks, triggerAnalysis]);

  const reset = useCallback(() => {
    if (sendIntervalRef.current) clearInterval(sendIntervalRef.current);
    recorder.cancel();

    setState("idle");
    setSegments([]);
    setAnalysis(null);
    setVoiceCommands([]);
    setIsAnalyzing(false);
    setError(null);
    chunksBuffer.current = [];
    transcriptRef.current = "";
    wordsSinceAnalysis.current = 0;
    lastAnalysisTime.current = 0;
  }, [recorder]);

  const updateSOAP = useCallback((section: keyof SOAPNote, value: string) => {
    setAnalysis(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        soap: { ...prev.soap, [section]: value },
      };
    });
  }, []);

  useEffect(() => {
    return () => {
      if (sendIntervalRef.current) clearInterval(sendIntervalRef.current);
    };
  }, []);

  return {
    state,
    segments,
    analysis,
    voiceCommands,
    duration: recorder.duration,
    audioLevel: recorder.audioLevel,
    isAnalyzing,
    error: error || recorder.error,
    start,
    pause,
    resume,
    stop,
    reset,
    updateSOAP,
  };
}
