"use client";

import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import type { ReactNode } from "react";

// LazyMotion + domAnimation: solo el subconjunto de animaciones que usamos (los componentes usan `m`).
// reducedMotion="user" respeta prefers-reduced-motion en todo el sitio.
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
