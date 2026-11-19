// Builds the real BinGi hotel website themes (copied from nazmulhasanovx/BINGI-WEB-theme-) as a static demo
// for the public site: website/public/theme-demo/index.html#/hotel/<demo-slug>
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: "next/link", replacement: path.resolve(__dirname, "shim/link.tsx") },
      { find: "next/image", replacement: path.resolve(__dirname, "shim/image.tsx") },
      { find: "next/navigation", replacement: path.resolve(__dirname, "shim/navigation.ts") },
      { find: "@", replacement: path.resolve(__dirname, "app-src") },
    ],
    dedupe: ["react", "react-dom", "framer-motion", "lucide-react", "clsx"],
  },
  // Photos live once, in website/public/theme-demo/{demo,themes,brand}; the build only replaces index.html + assets/.
  publicDir: false,
  build: { outDir: "../website/public/theme-demo", emptyOutDir: false, chunkSizeWarningLimit: 5000 },
  define: { "process.env.NEXT_PUBLIC_SITE_URL": "undefined" },
});
