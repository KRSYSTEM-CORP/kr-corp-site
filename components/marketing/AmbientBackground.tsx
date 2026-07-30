"use client";

import { useEffect, useRef } from "react";

const STOPS = ["#433DDD", "#7E2AC0", "#E2098C"];
const GLYPHS = ["01", "04.82", "$", "IVA", "1024", "Bs", "€", "032", "§"];

type Particle = {
  x: number;
  y: number;
  speed: number;
  size: number;
  alpha: number;
  color: string;
  glyph: string | null;
  drift: number;
};

// Ambient field pinned behind the entire page (not just the hero), so the
// brand gradient and product glyphs stay present while scrolling instead of
// disappearing after the first section. Deliberately lightweight: capped
// DPR, a small particle budget, and a paused loop off-screen/off-tab, since
// this sits behind every single frame of scroll on the whole site.
export function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let raf = 0;
    let running = !reduce;

    function makeParticle(initial: boolean): Particle {
      return {
        x: Math.random() * width,
        y: initial ? Math.random() * height : height + 20,
        speed: 0.05 + Math.random() * 0.1,
        size: 11 + Math.random() * 9,
        alpha: 0.03 + Math.random() * 0.05,
        color: STOPS[Math.floor(Math.random() * STOPS.length)],
        glyph: Math.random() > 0.45 ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)] : null,
        drift: (Math.random() - 0.5) * 0.12,
      };
    }

    function resize() {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      // Ambient decoration doesn't need retina sharpness — capping DPR at 1
      // keeps the fill-rate cost of every frame low on high-density screens.
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const count = Math.min(22, Math.floor((width * height) / 55000));
      particles = Array.from({ length: count }, () => makeParticle(true));
    }

    function frame() {
      ctx!.clearRect(0, 0, width, height);
      for (const p of particles) {
        ctx!.globalAlpha = p.alpha;
        ctx!.fillStyle = p.color;
        if (p.glyph) {
          ctx!.font = `600 ${p.size}px ui-monospace, Menlo, monospace`;
          ctx!.fillText(p.glyph, p.x, p.y);
        } else {
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.size / 7, 0, Math.PI * 2);
          ctx!.fill();
        }
        p.y -= p.speed;
        p.x += p.drift;
        if (p.y < -20) Object.assign(p, makeParticle(false));
      }
      ctx!.globalAlpha = 1;
      if (running) raf = requestAnimationFrame(frame);
    }

    function handleVisibility() {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!reduce) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    }

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", handleVisibility);
    if (reduce) {
      frame();
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="ambient-blob ambient-blob-1" />
      <div className="ambient-blob ambient-blob-2" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-70" />
    </div>
  );
}
