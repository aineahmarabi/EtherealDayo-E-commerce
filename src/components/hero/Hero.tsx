"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";

const ParticleCloud = dynamic(
  () => import("./ParticleCloud").then((m) => ({ default: m.ParticleCloud })),
  { ssr: false }
);

/* ════════════════════════════════════════════════════════════════════
   CONSTANTS
   ════════════════════════════════════════════════════════════════════ */
const TILT      = 0.38;
const SYS_ROT   = -0.18;
const LERP      = 0.09;
const CORNER_SC = 0.52;
const HOVER_SC  = 0.62;
const GAP       = 1.40;

const RINGS = [
  { r: 108, speed:  0.010, pr: 32, cap: 3 },
  { r: 218, speed: -0.006, pr: 27, cap: 7 },
];

function minOrbitR(n: number, pr: number): number {
  if (n <= 1) return pr * 2.5;
  return (GAP * pr) / (TILT * Math.sin(Math.PI / n));
}
const RING_MIN = RINGS.map((r) => minOrbitR(r.cap, r.pr));

const SYSTEMS = [
  { id: 0, label: "FOR HER",      tag: "Feminines",  accent: "#C97B89", rgb: "201,123,137", cf: [0.17, 0.20] },
  { id: 1, label: "FOR HIM",      tag: "Masculines", accent: "#7B9AC9", rgb: "123,154,201", cf: [0.83, 0.20] },
  { id: 2, label: "BESTSELLERS",  tag: "★ Top",      accent: "#C9A961", rgb: "201,169,97",  cf: [0.17, 0.80] },
  { id: 3, label: "NEW ARRIVALS", tag: "✦ New",      accent: "#A86CC9", rgb: "168,108,201", cf: [0.83, 0.80] },
] as const;

const MOBILE_BP = 640;

/* ── Types ─────────────────────────────────────────────────────────── */
type Product = { _id: string; name: string; slug?: string; images: string[]; brandName: string; };
type Planet  = {
  product: Product; sysId: number;
  angle: number; speed: number; r: number; pr: number; minR: number;
  img: HTMLImageElement | null; imgOk: boolean;
  x: number; y: number; z: number; hoverT: number;
};
type SysAnim = { x: number; y: number; scale: number; hoverT: number; };

function ellipsePoint(cx: number, cy: number, a: number, theta: number) {
  const ex = a * Math.cos(theta), ey = a * TILT * Math.sin(theta);
  const cR = Math.cos(SYS_ROT), sR = Math.sin(SYS_ROT);
  return { x: cx + ex * cR - ey * sR, y: cy + ex * sR + ey * cR, z: -Math.sin(theta) };
}

/* ════════════════════════════════════════════════════════════════════
   DRAW — one complete solar system at (cx, cy) with given scale
   ════════════════════════════════════════════════════════════════════ */
