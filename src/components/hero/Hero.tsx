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

/* ════════════════════════════════════════════════════════════════════════
   SOLAR SYSTEM PARAMETERS
   ════════════════════════════════════════════════════════════════════════
   Orbits are ELLIPSES rendered in perspective — like looking at the
   solar system from a slight angle above and to the side.

   TILT     : perspective compression (minor/major ratio).
               0 = perfectly edge-on, 1 = top-down circle.
   SYS_ROT  : how much the whole disc is rotated in 2D canvas space.
   ═══════════════════════════════════════════════════════════════════════ */
const TILT    = 0.28;   // controls how "flat" the perspective looks
const SYS_ROT = -0.22;  // radians — slight tilt so it matches the reference image

/*  Ring definitions
    a      : semi-major axis as a fraction of the "base" unit
    speed  : radians per normalised frame (sign = CW vs CCW)
    pr     : planet display radius in px
    count  : how many products on this ring                           */
const RING_DEFS = [
  { aFrac: 0.09,  speed:  0.0018,  pr: 28, count: 2  },
  { aFrac: 0.16,  speed: -0.0012,  pr: 32, count: 3  },
  { aFrac: 0.26,  speed:  0.00085, pr: 36, count: 5  },
  { aFrac: 0.38,  speed: -0.00055, pr: 34, count: 7  },
  { aFrac: 0.54,  speed:  0.00038, pr: 30, count: 10 },
  { aFrac: 0.74,  speed: -0.00025, pr: 26, count: 13 },
];
// Total = 2+3+5+7+10+13 = 40 slots (extra products fill ring 6)

type Product = {
  _id: string;
  name: string;
  slug?: string;
  images: string[];
  brandName: string;
};

type Planet = {
  product: Product;
  ringIndex: number;
  angle:   number;   // current orbital angle (radians)
  speed:   number;   // radians / frame
  a:       number;   // semi-major axis (px) — set on first draw
  pr:      number;   // planet radius (px)
  img:     HTMLImageElement | null;
  imgOk:   boolean;
  // rendered screen position
  x: number;
  y: number;
  z: number;         // depth (-1 = far, +1 = near viewer)
  // hover animation [0,1]
  hoverT: number;
};

/* ── Planet position on a perspective ellipse ───────────────────────────
   The ellipse has semi-major axis `a` (horizontal) and
   semi-minor axis `a * TILT` (vertical, compressed for perspective).
   The whole disc is then rotated by SYS_ROT in screen space.           */
function ellipsePoint(cx: number, cy: number, a: number, theta: number) {
  const ex = a * Math.cos(theta);
  const ey = a * TILT * Math.sin(theta);
  const cosR = Math.cos(SYS_ROT);
  const sinR = Math.sin(SYS_ROT);
  return {
    x: cx + ex * cosR - ey * sinR,
    y: cy + ex * sinR + ey * cosR,
    // z: negative sin(theta) = farther when at "top" of ellipse (away from viewer)
    z: -Math.sin(theta),
  };
}

