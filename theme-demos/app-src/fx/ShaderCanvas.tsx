"use client";
// Tiny WebGL1 full-screen shader (no three.js). Pauses off screen, caps at 30 fps and DPR 1.5.
// If anything fails (no WebGL, lost context, compile error) it renders nothing and the photo underneath stays.
import { useEffect, useRef, useState } from "react";

const VERT = "attribute vec2 p;varying vec2 v_uv;void main(){v_uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}";
export const COVER = `
vec2 cover(vec2 uv){float rs=u_res.x/u_res.y;float ri=u_texRes.x/u_texRes.y;vec2 s=rs>ri?vec2(1.,ri/rs):vec2(rs/ri,1.);return (uv-.5)*s+.5;}`;

export type Uniforms = Record<string, number | [number, number, number]>;

export function ShaderCanvas({ frag, tex, uniforms = {}, className, label }: { frag: string; tex?: HTMLImageElement | null; uniforms?: Uniforms; className?: string; label?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const uni = useRef(uniforms);
  useEffect(() => { uni.current = uniforms; });
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const fail = () => queueMicrotask(() => setFailed(true));
    const gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: false, powerPreference: "low-power" });
    if (!gl) { fail(); return; }
    const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader"); return s; };
    let prog: WebGLProgram;
    try {
      prog = gl.createProgram()!;
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, frag));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("link");
    } catch (e) {
      console.warn("BinGi FX: shader disabled", e);
      fail();
      return;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n: string) => gl.getUniformLocation(prog, n);
    if (tex) {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, tex); } catch { fail(); return; }
      gl.uniform1i(U("u_tex"), 0);
      gl.uniform2f(U("u_texRes"), tex.naturalWidth, tex.naturalHeight);
    }
    let visible = true, raf = 0, last = 0, first = true;
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const resize = () => {
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(loop); }, { rootMargin: "100px" });
    io.observe(canvas);
    const onMove = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); mouse.tx = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)); mouse.ty = Math.min(1, Math.max(0, 1 - (e.clientY - r.top) / r.height)); };
    window.addEventListener("pointermove", onMove, { passive: true });
    const onLost = (e: Event) => { e.preventDefault(); fail(); };
    canvas.addEventListener("webglcontextlost", onLost);
    const t0 = performance.now();
    function loop(now: number) {
      raf = 0;
      if (!visible || document.hidden) return;
      raf = requestAnimationFrame(loop);
      if (now - last < 33) return; // ~30 fps
      last = now;
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      const r = canvas!.getBoundingClientRect();
      const scroll = Math.max(-1, Math.min(1, (window.innerHeight / 2 - (r.top + r.height / 2)) / window.innerHeight));
      gl!.uniform1f(U("u_time"), (now - t0) / 1000);
      gl!.uniform2f(U("u_res"), canvas!.width, canvas!.height);
      gl!.uniform2f(U("u_mouse"), mouse.x, mouse.y);
      gl!.uniform1f(U("u_scroll"), scroll);
      for (const [k, v] of Object.entries(uni.current)) {
        const l = U(k);
        if (!l) continue;
        if (Array.isArray(v)) gl!.uniform3f(l, v[0], v[1], v[2]); else gl!.uniform1f(l, v);
      }
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
      if (first) { first = false; setReady(true); }
    }
    const onVis = () => { if (!document.hidden && visible && !raf) raf = requestAnimationFrame(loop); };
    document.addEventListener("visibilitychange", onVis);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("webglcontextlost", onLost);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [frag, tex]);

  if (failed) return null;
  return <canvas ref={ref} aria-hidden={!label} aria-label={label} role={label ? "img" : undefined} className={className} style={{ opacity: ready ? 1 : 0, transition: "opacity .8s ease" }} />;
}

/** "#rrggbb" → [r,g,b] in 0..1 for shader uniforms. */
export function rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
