"use client";

import { useEffect, useRef } from "react";

// Fondo de galaxia: estrellas en tres capas con parallax (scroll y puntero), parpadeo, estrellas
// fugaces ocasionales y nebulosas que respiran. Con «reducir movimiento» queda quieto.
type Star = { x: number; y: number; z: number; r: number; tw: number; ph: number; hue: number; col: string };
type Shoot = { x: number; y: number; vx: number; vy: number; life: number };

export function Galaxy() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let stars: Star[] = [];
    const shoots: Shoot[] = [];
    let mx = 0;
    let my = 0;
    let raf = 0;
    let last = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(w < 768 ? 120 : 220, Math.round((w * h) / 6500));
      stars = Array.from({ length: count }, () => ({
        col: "",
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() < 0.6 ? 0.25 : Math.random() < 0.7 ? 0.6 : 1,
        r: Math.random() * 1.2 + 0.3,
        tw: Math.random() * 2 + 0.8,
        ph: Math.random() * Math.PI * 2,
        hue: [220, 260, 300, 330, 200][Math.floor(Math.random() * 5)],
      }));
      // El color se calcula una sola vez; la opacidad va por globalAlpha (sin armar cadenas por cuadro).
      for (const s of stars) s.col = `hsl(${s.hue}, 90%, ${s.z === 1 ? 92 : 80}%)`;
    };

    const draw = (t: number) => {
      if (!reduce) raf = requestAnimationFrame(draw);
      // 30 cuadros por segundo bastan para un fondo y liberan el hilo principal.
      if (!reduce && t - last < 33) return;
      const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
      last = t;
      ctx.clearRect(0, 0, w, h);
      const sy = window.scrollY;
      for (const s of stars) {
        const px = ((s.x + mx * 18 * s.z) % w + w) % w;
        const py = (((s.y - sy * 0.08 * s.z + my * 12 * s.z) % h) + h) % h;
        const a = reduce ? 0.7 : 0.45 + 0.55 * Math.sin(t / 1000 * s.tw + s.ph) ** 2;
        ctx.beginPath();
        ctx.fillStyle = s.col;
        ctx.globalAlpha = a * (0.4 + s.z * 0.6);
        ctx.arc(px, py, s.r * (0.6 + s.z * 0.7), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!reduce) {
        if (Math.random() < 0.004 && shoots.length < 2) {
          shoots.push({ x: Math.random() * w * 0.8, y: Math.random() * h * 0.5, vx: 520 + Math.random() * 260, vy: 220 + Math.random() * 160, life: 1 });
        }
        for (let i = shoots.length - 1; i >= 0; i--) {
          const s = shoots[i];
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          s.life -= dt * 1.1;
          if (s.life <= 0) {
            shoots.splice(i, 1);
            continue;
          }
          const g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 0.12, s.y - s.vy * 0.12);
          g.addColorStop(0, `rgba(255,255,255,${s.life})`);
          g.addColorStop(1, "rgba(180,76,240,0)");
          ctx.strokeStyle = g;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x - s.vx * 0.12, s.y - s.vy * 0.12);
          ctx.stroke();
        }
      }
    };

    const onMove = (e: PointerEvent) => {
      mx = e.clientX / w - 0.5;
      my = e.clientY / h - 0.5;
    };
    const onVis = () => {
      if (reduce) return;
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(draw);
    };
    document.addEventListener("visibilitychange", onVis);
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    if (reduce) {
      draw(0);
      window.addEventListener("scroll", () => draw(0), { passive: true });
    } else {
      raf = requestAnimationFrame(draw);
    }
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#03020a]">
      <div className="galaxy-nebula absolute -left-1/4 top-[-10%] h-[70vh] w-[70vw] rounded-full bg-[radial-gradient(closest-side,rgba(67,61,221,0.5),transparent)]" />
      <div className="galaxy-nebula absolute -right-1/4 top-[25%] h-[75vh] w-[65vw] rounded-full bg-[radial-gradient(closest-side,rgba(180,76,240,0.38),transparent)] [animation-delay:-6s]" />
      <div className="galaxy-nebula absolute bottom-[-20%] left-[10%] h-[65vh] w-[60vw] rounded-full bg-[radial-gradient(closest-side,rgba(226,9,140,0.3),transparent)] [animation-delay:-12s]" />
      <canvas ref={ref} className="absolute inset-0" />
    </div>
  );
}
