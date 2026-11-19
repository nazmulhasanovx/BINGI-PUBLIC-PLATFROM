import type { CSSProperties } from "react";
// Absolute /demo, /themes and /brand paths become relative to theme-demo/index.html, so the demo works on the
// real site and in the single-file preview alike.
const rel = (s: string) => (s.startsWith("/demo/") || s.startsWith("/themes/") || s.startsWith("/brand/") ? s.slice(1) : s);

export default function Image({ src, alt, fill, className, priority, sizes, quality, style, width, height }: { src: string; alt: string; fill?: boolean; className?: string; priority?: boolean; sizes?: string; quality?: number; style?: CSSProperties; width?: number; height?: number }) {
  void sizes;
  void quality;
  const s: CSSProperties = fill ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...style } : { ...style };
  return <img src={rel(src)} alt={alt} width={fill ? undefined : width} height={fill ? undefined : height} className={className} style={s} loading={priority ? "eager" : "lazy"} decoding="async" />;
}
