"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

const ease = [0.22, 1, 0.36, 1] as const; // soft "expo-out", Apple-like

/** Fades + lifts content in when it scrolls into view (once). */
export function Reveal({ children, delay = 0, y = 24, className, ...rest }: { children: ReactNode; delay?: number; y?: number; className?: string } & Omit<HTMLMotionProps<"div">, "children">) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.7, ease, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Staggered children for grids and lists. Put <RevealItem> inside. */
export function RevealGroup({ children, className, stagger = 0.08 }: { children: ReactNode; className?: string; stagger?: number }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{ hidden: { opacity: 0, y: 22, scale: 0.985 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease } } }}
    >
      {children}
    </motion.div>
  );
}

/** Hero entrance: staggered lines. */
export function HeroIn({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease, delay }}>
      {children}
    </motion.div>
  );
}

/** Slow settle-in for large photos (Ken Burns-lite). */
export function PhotoIn({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} initial={{ scale: 1.06 }} animate={{ scale: 1 }} transition={{ duration: 1.8, ease }}>
      {children}
    </motion.div>
  );
}
