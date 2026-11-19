"use client";
import { useRef, type ReactNode } from "react";
import { fileToPhoto } from "@/lib/photo";

/** Hidden file input + a button that opens it. */
export function PhotoButton({ onPhoto, onError, label, className, children }: { onPhoto: (src: string) => void; onError: (m: string) => void; label: string; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <button type="button" onClick={() => ref.current?.click()} aria-label={label} className={className}>{children}</button>
      <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) fileToPhoto(f).then(onPhoto).catch((x: Error) => onError(x.message)); }} />
    </>
  );
}
