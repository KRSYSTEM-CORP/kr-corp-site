"use client";

import { startTransition, useEffect, useId, useMemo, useRef, useState } from "react";
import { motion, useInView, type Transition } from "framer-motion";

// Ported from the Framer component at framer.com/m/TextMotion (by
// KollinaStudio) — same 37-preset text-reveal engine (transform recipes plus
// scramble/type/liquid/dissolve/melt/chroma/shine/neon/wipe), stripped of
// the Framer canvas machinery (property controls, demo panel, static-
// renderer special-casing) that has no meaning outside their editor.

type Preset =
  | "fade" | "rise" | "drop" | "slide"
  | "split" | "blur" | "focus"
  | "mask" | "curtain" | "unfold" | "wipe" | "roll"
  | "pop" | "punch" | "zoom" | "shrink" | "stretch"
  | "flip" | "swivel" | "tilt" | "spin" | "shear"
  | "glitch" | "wave" | "cascade" | "scatter"
  | "scramble" | "type" | "liquid" | "dissolve" | "chroma" | "shine" | "neon"
  | "explode" | "vortex" | "warp" | "melt";

type Recipe = {
  splitBy: "word" | "character" | "line";
  effect: "transform" | "scramble" | "type" | "liquid" | "dissolve" | "melt" | "chroma" | "shine" | "neon" | "wipe";
  amount: number;
  detail: number;
  settle: number;
  chaos: number;
  z: number;
  x: number;
  y: number;
  opacity: number;
  blur: number;
  scale: number;
  scaleX: number;
  scaleY: number;
  rotate: number;
  rotateX: number;
  rotateY: number;
  skewX: number;
  origin: "center" | "top" | "bottom" | "left" | "right";
  clip: boolean;
  order: "forward" | "reverse" | "center" | "random";
  duration: number;
  stagger: number;
  easing: "spring" | "bounce" | "smooth" | "snappy" | "gentle";
};

const BASE: Recipe = {
  splitBy: "word", effect: "transform", amount: 0, detail: 10, settle: 1.8, chaos: 0,
  z: 0, x: 0, y: 0, opacity: 0, blur: 0, scale: 1, scaleX: 1, scaleY: 1,
  rotate: 0, rotateX: 0, rotateY: 0, skewX: 0, origin: "center", clip: false,
  order: "forward", duration: 0.7, stagger: 0.03, easing: "smooth",
};

