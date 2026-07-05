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
   SOLAR SYSTEM CONSTANTS
   ════════════════════════════════════════════════════════════════════

   TILT     = perspective compression (minor/major ratio).
              0.45 gives a clear tilt without collapsing inner rings.
   SYS_ROT  = rotation of the whole disc in screen space (radians).
   GAP_PAD  = extra gap multiplier between planet edges (≥1 = touching,
              1.3 = 30% gap, 1.5 = 50% gap, etc.)
   ═══════════════════════════════════════════════════════════════════ */
const TILT    = 0.45;
const SYS_ROT = -0.20;
const GAP_PAD = 1.45;   // guaranteed clear space between planet edges

/* Ring definitions. Orbit radius is computed as:
      actual_a = max( aFrac × base,  minNoOverlapRadius )
   so planets never collide even on tiny screens.

   Counts: sparser inner rings (like the real solar system),
   more populated outer rings.                                        */
const RING_DEFS = [
  { aFrac: 0.14, speed:  0.009,   pr: 36, count: 3  },
  { aFrac: 0.25, speed: -0.006,   pr: 33, count: 4  },
  { aFrac: 0.38, speed:  0.0042,  pr: 30, count: 6  },
  { aFrac: 0.54, speed: -0.0028,  pr: 28, count: 8  },
  { aFrac: 0.74, speed:  0.0018,  pr: 25, count: 10 },
  { aFrac: 0.98, speed: -0.0013,  pr: 23, count: 9  },
];
// Total = 3+4+6+8+10+9 = 40 slots

/* Minimum orbit radius that guarantees GAP_PAD between planet edges
   at the narrowest (most compressed) point of the perspective ellipse. */
function minOrbitRadius(n: number, pr: number): number {
  if (n <= 1) return pr * 2;
  // chord between adjacent planets at "top/bottom" of ellipse ≥ GAP_PAD × 2pr
  // chord = 2 × a × TILT × sin(π/n)
  // → a ≥ GAP_PAD × pr / (TILT × sin(π/n))
  return (GAP_PAD * pr) / (TILT * Math.sin(Math.PI / n));
}

type Product = {
  _id: string; name: string; slug?: string;
  images: string[]; brandName: string;
};

type Planet = {
  product : Product;
  ringIdx : number;
  angle   : number;    // current orbital angle (rad)
  speed   : number;    // rad / normalised frame
  a       : number;    // actual semi-major axis px (computed each frame)
  minA    : number;    // minimum a to avoid overlap (precomputed once)
  pr      : number;    // planet radius px
  img     : HTMLImageElement | null;
  imgOk   : boolean;
  x       : number;   // screen position last frame
  y       : number;
  z       : number;   // depth (-1=far, +1=near)
  hoverT  : number;   // 0→1 hover progress
};

/* Planet screen position on a perspective-tilted ellipse.           */
function ellipsePoint(cx: number, cy: number, a: number, theta: number) {
  const ex   = a * Math.cos(theta);
  const ey   = a * TILT * Math.sin(theta);
  const cosR = Math.cos(SYS_ROT);
  const sinR = Math.sin(SYS_ROT);
  return {
    x : cx + ex * cosR - ey * sinR,
    y : cy + ex * sinR + ey * cosR,
    z : -Math.sin(theta),   // >0 = near viewer
  };
}

