"use client";

import { useEffect, useRef } from "react";

/**
 * Ambient cursor glow — a soft radial gradient that follows the mouse.
 * Adds a premium "living" feel to the dashboard background.
 */
export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    let x = -999, y = -999;
    let cx = -999, cy = -999;
    let raf: number;

    const handleMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
    };

    const handleLeave = () => {
      x = -999;
      y = -999;
    };

    function tick() {
      cx += (x - cx) * 0.08;
      cy += (y - cy) * 0.08;
      if (glowRef.current) {
        glowRef.current.style.left = `${cx}px`;
        glowRef.current.style.top = `${cy}px`;
        glowRef.current.style.opacity = x < 0 ? "0" : "1";
      }
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", handleLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="cursor-glow"
      aria-hidden="true"
    />
  );
}
