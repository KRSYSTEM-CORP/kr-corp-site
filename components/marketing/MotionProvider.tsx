"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

// reducedMotion="user" makes every motion.* component on the site
// automatically honor prefers-reduced-motion — animated properties still
// apply their end state instantly, just without the transition — so this
// one provider covers the accessibility requirement for the whole page
// instead of guarding each component individually.
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
