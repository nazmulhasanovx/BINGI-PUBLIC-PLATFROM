import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Files in /public: the single-file preview serves them next to index.html, so use a relative path there.
export const asset = (path: string) => (import.meta.env.MODE === 'single' ? path.replace(/^\//, '') : path)
