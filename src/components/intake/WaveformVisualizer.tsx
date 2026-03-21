"use client";

import { useRef, useEffect } from "react";

interface Props {
  audioLevel: number; // 0-1
  isRecording: boolean;
  isPaused: boolean;
  barCount?: number;
  color?: string;
}

export default function WaveformVisualizer({
  audioLevel,
  isRecording,
  isPaused,
  barCount = 48,
  color = "var(--brand-primary, #3DA9D1)",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barsRef = useRef<number[]>(Array(barCount).fill(0.05));
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const bars = barsRef.current;
      const barWidth = width / barCount;
      const gap = 2;

      // Shift bars left and add new value on right
      for (let i = 0; i < bars.length - 1; i++) {
        bars[i] = bars[i + 1];
      }

      if (isRecording && !isPaused) {
        // Add some randomness for organic feel
        const jitter = Math.random() * 0.15;
        bars[bars.length - 1] = Math.max(0.05, Math.min(1, audioLevel + jitter));
      } else {
        // Decay to baseline
        bars[bars.length - 1] = Math.max(0.05, bars[bars.length - 1] * 0.85);
      }

      // Draw bars
      for (let i = 0; i < bars.length; i++) {
        const x = i * barWidth + gap / 2;
        const barH = bars[i] * height * 0.9;
        const y = (height - barH) / 2;

        ctx.fillStyle = color;
        ctx.globalAlpha = 0.3 + bars[i] * 0.7;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth - gap, barH, 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [audioLevel, isRecording, isPaused, barCount, color]);

  return (
    <canvas
      ref={canvasRef}
      width={480}
      height={80}
      className="w-full h-20 rounded-xl"
      style={{ imageRendering: "auto" }}
    />
  );
}
