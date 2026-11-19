"use client";
// Signature Collection — real-time 3D dioramas (three.js), built from simple low-poly parts.
// Scenes: AUREL (exploded hotel floors), AXIS (business suite), RESIDE (apartment plan), MATIR (farm).
// Labels are real HTML that follow 3D anchors. Calm → one still frame; no WebGL → the photo + label list.
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useFx } from "@/fx/fx";

export type SceneId = "aurel" | "axis" | "reside" | "matir";
export type Label = { key: string; title: string; sub?: string };

type Built = { root: THREE.Group; anchors: Record<string, THREE.Vector3>; size: number };

/* ---------- parts ---------- */
const mat = (c: string, o: Partial<THREE.MeshStandardMaterialParameters> = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, flatShading: true, ...o });
function box(g: THREE.Object3D, w: number, h: number, d: number, c: string | THREE.Material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof c === "string" ? mat(c) : c);
  m.position.set(x, y + h / 2, z);
  m.castShadow = true;
  m.receiveShadow = true;
  g.add(m);
  return m;
}
function cyl(g: THREE.Object3D, r: number, h: number, c: string, x = 0, y = 0, z = 0, seg = 10) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat(c));
  m.position.set(x, y + h / 2, z);
  m.castShadow = true;
  g.add(m);
  return m;
}
function bed(g: THREE.Object3D, x: number, z: number, y = 0, rot = 0, linen = "#f4efe6", throwC = "#b5532c") {
  const b = new THREE.Group();
  box(b, 2.2, 0.35, 2.6, "#6b4f3a", 0, 0, 0);
  box(b, 2.1, 0.3, 2.5, linen, 0, 0.35, 0);
  box(b, 2.12, 0.08, 0.8, throwC, 0, 0.62, 0.7);
  box(b, 0.8, 0.22, 0.45, "#ffffff", -0.5, 0.65, -0.95);
  box(b, 0.8, 0.22, 0.45, "#ffffff", 0.5, 0.65, -0.95);
  box(b, 2.3, 1.1, 0.12, "#5a4334", 0, 0, -1.32);
  b.position.set(x, y, z);
  b.rotation.y = rot;
  g.add(b);
}
function sofa(g: THREE.Object3D, x: number, z: number, y = 0, rot = 0, c = "#c9b8a3") {
  const s = new THREE.Group();
  box(s, 2.4, 0.45, 0.95, c, 0, 0, 0);
  box(s, 2.4, 0.55, 0.25, c, 0, 0.4, -0.38);
  box(s, 0.22, 0.4, 0.95, c, -1.1, 0.4, 0);
  box(s, 0.22, 0.4, 0.95, c, 1.1, 0.4, 0);
  s.position.set(x, y, z);
  s.rotation.y = rot;
  g.add(s);
}
function table(g: THREE.Object3D, x: number, z: number, y = 0, w = 1.2, d = 0.8, h = 0.75, c = "#7a5a40") {
  box(g, w, 0.06, d, c, x, y + h - 0.06, z);
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(g, 0.06, h - 0.06, 0.06, c, x + dx * (w / 2 - 0.06), y, z + dz * (d / 2 - 0.06));
}
function chair(g: THREE.Object3D, x: number, z: number, y = 0, c = "#2b2b2b", rot = 0) {
  const ch = new THREE.Group();
  box(ch, 0.5, 0.08, 0.5, c, 0, 0.42, 0);
  box(ch, 0.5, 0.5, 0.06, c, 0, 0.5, -0.22);
  cyl(ch, 0.04, 0.42, "#444", 0, 0, 0, 6);
  ch.position.set(x, y, z);
  ch.rotation.y = rot;
  g.add(ch);
}
function plant(g: THREE.Object3D, x: number, z: number, y = 0, s = 1) {
  cyl(g, 0.22 * s, 0.4 * s, "#d8cbb8", x, y, z, 8);
  const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5 * s, 0), mat("#4f7d45"));
  leaf.position.set(x, y + 0.85 * s, z);
  leaf.castShadow = true;
  g.add(leaf);
}
function tree(g: THREE.Object3D, x: number, z: number, y = 0, s = 1, c = "#4c7f3e") {
  cyl(g, 0.12 * s, 1.1 * s, "#6b4b32", x, y, z, 6);
  const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9 * s, 0), mat(c));
  crown.position.set(x, y + 1.6 * s, z);
  crown.castShadow = true;
  g.add(crown);
}
function cottage(g: THREE.Object3D, x: number, z: number, y = 0, rot = 0, roofC = "#a34a2a") {
  const c = new THREE.Group();
  box(c, 2.6, 1.4, 2, "#f1e6d2", 0, 0, 0);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.1, 1.2, 4), mat(roofC));
  roof.rotation.y = Math.PI / 4;
  roof.scale.set(1.15, 1, 0.9);
  roof.position.y = 2;
  roof.castShadow = true;
  c.add(roof);
  box(c, 0.5, 0.9, 0.05, "#6b4b32", 0, 0, 1.01);
  box(c, 3, 0.12, 0.9, "#8a6a4a", 0, 0, 1.4);
  c.position.set(x, y, z);
  c.rotation.y = rot;
  g.add(c);
}
const glass = () => new THREE.MeshStandardMaterial({ color: "#bfe2ef", transparent: true, opacity: 0.35, roughness: 0.1, metalness: 0.1 });