/* ════════════════════════════════════════════════════════════════════════
   HERO COMPONENT
   ════════════════════════════════════════════════════════════════════════ */
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

  /* ── Build planets once products arrive ─────────────────────────── */
  useEffect(() => {
    if (!activeProducts || activeProducts.length === 0) return;

    const planets: Planet[] = [];
    let pIdx = 0;

    for (let ri = 0; ri < RING_DEFS.length; ri++) {
      const ring  = RING_DEFS[ri];
      // fill this ring — cap at available products
      const n = ri === RING_DEFS.length - 1
        ? activeProducts.length - pIdx  // last ring gets all remaining
        : Math.min(ring.count, activeProducts.length - pIdx);

      if (n <= 0) break;

      for (let j = 0; j < n; j++, pIdx++) {
        const product = activeProducts[pIdx];
        // Evenly distribute + stagger per ring so planets don't stack radially
        const startAngle = (j / n) * Math.PI * 2 + ri * 0.9;

        const planet: Planet = {
          product,
          ringIndex: ri,
          angle: startAngle,
          speed: ring.speed,
          a: 0,         // computed on first frame from canvas size
          pr: ring.pr,
          img: null,
          imgOk: false,
          x: 0, y: 0, z: 0,
          hoverT: 0,
        };

        const src = product.images?.[0];
        if (src) {
          const im = new window.Image();
          im.crossOrigin = "anonymous";
          im.onload  = () => { planet.imgOk = true; };
          im.onerror = () => { planet.imgOk = false; };
          im.src = src;
          planet.img = im;
        }

        planets.push(planet);
      }
    }

    planetsRef.current = planets;
    setTimeout(() => setReady(true), 150);
  }, [activeProducts]);

  /* ── Canvas render loop ─────────────────────────────────────────── */
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

    let lastT = 0;

    function draw(now: number) {
      const dt  = Math.min((now - lastT) / 16, 3);
      lastT = now;

      const W  = canvas!.width;
      const H  = canvas!.height;
      const cx = W / 2;
      const cy = H / 2;

      /* Base unit: use the larger dimension so outer rings bleed off
         the shorter edges — exactly like in the reference image.      */
      const base = Math.max(W, H) * 0.48;

      ctx!.clearRect(0, 0, W, H);

      const planets = planetsRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      /* ── Update semi-major axes from current canvas size ──────── */
      for (let ri = 0; ri < RING_DEFS.length; ri++) {
        const a = RING_DEFS[ri].aFrac * base;
        for (const p of planets) {
          if (p.ringIndex === ri) p.a = a;
        }
      }

      /* ── Draw orbital ellipses (back half dimmer) ─────────────── */
      for (let ri = 0; ri < RING_DEFS.length; ri++) {
        const a = RING_DEFS[ri].aFrac * base;
        const b = a * TILT;

        // Draw BACK half (far from viewer) — very dim
        ctx!.beginPath();
        ctx!.ellipse(cx, cy, a, b, SYS_ROT, Math.PI, Math.PI * 2);
        ctx!.strokeStyle = "rgba(220,210,190,0.06)";
        ctx!.lineWidth   = 0.8;
        ctx!.stroke();

        // Draw FRONT half (near viewer) — brighter
        ctx!.beginPath();
        ctx!.ellipse(cx, cy, a, b, SYS_ROT, 0, Math.PI);
        ctx!.strokeStyle = "rgba(220,210,190,0.13)";
        ctx!.lineWidth   = 0.9;
        ctx!.stroke();
      }

      /* ── Sun glow ─────────────────────────────────────────────── */
      const t    = now * 0.001;
      const beat = 0.92 + Math.sin(t * 0.7) * 0.08;

      // Outer corona
      const coronaR = base * 0.058 * beat;
      const corona  = ctx!.createRadialGradient(cx, cy, 0, cx, cy, coronaR * 3);
      corona.addColorStop(0,   "rgba(255,200,100,0.22)");
      corona.addColorStop(0.35,"rgba(201,169,97,0.14)");
      corona.addColorStop(0.65,"rgba(89,40,166,0.07)");
      corona.addColorStop(1,   "rgba(0,0,0,0)");
      ctx!.fillStyle = corona;
      ctx!.beginPath();
      ctx!.arc(cx, cy, coronaR * 3, 0, Math.PI * 2);
      ctx!.fill();

      // Core bright ball
      const coreR = base * 0.028 * beat;
      const core  = ctx!.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      core.addColorStop(0,   "rgba(255,240,180,0.95)");
      core.addColorStop(0.4, "rgba(255,190,60,0.8)");
      core.addColorStop(0.75,"rgba(201,130,40,0.5)");
      core.addColorStop(1,   "rgba(0,0,0,0)");
      ctx!.fillStyle = core;
      ctx!.beginPath();
      ctx!.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx!.fill();

      /* ── Sun brand text ───────────────────────────────────────── */
      const fBase = Math.max(11, base * 0.048);
      ctx!.textAlign    = "center";
      ctx!.textBaseline = "middle";

      ctx!.font      = `300 ${fBase * 0.62}px Jost, sans-serif`;
      ctx!.fillStyle = `rgba(244,239,231,${0.65 + Math.sin(t) * 0.08})`;
      ctx!.fillText("ETHEREAL", cx, cy - fBase * 0.5);

      ctx!.font      = `700 ${fBase}px Jost, sans-serif`;
      ctx!.fillStyle = `rgba(255,220,130,${0.9 + Math.sin(t * 1.4) * 0.07})`;
      ctx!.fillText("DAYO", cx, cy + fBase * 0.2);

      ctx!.font      = `300 ${Math.max(6, fBase * 0.28)}px Jost, sans-serif`;
      ctx!.fillStyle = "rgba(201,169,97,0.38)";
      ctx!.fillText("MAISON DE PARFUM", cx, cy + fBase * 0.78);

      /* ── Update planet positions & hover state ────────────────── */
      let newHovered: Planet | null = null;

      for (const p of planets) {
        // Advance orbit
        if (p.hoverT < 0.05) {
          p.angle += p.speed * dt;
        }

        // Ellipse position
        const pos = ellipsePoint(cx, cy, p.a, p.angle);
        p.z = pos.z;

        // Hover check on previous frame's position
        const dx = mx - p.x;
        const dy = my - p.y;
        const isHov = Math.sqrt(dx * dx + dy * dy) < p.pr * (1 + p.hoverT) + 10;
        if (isHov) {
          newHovered = p;
          // Freeze orbit while hovered — drift slightly toward mouse
          const pull = p.hoverT * 0.25;
          p.x = pos.x + (mx - pos.x) * pull;
          p.y = pos.y + (my - pos.y) * pull;
        } else {
          p.x = pos.x;
          p.y = pos.y;
        }

        // Animate hover progress
        p.hoverT += ((isHov ? 1 : 0) - p.hoverT) * 0.1 * dt;
      }

      /* ── Sort planets by z (back → front) for correct depth ──── */
      const sorted = [...planets].sort((a, b) => a.z - b.z);

      /* ── Draw planets ─────────────────────────────────────────── */
      for (const p of sorted) {
        const scale = 1 + p.hoverT * 0.75;
        const pr    = p.pr * scale;

        // Depth fade: planets in the "back" (z < 0) are slightly dimmer
        const depthAlpha = 0.55 + 0.45 * ((p.z + 1) / 2);

        /* Connection line to sun on hover */
        if (p.hoverT > 0.08) {
          ctx!.globalAlpha = p.hoverT * 0.3;
          ctx!.beginPath();
          ctx!.moveTo(cx, cy);
          ctx!.lineTo(p.x, p.y);
          ctx!.strokeStyle = "rgba(255,200,100,0.7)";
          ctx!.lineWidth   = 0.7;
          ctx!.setLineDash([4, 6]);
          ctx!.stroke();
          ctx!.setLineDash([]);
          ctx!.globalAlpha = 1;
        }

        /* Planet glow on hover */
        if (p.hoverT > 0.05) {
          ctx!.globalAlpha = p.hoverT * depthAlpha;
          const gg = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, pr * 2.8);
          gg.addColorStop(0, "rgba(201,169,97,0.4)");
          gg.addColorStop(1, "rgba(0,0,0,0)");
          ctx!.fillStyle = gg;
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, pr * 2.8, 0, Math.PI * 2);
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
          // Edge vignette so it looks spherical
          const vig = ctx!.createRadialGradient(
            p.x - pr * 0.25, p.y - pr * 0.25, pr * 0.1,
            p.x, p.y, pr
          );
          vig.addColorStop(0, "rgba(0,0,0,0)");
          vig.addColorStop(1, "rgba(0,0,0,0.55)");
          ctx!.fillStyle = vig;
          ctx!.fillRect(p.x - pr, p.y - pr, pr * 2, pr * 2);
        } else {
          // Fallback sphere gradient (deep space colour per ring)
          const RING_COLS = ["#3B1A6B","#1A2E6B","#1A4A3B","#6B3B1A","#4A1A3B","#1A3B4A"];
          const gc = ctx!.createRadialGradient(
            p.x - pr * 0.35, p.y - pr * 0.35, 0,
            p.x, p.y, pr
          );
          gc.addColorStop(0, RING_COLS[p.ringIndex] ?? "#2D1457");
          gc.addColorStop(1, "#050310");
          ctx!.fillStyle = gc;
          ctx!.fillRect(p.x - pr, p.y - pr, pr * 2, pr * 2);

          // Initial letter
          ctx!.fillStyle    = "rgba(201,169,97,0.75)";
          ctx!.font         = `600 ${Math.max(9, pr * 0.65)}px Jost, sans-serif`;
          ctx!.textAlign    = "center";
          ctx!.textBaseline = "middle";
          ctx!.fillText(p.product.name.charAt(0), p.x, p.y);
        }
        ctx!.restore();

        /* Planet border ring */
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, pr, 0, Math.PI * 2);
        ctx!.strokeStyle = p.hoverT > 0.1
          ? `rgba(255,215,100,${0.3 + p.hoverT * 0.6})`
          : "rgba(255,240,200,0.18)";
        ctx!.lineWidth = p.hoverT > 0.1 ? 1.8 : 0.7;
        ctx!.stroke();

        ctx!.globalAlpha = 1;

        /* Hover label */
        if (p.hoverT > 0.3) {
          const a = Math.min((p.hoverT - 0.3) / 0.4, 1);
          ctx!.globalAlpha = a;
          ctx!.textAlign    = "center";
          ctx!.textBaseline = "top";

          const fs    = Math.max(10, pr * 0.5);
          const label = p.product.name.length > 22
            ? p.product.name.slice(0, 22) + "…"
            : p.product.name;

          ctx!.font    = `500 ${fs}px Jost, sans-serif`;
          const tw     = ctx!.measureText(label).width;
          const pillW  = tw + 18;
          const pillH  = fs + 10;
          const pillX  = p.x - pillW / 2;
          const pillY  = p.y + pr + 8;

          // Pill bg
          ctx!.fillStyle = "rgba(8,4,18,0.9)";
          if (ctx!.roundRect) {
            ctx!.beginPath();
            ctx!.roundRect(pillX, pillY, pillW, pillH, 5);
            ctx!.fill();
          } else {
            ctx!.fillRect(pillX, pillY, pillW, pillH);
          }

          // Product name
          ctx!.fillStyle = "rgba(244,239,231,0.95)";
          ctx!.fillText(label, p.x, pillY + 5);

          // Brand (smaller, below)
          ctx!.font      = `300 ${Math.max(7, fs * 0.7)}px Jost, sans-serif`;
          ctx!.fillStyle = "rgba(201,169,97,0.6)";
          ctx!.fillText(p.product.brandName, p.x, pillY + pillH + 3);

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
    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  /* ── Click → navigate ───────────────────────────────────────────── */
  const handleClick = useCallback(() => {
    const p = hoveredRef.current;
    if (p?.product.slug) {
      routerRef.current.push(`/product/${p.product.slug}`);
    }
  }, []);

  /* ── Touch ──────────────────────────────────────────────────────── */
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback(() => {
    const p = hoveredRef.current;
    if (p?.product.slug) routerRef.current.push(`/product/${p.product.slug}`);
    setTimeout(() => { mouseRef.current = { x: -99999, y: -99999 }; }, 400);
  }, []);

  return (
    <section
      className="relative h-dvh w-full overflow-hidden"
      aria-label="Ethereal Dayo — Fragrance Solar System"
      style={{ background: "#04020F" }}
    >
      {/* Star field */}
      <div className="absolute inset-0 z-[1]">
        <ParticleCloud />
      </div>

      {/* Solar system canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-[2] w-full h-full"
        onClick={handleClick}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        aria-label="Solar system of fragrances"
      />

      {/* Loading */}
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

      {/* Hint */}
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
          animate={{ y: [0, 6, 0], opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-5 bg-gradient-to-b from-gold/30 to-transparent"
        />
      </motion.div>
    </section>
  );
}