const PRESETS: Record<Preset, Partial<Recipe>> = {
  fade: { y: 18, duration: 0.6, stagger: 0.04 },
  rise: { splitBy: "line", y: 80, duration: 0.8, stagger: 0.12, easing: "spring" },
  drop: { splitBy: "character", y: -60, duration: 0.7, stagger: 0.02, easing: "spring" },
  slide: { x: -60, duration: 0.7, stagger: 0.05 },
  split: { splitBy: "character", y: 48, blur: 8, duration: 0.7, stagger: 0.02, easing: "spring" },
  blur: { blur: 14, duration: 0.9, stagger: 0.06 },
  focus: { splitBy: "character", blur: 18, scale: 1.15, duration: 0.8, stagger: 0.02 },
  mask: { splitBy: "line", clip: true, y: 100, duration: 0.9, stagger: 0.12, easing: "snappy" },
  curtain: { clip: true, y: 100, duration: 0.7, stagger: 0.05, easing: "snappy" },
  unfold: { splitBy: "line", rotateX: -80, origin: "top", duration: 0.9, stagger: 0.1, easing: "gentle" },
  wipe: { splitBy: "line", effect: "wipe", amount: 22, opacity: 1, duration: 0.9, stagger: 0.12, easing: "snappy" },
  roll: { splitBy: "character", clip: true, y: 100, rotateX: -90, origin: "bottom", duration: 0.7, stagger: 0.03, easing: "snappy" },
  pop: { splitBy: "character", scale: 0.4, duration: 0.6, stagger: 0.025, easing: "snappy" },
  punch: { splitBy: "line", scale: 0.8, y: 20, duration: 0.5, stagger: 0.08, easing: "bounce" },
  zoom: { splitBy: "line", scale: 1.6, blur: 10, duration: 0.9, stagger: 0.1 },
  shrink: { splitBy: "character", scale: 2.2, duration: 0.6, stagger: 0.02, easing: "snappy" },
  stretch: { splitBy: "character", scaleX: 0.3, scaleY: 1.8, duration: 0.7, stagger: 0.025, easing: "spring" },
  flip: { rotateX: 90, duration: 0.8, stagger: 0.06, easing: "gentle" },
  swivel: { rotateY: 90, duration: 0.8, stagger: 0.06, easing: "gentle" },
  tilt: { splitBy: "character", rotate: -12, y: 30, duration: 0.7, stagger: 0.025, easing: "spring" },
  spin: { splitBy: "character", rotate: 180, scale: 0.5, duration: 0.7, stagger: 0.03, easing: "snappy" },
  shear: { skewX: 20, x: 30, duration: 0.6, stagger: 0.05, easing: "snappy" },
  glitch: { splitBy: "character", x: 14, skewX: -18, duration: 0.35, stagger: 0.012, easing: "snappy", order: "random" },
  wave: { splitBy: "character", y: 30, duration: 0.7, stagger: 0.035, easing: "spring", order: "center" },
  cascade: { splitBy: "character", y: 40, duration: 0.7, stagger: 0.025, order: "reverse" },
  scatter: { splitBy: "character", y: 40, x: 20, rotate: 20, duration: 0.8, stagger: 0.03, easing: "spring", order: "random" },
  scramble: { splitBy: "character", effect: "scramble", opacity: 1, duration: 0.4, stagger: 0.035 },
  type: { splitBy: "character", effect: "type", opacity: 1, duration: 0.01, stagger: 0.045 },
  liquid: { splitBy: "line", effect: "liquid", amount: 70, detail: 10, settle: 1.3, duration: 2.4, stagger: 0.18 },
  dissolve: { effect: "dissolve", amount: 150, detail: 76, settle: 2.2, duration: 1.2, stagger: 0.06 },
  chroma: { splitBy: "character", effect: "chroma", amount: 14, duration: 0.7, stagger: 0.02, easing: "snappy" },
  shine: { splitBy: "character", effect: "shine", amount: 2.8, duration: 0.5, stagger: 0.03 },
  neon: { effect: "neon", amount: 18, duration: 0.9, stagger: 0.07 },
  explode: { splitBy: "character", chaos: 1, scale: 0.3, blur: 4, duration: 1.1, stagger: 0.015, easing: "spring", order: "random" },
  vortex: { splitBy: "character", chaos: 0.55, rotate: 720, scale: 0, duration: 1.2, stagger: 0.03, easing: "spring" },
  warp: { z: -900, rotateY: 65, blur: 12, duration: 1, stagger: 0.08, origin: "left" },
  melt: { splitBy: "line", effect: "melt", amount: 95, detail: 6, settle: 1.2, duration: 2.3, stagger: 0.15 },
};

const EASING: Record<Recipe["easing"], Transition> = {
  spring: { type: "spring", bounce: 0 },
  bounce: { type: "spring", bounce: 0.55 },
  smooth: { ease: [0.22, 1, 0.36, 1] },
  snappy: { ease: [0.16, 1, 0.3, 1] },
  gentle: { ease: [0.4, 0, 0.2, 1] },
};

const ORIGIN: Record<Recipe["origin"], string> = {
  center: "50% 50%", top: "50% 0%", bottom: "50% 100%", left: "0% 50%", right: "100% 50%",
};

const SCRAMBLE_GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@$*<>/\\[]{}";

function tokenize(text: string, splitBy: Recipe["splitBy"]) {
  const lines = text.split("\n");
  if (splitBy === "line") return lines.map((line) => [line]);
  return lines.map((line) => line.split(/(\s+)/).filter((t) => t.length > 0));
}

