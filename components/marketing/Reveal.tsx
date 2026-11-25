"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

// Aparición al entrar en pantalla con IntersectionObserver + CSS (solo opacity/transform).
// Una vez visible se queda visible, igual que antes con framer-motion.
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.add("reveal-in");
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} style={delay ? { transitionDelay: `${delay}s` } : undefined} className={`reveal ${className}`}>
      {children}
    </div>
  );
}