function drawSystem(
  ctx     : CanvasRenderingContext2D,
  cx      : number, cy: number, sc: number,
  cfg     : typeof SYSTEMS[number],
  planets : Planet[],
  mx: number, my: number,
  now: number, dt: number,
  isActive: boolean,
  alpha   : number,
  onHov   : (p: Planet) => void,
) {
  ctx.globalAlpha = alpha;

  /* Orbit rings */
  for (let ri = 0; ri < RINGS.length; ri++) {
    const a = Math.max(RINGS[ri].r, RING_MIN[ri]) * sc, b = a * TILT;
    ctx.beginPath(); ctx.ellipse(cx, cy, a, b, SYS_ROT, Math.PI, Math.PI * 2);
    ctx.strokeStyle = `rgba(${cfg.rgb},0.07)`; ctx.lineWidth = 0.7; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx, cy, a, b, SYS_ROT, 0, Math.PI);
    ctx.strokeStyle = `rgba(${cfg.rgb},0.20)`; ctx.lineWidth = isActive ? 1.0 : 0.65; ctx.stroke();
  }

  /* Sun glow */
  const beat = 0.93 + Math.sin(now * 0.001 * 0.65 + cfg.id * 1.2) * 0.07;
  const cR   = (isActive ? 22 : 14) * sc * beat;
  const gR   = cR * 2.8;
  const cG   = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
  cG.addColorStop(0, `rgba(${cfg.rgb},0.38)`);
  cG.addColorStop(0.4, `rgba(${cfg.rgb},0.12)`);
  cG.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = cG; ctx.beginPath(); ctx.arc(cx, cy, gR, 0, Math.PI * 2); ctx.fill();
  const ccG = ctx.createRadialGradient(cx, cy, 0, cx, cy, cR);
  ccG.addColorStop(0, `rgba(${cfg.rgb},0.98)`);
  ccG.addColorStop(0.6, `rgba(${cfg.rgb},0.55)`);
  ccG.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = ccG; ctx.beginPath(); ctx.arc(cx, cy, cR, 0, Math.PI * 2); ctx.fill();

  /* Sun label */
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const fL = Math.max(7, (isActive ? 14 : 11) * sc);
  ctx.font = `700 ${fL}px Jost, sans-serif`;
  ctx.fillStyle = `rgba(244,239,231,${isActive ? 0.90 : 0.62})`;
  ctx.fillText(cfg.label, cx, cy - fL * 0.45);
  ctx.font = `300 ${Math.max(5, fL * 0.58)}px Jost, sans-serif`;
  ctx.fillStyle = `rgba(${cfg.rgb},${isActive ? 0.78 : 0.45})`;
  ctx.fillText(cfg.tag, cx, cy + fL * 0.65);

  /* Planets */
  const sysP  = planets.filter((p) => p.sysId === cfg.id);
  const spMul = isActive ? 1 : 0.22;
  for (const p of sysP) {
    if (!isActive || p.hoverT < 0.5) p.angle += p.speed * dt * spMul;
    const pos = ellipsePoint(cx, cy, Math.max(p.r, p.minR) * sc, p.angle);
    p.x = pos.x; p.y = pos.y; p.z = pos.z;
  }

  const sorted = [...sysP].sort((a, b) => a.z - b.z);
  for (const p of sorted) {
    const pr     = p.pr * sc;
    const depA   = 0.42 + 0.58 * ((p.z + 1) * 0.5);
    let isHov    = false;
    if (isActive) {
      const dx = mx - p.x, dy = my - p.y;
      isHov = Math.sqrt(dx * dx + dy * dy) < pr + 12;
      if (isHov) onHov(p);
    }
    p.hoverT += ((isHov ? 1 : 0) - p.hoverT) * 0.10 * dt;
    const drawR = pr * (1 + p.hoverT * (isActive ? 0.55 : 0));

    if (isHov && p.hoverT > 0.05) {
      ctx.globalAlpha = p.hoverT * depA * alpha;
      const hg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, drawR * 2.5);
      hg.addColorStop(0, `rgba(${cfg.rgb},0.42)`); hg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(p.x, p.y, drawR * 2.5, 0, Math.PI * 2); ctx.fill();
    }
    if (isActive && p.hoverT > 0.06) {
      ctx.globalAlpha = p.hoverT * 0.28 * alpha;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = `rgba(${cfg.rgb},0.8)`; ctx.lineWidth = 0.7;
      ctx.setLineDash([3, 6]); ctx.stroke(); ctx.setLineDash([]);
    }

    ctx.globalAlpha = depA * alpha;
    ctx.save();
    ctx.beginPath(); ctx.arc(p.x, p.y, drawR, 0, Math.PI * 2); ctx.clip();
    if (p.imgOk && p.img) {
      ctx.drawImage(p.img, p.x - drawR, p.y - drawR, drawR * 2, drawR * 2);
      const vig = ctx.createRadialGradient(p.x - drawR * 0.28, p.y - drawR * 0.28, drawR * 0.06, p.x, p.y, drawR);
      vig.addColorStop(0, "rgba(0,0,0,0)"); vig.addColorStop(1, "rgba(0,0,0,0.50)");
      ctx.fillStyle = vig; ctx.fillRect(p.x - drawR, p.y - drawR, drawR * 2, drawR * 2);
    } else {
      const sg = ctx.createRadialGradient(p.x - drawR * 0.3, p.y - drawR * 0.3, 0, p.x, p.y, drawR);
      sg.addColorStop(0, `rgba(${cfg.rgb},0.28)`); sg.addColorStop(1, "rgba(4,2,16,0.9)");
      ctx.fillStyle = sg; ctx.fillRect(p.x - drawR, p.y - drawR, drawR * 2, drawR * 2);
      if (drawR > 7) {
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.font = `600 ${Math.max(7, drawR * 0.6)}px Jost, sans-serif`;
        ctx.fillStyle = `rgba(${cfg.rgb},0.82)`;
        ctx.fillText(p.product.name.charAt(0), p.x, p.y);
      }
    }
    ctx.restore();

    ctx.beginPath(); ctx.arc(p.x, p.y, drawR, 0, Math.PI * 2);
    ctx.strokeStyle = isHov ? `rgba(${cfg.rgb},${0.35 + p.hoverT * 0.60})` : `rgba(${cfg.rgb},0.22)`;
    ctx.lineWidth = isHov ? 2.0 : 0.65; ctx.stroke();
    ctx.globalAlpha = alpha;

    /* Name label */
    if (isActive && p.hoverT > 0.25) {
      const la = Math.min((p.hoverT - 0.25) / 0.42, 1);
      ctx.globalAlpha = la * alpha;
      const fs = Math.max(9, drawR * 0.44);
      const lbl = p.product.name.length > 20 ? p.product.name.slice(0, 20) + "…" : p.product.name;
      ctx.font = `500 ${fs}px Jost, sans-serif`; ctx.textAlign = "center";
      const tw = ctx.measureText(lbl).width, pw = tw + 14, ph = fs + 9;
      const px = p.x - pw / 2, py = p.y + drawR + 8;
      ctx.fillStyle = "rgba(4,2,15,0.92)";
      if ((ctx as any).roundRect) { ctx.beginPath(); (ctx as any).roundRect(px, py, pw, ph, 4); ctx.fill(); }
      else ctx.fillRect(px, py, pw, ph);
      ctx.fillStyle = "rgba(244,239,231,0.96)"; ctx.textBaseline = "top";
      ctx.fillText(lbl, p.x, py + 5);
      ctx.font = `300 ${Math.max(7, fs * 0.68)}px Jost, sans-serif`;
      ctx.fillStyle = `rgba(${cfg.rgb},0.62)`;
      ctx.fillText(p.product.brandName, p.x, py + ph + 3);
      ctx.globalAlpha = alpha;
    }
  }

  /* Corner click label (desktop only, inactive) */
  if (!isActive) {
    const lY = cy + Math.max(RINGS[1].r, RING_MIN[1]) * sc * TILT + RINGS[1].pr * sc + 11;
    ctx.globalAlpha = alpha * 0.55;
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    ctx.font = `400 9px Jost, sans-serif`;
    ctx.fillStyle = cfg.accent;
    ctx.fillText(`${cfg.label}  ›`, cx, lY);
  }

  ctx.globalAlpha = 1;
}