/* ---------- scenes ---------- */
function buildAurel(): Built {
  const root = new THREE.Group();
  const floors = [0, 4.4, 8.8];
  const slab = (y: number) => {
    box(root, 14, 0.5, 9, "#e9e2d8", 0, y, 0);
    box(root, 14, 0.12, 9, "#c9bba8", 0, y + 0.5, 0);
  };
  // lobby
  slab(floors[0]);
  box(root, 4, 1.1, 1.1, "#d9c9b3", 0.5, 0.62, -2.2);
  box(root, 2.2, 1.4, 0.15, "#efe8de", 0.5, 0.62, -3.6);
  for (const x of [-5.5, 5.5]) cyl(root, 0.35, 3.8, "#cfc6ba", x, 0.62, -1.5);
  sofa(root, -3.5, 1.5, 0.62, Math.PI / 2, "#b8432a");
  sofa(root, -1.2, 2.8, 0.62, Math.PI, "#b8432a");
  table(root, -2.2, 1.6, 0.62, 1.2, 1.2, 0.45, "#5a4334");
  for (const [x, z] of [[-6, -3.6], [6, 3.6], [6, -3.6], [-6, 3.6]]) plant(root, x, z, 0.62, 1.3);
  chair(root, 3.5, 2, 0.62, "#8a3a26");
  chair(root, 4.5, 2.3, 0.62, "#8a3a26", 0.4);
  table(root, 4, 1.2, 0.62, 0.9, 0.9, 0.7, "#3a2a20");
  // suite
  slab(floors[1]);
  bed(root, -3, -1.2, floors[1] + 0.62, 0);
  sofa(root, 3, 1.6, floors[1] + 0.62, Math.PI, "#d8cbb9");
  table(root, 3, 0.3, floors[1] + 0.62, 1.2, 0.7, 0.4, "#5a4334");
  box(root, 0.12, 3.3, 9, glass(), 6.9, floors[1] + 0.62, 0);
  box(root, 14, 3.3, 0.12, "#efe8de", 0, floors[1] + 0.62, -4.45);
  box(root, 0.12, 3.3, 4, "#efe8de", 0.5, floors[1] + 0.62, -2.4);
  plant(root, 5.8, -3.5, floors[1] + 0.62, 1.2);
  // rooftop
  slab(floors[2]);
  const pool = new THREE.Mesh(new THREE.BoxGeometry(7, 0.12, 3.2), new THREE.MeshStandardMaterial({ color: "#4fc6dc", roughness: 0.1, metalness: 0.1, emissive: "#1e8fa8", emissiveIntensity: 0.25 }));
  pool.position.set(-1.5, floors[2] + 0.64, -1.6);
  root.add(pool);
  box(root, 7.4, 0.2, 0.2, "#d7cfc3", -1.5, floors[2] + 0.62, 0.1);
  for (let i = 0; i < 4; i++) box(root, 0.7, 0.18, 1.8, "#f3efe8", -4.4 + i * 1.7, floors[2] + 0.62, 2);
  for (const x of [-3.5, 0.5]) { cyl(root, 0.04, 2, "#555", x, floors[2] + 0.62, 3.2, 6); const u = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.5, 8), mat("#efe6d6")); u.position.set(x, floors[2] + 2.8, 3.2); root.add(u); }
  box(root, 3.2, 0.12, 3.2, "#3a2a20", 4.6, floors[2] + 3.4, -1.6);
  for (const [x, z] of [[3.1, -0.1], [6.1, -0.1], [3.1, -3.1], [6.1, -3.1]]) box(root, 0.12, 2.8, 0.12, "#3a2a20", x, floors[2] + 0.62, z);
  for (const [x, z] of [[-6.3, 3.8], [6.3, 3.8], [-6.3, -3.8]]) tree(root, x, z, floors[2] + 0.62, 0.7, "#5c8f4a");
  return { root, size: 17, anchors: { top: new THREE.Vector3(-1.5, floors[2] + 1, -1.6), mid: new THREE.Vector3(-3, floors[1] + 1.4, -1.2), low: new THREE.Vector3(0.5, 1.6, -2.2) } };
}

