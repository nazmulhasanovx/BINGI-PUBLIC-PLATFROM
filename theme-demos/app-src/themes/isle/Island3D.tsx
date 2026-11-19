"use client";
// ISLE v2 — a real-time 3D island built from the hotel's own data (villa counts from Rooms, the jetty, the restaurant).
// The camera flies along a path as the guest scrolls; the light moves from morning to sunset.
// Rule (FX): the page is complete without this — calm / low-end / no WebGL get the photo version instead.
import { useEffect, useRef } from "react";
import * as THREE from "three";

export type IslandSpec = { water: number; beach: number; restaurant: boolean };

const C = {
  sand: "#efe3c8", grass: "#4f8a4a", grassDark: "#36693a", trunk: "#8a6a48", leaf: "#2f7a3e",
  roof: "#a57d52", roofDark: "#7d5b38", wall: "#f6f1e7", deck: "#b98e62", pool: "#4fd8e8", plank: "#a98157",
};

/* ---------- builders ---------- */
function palm(rng: () => number) {
  const g = new THREE.Group();
  const h = 3.6 + rng() * 2.2;
  const bend = (rng() - 0.5) * 1.6;
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(bend * 0.3, h * 0.5, 0), new THREE.Vector3(bend, h, 0)]);
  const trunk = new THREE.Mesh(new THREE.TubeGeometry(curve, 8, 0.13, 5), new THREE.MeshStandardMaterial({ color: C.trunk, flatShading: true, roughness: 0.9 }));
  g.add(trunk);
  const leafGeo = new THREE.ConeGeometry(0.42, 2.6, 3, 1, true);
  leafGeo.translate(0, 1.3, 0);
  const leafMat = new THREE.MeshStandardMaterial({ color: C.leaf, flatShading: true, side: THREE.DoubleSide, roughness: 0.8 });
  for (let i = 0; i < 7; i++) {
    const l = new THREE.Mesh(leafGeo, leafMat);
    l.position.copy(curve.getPoint(1));
    l.rotation.set(Math.PI / 2 - 0.35 - rng() * 0.3, (i / 7) * Math.PI * 2, 0, "YXZ");
    l.scale.set(1, 0.9 + rng() * 0.3, 0.35);
    g.add(l);
  }
  return g;
}

function villa(water: boolean, rng: () => number) {
  const g = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: C.deck, flatShading: true, roughness: 0.85 });
  const deck = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.22, 3.6), wood);
  deck.position.y = water ? 1.2 : 0.35;
  g.add(deck);
  if (water) {
    const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.6, 5);
    for (const [x, z] of [[-1.9, -1.6], [1.9, -1.6], [-1.9, 1.6], [1.9, 1.6], [0, 1.6], [0, -1.6]]) {
      const p = new THREE.Mesh(postGeo, wood);
      p.position.set(x, 0.4, z);
      g.add(p);
    }
  }
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.3, 2.2), new THREE.MeshStandardMaterial({ color: C.wall, flatShading: true, roughness: 0.7 }));
  body.position.set(-0.6, deck.position.y + 0.75, -0.3);
  g.add(body);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.4, 1.5, 4), new THREE.MeshStandardMaterial({ color: rng() > 0.5 ? C.roof : C.roofDark, flatShading: true, roughness: 1 }));
  roof.rotation.y = Math.PI / 4;
  roof.position.set(-0.6, deck.position.y + 2.1, -0.3);
  roof.scale.set(1.15, 1, 1.05);
  g.add(roof);
  if (water) {
    const pool = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.05, 1.5), new THREE.MeshStandardMaterial({ color: C.pool, roughness: 0.15, metalness: 0.1, emissive: "#1aa7b8", emissiveIntensity: 0.25 }));
    pool.position.set(1.35, deck.position.y + 0.14, 0.6);
    g.add(pool);
  }
  return g;
}

function pavilion() {
  const g = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: C.deck, flatShading: true });
  const deck = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.6, 0.3, 10), wood);
  deck.position.y = 1.2;
  g.add(deck);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(5.4, 3.2, 10), new THREE.MeshStandardMaterial({ color: C.roof, flatShading: true, roughness: 1 }));
  roof.position.y = 4.4;
  g.add(roof);
  const col = new THREE.CylinderGeometry(0.12, 0.12, 2.8, 5);
  for (let i = 0; i < 8; i++) {
    const c = new THREE.Mesh(col, wood);
    const a = (i / 8) * Math.PI * 2;
    c.position.set(Math.cos(a) * 4, 2.7, Math.sin(a) * 4);
    g.add(c);
  }
  // warm lights inside
  const glow = new THREE.PointLight("#ffb46b", 0, 18, 2);
  glow.position.y = 3;
  glow.name = "glow";
  g.add(glow);
  return g;
}

