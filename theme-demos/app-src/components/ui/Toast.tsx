"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info } from "lucide-react";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";

export interface ToastMsg {
  text: string;
  tone?: "ok" | "info";
  action?: { href: string; label: string };
}

export function useToast() {
  const [msg, setMsg] = useState<ToastMsg | null>(null);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback((m: ToastMsg) => {
    setMsg(m);
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => setMsg(null), 4000);
  }, []);
  const node = (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex justify-center px-4 md:bottom-8" aria-live="polite">
      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            className="pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl bg-[#16181d] px-4 py-3 text-[15px] text-white shadow-float"
          >
            {msg.tone === "info" ? <Info className="size-5 shrink-0" /> : <CheckCircle2 className="size-5 shrink-0 text-emerald-300" />}
            <span>{msg.text}</span>
            {msg.action && (
              <Link href={msg.action.href} className="ml-1 shrink-0 font-semibold underline underline-offset-2">{msg.action.label}</Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
  return { show, node };
}