/* ════════════════════════════════════════════════════════════════════ */
export function Hero() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const planetsRef = useRef<Planet[]>([]);
  const mouseRef   = useRef({ x: -99999, y: -99999 });
  const hoveredRef = useRef<Planet | null>(null);
  const rafRef     = useRef<number>(0);
  const router     = useRouter();
  const routerRef  = useRef(router);
  routerRef.current = router;

  const activeProducts = useQuery(api.products.listActive);
  const [ready, setReady] = useState(false);

  /* ── Build planet list ──────────────────────────────────────────── */
  useEffect(() => {
    if (!activeProducts || activeProducts.length === 0) return;

    const planets: Planet[] = [];
    let pIdx = 0;

    for (let ri = 0; ri < RING_DEFS.length; ri++) {
      const ring = RING_DEFS[ri];
      const n    = ri === RING_DEFS.length - 1
        ? activeProducts.length - pIdx
        : Math.min(ring.count, activeProducts.length - pIdx);
      if (n <= 0) break;

      const precomputedMinA = minOrbitRadius(n, ring.pr);

      for (let j = 0; j < n; j++, pIdx++) {
        const product    = activeProducts[pIdx];
        // Even spacing + angular stagger per ring
        const startAngle = (j / n) * Math.PI * 2 + ri * 1.05;

        const planet: Planet = {
          product, ringIdx: ri,
          angle: startAngle, speed: ring.speed,
          a: precomputedMinA, minA: precomputedMinA, pr: ring.pr,
          img: null, imgOk: false,
          x: 0, y: 0, z: 0, hoverT: 0,
        };

        const src = product.images?.[0];
        if (src) {
          const im       = new window.Image();
          im.crossOrigin = "anonymous";
          im.onload  = () => { planet.imgOk = true; };
          im.onerror = () => { planet.imgOk = false; };
          im.src     = src;
          planet.img = im;
        }

        planets.push(planet);
      }
    }

    planetsRef.current = planets;
    setTimeout(() => setReady(true), 120);
  }, [activeProducts]);

  /* ── Canvas draw loop ───────────────────────────────────────────── */
  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    let prevTime = performance.now();

    function draw(now: number) {
      const dt  = Math.min((now - prevTime) / 16.667, 3);
      prevTime  = now;

      const W  = canvas!.width;
      const H  = canvas!.height;
      const cx = W / 2;
      const cy = H / 2;
      /* Base unit: max(W,H) × 0.50 — inner rings visible, outer bleed off */
      const base = Math.max(W, H) * 0.50;

      ctx!.clearRect(0, 0, W, H);

      const planets = planetsRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      /* ── Update actual orbit radii ─────────────────────────────── */
      for (let ri = 0; ri < RING_DEFS.length; ri++) {
        const ring     = RING_DEFS[ri];
        const desired  = ring.aFrac * base;
        const minA     = planets.find(p => p.ringIdx === ri)?.minA ?? ring.pr * 2;
        const actual   = Math.max(desired, minA);
        for (const p of planets) if (p.ringIdx === ri) p.a = actual;
      }

      /* ── Orbit ellipse paths ───────────────────────────────────── */
      for (let ri = 0; ri < RING_DEFS.length; ri++) {
        const a = planets.find(p => p.ringIdx === ri)?.a ?? 0;
        if (a === 0) continue;
        const b = a * TILT;

        /* Back half — dimmer (far side of the disc) */
        ctx!.beginPath();
        ctx!.ellipse(cx, cy, a, b, SYS_ROT, Math.PI, Math.PI * 2);
        ctx!.strokeStyle = "rgba(210,200,175,0.07)";
        ctx!.lineWidth   = 0.8;
        ctx!.stroke();

        /* Front half — brighter (near side) */
        ctx!.beginPath();
        ctx!.ellipse(cx, cy, a, b, SYS_ROT, 0, Math.PI);
        ctx!.strokeStyle = "rgba(220,210,185,0.18)";
        ctx!.lineWidth   = 1.0;
        ctx!.stroke();
      }

      /* ── Sun ───────────────────────────────────────────────────── */
      const pulse = now * 0.001;
      const beat  = 0.93 + Math.sin(pulse * 0.65) * 0.07;

      const coronaR = base * 0.060 * beat;
      const coronaG = ctx!.createRadialGradient(cx, cy, 0, cx, cy, coronaR * 3.8);
      coronaG.addColorStop(0,    "rgba(255,195,80,0.30)");
      coronaG.addColorStop(0.35, "rgba(201,140,50,0.15)");
      coronaG.addColorStop(0.65, "rgba(89,40,166,0.06)");
      coronaG.addColorStop(1,    "rgba(0,0,0,0)");
      ctx!.fillStyle = coronaG;
      ctx!.beginPath();
      ctx!.arc(cx, cy, coronaR * 3.8, 0, Math.PI * 2);
      ctx!.fill();

      const coreR = base * 0.028 * beat;
      const coreG = ctx!.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      coreG.addColorStop(0,   "rgba(255,248,210,1)");
      coreG.addColorStop(0.4, "rgba(255,185,60,0.85)");
      coreG.addColorStop(0.8, "rgba(210,110,20,0.45)");
      coreG.addColorStop(1,   "rgba(0,0,0,0)");
      ctx!.fillStyle = coreG;
      ctx!.beginPath();
      ctx!.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx!.fill();

      /* Sun text */
      const fB = Math.max(11, base * 0.048);
      ctx!.textAlign    = "center";
      ctx!.textBaseline = "middle";
      ctx!.font      = `300 ${fB * 0.58}px Jost, sans-serif`;
      ctx!.fillStyle = `rgba(244,239,231,${0.62 + Math.sin(pulse) * 0.08})`;
      ctx!.fillText("ETHEREAL", cx, cy - fB * 0.50);
      ctx!.font      = `700 ${fB}px Jost, sans-serif`;
      ctx!.fillStyle = `rgba(255,220,120,${0.92 + Math.sin(pulse * 1.3) * 0.06})`;
      ctx!.fillText("DAYO", cx, cy + fB * 0.20);
      ctx!.font      = `300 ${Math.max(6, fB * 0.26)}px Jost, sans-serif`;
      ctx!.fillStyle = "rgba(201,169,97,0.32)";
      ctx!.fillText("MAISON DE PARFUM", cx, cy + fB * 0.78);

      /* ── Advance angles & hover detection ──────────────────────── */
      let newHovered: Planet | null = null;

      for (const p of planets) {
        /* Advance orbit (freeze when almost fully hovered) */
        if (p.hoverT < 0.55) {
          p.angle += p.speed * dt;
        }

        const home = ellipsePoint(cx, cy, p.a, p.angle);
        p.z = home.z;

        /* Hover check against LAST frame's rendered position */
        const dx   = mx - p.x;
        const dy   = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const isHov = dist < p.pr + 14;

        if (isHov) newHovered = p;

        /* Smooth hover progress */
        p.hoverT += ((isHov ? 1 : 0) - p.hoverT) * 0.10 * dt;

        /* Drift toward cursor on hover */
        if (p.hoverT > 0.02) {
          const pull = p.hoverT * 0.30;
          p.x = home.x + (mx - home.x) * pull;
          p.y = home.y + (my - home.y) * pull;
        } else {
          p.x = home.x;
          p.y = home.y;
        }
      }

      /* ── Depth-sort: back → front ──────────────────────────────── */
      const sorted = [...planets].sort((a, b) => a.z - b.z);

      /* ── Draw planets ──────────────────────────────────────────── */
      for (const p of sorted) {
        const scale      = 1 + p.hoverT * 0.70;
        const pr         = p.pr * scale;
        const depthAlpha = 0.48 + 0.52 * ((p.z + 1) * 0.5);

        /* Connection line to sun */
        if (p.hoverT > 0.06) {
          ctx!.globalAlpha = p.hoverT * 0.32;
          ctx!.beginPath();
          ctx!.moveTo(cx, cy);
          ctx!.lineTo(p.x, p.y);
          ctx!.strokeStyle = "rgba(255,210,100,0.85)";
          ctx!.lineWidth   = 0.8;
          ctx!.setLineDash([3, 7]);
          ctx!.stroke();
          ctx!.setLineDash([]);
          ctx!.globalAlpha = 1;
        }

        /* Hover glow halo */
        if (p.hoverT > 0.04) {
          ctx!.globalAlpha = p.hoverT * depthAlpha;
          const hg = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, pr * 2.6);
          hg.addColorStop(0, "rgba(255,200,80,0.40)");
          hg.addColorStop(1, "rgba(0,0,0,0)");
          ctx!.fillStyle = hg;
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, pr * 2.6, 0, Math.PI * 2);
          ctx!.fill();
          ctx!.globalAlpha = 1;
        }

        /* Planet body */
        ctx!.globalAlpha = depthAlpha;
        ctx!.save();
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, pr, 0, Math.PI * 2);
        ctx!.clip();

        if (p.imgOk && p.img) {
          ctx!.drawImage(p.img, p.x - pr, p.y - pr, pr * 2, pr * 2);
          /* Spherical edge vignette */
          const vig = ctx!.createRadialGradient(
            p.x - pr * 0.28, p.y - pr * 0.28, pr * 0.08,
            p.x, p.y, pr
          );
          vig.addColorStop(0, "rgba(0,0,0,0)");
          vig.addColorStop(1, "rgba(0,0,0,0.50)");
          ctx!.fillStyle = vig;
          ctx!.fillRect(p.x - pr, p.y - pr, pr * 2, pr * 2);
        } else {
          const RING_COLS = ["#3B1A6B","#182A5A","#1B3D2A","#5A2A18","#3A1A3B","#1A3B4A"];
          const sg = ctx!.createRadialGradient(
            p.x - pr * 0.32, p.y - pr * 0.32, 0,
            p.x, p.y, pr
          );
          sg.addColorStop(0, RING_COLS[p.ringIdx] ?? "#2D1457");
          sg.addColorStop(1, "#040210");
          ctx!.fillStyle = sg;
          ctx!.fillRect(p.x - pr, p.y - pr, pr * 2, pr * 2);
          ctx!.fillStyle    = "rgba(201,169,97,0.78)";
          ctx!.font         = `600 ${Math.max(9, pr * 0.62)}px Jost, sans-serif`;
          ctx!.textAlign    = "center";
          ctx!.textBaseline = "middle";
          ctx!.fillText(p.product.name.charAt(0), p.x, p.y);
        }
        ctx!.restore();

        /* Border ring */
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, pr, 0, Math.PI * 2);
        ctx!.strokeStyle = p.hoverT > 0.08
          ? `rgba(255,215,100,${0.25 + p.hoverT * 0.65})`
          : "rgba(255,240,200,0.15)";
        ctx!.lineWidth = p.hoverT > 0.08 ? 2 : 0.6;
        ctx!.stroke();
        ctx!.globalAlpha = 1;

        /* Name label */
        if (p.hoverT > 0.25) {
          const a     = Math.min((p.hoverT - 0.25) / 0.45, 1);
          ctx!.globalAlpha = a;
          ctx!.textAlign   = "center";
          const fs     = Math.max(10, pr * 0.46);
          const label  = p.product.name.length > 22
            ? p.product.name.slice(0, 22) + "…"
            : p.product.name;
          ctx!.font = `500 ${fs}px Jost, sans-serif`;
          const tw  = ctx!.measureText(label).width;
          const pw  = tw + 18;
          const ph  = fs + 10;
          const px  = p.x - pw / 2;
          const py  = p.y + pr + 9;

          ctx!.fillStyle = "rgba(6,3,16,0.92)";
          if ((ctx as any).roundRect) {
            ctx!.beginPath();
            (ctx as any).roundRect(px, py, pw, ph, 5);
            ctx!.fill();
          } else {
            ctx!.fillRect(px, py, pw, ph);
          }
          ctx!.fillStyle    = "rgba(244,239,231,0.96)";
          ctx!.textBaseline = "top";
          ctx!.fillText(label, p.x, py + 5);
          ctx!.font      = `300 ${Math.max(7, fs * 0.68)}px Jost, sans-serif`;
          ctx!.fillStyle = "rgba(201,169,97,0.62)";
          ctx!.fillText(p.product.brandName, p.x, py + ph + 3);
          ctx!.globalAlpha = 1;
        }
      }

      hoveredRef.current   = newHovered;
      canvas!.style.cursor = newHovered ? "pointer" : "default";

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [ready]);

  /* ── Mouse ──────────────────────────────────────────────────────── */
  useEffect(() => {
    const onMove = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  /* ── Click ──────────────────────────────────────────────────────── */
  const handleClick = useCallback(() => {
    const p = hoveredRef.current;
    if (p?.product.slug) routerRef.current.push(`/product/${p.product.slug}`);
  }, []);

  /* ── Touch ──────────────────────────────────────────────────────── */
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);
  const handleTouchEnd = useCallback(() => {
    const p = hoveredRef.current;
    if (p?.product.slug) routerRef.current.push(`/product/${p.product.slug}`);
    setTimeout(() => { mouseRef.current = { x: -99999, y: -99999 }; }, 450);
  }, []);

  return (
    <section
      className="relative h-dvh w-full overflow-hidden"
      aria-label="Ethereal Dayo — Fragrance Solar System"
      style={{ background: "#04020F" }}
    >
      <div className="absolute inset-0 z-[1]"><ParticleCloud /></div>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-[2] w-full h-full"
        onClick={handleClick}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        aria-label="Solar system of fragrances"
      />
      <AnimatePresence>
        {!ready && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.2 } }}
            className="absolute inset-0 z-[5] flex flex-col items-center justify-center gap-5 pointer-events-none"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 rounded-full"
              style={{ border: "1px solid rgba(201,169,97,0.12)", borderTopColor: "rgba(255,200,80,0.7)" }}
            />
            <span className="text-[9px] tracking-[0.55em] uppercase text-gold/30 font-body">
              Mapping the Collection
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ duration: 1.5, delay: 2 }}
        className="absolute bottom-6 left-0 right-0 z-[3] flex flex-col items-center gap-2 pointer-events-none"
      >
        <span className="text-[8px] tracking-[0.5em] uppercase text-bone/20 font-body">
          Hover a fragrance · Click to explore
        </span>
        <motion.div
          animate={{ y: [0, 6, 0], opacity: [0.08, 0.35, 0.08] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-5 bg-gradient-to-b from-gold/30 to-transparent"
        />
      </motion.div>
    </section>
  );
}