function boardwalk(curve: THREE.Curve<THREE.Vector3>, steps: number) {
  const mat = new THREE.MeshStandardMaterial({ color: C.plank, flatShading: true, roughness: 0.9 });
  const plank = new THREE.BoxGeometry(1.6, 0.12, 0.42);
  const inst = new THREE.InstancedMesh(plank, mat, steps);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const p = curve.getPoint(t);
    const tan = curve.getTangent(t);
    q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(tan.x, 0, tan.z).normalize());
    m.compose(new THREE.Vector3(p.x, 1.05, p.z), q, new THREE.Vector3(1, 1, 1));
    inst.setMatrixAt(i, m);
  }
  void up;
  return inst;
}

const OCEAN_VS = /* glsl */ `
uniform float uTime; varying vec3 vW; varying float vR;
void main(){ vec3 p = position; vec4 w = modelMatrix * vec4(p,1.0);
  float wave = sin(w.x*0.18+uTime*0.9)*0.12 + cos(w.z*0.22+uTime*0.7)*0.1 + sin((w.x+w.z)*0.6+uTime*1.6)*0.03;
  w.y += wave; vW = w.xyz; vR = length(w.xz); gl_Position = projectionMatrix * viewMatrix * w; }`;
const OCEAN_FS = /* glsl */ `
uniform float uTime; uniform vec3 uShallow; uniform vec3 uDeep; uniform vec3 uSun; uniform vec3 uSky; uniform float uFoam;
varying vec3 vW; varying float vR;
float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
void main(){
  float shallow = smoothstep(95.0, 28.0, vR);
  vec3 col = mix(uDeep, uShallow, shallow);
  float caustic = sin(vW.x*0.9+uTime)*sin(vW.z*0.8-uTime*0.8);
  col += shallow * 0.022 * caustic;
  float foam = smoothstep(uFoam+2.4, uFoam, vR) * smoothstep(uFoam-1.2, uFoam+0.2, vR);
  col = mix(col, vec3(1.0), foam*0.75);
  vec3 v = normalize(cameraPosition - vW);
  float fres = pow(1.0 - max(v.y, 0.0), 3.0);
  col = mix(col, uSky, fres*0.55);
  float far = smoothstep(160.0, 520.0, length(vW.xz - cameraPosition.xz));
  col = mix(col, uSky, far);
  float glint = step(0.9985, h(floor(vW.xz*7.0)+floor(uTime*4.0))) * (1.0-shallow*0.7);
  col += uSun * glint * 0.6;
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;
const SKY_FS = /* glsl */ `
uniform vec3 uTop; uniform vec3 uHorizon; uniform vec3 uSunCol; uniform vec3 uSunDir; varying vec3 vDir;
void main(){ vec3 d = normalize(vDir); float t = clamp(d.y*1.6, 0.0, 1.0);
  vec3 col = mix(uHorizon, uTop, pow(t, 0.7));
  float s = max(dot(d, normalize(uSunDir)), 0.0);
  col += uSunCol * (pow(s, 600.0)*2.5 + pow(s, 12.0)*0.35);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

/** Scroll-driven island. `progress` is read every frame from the ref (0 → 1). */
export function Island3D({ spec, progress, onReady }: { spec: IslandSpec; progress: React.RefObject<number>; onReady?: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current!;
    let rng = 7;
    const rand = () => ((rng = (rng * 16807) % 2147483647) / 2147483647);
    const small = window.innerWidth < 768;
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.5 : 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = !small;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("aria-hidden", "true");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(small ? 55 : 42, 1, 0.5, 900);
    scene.fog = new THREE.FogExp2("#bfe3ee", 0.0024);

    // sky
    const skyU = { uTop: { value: new THREE.Color("#3f8fd0") }, uHorizon: { value: new THREE.Color("#cfeaf2") }, uSunCol: { value: new THREE.Color("#fff3d6") }, uSunDir: { value: new THREE.Vector3(0.4, 0.5, -0.8) } };
    const sky = new THREE.Mesh(new THREE.SphereGeometry(600, 32, 16), new THREE.ShaderMaterial({
      uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
      vertexShader: "varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
      fragmentShader: SKY_FS,
    }));
    scene.add(sky);

    // light
    const hemi = new THREE.HemisphereLight("#dff4ff", "#e9d9b4", 1.25);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight("#fff2dc", 2.4);
    sun.position.set(60, 80, -50);
    sun.castShadow = !small;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -70, right: 70, top: 70, bottom: -70, near: 10, far: 260 });
    scene.add(sun);

    // ocean
    const oceanU = { uTime: { value: 0 }, uShallow: { value: new THREE.Color("#58d6cf") }, uDeep: { value: new THREE.Color("#0b5f8c") }, uSun: { value: new THREE.Color("#ffffff") }, uSky: { value: new THREE.Color("#cfeaf2") }, uFoam: { value: 23.5 } };
    const ocean = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200, small ? 120 : 220, small ? 120 : 220), new THREE.ShaderMaterial({ uniforms: oceanU, vertexShader: OCEAN_VS, fragmentShader: OCEAN_FS }));
    ocean.rotation.x = -Math.PI / 2;
    scene.add(ocean);

    // island: sand + green hump with gentle noise
    const sandGeo = new THREE.CylinderGeometry(22, 25, 1.4, 48, 1);
    const sand = new THREE.Mesh(sandGeo, new THREE.MeshStandardMaterial({ color: C.sand, flatShading: true, roughness: 1 }));
    sand.position.y = 0.2;
    sand.receiveShadow = true;
    scene.add(sand);
    const hillGeo = new THREE.SphereGeometry(17, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const pos = hillGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      pos.setY(i, pos.getY(i) * 0.16 + Math.sin(x * 0.4) * Math.cos(z * 0.35) * 0.35);
    }
    hillGeo.computeVertexNormals();
    const hill = new THREE.Mesh(hillGeo, new THREE.MeshStandardMaterial({ color: C.grass, flatShading: true, roughness: 1 }));
    hill.position.y = 0.85;
    hill.receiveShadow = true;
    scene.add(hill);

    // palms
    for (let i = 0; i < (small ? 34 : 56); i++) {
      const a = rand() * Math.PI * 2;
      const r = 6 + rand() * 13;
      const p = palm(rand);
      p.position.set(Math.cos(a) * r, 1.1, Math.sin(a) * r);
      p.rotation.y = rand() * Math.PI * 2;
      p.traverse((o) => { if ((o as THREE.Mesh).isMesh) o.castShadow = !small; });
      scene.add(p);
    }

    // beach villas around the shore (south-west arc)
    const beachN = Math.min(Math.max(spec.beach, 0), 12);
    for (let i = 0; i < beachN; i++) {
      const a = Math.PI * 0.75 + (i / Math.max(beachN - 1, 1)) * Math.PI * 0.75;
      const v = villa(false, rand);
      v.position.set(Math.cos(a) * 18.5, 0.5, Math.sin(a) * 18.5);
      v.rotation.y = -a + Math.PI / 2;
      v.scale.setScalar(0.8);
      v.traverse((o) => { if ((o as THREE.Mesh).isMesh) o.castShadow = !small; });
      scene.add(v);
    }

    // jetty + serpentine walkway of water villas (north-east)
    const walk = new THREE.CatmullRomCurve3([
      new THREE.Vector3(14, 0, -16), new THREE.Vector3(26, 0, -28), new THREE.Vector3(44, 0, -30), new THREE.Vector3(58, 0, -20), new THREE.Vector3(70, 0, -32), new THREE.Vector3(84, 0, -22),
    ]);
    scene.add(boardwalk(walk, 260));
    const waterN = Math.min(Math.max(spec.water, 0), 24);
    for (let i = 0; i < waterN; i++) {
      const t = 0.12 + (i / Math.max(waterN - 1, 1)) * 0.86;
      const p = walk.getPoint(t);
      const tan = walk.getTangent(t);
      const side = i % 2 ? 1 : -1;
      const n = new THREE.Vector3(-tan.z, 0, tan.x).normalize().multiplyScalar(5.2 * side);
      const v = villa(true, rand);
      v.position.set(p.x + n.x, 0, p.z + n.z);
      v.rotation.y = Math.atan2(n.x, n.z);
      v.traverse((o) => { if ((o as THREE.Mesh).isMesh) o.castShadow = !small; });
      scene.add(v);
    }
    // main jetty to the arrival pavilion (east)
    const jetty = new THREE.CatmullRomCurve3([new THREE.Vector3(20, 0, 8), new THREE.Vector3(36, 0, 12), new THREE.Vector3(50, 0, 10)]);
    scene.add(boardwalk(jetty, 90));
    const pav = pavilion();
    pav.position.set(55, 0, 10);
    scene.add(pav);
    const glow = pav.getObjectByName("glow") as THREE.PointLight;

    // speedboat on the arrival path
    const boat = new THREE.Group();
    const hull = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 4.4), new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.4 }));
    hull.position.y = 0.3;
    boat.add(hull);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.5, 1.4), new THREE.MeshStandardMaterial({ color: "#1d3e5c", roughness: 0.3 }));
    cab.position.set(0, 0.8, -0.2);
    boat.add(cab);
    scene.add(boat);
    const boatPath = new THREE.CatmullRomCurve3([new THREE.Vector3(170, 0, 120), new THREE.Vector3(110, 0, 60), new THREE.Vector3(75, 0, 22), new THREE.Vector3(58, 0, 13)]);

    // camera path (scroll) — aerial atoll → arrival → water villas → beach → sunset pull-back
    const camPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(118, 82, 128), new THREE.Vector3(92, 24, 58), new THREE.Vector3(62, 17, 6), new THREE.Vector3(40, 15, -58),
      new THREE.Vector3(-8, 15, -40), new THREE.Vector3(-44, 12, 6), new THREE.Vector3(-26, 15, 46), new THREE.Vector3(52, 52, 108),
    ], false, "catmullrom", 0.4);
    const lookPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4, 0, 14), new THREE.Vector3(66, 2, 14), new THREE.Vector3(52, 2, -26), new THREE.Vector3(48, 2, -26),
      new THREE.Vector3(-12, 2, -6), new THREE.Vector3(-16, 2, 8), new THREE.Vector3(-6, 2, 14), new THREE.Vector3(22, 0, -10),
    ]);

    const day = { top: new THREE.Color("#3f8fd0"), hor: new THREE.Color("#cfeaf2"), sun: new THREE.Color("#fff2dc"), fog: new THREE.Color("#bfe3ee"), deep: new THREE.Color("#0b5f8c") };
    const eve = { top: new THREE.Color("#262a62"), hor: new THREE.Color("#ff9f6b"), sun: new THREE.Color("#ff8a4a"), fog: new THREE.Color("#e59a7c"), deep: new THREE.Color("#163466") };
    const tmp = new THREE.Color();

    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    io.observe(el);

    let p = progress.current ?? 0;
    let raf = 0;
    const clock = new THREE.Clock();
    let first = true;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const dt = Math.min(clock.getDelta(), 0.1);
      const t = clock.elapsedTime;
      p += ((progress.current ?? 0) - p) * (1 - Math.exp(-dt * 5));
      const k = THREE.MathUtils.clamp(p, 0, 1);
      camera.position.copy(camPath.getPoint(k));
      camera.lookAt(lookPath.getPoint(k));
      // light: morning → sunset over the last third
      const e = THREE.MathUtils.smoothstep(k, 0.6, 0.88);
      skyU.uTop.value.copy(tmp.copy(day.top).lerp(eve.top, e));
      skyU.uHorizon.value.copy(tmp.copy(day.hor).lerp(eve.hor, e));
      skyU.uSunCol.value.copy(tmp.copy(day.sun).lerp(eve.sun, e));
      skyU.uSunDir.value.set(0.4, THREE.MathUtils.lerp(0.5, 0.04, e), -0.8);
      sun.color.copy(skyU.uSunCol.value);
      sun.intensity = THREE.MathUtils.lerp(2.4, 1.4, e);
      sun.position.set(60, THREE.MathUtils.lerp(80, 12, e), -50);
      hemi.intensity = THREE.MathUtils.lerp(1.25, 0.7, e);
      (scene.fog as THREE.FogExp2).color.copy(tmp.copy(day.fog).lerp(eve.fog, e));
      oceanU.uSky.value.copy(skyU.uHorizon.value);
      oceanU.uDeep.value.copy(tmp.copy(day.deep).lerp(eve.deep, e));
      oceanU.uTime.value = t;
      glow.intensity = e * 40;
      // boat arrives during the first fifth
      const bk = THREE.MathUtils.clamp(k / 0.22, 0, 1);
      const bp = boatPath.getPoint(bk);
      boat.position.set(bp.x, 0.1 + Math.sin(t * 2) * 0.05, bp.z);
      boat.lookAt(boatPath.getPoint(Math.min(bk + 0.01, 1)));
      renderer.render(scene, camera);
      if (first) { first = false; onReady?.(); }
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose()); else mat?.dispose?.();
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [spec.water, spec.beach, spec.restaurant, progress, onReady]);
  return <div ref={host} className="absolute inset-0 [&>canvas]:block [&>canvas]:h-full [&>canvas]:w-full" />;
}