function buildAxis(): Built {
  const root = new THREE.Group();
  box(root, 14, 0.5, 9, "#dfe3ea", 0, 0, 0);
  box(root, 14, 0.08, 9, "#c9b49a", 0, 0.5, 0);
  const wall = "#f2f2f0";
  box(root, 14, 3, 0.18, wall, 0, 0.58, -4.4);
  box(root, 0.18, 3, 9, wall, -6.9, 0.58, 0);
  box(root, 0.18, 3, 4.2, wall, 2.6, 0.58, -2.3);
  box(root, 4, 3, 0.18, wall, 4.8, 0.58, -0.2);
  box(root, 0.12, 2.6, 4, glass(), -6.8, 0.75, -1.8);
  // work
  box(root, 2.6, 0.08, 1, "#5a4334", -4.6, 1.3, -3.5);
  box(root, 0.08, 0.8, 0.9, "#5a4334", -5.8, 0.58, -3.5);
  box(root, 0.08, 0.8, 0.9, "#5a4334", -3.4, 0.58, -3.5);
  box(root, 0.9, 0.55, 0.06, "#20242c", -4.6, 1.38, -3.85);
  chair(root, -4.6, -2.6, 0.58, "#1f2937", Math.PI);
  plant(root, -6.2, 3.6, 0.58, 1.1);
  // rest
  bed(root, -0.4, -2.8, 0.58, 0, "#f3f4f6", "#1d3b7a");
  box(root, 0.6, 0.6, 0.6, "#5a4334", -2, 0.58, -3.6);
  box(root, 0.6, 0.6, 0.6, "#5a4334", 1.2, 0.58, -3.6);
  sofa(root, -2.6, 2.4, 0.58, 0, "#c8c3ba");
  table(root, -2.6, 3.6, 0.58, 1.2, 0.7, 0.4, "#5a4334");
  // recharge (bath)
  box(root, 2.2, 0.6, 1.1, "#ffffff", 4.6, 0.58, -3.6);
  box(root, 1.4, 0.9, 0.6, "#e5e7eb", 6.2, 0.58, -1.2);
  box(root, 0.06, 2.4, 1.4, glass(), 3.4, 0.58, -1.2);
  return { root, size: 15, anchors: { work: new THREE.Vector3(-4.6, 1.9, -3.5), rest: new THREE.Vector3(-0.4, 1.4, -2.8), recharge: new THREE.Vector3(4.6, 1.4, -3.6) } };
}

