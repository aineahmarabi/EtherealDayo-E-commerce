"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
  twinkle: number;
  twinkleSpeed: number;
};

const COLORS = [
  "#8B1A35", "#6E1228", "#C97B89", "#C9A961",
  "#A83A52", "#4A0E1F", "#E5D5B8", "#A86C9E",
];

function gaussianRandom(mean: number, std: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function ParticleCloud() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number>(0);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const COUNT = isMobile ? 80 : 200;
    const REPEL_RADIUS = 120;
    const REPEL_STRENGTH = 4;
    const SPRING = 0.04;
    const DAMPING = 0.82;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      buildParticles();
    };

    function buildParticles() {
      const W = canvas!.width;
      const H = canvas!.height;
      const cx = W / 2;
      const cy = H / 2;
      const stdX = W * 0.22;
      const stdY = H * 0.22;

      particles.current = Array.from({ length: COUNT }, () => {
        const hx = gaussianRandom(cx, stdX);
        const hy = gaussianRandom(cy, stdY);
        const distFromCenter = Math.hypot(hx - cx, hy - cy);
        const maxDist = Math.hypot(cx, cy);
        const alphaBase = Math.max(0.05, 1 - distFromCenter / maxDist);

        return {
          x: hx,
          y: hy,
          homeX: hx,
          homeY: hy,
          vx: 0,
          vy: 0,
          radius: Math.random() * 1.8 + 0.3,
          alpha: alphaBase * (0.4 + Math.random() * 0.5),
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          twinkle: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.005 + Math.random() * 0.015,
        };
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };

    // Gyroscope for mobile
    let lastGamma = 0;
    let lastBeta = 0;
    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      lastGamma = e.gamma ?? 0;
      lastBeta = e.beta ?? 0;
      const cx = canvas!.width / 2;
      const cy = canvas!.height / 2;
      mouse.current = {
        x: cx + (lastGamma / 90) * cx * 0.5,
        y: cy + (lastBeta / 90) * cy * 0.5,
      };
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    if (isMobile) {
      window.addEventListener("deviceorientation", handleDeviceOrientation, { passive: true });
    }

    let lastTime = 0;
    function draw(time: number) {
      const dt = Math.min((time - lastTime) / 16, 3);
      lastTime = time;
      const W = canvas!.width;
      const H = canvas!.height;

      ctx!.clearRect(0, 0, W, H);

      // Subtle center radial glow
      const gradient = ctx!.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.35);
      gradient.addColorStop(0, "rgba(139, 26, 53, 0.07)");
      gradient.addColorStop(0.5, "rgba(201, 169, 97, 0.03)");
      gradient.addColorStop(1, "transparent");
      ctx!.fillStyle = gradient;
      ctx!.fillRect(0, 0, W, H);

      const mx = mouse.current.x;
      const my = mouse.current.y;

      for (const p of particles.current) {
        if (!prefersReducedMotion.current) {
          const dx = mx - p.x;
          const dy = my - p.y;
          const dist = Math.hypot(dx, dy);

          if (dist < REPEL_RADIUS) {
            const force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH;
            p.vx -= (dx / dist) * force * dt;
            p.vy -= (dy / dist) * force * dt;
          }

          // Spring to home
          p.vx += (p.homeX - p.x) * SPRING * dt;
          p.vy += (p.homeY - p.y) * SPRING * dt;

          p.vx *= DAMPING;
          p.vy *= DAMPING;

          p.x += p.vx * dt;
          p.y += p.vy * dt;
        }

        // Twinkle
        p.twinkle += p.twinkleSpeed * dt;
        const twinkledAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.twinkle));

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx!.fillStyle =
          p.color +
          Math.round(twinkledAlpha * 255)
            .toString(16)
            .padStart(2, "0");
        ctx!.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("deviceorientation", handleDeviceOrientation);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