function pseudoRandom(n: number) {
  const x = Math.sin((n + 1) * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function staggerIndex(i: number, total: number, order: Recipe["order"]) {
  switch (order) {
    case "reverse": return total - 1 - i;
    case "center": return Math.abs(i - (total - 1) / 2);
    case "random": return pseudoRandom(i) * total;
    default: return i;
  }
}

const usesTurbulenceEffect = (e: Recipe["effect"]) => e === "liquid" || e === "dissolve" || e === "melt";

function detailToFrequency(detail: number, effect: Recipe["effect"]) {
  const f = Math.max(Math.pow(detail / 100, 2) * 1.2, 5e-4);
  if (effect === "liquid") return `${f.toFixed(4)} ${(f * 1.8).toFixed(4)}`;
  if (effect === "melt") return `${(f * 0.25).toFixed(4)} ${(f * 6).toFixed(4)}`;
  return `${f.toFixed(4)} ${f.toFixed(4)}`;
}

function filterString(blurPx: number, brightness: number, glowPx: number, glowColor: string) {
  return `blur(${blurPx}px) brightness(${brightness}) drop-shadow(0 0 ${glowPx}px ${glowColor})`;
}

function chromaShadow(offset: number, alpha: number) {
  return `${offset}px 0 0 rgba(255,0,80,${alpha}), ${-offset}px 0 0 rgba(0,255,255,${alpha})`;
}

function wipeClip(progress: number, skew: number) {
  return progress === 0
    ? `polygon(0% 0%, 0% 0%, ${-skew}% 100%, 0% 100%)`
    : `polygon(0% 0%, ${100 + skew}% 0%, 100% 100%, 0% 100%)`;
}

export function TextMotion({
  text,
  preset,
  delay = 0,
  trigger = "onView",
  threshold = 0.4,
  replay = false,
  intensity = 1,
  className = "",
  decorative = false,
}: {
  text: string;
  preset: Preset;
  delay?: number;
  trigger?: "onView" | "onMount" | "hover";
  threshold?: number;
  replay?: boolean;
  intensity?: number;
  className?: string;
  /** Set when a visible sibling (e.g. an aria-label'd heading) already carries the real text for screen readers. */
  decorative?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const inView = useInView(ref, { amount: threshold, once: !replay });
  const filterId = `tm-${useId().replace(/:/g, "")}`;
  const displaceRef = useRef<SVGFEDisplacementMapElement>(null);

  const m = useMemo<Recipe>(() => {
    const base = { ...BASE, ...PRESETS[preset] };
    const ratio = (v: number) => 1 + (v - 1) * intensity;
    return {
      ...base,
      amount: base.amount * intensity,
      chaos: base.chaos * intensity,
      z: base.z * intensity,
      x: base.x * intensity,
      y: base.y * intensity,
      blur: base.blur * intensity,
      scale: ratio(base.scale),
      scaleX: ratio(base.scaleX),
      scaleY: ratio(base.scaleY),
      rotate: base.rotate * intensity,
      rotateX: base.rotateX * intensity,
      rotateY: base.rotateY * intensity,
      skewX: base.skewX * intensity,
    };
  }, [preset, intensity]);

  const lines = useMemo(() => tokenize(text, m.splitBy), [text, m.splitBy]);

  const indexed = useMemo(() => {
    let i = 0;
    return lines.map((units) =>
      units.map((unit) => {
        const isSpace = /^\s+$/.test(unit);
        if (isSpace) return { unit, index: -1, isSpace, chars: null as { c: string; index: number }[] | null };
        if (m.splitBy === "character") {
          return { unit, index: -1, isSpace, chars: Array.from(unit).map((c) => ({ c, index: i++ })) };
        }
        return { unit, index: i++, isSpace, chars: null };
      })
    );
  }, [lines, m.splitBy]);

  const totalUnits = useMemo(() => {
    let n = 0;
    for (const units of indexed) {
      for (const u of units) {
        if (u.isSpace) continue;
        n += u.chars ? u.chars.length : 1;
      }
    }
    return Math.max(n, 1);
  }, [indexed]);

  const playing = trigger === "onMount" || (trigger === "onView" && inView) || (trigger === "hover" && hovered);

  const usesClock = m.effect === "scramble" || m.effect === "type" || usesTurbulenceEffect(m.effect);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!usesClock || !playing) return;
    const start = performance.now();
    let raf = 0;
    const total = delay + m.duration + m.stagger * totalUnits;
    const step = () => {
      const t = (performance.now() - start) / 1000;
      if (displaceRef.current) {
        const p = Math.min(t / Math.max(total, 0.01), 1);
        const eased = Math.pow(1 - p, m.settle);
        displaceRef.current.setAttribute("scale", String(m.amount * eased));
      }
      setElapsed(t);
      if (t < total + 0.1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [usesClock, playing, delay, m.duration, m.stagger, m.amount, m.settle, totalUnits]);

  const isChroma = m.effect === "chroma";
  const isShine = m.effect === "shine";
  const isNeon = m.effect === "neon";
  const isWipe = m.effect === "wipe";
  const glowColor = "currentColor";
  const spread = (seed: number, salt: number) => (pseudoRandom(seed * 3 + salt) - 0.5) * 2;

  const variants = {
    hidden: ({ seed }: { seed: number }) => ({
      opacity: m.opacity,
      x: m.x + (m.chaos && !m.clip ? spread(seed, 1) * m.chaos * 240 : 0),
      y: m.clip ? `${m.y}%` : m.y + (m.chaos ? spread(seed, 2) * m.chaos * 200 : 0),
      z: m.z,
      scale: m.scale,
      scaleX: m.scaleX,
      scaleY: m.scaleY,
      rotate: m.rotate + (m.chaos ? spread(seed, 3) * m.chaos * 160 : 0),
      rotateX: m.rotateX,
      rotateY: m.rotateY,
      skewX: m.skewX,
      transformPerspective: 800,
      filter: filterString(m.blur, isShine ? m.amount : 1, isNeon ? m.amount : 0, glowColor),
      ...(isChroma ? { textShadow: chromaShadow(m.amount, 0.9) } : null),
      ...(isWipe ? { clipPath: wipeClip(0, m.amount) } : null),
    }),
    visible: ({ i }: { i: number }) => ({
      opacity: 1, x: 0, y: m.clip ? "0%" : 0, z: 0, scale: 1, scaleX: 1, scaleY: 1,
      rotate: 0, rotateX: 0, rotateY: 0, skewX: 0, transformPerspective: 800,
      filter: filterString(0, 1, 0, glowColor),
      ...(isChroma ? { textShadow: chromaShadow(0, 0) } : null),
      ...(isWipe ? { clipPath: wipeClip(1, m.amount) } : null),
      transition: { ...EASING[m.easing], duration: m.duration, delay: delay + i * m.stagger },
    }),
  };

  const tokenStyle = { display: "inline-block", transformOrigin: ORIGIN[m.origin], willChange: "transform, filter, opacity" };
  const clipStyle = { display: "inline-block", overflow: "hidden", verticalAlign: "bottom", paddingBottom: "0.15em", marginBottom: "-0.15em" };
  const usesTurbulence = usesTurbulenceEffect(m.effect);
  const turbulenceWrapStyle = usesTurbulence ? { filter: `url(#${filterId})`, willChange: "filter" } : {};
  const isScramble = m.effect === "scramble";
  const isType = m.effect === "type";

  const contentFor = (content: string, orderIdx: number) => {
    if (!isScramble && !isType) return content;
    const revealAt = delay + orderIdx * m.stagger;
    if (elapsed >= revealAt) return content;
    if (isType) return "";
    const seed = Math.floor(elapsed / 0.045) + orderIdx;
    return SCRAMBLE_GLYPHS[Math.floor(pseudoRandom(seed) * SCRAMBLE_GLYPHS.length)];
  };

  const renderToken = (content: string, index: number, key: number) => {
    const orderIdx = staggerIndex(index, totalUnits, m.order);
    const shown = contentFor(content, orderIdx);
    const token = (
      <motion.span
        key={m.clip ? undefined : key}
        custom={{ i: orderIdx, seed: index }}
        variants={variants}
        initial="hidden"
        animate={playing ? "visible" : "hidden"}
        style={tokenStyle}
      >
        {shown === "" ? <span style={{ visibility: "hidden" }}>{content}</span> : shown}
      </motion.span>
    );
    if (!m.clip) return token;
    return (
      <span style={clipStyle} key={key}>
        {token}
      </span>
    );
  };

  return (
    <div
      ref={ref}
      aria-hidden={decorative || undefined}
      onMouseEnter={trigger === "hover" ? () => startTransition(() => setHovered(true)) : undefined}
      onMouseLeave={trigger === "hover" ? () => startTransition(() => setHovered(false)) : undefined}
      className={className}
      style={{ position: "relative", display: "inline-block" }}
    >
      {usesTurbulence && (
        <svg aria-hidden="true" focusable="false" style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}>
          <filter id={filterId} colorInterpolationFilters="sRGB">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={detailToFrequency(m.detail, m.effect)}
              numOctaves={m.effect === "liquid" ? 2 : 1}
              seed={7}
              result="noise"
            />
            <feDisplacementMap ref={displaceRef} in="SourceGraphic" in2="noise" scale={m.amount} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
      )}
      <div style={turbulenceWrapStyle}>
        {indexed.map((units, li) => (
          <div key={li} style={{ display: "block", whiteSpace: "pre-wrap" }}>
            {units.map((u, ui) => {
              if (u.isSpace) return <span key={ui}>{u.unit}</span>;
              if (u.chars) {
                return (
                  <span key={ui} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
                    {u.chars.map(({ c, index }, ci) => renderToken(c, index, ci))}
                  </span>
                );
              }
              return renderToken(u.unit, u.index, ui);
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