function buildReside(): Built {
  const root = new THREE.Group();
  box(root, 15, 0.5, 11, "#d9d2c7", 0, 0, 0);
  box(root, 15, 0.08, 11, "#c7a982", 0, 0.5, 0);
  const wall = "#f4f1ec";
  box(root, 15, 2.6, 0.18, wall, 0, 0.58, -5.4);
  box(root, 0.18, 2.6, 11, wall, -7.4, 0.58, 0);
  box(root, 0.18, 2.6, 5, wall, 1.6, 0.58, -2.9);
  box(root, 0.18, 2.6, 4, wall, 1.6, 0.58, 3.4);
  box(root, 5.8, 2.6, 0.18, wall, 4.5, 0.58, 0);
  // kitchen (cook)
  box(root, 5, 0.9, 0.7, "#ffffff", -4.6, 0.58, -4.9);
  box(root, 0.7, 0.9, 3, "#ffffff", -7, 0.58, -3.2);
  box(root, 2.4, 0.9, 1, "#e9e3da", -3.8, 0.58, -2.4);
  for (const x of [-4.6, -3.8, -3]) chair(root, x, -1.6, 0.58, "#5a4334", Math.PI);
  // living (live)
  sofa(root, -4.4, 3.6, 0.58, 0, "#e3dbcf");
  box(root, 3, 0.04, 2.2, "#efe9df", -4.4, 0.58, 2.3);
  table(root, -4.4, 2.2, 0.58, 1.2, 0.7, 0.4, "#8a6a4a");
  table(root, -1.2, 0.8, 0.58, 1.6, 1, 0.75, "#8a6a4a");
  for (const [x, z] of [[-1.9, 0.3], [-0.5, 0.3], [-1.9, 1.3], [-0.5, 1.3]]) chair(root, x, z, 0.58, "#3a3a3a");
  plant(root, -6.8, 4.8, 0.58, 1.2);
  // bedroom (rest)
  bed(root, 4.5, -3.4, 0.58, 0, "#f4efe6", "#8c7663");
  plant(root, 6.8, -1, 0.58, 1);
  // study (work)
  box(root, 2.2, 0.08, 0.8, "#5a4334", 4.5, 1.3, 4.8);
  box(root, 0.08, 0.72, 0.7, "#5a4334", 3.5, 0.58, 4.8);
  box(root, 0.08, 0.72, 0.7, "#5a4334", 5.5, 0.58, 4.8);
  chair(root, 4.5, 3.9, 0.58, "#2b2b2b", Math.PI);
  box(root, 0.12, 2.2, 5, glass(), 7.4, 0.7, 2.6);
  return { root, size: 16, anchors: { cook: new THREE.Vector3(-4.6, 1.6, -4.5), live: new THREE.Vector3(-4.4, 1.4, 3), rest: new THREE.Vector3(4.5, 1.4, -3.4), work: new THREE.Vector3(4.5, 1.6, 4.6) } };
}

