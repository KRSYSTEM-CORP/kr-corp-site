"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

// Inspired by the Framer "Motion Tiles" concept (a hover-reactive tile
// grid) — rebuilt as our own code rather than a literal port, since the
// original is a Framer-editor "smart component" wired to a Video layer
// hosted on Framer's own asset URLs, not portable code. This version does
// a 3D cursor-tilt plus a spotlight that tracks the pointer, in CSS +
// Framer Motion (already a site dependency), no extra libraries.

export function MotionTile({
  title,
  description,
  eyebrow,
  className = "",
}: {
  title: string;
  description: string;
  eyebrow?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springConfig = { stiffness: 200, damping: 20 };
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [7, -7]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-7, 7]), springConfig);
  const spotlightX = useTransform(mouseX, (v) => `${v * 100}%`);
  const spotlightY = useTransform(mouseY, (v) => `${v * 100}%`);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }

  function handleMouseLeave() {
    mouseX.set(0.5);
    mouseY.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -4 }}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className={`group relative h-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-6 ${className}`}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(240px circle at ${spotlightX} ${spotlightY}, rgba(126,42,192,0.25), transparent 70%)`,
        }}
      />
      <div className="relative">
        {eyebrow && (
          <span className="font-heading text-3xl font-bold bg-gradient-to-r from-[#433DDD] to-[#E2098C] bg-clip-text text-transparent">
            {eyebrow}
          </span>
        )}
        <h3 className={eyebrow ? "mt-3 font-heading font-semibold text-white" : "font-heading font-semibold text-white"}>
          {title}
        </h3>
        <p className="mt-2 text-sm text-[#a29cbd]">{description}</p>
      </div>
    </motion.div>
  );
}
