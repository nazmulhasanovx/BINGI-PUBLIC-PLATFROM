"use client";
// FX1 Tilt · FX2 Live photo (depth / water) · FX3 Neon field + Fireflies.
import Image from "next/image";
import clsx from "clsx";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useFx } from "./fx";
import { COVER, ShaderCanvas, rgb } from "./ShaderCanvas";

/* ---------------- FX1: depth card ---------------- */
/** Card that tilts toward the pointer with a soft glare. Static on touch, calm motion or reduced motion. */
export function Tilt({ children, className, max = 7, glare = true }: { children: ReactNode; className?: string; max?: number; glare?: boolean }) {
  const fx = useFx();
  const ref = useRef<HTMLDivElement>(null);
  const on = fx.level !== "calm" && fx.finePointer;
  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!on || !el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(0.5 - y) * max}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * max}deg`);
    el.style.setProperty("--gx", `${x * 100}%`);
    el.style.setProperty("--gy", `${y * 100}%`);
    el.style.setProperty("--go", "1");
  };
  const leave = () => { const el = ref.current; if (!el) return; el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); el.style.setProperty("--go", "0"); };
  return (
    <div ref={ref} onPointerMove={move} onPointerLeave={leave} className={clsx("relative [transform-style:preserve-3d]", className)}
      style={on ? ({ transform: "perspective(900px) rotateX(var(--rx,0)) rotateY(var(--ry,0))", transition: "transform .25s cubic-bezier(.2,.8,.2,1)" } as CSSProperties) : undefined}>
      {children}
      {on && glare && <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300" style={{ opacity: "var(--go,0)", background: "radial-gradient(circle at var(--gx,50%) var(--gy,50%), rgb(255 255 255 / .28), transparent 55%)", mixBlendMode: "soft-light" }} />}
    </div>
  );
}

/* ---------------- FX2: live photo ---------------- */
const DEPTH = `precision mediump float;varying vec2 v_uv;uniform sampler2D u_tex;uniform vec2 u_res,u_texRes,u_mouse;uniform float u_time,u_scroll,u_strength;${COVER}
void main(){
  vec2 base=v_uv*.94+.03;
  vec3 c0=texture2D(u_tex,cover(base)).rgb;float l=dot(c0,vec3(.299,.587,.114));
  float depth=clamp(1.-v_uv.y*1.05+(l-.5)*.3,0.,1.);
  vec2 m=u_mouse-.5;
  vec2 off=m*u_strength*(depth-.4)+vec2(sin(u_time*.31),cos(u_time*.23))*.004*depth+vec2(0.,u_scroll*.025*(depth-.3));
  gl_FragColor=vec4(texture2D(u_tex,cover(base+off)).rgb,1.);
}`;
const WATER = `precision mediump float;varying vec2 v_uv;uniform sampler2D u_tex;uniform vec2 u_res,u_texRes,u_mouse;uniform float u_time,u_scroll,u_strength,u_h;${COVER}
void main(){
  vec2 base=v_uv*.96+.02;
  float w=smoothstep(u_h,u_h-.06,v_uv.y);
  float t=u_time;float k=1.-v_uv.y/max(u_h,.01)*.6;
  vec2 d=vec2(sin(v_uv.y*120.+t*1.7)*.0022+sin(v_uv.x*26.+t*.9)*.0014,sin(v_uv.x*44.+t*1.3)*.0018+sin(v_uv.y*70.-t*1.1)*.0012)*w*k*u_strength;
  vec2 m=(u_mouse-.5)*.012*(1.-v_uv.y);
  vec3 c=texture2D(u_tex,cover(base+d+m)).rgb;
  float s=pow(max(0.,sin(v_uv.x*80.+t*2.2+sin(v_uv.y*160.+t)*2.)),24.)*w*.07;
  gl_FragColor=vec4(c+s,1.);
}`;

/**
 * The hotel's own photo, made alive: "depth" = 3D-photo parallax, "water" = moving water below the horizon.
 * The plain <Image> always renders first (fast first paint); the shader fades in on capable devices only.
 */
export function LivePhoto({ src, alt, mode, priority, sizes = "100vw", className, strength = 1, horizon = 0.45, quality = 68 }: {
  src: string; alt: string; mode: "depth" | "water"; priority?: boolean; sizes?: string; className?: string; strength?: number; horizon?: number; quality?: number;
}) {
  const fx = useFx();
  const wrap = useRef<HTMLDivElement>(null);
  const [tex, setTex] = useState<HTMLImageElement | null>(null);
  const on = fx.gl && fx.level !== "calm";
  useEffect(() => {
    if (!on) return;
    let cancelled = false;
    const start = () => {
      const img = wrap.current?.querySelector("img");
      if (!img) return;
      const go = () => {
        const t = new window.Image();
        t.decoding = "async";
        t.onload = () => !cancelled && setTex(t);
        t.src = img.currentSrc || img.src;
      };
      if (img.complete && img.naturalWidth) go(); else img.addEventListener("load", go, { once: true });
    };
    const idle = (window as Window & { requestIdleCallback?: (f: () => void) => number }).requestIdleCallback;
    const id = idle ? idle(start) : window.setTimeout(start, 300);
    return () => { cancelled = true; if (!idle) window.clearTimeout(id); };
  }, [on, src]);
  return (
    <div ref={wrap} className={clsx("absolute inset-0", className)}>
      <Image src={src} alt={alt} fill priority={priority} fetchPriority={priority ? "high" : undefined} sizes={sizes} quality={quality} className="object-cover" />
      {on && tex && <ShaderCanvas frag={mode === "water" ? WATER : DEPTH} tex={tex} uniforms={{ u_strength: mode === "water" ? strength : 0.05 * strength, u_h: horizon }} className="absolute inset-0 size-full" />}
    </div>
  );
}

/* ---------------- FX3: neon light field ---------------- */
const NEON = `precision mediump float;varying vec2 v_uv;uniform vec2 u_res,u_mouse;uniform float u_time,u_scroll;uniform vec3 u_a,u_b;
float line(float x,float w){return smoothstep(w,0.,abs(fract(x)-.5)-.5+w);}
void main(){
  vec2 uv=v_uv;float t=u_time;
  vec3 col=mix(vec3(.02,.025,.05),vec3(.05,.04,.1),uv.y);
  float hz=.42+(u_mouse.y-.5)*.04;
  if(uv.y<hz){
    float py=(hz-uv.y);float z=.12/max(py,.002);
    float x=(uv.x-.5+(u_mouse.x-.5)*.1)*z*1.4;
    float gx=pow(1.-abs(fract(x)-.5)*2.,18.);float gz=pow(1.-abs(fract(z*.6-t*.35)-.5)*2.,18.);
    float fade=smoothstep(0.,.35,py);
    col+=(gx+gz)*mix(u_a,u_b,uv.x)*.55*fade;
  }
  float glow=exp(-pow((uv.y-hz)*14.,2.));col+=glow*mix(u_b,u_a,.5)*.5;
  vec2 c=uv-vec2(.5+sin(t*.2)*.25,.72);c.x*=u_res.x/u_res.y;col+=u_a*.18/(1.+dot(c,c)*18.);
  vec2 c2=uv-vec2(.25+cos(t*.17)*.2,.62);c2.x*=u_res.x/u_res.y;col+=u_b*.14/(1.+dot(c2,c2)*22.);
  gl_FragColor=vec4(col,1.);
}`;
/** Moving neon grid with a horizon glow (POD). Static gradient when FX is off. */
export function NeonField({ a = "#22d3ee", b = "#a855f7", className }: { a?: string; b?: string; className?: string }) {
  const fx = useFx();
  return (
    <div aria-hidden className={clsx("absolute inset-0", className)} style={{ background: `radial-gradient(70% 60% at 50% 42%, ${b}33, transparent 70%), linear-gradient(180deg,#0b0a1a,#06070d)` }}>
      {fx.gl && fx.level !== "calm" && <ShaderCanvas frag={NEON} uniforms={{ u_a: rgb(a), u_b: rgb(b) }} className="absolute inset-0 size-full" />}
    </div>
  );
}