/* ════════════════════════════════════════════════════════════════════
   HERO COMPONENT
   ════════════════════════════════════════════════════════════════════ */
export function Hero() {
  const canvasRef        = useRef<HTMLCanvasElement>(null);
  const planetsRef       = useRef<Planet[]>([]);
  const dAnimsRef        = useRef<SysAnim[]>(SYSTEMS.map(() => ({ x: 0, y: 0, scale: CORNER_SC, hoverT: 0 })));
  /* Mobile scroll */
  const scrollXRef       = useRef(0);
  const targetScrollRef  = useRef(0);
  const isDraggingRef    = useRef(false);
  const dragStartXRef    = useRef(0);
  const liveScrollRef    = useRef(0);
  /* Interaction */
  const mouseRef         = useRef({ x: -99999, y: -99999 });
  const activeIdRef      = useRef<number | null>(null);
  const hoveredPlanetRef = useRef<Planet | null>(null);
  const hoveredSysRef    = useRef<number | null>(null);
  const rafRef           = useRef<number>(0);
  const router           = useRouter();
  const routerRef        = useRef(router);
  routerRef.current      = router;

  const [activeId,  setActiveId]  = useState<number | null>(null);
  const [mobileIdx, setMobileIdx] = useState(0);
  const [ready,     setReady]     = useState(false);
  const activeProducts = useQuery(api.products.listActive);

  useEffect(() => { activeIdRef.current = activeId; }, [activeId]);

  /* ── Build planets ─────────────────────────────────────────────── */
  useEffect(() => {
    if (!activeProducts || activeProducts.length === 0) return;
    const planets: Planet[] = [];
    const PER = 10;
    for (let sid = 0; sid < 4; sid++) {
      const group = activeProducts.slice(sid * PER, (sid + 1) * PER);
      let pi = 0;
      for (let ri = 0; ri < RINGS.length; ri++) {
        const ring = RINGS[ri];
        const n = ri === RINGS.length - 1 ? group.length - pi : Math.min(ring.cap, group.length - pi);
        if (n <= 0) break;
        for (let j = 0; j < n; j++, pi++) {
          const product = group[pi];
          if (!product) continue;
          const angle = (j / n) * Math.PI * 2 + sid * 1.15 + ri * 0.88;
          const planet: Planet = {
            product, sysId: sid, angle, speed: ring.speed,
            r: ring.r, pr: ring.pr, minR: RING_MIN[ri],
            img: null, imgOk: false, x: 0, y: 0, z: 0, hoverT: 0,
          };
          const src = product.images?.[0];
          if (src) {
            const im = new window.Image(); im.crossOrigin = "anonymous";
            im.onload = () => { planet.imgOk = true; };
            im.onerror = () => {};
            im.src = src; planet.img = im;
          }
          planets.push(planet);
        }
      }
    }
    planetsRef.current = planets;
    setTimeout(() => setReady(true), 120);
  }, [activeProducts]);

  /* ── Canvas loop ────────────────────────────────────────────────── */
  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize, { passive: true });
    let prevTime = performance.now();

    function draw(now: number) {
      const dt = Math.min((now - prevTime) / 16.667, 3);
      prevTime = now;
      const W = canvas!.width, H = canvas!.height;
      ctx!.clearRect(0, 0, W, H);

      const planets = planetsRef.current;
      const mx = mouseRef.current.x, my = mouseRef.current.y;
      const isMobile = W < MOBILE_BP;

      let newHovSys: number | null = null;
      let newHovPlanet: Planet | null = null;

      /* ════════════════════════════════════════════════════════════
         SHARED: Central "ETHEREAL DAYO" brand display
         On desktop: always visible (fades a bit when a system is active)
         On mobile: shown in the center of each system's screen-page
         ═══════════════════════════════════════════════════════════ */
      function drawBrand(bx: number, by: number, alphaMulti: number, sizeMul: number) {
        const t     = now * 0.001;
        const beat  = 0.93 + Math.sin(t * 0.55) * 0.07;
        const base  = Math.max(12, Math.min(W, H) * 0.055 * sizeMul);

        /* Outer corona */
        const coronaR = base * 2.2 * beat;
        const cG      = ctx!.createRadialGradient(bx, by, 0, bx, by, coronaR * 3);
        cG.addColorStop(0,   `rgba(255,195,80,${0.28 * alphaMulti})`);
        cG.addColorStop(0.35,`rgba(201,140,50,${0.12 * alphaMulti})`);
        cG.addColorStop(0.65,`rgba(89,40,166,${0.05 * alphaMulti})`);
        cG.addColorStop(1,   "rgba(0,0,0,0)");
        ctx!.fillStyle = cG;
        ctx!.beginPath(); ctx!.arc(bx, by, coronaR * 3, 0, Math.PI * 2); ctx!.fill();

        /* Bright core */
        const ccG = ctx!.createRadialGradient(bx, by, 0, bx, by, base * 0.55 * beat);
        ccG.addColorStop(0,   `rgba(255,245,200,${0.90 * alphaMulti})`);
        ccG.addColorStop(0.45,`rgba(255,185,60,${0.72 * alphaMulti})`);
        ccG.addColorStop(0.85,`rgba(210,110,20,${0.35 * alphaMulti})`);
        ccG.addColorStop(1,   "rgba(0,0,0,0)");
        ctx!.fillStyle = ccG;
        ctx!.beginPath(); ctx!.arc(bx, by, base * 0.55 * beat, 0, Math.PI * 2); ctx!.fill();

        /* Brand text */
        ctx!.textAlign = "center"; ctx!.textBaseline = "middle";
        ctx!.globalAlpha = alphaMulti * (0.65 + Math.sin(t) * 0.08);
        ctx!.font = `300 ${base * 0.58}px Jost, sans-serif`;
        ctx!.fillStyle = "rgba(244,239,231,1)";
        ctx!.fillText("ETHEREAL", bx, by - base * 0.52);

        ctx!.globalAlpha = alphaMulti * (0.92 + Math.sin(t * 1.3) * 0.06);
        ctx!.font = `700 ${base}px Jost, sans-serif`;
        ctx!.fillStyle = "rgba(255,220,120,1)";
        ctx!.fillText("DAYO", bx, by + base * 0.18);

        ctx!.globalAlpha = alphaMulti * 0.38;
        ctx!.font = `300 ${Math.max(6, base * 0.28)}px Jost, sans-serif`;
        ctx!.fillStyle = "rgba(201,169,97,1)";
        ctx!.fillText("MAISON DE PARFUM", bx, by + base * 0.80);

        ctx!.globalAlpha = 1;
      }

      /* ════════════════════════════════════════════════════════════
         MOBILE MODE — horizontal swipe between full-screen systems
         ════════════════════════════════════════════════════════ */
      if (isMobile) {
        if (!isDraggingRef.current) {
          scrollXRef.current += (targetScrollRef.current - scrollXRef.current) * 0.15 * dt;
        } else {
          scrollXRef.current = liveScrollRef.current;
        }
        const scrollX    = scrollXRef.current;
        // Increased scale by 25% to make planets and images much larger/clearer on mobile
        const mobileScale = Math.min(1.2, Math.min(W, H) * 0.55 / RINGS[1].r);
        const curIdx     = Math.round(scrollX / W);

        for (let sid = 0; sid < 4; sid++) {
          const sysCX = W / 2 + sid * W - scrollX;
          if (sysCX < -W * 0.65 || sysCX > W * 1.65) continue;

          const sysCY     = H / 2;
          const isVis     = sid === curIdx;
          const proxAlpha = 1 - Math.min(1, Math.abs(sysCX - W / 2) / W);

          /* Brand in center of each system page */
          drawBrand(sysCX, sysCY, proxAlpha * 0.85, 0.75);

          drawSystem(
            ctx!, sysCX, sysCY, mobileScale,
            SYSTEMS[sid], planets, mx, my, now, dt,
            /* isActive= */ isVis,
            /* alpha=    */ 0.30 + proxAlpha * 0.70,
            (p) => { newHovPlanet = p; }
          );
        }

      } else {
        /* ════════════════════════════════════════════════════════
           DESKTOP MODE — 4 corners + click-to-center
           ════════════════════════════════════════════════════ */
        const curActive = activeIdRef.current;
        const hasActive = curActive !== null;
        const dynScale  = Math.min(1.0, Math.min(W, H) * 0.42 / RINGS[1].r);
        const dAnims    = dAnimsRef.current;

        /* Central brand — always visible, fades when a collection is centered */
        const brandAlpha = hasActive ? 0.18 : 0.88;
        drawBrand(W / 2, H / 2, brandAlpha, 1.0);

        for (let sid = 0; sid < 4; sid++) {
          const cfg  = SYSTEMS[sid];
          const anim = dAnims[sid];
          const isAct = curActive === sid;

          const tgX = isAct ? W * 0.5 : W * cfg.cf[0];
          const tgY = isAct ? H * 0.5 : H * cfg.cf[1];

          let sysHov = false;
          if (!isAct) {
            const dsx = mx - anim.x, dsy = my - anim.y;
            sysHov = Math.sqrt(dsx * dsx + dsy * dsy) < RINGS[1].r * anim.scale * 1.5;
            if (sysHov) newHovSys = sid;
          }
          anim.hoverT += ((sysHov ? 1 : 0) - anim.hoverT) * 0.10 * dt;

          const tgScale = isAct ? dynScale : (sysHov ? HOVER_SC : CORNER_SC);
          anim.x     += (tgX     - anim.x)     * LERP * dt;
          anim.y     += (tgY     - anim.y)     * LERP * dt;
          anim.scale += (tgScale - anim.scale) * LERP * dt;

          const sysAlpha = hasActive && !isAct ? 0.25 + anim.hoverT * 0.28 : 1.0;

          drawSystem(
            ctx!, anim.x, anim.y, anim.scale,
            cfg, planets, mx, my, now, dt,
            /* isActive= */ isAct,
            /* alpha=    */ sysAlpha,
            (p) => { newHovPlanet = p; }
          );
        }
      }

      hoveredSysRef.current    = newHovSys;
      hoveredPlanetRef.current = newHovPlanet;
      canvas!.style.cursor     = (newHovPlanet || newHovSys !== null) ? "pointer" : "default";
      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
  }, [ready]);

  /* ── Mouse ──────────────────────────────────────────────────────── */
  useEffect(() => {
    const mv = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", mv, { passive: true });
    return () => window.removeEventListener("mousemove", mv);
  }, []);

  /* ── Desktop click ──────────────────────────────────────────────── */
  const handleClick = useCallback(() => {
    if (canvasRef.current && canvasRef.current.width >= MOBILE_BP) {
      const hovPlanet = hoveredPlanetRef.current;
      const hovSys    = hoveredSysRef.current;
      const curActive = activeIdRef.current;
      if (hovPlanet?.product.slug) { routerRef.current.push(`/product/${hovPlanet.product.slug}`); return; }
      if (hovSys !== null) { setActiveId((p) => (p === hovSys ? null : hovSys)); return; }
      if (curActive !== null) setActiveId(null);
    }
  }, []);

  /* ── Mobile touch ───────────────────────────────────────────────── */
  const dragStartYRef = useRef(0);
  const isVerticalScrollRef = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const W = window.innerWidth;
    if (W >= MOBILE_BP) return;
    isDraggingRef.current = true;
    isVerticalScrollRef.current = false;
    dragStartXRef.current = e.touches[0].clientX;
    dragStartYRef.current = e.touches[0].clientY;
    liveScrollRef.current = scrollXRef.current;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const W = window.innerWidth;
    const tx = e.touches[0].clientX;
    const ty = e.touches[0].clientY;
    mouseRef.current = { x: tx, y: ty };
    
    if (W < MOBILE_BP && isDraggingRef.current) {
      const dx = Math.abs(tx - dragStartXRef.current);
      const dy = Math.abs(ty - dragStartYRef.current);
      
      // If moving mostly vertically, let the browser scroll the page
      if (dy > dx && dy > 10) {
        isVerticalScrollRef.current = true;
      }
      
      if (!isVerticalScrollRef.current) {
        const delta = dragStartXRef.current - tx;
        liveScrollRef.current = targetScrollRef.current + delta;
      }
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const W = window.innerWidth;
    if (W < MOBILE_BP) {
      isDraggingRef.current = false;
      if (isVerticalScrollRef.current) return; // Was a vertical scroll, ignore swipe

      const endX     = e.changedTouches[0]?.clientX ?? dragStartXRef.current;
      const rawDelta = dragStartXRef.current - endX;
      
      // If it's a tap (barely moved), try to navigate
      if (Math.abs(rawDelta) < 10) {
        const hovPlanet = hoveredPlanetRef.current;
        if (hovPlanet?.product.slug) {
          routerRef.current.push(`/product/${hovPlanet.product.slug}`);
        }
      } else {
        // Handle swipe pagination
        setMobileIdx((prev) => {
          const next = Math.max(0, Math.min(3,
            rawDelta > W * 0.15 ? prev + 1 : rawDelta < -W * 0.15 ? prev - 1 : prev
          ));
          targetScrollRef.current = next * W;
          return next;
        });
      }
    } else {
      const hovPlanet = hoveredPlanetRef.current;
      const hovSys    = hoveredSysRef.current;
      const curActive = activeIdRef.current;
      if (hovPlanet?.product.slug) routerRef.current.push(`/product/${hovPlanet.product.slug}`);
      else if (hovSys !== null) setActiveId((p) => (p === hovSys ? null : hovSys));
      else if (curActive !== null) setActiveId(null);
    }
    setTimeout(() => { mouseRef.current = { x: -99999, y: -99999 }; }, 450);
  }, []);

  return (
    <section
      className="relative h-dvh w-full overflow-hidden"
      aria-label="Ethereal Dayo — Browse Collections"
      style={{ background: "#04020F" }}
    >
      <div className="absolute inset-0 z-[1]"><ParticleCloud /></div>

      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-[2] w-full h-full"
        style={{ touchAction: "pan-y" }}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        aria-label="Ethereal Dayo fragrance collections solar system"
      />

      {/* Loading spinner */}
      <AnimatePresence>
        {!ready && (
          <motion.div key="loader" initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 1 } }}
            className="absolute inset-0 z-[5] flex flex-col items-center justify-center gap-5 pointer-events-none"
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 rounded-full"
              style={{ border: "1px solid rgba(201,169,97,0.12)", borderTopColor: "rgba(255,200,80,0.7)" }}
            />
            <span className="text-[9px] tracking-[0.55em] uppercase text-gold/30 font-body">
              Mapping Collections
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile: collection name top pill */}
      <AnimatePresence mode="wait">
        {ready && (
          <motion.div key={`mob-label-${mobileIdx}`}
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.35 }}
            className="absolute top-[72px] left-0 right-0 z-[4] flex justify-center sm:hidden pointer-events-none"
          >
            <span
              className="px-4 py-1.5 rounded-full text-[9px] tracking-[0.45em] uppercase font-body"
              style={{ background: `${SYSTEMS[mobileIdx].accent}22`, color: SYSTEMS[mobileIdx].accent, border: `1px solid ${SYSTEMS[mobileIdx].accent}40` }}
            >
              {SYSTEMS[mobileIdx].label}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile: pagination dots */}
      <div className="absolute bottom-14 left-0 right-0 z-[4] flex justify-center gap-3 sm:hidden pointer-events-none">
        {SYSTEMS.map((sys, i) => (
          <motion.div key={sys.id}
            animate={{ scale: i === mobileIdx ? 1.5 : 1, opacity: i === mobileIdx ? 1 : 0.25 }}
            transition={{ duration: 0.3 }}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: i === mobileIdx ? sys.accent : "#fff" }}
          />
        ))}
      </div>

      {/* Mobile hint */}
      <div className="absolute bottom-5 left-0 right-0 z-[3] flex flex-col items-center gap-1 pointer-events-none sm:hidden">
        <span className="text-[7px] tracking-[0.5em] uppercase text-bone/20 font-body">
          ← Swipe to browse · Tap to explore →
        </span>
      </div>

      {/* Desktop: back button */}
      <AnimatePresence>
        {activeId !== null && (
          <motion.button key="back"
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            onClick={() => setActiveId(null)}
            className="absolute top-[72px] left-1/2 -translate-x-1/2 z-[4] hidden sm:flex items-center px-4 py-2"
          >
            <span className="text-[8px] tracking-[0.5em] uppercase text-bone/30 font-body hover:text-bone/60 transition-colors">
              ← All Collections
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Desktop bottom hint */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: ready ? 1 : 0 }} transition={{ duration: 1.5, delay: 2 }}
        className="absolute bottom-5 left-0 right-0 z-[3] hidden sm:flex flex-col items-center gap-1.5 pointer-events-none"
      >
        <span className="text-[7px] tracking-[0.5em] uppercase text-bone/18 font-body">
          {activeId !== null ? "Hover a fragrance · Click to open" : "Click a corner to explore the collection"}
        </span>
      </motion.div>
    </section>
  );
}