function buildMatir(n: number): Built {
  const root = new THREE.Group();
  // terrain block with earth sides
  const top = new THREE.Mesh(new THREE.CylinderGeometry(11, 11, 0.6, 9), mat("#7aa452"));
  top.position.y = 0;
  top.receiveShadow = true;
  root.add(top);
  const earth = new THREE.Mesh(new THREE.CylinderGeometry(11, 9.4, 2.4, 9), mat("#7a5232"));
  earth.position.y = -1.5;
  root.add(earth);
  // pond
  const pond = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.08, 18), new THREE.MeshStandardMaterial({ color: "#5fa8b5", roughness: 0.15, emissive: "#2a6f7d", emissiveIntensity: 0.2 }));
  pond.scale.set(1.3, 1, 0.9);
  pond.position.set(-1.5, 0.32, 3.2);
  root.add(pond);
  box(root, 2.2, 0.12, 0.6, "#8a6a4a", 1.4, 0.3, 3.3);
  // field rows
  for (let i = 0; i < 7; i++) box(root, 5, 0.18, 0.32, i % 2 ? "#5d8c3a" : "#8fb35a", 4.6, 0.3, -1 + i * 0.6);
  // greenhouse
  const gh = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 3, 10, 1, false, 0, Math.PI), glass());
  gh.rotation.z = Math.PI / 2;
  gh.position.set(6.4, 0.3, -3.6);
  root.add(gh);
  // cottages from rooms
  const spots = [[-5, -3, 0.4], [-2, -5.5, 0.1], [1.4, -6.2, -0.2], [-6.8, 0.4, 0.9], [-4.6, -6.6, 0.3], [4.4, -6.2, -0.4]];
  spots.slice(0, Math.max(1, Math.min(n, 6))).forEach(([x, z, r]) => cottage(root, x, z, 0.3, r));
  // dining pavilion (thatch)
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2, 1.2, 6), mat("#c9a35f"));
  roof.position.set(-6.4, 2.6, 4.2);
  roof.castShadow = true;
  root.add(roof);
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; cyl(root, 0.08, 1.9, "#6b4b32", -6.4 + Math.cos(a) * 1.4, 0.3, 4.2 + Math.sin(a) * 1.4, 5); }
  table(root, -6.4, 4.2, 0.3, 1.6, 0.8, 0.7, "#6b4b32");
  // trees
  for (const [x, z, s] of [[-8.5, -4, 1.1], [-9, 2.2, 1], [8.6, 2, 1.1], [2.6, 7.8, 1], [-3.6, 7.6, 0.9], [7.6, -6.4, 0.9], [-1, -8.6, 1], [5.8, 6, 0.8], [0.6, 0, 0.8]] as const) tree(root, x, z, 0.3, s, ["#4c7f3e", "#5f9446", "#3f6f34"][Math.round(x * 3 + z) % 3 < 0 ? 0 : Math.round(x * 3 + z) % 3]);
  // path
  for (let i = 0; i < 10; i++) box(root, 0.6, 0.04, 0.6, "#d9c49c", -3 + i * 0.7, 0.3, 1.2 + Math.sin(i * 0.7) * 0.6);
  return { root, size: 24, anchors: { cottages: new THREE.Vector3(-3.5, 2.8, -4.5), pond: new THREE.Vector3(-1.5, 0.6, 3.2), fields: new THREE.Vector3(4.6, 0.8, 0.8), kitchen: new THREE.Vector3(-6.4, 3, 4.2) } };
}