/* ---------------- FX3: fireflies (canvas 2D, no WebGL needed) ---------------- */
export function Fireflies({ count = 28, color = "#ffe9a8", className }: { count?: number; color?: string; className?: string }) {
  const fx = useFx();
  const ref = useRef<HTMLCanvasElement>(null);
  const on = fx.level !== "calm";
  useEffect(() => {
    const c = ref.current;
    if (!on || !c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    let W = 0, H = 0, raf = 0, vis = true, last = 0;
    const fit = () => { const r = c.getBoundingClientRect(); W = r.width; H = r.height; c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    fit();
    const ro = new ResizeObserver(fit); ro.observe(c);
    const P = Array.from({ length: count }, () => ({ x: Math.random(), y: 0.25 + Math.random() * 0.75, a: Math.random() * 6.28, s: 0.6 + Math.random() * 1.4, p: Math.random() * 6.28 }));
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis && !raf) raf = requestAnimationFrame(loop); });
    io.observe(c);
    function loop(now: number) {
      raf = 0;
      if (!vis || document.hidden) return;
      raf = requestAnimationFrame(loop);
      if (now - last < 33) return;
      last = now;
      ctx!.clearRect(0, 0, W, H);
      for (const f of P) {
        f.a += (Math.random() - 0.5) * 0.3;
        f.x += Math.cos(f.a) * 0.0009 * f.s; f.y += Math.sin(f.a) * 0.0007 * f.s;
        if (f.x < -0.05) f.x = 1.05; if (f.x > 1.05) f.x = -0.05; if (f.y < 0.15) f.y = 0.95; if (f.y > 1.02) f.y = 0.2;
        const glow = 0.35 + 0.65 * Math.max(0, Math.sin(now / 900 * f.s + f.p));
        const x = f.x * W, y = f.y * H, r = 2.2 + f.s * 1.6;
        const g = ctx!.createRadialGradient(x, y, 0, x, y, r * 5);
        g.addColorStop(0, color); g.addColorStop(0.25, `${color}aa`); g.addColorStop(1, `${color}00`);
        ctx!.globalAlpha = glow; ctx!.fillStyle = g; ctx!.beginPath(); ctx!.arc(x, y, r * 5, 0, 6.29); ctx!.fill();
      }
      ctx!.globalAlpha = 1;
    }
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [on, count, color]);
  if (!on) return null;
  return <canvas ref={ref} aria-hidden className={clsx("pointer-events-none absolute inset-0 size-full", className)} />;
}
