"use client";

import { useEffect, useState } from "react";

const SESSION_KEY = "kr-intro-shown";

type Phase = "enter" | "hold" | "exit" | "done";

// A once-per-session opening curtain: the wordmark settles in, holds a
// beat, then the whole overlay lifts away to reveal the hero underneath —
// the "first impression" moment the rest of the page's motion builds on.
export function PageIntro() {
  const [phase, setPhase] = useState<Phase>("enter");

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || sessionStorage.getItem(SESSION_KEY)) {
      // Skipped (reduced motion, or already shown this session): dismiss on the
      // next tick rather than setting state inside the effect body.
      const skip = setTimeout(() => setPhase("done"), 0);
      return () => clearTimeout(skip);
    }
    sessionStorage.setItem(SESSION_KEY, "1");
    const t1 = setTimeout(() => setPhase("hold"), 80);
    const t2 = setTimeout(() => setPhase("exit"), 1000);
    const t3 = setTimeout(() => setPhase("done"), 1700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#0a0912] transition-all duration-700 ${
        phase === "exit" ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
      }`}
      style={{
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        pointerEvents: phase === "exit" ? "none" : "auto",
      }}
      aria-hidden="true"
    >
      <span
        className={`flex items-center gap-2 text-4xl font-extrabold tracking-tight transition-all duration-700 sm:text-5xl ${
          phase === "enter" ? "scale-90 opacity-0" : "scale-100 opacity-100"
        }`}
        style={{
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          filter: phase === "enter" ? "blur(6px)" : "blur(0px)",
        }}
      >
        KR{" "}
        <span className="bg-gradient-to-r from-[#433DDD] via-[#7E2AC0] to-[#E2098C] bg-clip-text text-transparent">
          SYSTEM
        </span>
      </span>
    </div>
  );
}
