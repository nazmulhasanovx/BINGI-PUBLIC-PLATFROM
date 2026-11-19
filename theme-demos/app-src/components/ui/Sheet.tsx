"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { lockScroll } from "@/components/motion/SmoothScroll";

/** Bottom sheet on phones, right drawer on tablet/desktop when side="right". */
export function Sheet({
  open,
  onClose,
  title,
  side = "bottom",
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  side?: "bottom" | "right";
  children: ReactNode;
  footer?: ReactNode;
}) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lockScroll(true);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      lockScroll(false);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 420, damping: 38 };
  const isRight = side === "right";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={title}>
          <motion.button
            aria-label="Close"
            className="absolute inset-0 bg-[#16181d]/25 backdrop-blur-[2px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          />
          <motion.div
            className={
              isRight
                ? "absolute inset-y-0 right-0 flex w-[min(400px,88vw)] flex-col bg-surface shadow-float"
                : "absolute inset-x-0 bottom-0 mx-auto flex max-h-[92dvh] w-full flex-col rounded-t-[28px] bg-surface shadow-float md:max-w-[720px]"
            }
            initial={isRight ? { x: "100%" } : { y: "100%" }}
            animate={isRight ? { x: 0 } : { y: 0 }}
            exit={isRight ? { x: "100%" } : { y: "100%" }}
            transition={spring}
            drag={isRight ? false : "y"}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose();
            }}
          >
            {!isRight && <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-line" />}
            <div className="flex shrink-0 items-center justify-between px-5 pb-2 pt-3">
              <h2 className="text-lg font-bold">{title}</h2>
              <button onClick={onClose} aria-label="Close" className="grid size-10 place-items-center rounded-full bg-canvas hover:bg-line">
                <X className="size-5" />
              </button>
            </div>
            <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4">{children}</div>
            {footer && <div className="pb-safe shrink-0 border-t border-line px-5 pt-3">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
