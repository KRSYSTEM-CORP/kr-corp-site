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

// Ambient canvas behind the hero only — small numeric/currency glyphs
// drifting upward, nodding to the invoices/appointments the products
// actually track, instead of a decorative generic particle field.
export function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;

    function makeParticle(initial: boolean): Particle {
      return {
        x: Math.random() * width,
        y: initial ? Math.random() * height : height + 20,
        speed: 0.15 + Math.random() * 0.35,
        size: 12 + Math.random() * 10,
        alpha: 0.06 + Math.random() * 0.16,
        color: STOPS[Math.floor(Math.random() * STOPS.length)],
        glyph: Math.random() > 0.5 ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)] : null,
        drift: (Math.random() - 0.5) * 0.25,
      };
    }

    function resize() {
      if (!canvas) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      width = rect?.width ?? window.innerWidth;
      height = rect?.height ?? 600;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(60, Math.floor((width * height) / 12000));
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
      if (!reduce) raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", resize);
    if (reduce) {
      frame();
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-80"
    />
  );
}
