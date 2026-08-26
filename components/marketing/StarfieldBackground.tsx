"use client";

import { useEffect, useRef } from "react";

type Star = { x: number; y: number; z: number; tw: number };

const BACKGROUND = "#0a0912";
const STAR_COLOR = "#e7e2ff";
const STAR_COUNT = 420;
const SPEED = 0.6;
const SPREAD = 5;
const FOCAL = 2;
const TWINKLE = 0.3;
const TRAIL = 0.85;
const SIZE = 1.4;
const FADE_IN_RANGE = 4;

// Ported from the Framer canvas component at framer.com/m/Stars-Galaxy —
// same drifting-starfield math, but as plain canvas code with no Framer
// runtime dependency, and re-tuned to the site's own dark-violet
// background/star color so it sits correctly *behind* AmbientBackground's
// gradient blobs instead of painting over them with stock black.
export function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let raf = 0;
    let running = !reduce;
    const mouse = { x: 0.5, y: 0.5 };
    let stars: Star[] = [];

    function createStar(): Star {
      return {
        x: (Math.random() - 0.5) * SPREAD,
        y: (Math.random() - 0.5) * SPREAD,
        z: Math.random(),
        tw: Math.random() * Math.PI * 2,
      };
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width * DPR;
      canvas!.height = height * DPR;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
      stars = Array.from({ length: STAR_COUNT }, createStar);
      // Pre-fill once so a reduced-motion single frame (or a mid-animation
      // resize) never shows a transparent flash before the trail-fade loop
      // has painted enough frames to reach full opacity on its own.
      ctx!.globalAlpha = 1;
      ctx!.fillStyle = BACKGROUND;
      ctx!.fillRect(0, 0, width, height);
    }

    function onMouseMove(e: MouseEvent) {
      mouse.x = Math.min(1, Math.max(0, e.clientX / width));
      mouse.y = Math.min(1, Math.max(0, e.clientY / height));
    }

    function frame() {
      ctx!.globalAlpha = TRAIL < 1 ? 1 - TRAIL : 1;
      ctx!.fillStyle = BACKGROUND;
      ctx!.fillRect(0, 0, width, height);
      ctx!.globalAlpha = 1;
      ctx!.fillStyle = STAR_COLOR;

      const cx = mouse.x * width;
      const cy = mouse.y * height;

      for (const s of stars) {
        const depth = s.z * FOCAL + 0.001;
        const px = cx + (s.x / depth) * width;
        const py = cy + (s.y / depth) * height;
        s.z -= SPEED * 0.002;
        if (s.z <= 0 || s.z > 1) Object.assign(s, createStar());
        s.tw += TWINKLE * 0.05;
        const alpha = Math.max(0, 1 - s.z / FADE_IN_RANGE);
        const radius = SIZE * (1 - s.z) * (1 + Math.sin(s.tw) * TWINKLE);
        ctx!.globalAlpha = alpha;
        ctx!.beginPath();
        ctx!.arc(px, py, radius, 0, Math.PI * 2);
        ctx!.fill();
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
    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("visibilitychange", handleVisibility);
    frame();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 -z-20" aria-hidden="true" />;
}