/* ---------- component ---------- */
export function Diorama({ scene, labels, fallback, count = 3, className = "h-[420px] md:h-[620px]", tone = "light" }: { scene: SceneId; labels: Label[]; fallback: string; count?: number; className?: string; tone?: "light" | "dark" }) {
  const fx = useFx();
  const host = useRef<HTMLDivElement>(null);
  const tags = useRef<(HTMLDivElement | null)[]>([]);
  const [live, setLive] = useState<"none" | "on">("none");
  const motion = fx.level !== "calm";

  useEffect(() => {
    if (!fx.gl && fx.level !== "calm") return;
    let gl: WebGLRenderingContext | null = null;
    try { gl = document.createElement("canvas").getContext("webgl"); } catch {}
    if (!gl) return;
    const el = host.current!;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    el.prepend(renderer.domElement);
    renderer.domElement.setAttribute("aria-hidden", "true");
    const s = new THREE.Scene();
    const built = scene === "aurel" ? buildAurel() : scene === "axis" ? buildAxis() : scene === "reside" ? buildReside() : buildMatir(count);
    s.add(built.root);
    s.add(new THREE.HemisphereLight("#fff8ee", "#c9b7a0", 1.6));
    const sun = new THREE.DirectionalLight("#fff1dd", 2.2);
    sun.position.set(14, 22, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18 });
    s.add(sun);
    if (scene === "aurel") { const warm = new THREE.PointLight("#ffb46b", 18, 16, 2); warm.position.set(0, 2.6, 0); s.add(warm); }
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
    const box3 = new THREE.Box3().setFromObject(built.root);
    const center = box3.getCenter(new THREE.Vector3());
    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h, false);
      const aspect = w / h;
      const half = built.size / 2 / Math.min(1, aspect * 0.75);
      Object.assign(cam, { left: -half * aspect, right: half * aspect, top: half, bottom: -half });
      cam.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(el);
    const v = new THREE.Vector3();
    const keys = labels.map((l) => l.key);
    let raf = 0;
    const clock = new THREE.Clock();
    const draw = () => {
      const t = clock.getElapsedTime();
      const r = el.getBoundingClientRect();
      const scrollK = motion ? THREE.MathUtils.clamp(1 - (r.top + r.height / 2) / window.innerHeight, -0.5, 1.5) : 0.5;
      const ang = Math.PI / 4 + (scrollK - 0.5) * 0.5 + (motion ? Math.sin(t * 0.25) * 0.04 : 0);
      cam.position.set(center.x + Math.sin(ang) * 40, center.y + 28, center.z + Math.cos(ang) * 40);
      cam.lookAt(center);
      renderer.render(s, cam);
      keys.forEach((k, i) => {
        const a = built.anchors[k];
        const node = tags.current[i];
        if (!a || !node) return;
        v.copy(a).project(cam);
        node.style.transform = `translate(${((v.x + 1) / 2) * el.clientWidth}px, ${((1 - v.y) / 2) * el.clientHeight}px)`;
        node.style.opacity = "1";
      });
    };
    const loop = () => { raf = requestAnimationFrame(loop); if (visible) draw(); };
    if (motion) loop(); else { draw(); window.addEventListener("scroll", draw, { passive: true }); }
    const on = requestAnimationFrame(() => setLive("on"));
    return () => {
      cancelAnimationFrame(on);
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", draw);
      ro.disconnect();
      io.disconnect();
      s.traverse((o) => { const m = o as THREE.Mesh; m.geometry?.dispose?.(); const mm = m.material as THREE.Material | undefined; mm?.dispose?.(); });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [scene, count, fx.gl, fx.level, motion, labels]);

  const ink = tone === "dark" ? "text-white" : "text-ink";
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div ref={host} className="absolute inset-0 [&>canvas]:block [&>canvas]:h-full [&>canvas]:w-full">
        {live === "none" && <Image src={fallback} alt="" fill sizes="(max-width: 768px) 100vw, 760px" className="rounded-[var(--lux-r)] object-cover" />}
      </div>
      {live === "on" && labels.map((l, i) => (
        <div key={l.key} ref={(n) => { tags.current[i] = n; }} className="pointer-events-none absolute left-0 top-0 opacity-0 transition-opacity duration-500">
          <span className="absolute -left-[5px] -top-[5px] size-[10px] rounded-full border-2 border-white bg-[color:var(--lux-accent)] shadow" />
          <span className={`absolute left-3 top-3 block whitespace-nowrap rounded-[6px] bg-surface/90 px-2.5 py-1.5 shadow-md backdrop-blur ${ink === "text-white" ? "" : ""}`}>
            <b className="block text-[12px] font-bold uppercase tracking-[0.14em] text-[color:var(--lux-accent-ink)]">{l.title}</b>
            {l.sub && <span className="block text-[11.5px] text-muted">{l.sub}</span>}
          </span>
        </div>
      ))}
      {live === "none" && (
        <ul className="absolute bottom-3 left-3 flex flex-wrap gap-2">
          {labels.map((l) => <li key={l.key} className="rounded-full bg-surface/90 px-3 py-1 text-[12px] font-semibold">{l.title}</li>)}
        </ul>
      )}
    </div>
  );
}
