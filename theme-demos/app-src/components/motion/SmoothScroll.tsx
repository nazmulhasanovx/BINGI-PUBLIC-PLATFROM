"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/** Apple-like inertial scrolling on desktop (wheel/trackpad). Touch devices keep native momentum. Off for reduced motion. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 1, anchors: { offset: -96 } });
    window.__lenis = lenis;
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/** Pause page scrolling while a sheet / viewer is open. */
export function lockScroll(lock: boolean) {
  if (lock) window.__lenis?.stop();
  else window.__lenis?.start();
}
