"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { WORLDS } from "@/lib/types";
import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Image from "next/image";

const ParticleCloud = dynamic(
  () => import("./ParticleCloud").then((m) => ({ default: m.ParticleCloud })),
  { ssr: false }
);

const ease = [0.2, 0.8, 0.2, 1] as const;

/* Navbar is 64px (h-16). Cards fill from the very bottom of the navbar to the bottom of the viewport. */

export function Hero() {
  const activeProducts = useQuery(api.products.listActive);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => prev + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const getProductForWorld = (worldId: string) => {
    if (!activeProducts || activeProducts.length === 0) return null;
    let filtered = [];
    switch (worldId) {
      case "her":
        filtered = activeProducts.filter((p) => p.audience === "her" || p.audience === "unisex");
        break;
      case "him":
        filtered = activeProducts.filter((p) => p.audience === "him" || p.audience === "unisex");
        break;
      case "bestsellers":
        filtered = activeProducts.filter((p) => p.isBestseller);
        break;
      case "new-arrivals":
        filtered = [...activeProducts].sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0)).slice(0, 8);
        break;
      default:
        filtered = [];
    }

    if (filtered.length === 0) return null;
    const prod = filtered[activeIndex % filtered.length];
    return {
      image: prod.images?.[0] || "",
      name: prod.name,
    };
  };

  return (
    <section
      className="relative h-dvh w-full overflow-hidden"
      aria-label="Ethereal Dayo — Welcome"
      style={{ background: "linear-gradient(180deg, #0A0414 0%, #140A28 60%, rgba(45,20,87,0.15) 100%)" }}
    >
      {/* Particle cloud — behind everything */}
      <ParticleCloud />

      {/* Vignette overlay — dims edges, keeps center alive */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background: "radial-gradient(ellipse 70% 80% at 50% 55%, transparent 20%, rgba(10,4,20,0.55) 100%)",
        }}
        aria-hidden="true"
      />

      {/* ============================================================
          DESKTOP: 5 columns filling full height below navbar
          ============================================================ */}
      <div
        className="hidden md:flex absolute z-[2] left-0 right-0 bottom-0"
        style={{ top: "64px" }} /* exactly below navbar */
      >
        {/* Outer left — For Her */}
        <WorldColumn world={WORLDS[0]} flex={1} pyramidOffset="10%" delay={0.15} productInfo={getProductForWorld(WORLDS[0].id)} />
        {/* Inner left — For Him */}
        <WorldColumn world={WORLDS[1]} flex={1.1} pyramidOffset="5%" delay={0.2} productInfo={getProductForWorld(WORLDS[1].id)} />
        {/* Center — Brand Anchor */}
        <BrandColumn />
        {/* Inner right — Bestsellers */}
        <WorldColumn world={WORLDS[2]} flex={1.1} pyramidOffset="5%" delay={0.2} productInfo={getProductForWorld(WORLDS[2].id)} />
        {/* Outer right — New Arrivals */}
        <WorldColumn world={WORLDS[3]} flex={1} pyramidOffset="10%" delay={0.15} productInfo={getProductForWorld(WORLDS[3].id)} />
      </div>

      {/* ============================================================
          MOBILE: brand top + 2×2 grid fills below navbar
          ============================================================ */}
      <div
        className="flex md:hidden flex-col absolute left-0 right-0 bottom-0 z-[2] px-3 gap-3"
        style={{ top: "64px" }}
      >
        {/* Brand crown — compact */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="flex justify-center pt-4 pb-2"
        >
          <Link href="/catalog" aria-label="Enter the catalog">
            <div className="flex flex-col items-center gap-1 px-8 py-4 rounded-2xl border border-gold/30 bg-noir/70 backdrop-blur-sm">
              <div className="hairline w-12 mb-1" />
              <span className="font-display text-xl text-bone tracking-widest">Ethereal Dayo</span>
              <span className="text-[9px] tracking-[0.35em] uppercase text-gold font-body">Maison de Parfum</span>
              <div className="hairline w-12 mt-1" />
            </div>
          </Link>
        </motion.div>

        {/* 2×2 grid — fills remaining height */}
        <div className="grid grid-cols-2 gap-3 flex-1 pb-3">
          {WORLDS.map((world, i) => {
            const productInfo = getProductForWorld(world.id);
            return (
              <motion.div
                key={world.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.25 + i * 0.08, ease }}
                className="h-full min-h-0"
              >
                <Link href={world.href} aria-label={`Explore ${world.label}`} className="block h-full">
                  <div
                    className="relative h-full rounded-2xl border overflow-hidden flex flex-col"
                    style={{
                      borderColor: `${world.accent}35`,
                      background: `linear-gradient(180deg, ${world.accent}0a 0%, rgba(20,10,40,0.95) 100%)`,
                    }}
                  >
                    {/* Accent tag */}
                    {world.tag && (
                      <div className="px-3 pt-3">
                        <span className="text-[8px] tracking-[0.3em] uppercase font-body" style={{ color: world.accent }}>
                          {world.tag}
                        </span>
                      </div>
                    )}
                    {/* Bottle centered with dynamic image */}
                    <div className="flex-1 flex items-center justify-center p-3 relative w-full h-full min-h-[96px]">
                      <AnimatePresence mode="wait">
                        {productInfo && productInfo.image ? (
                          <motion.div
                            key={productInfo.image}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.55 }}
                            className="relative w-16 h-20 aspect-[3/4]"
                          >
                            <Image
                              src={productInfo.image}
                              alt={productInfo.name}
                              fill
                              className="object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
                              sizes="64px"
                            />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="svg-placeholder"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.55 }}
                          >
                            <BottleSVG accent={world.accent} className="w-12 h-20" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    {/* Label bar */}
                    <div className="px-3 pb-4 flex flex-col gap-0.5">
                      <span className="font-display text-sm text-bone leading-tight">{world.label}</span>
                      <span className="w-5 h-px block" style={{ backgroundColor: world.accent, opacity: 0.5 }} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Tagline — hovers above the bottom of the card strip */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1, ease }}
        className="hidden md:block absolute bottom-6 left-0 right-0 text-center z-[3] pointer-events-none font-display text-lg text-bone/40 tracking-wide"
      >
        Where do you <em className="not-italic text-dusty-rose/70">begin?</em>
      </motion.p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* World column — fills full height, pyramid via top offset            */
/* ------------------------------------------------------------------ */
function WorldColumn({
  world,
  flex,
  pyramidOffset,
  delay,
  productInfo,
}: {
  world: (typeof WORLDS)[number];
  flex: number;
  pyramidOffset: string;
  delay: number;
  productInfo: { image: string; name: string } | null;
}) {
  return (
    <div style={{ flex, display: "flex", flexDirection: "column" }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay, ease }}
        style={{ marginTop: pyramidOffset, height: "100%", display: "flex", flexDirection: "column" }}
      >
        <Link href={world.href} aria-label={`Explore ${world.label}`} className="flex flex-col flex-1">
          <motion.div
            whileHover={{ marginTop: "-8px" }}
            transition={{ duration: 0.65, ease }}
            className="group relative flex-1 border-t border-x cursor-pointer overflow-hidden"
            style={{
              borderColor: `${world.accent}30`,
            }}
          >
            {/* ── Background: product image OR dark gradient ── */}
            <AnimatePresence mode="wait">
              {productInfo && productInfo.image ? (
                <motion.div
                  key={productInfo.image}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                  className="absolute inset-0 overflow-hidden"
                >
                  <Image
                    src={productInfo.image}
                    alt={productInfo.name}
                    fill
                    className="object-cover object-top transition-transform duration-700 ease-in-out group-hover:scale-110"
                    sizes="(max-width: 768px) 20vw, 20vw"
                  />
                  {/* dark overlay so text stays readable */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(180deg, rgba(10,4,20,0.15) 0%, rgba(10,4,20,0.05) 40%, rgba(10,4,20,0.75) 75%, rgba(10,4,20,0.96) 100%)`,
                    }}
                  />
                  {/* subtle accent tint */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-[0.08] transition-opacity duration-700"
                    style={{ backgroundColor: world.accent }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="dark-bg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(180deg, ${world.accent}0c 0%, rgba(10,4,20,0.93) 65%)`,
                  }}
                >
                  {/* Floating SVG bottle placeholder — centred */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="transition-transform duration-700 ease-in-out group-hover:scale-110"
                    >
                      <BottleSVG accent={world.accent} className="w-20 h-32 md:w-24 md:h-36 opacity-70" />
                    </motion.div>
                  </div>
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-[0.1] transition-opacity duration-700"
                    style={{ backgroundColor: world.accent }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Foreground content (z-10) ── */}
            <div className="relative z-10 h-full flex flex-col justify-between py-5 px-3">
              {/* Tag top */}
              <div>
                {world.tag && (
                  <span
                    className="text-[9px] tracking-[0.35em] uppercase font-body"
                    style={{ color: world.accent }}
                  >
                    {world.tag}
                  </span>
                )}
              </div>

              {/* Label bottom */}
              <div className="flex flex-col gap-1.5">
                <span className="font-display text-base text-bone tracking-tight text-center block">
                  {world.label}
                </span>
                <span
                  className="block w-8 h-px mx-auto"
                  style={{ backgroundColor: world.accent, opacity: 0.6 }}
                />
              </div>
            </div>
          </motion.div>
        </Link>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Brand anchor column — fills full height, center stage               */
/* ------------------------------------------------------------------ */
function BrandColumn() {
  return (
    <div style={{ flex: 1.2, display: "flex", flexDirection: "column" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.35, ease }}
        className="flex-1"
      >
        <Link href="/catalog" aria-label="Enter the Ethereal Dayo catalog" className="flex flex-col h-full">
          <div
            className="group relative flex-1 border-t border-x border-gold/25 overflow-hidden cursor-pointer"
            style={{
              background: "linear-gradient(180deg, rgba(89,40,166,0.1) 0%, rgba(10,4,20,0.97) 70%)",
            }}
          >
            {/* Breathing aura */}
            <motion.div
              animate={{ opacity: [0.05, 0.18, 0.05] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-gold blur-3xl pointer-events-none"
            />

            {/* Center content */}
            <div className="relative h-full flex flex-col items-center justify-center gap-5 px-4 py-12">
              <div className="hairline w-16" />

              <div className="flex flex-col items-center gap-1 text-center">
                <span className="font-display text-2xl lg:text-3xl text-bone tracking-[0.15em]">
                  Ethereal
                </span>
                <span className="font-display text-3xl lg:text-4xl text-bone tracking-[0.15em]">
                  Dayo
                </span>
              </div>

              <span className="text-[9px] tracking-[0.4em] uppercase text-gold font-body">
                Maison de Parfum
              </span>

              <div className="hairline w-16" />

              <motion.span
                animate={{ opacity: [0.25, 1, 0.25] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="text-[10px] tracking-[0.45em] uppercase text-gold/60 font-body mt-2"
              >
                Enter
              </motion.span>
            </div>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}

function BottleSVG({ accent, className }: { accent: string; className?: string }) {
  return (
    <svg viewBox="0 0 60 90" className={className ?? "w-16 h-24"} aria-hidden="true">
      <rect x="22" y="2" width="16" height="12" rx="3" fill={accent} opacity="0.65" />
      <rect x="24" y="14" width="12" height="6" rx="2.5" fill={accent} opacity="0.35" />
      <rect x="18" y="20" width="24" height="3" rx="1.5" fill={accent} opacity="0.45" />
      <path
        d="M14 23 Q10 32 10 50 L10 78 Q10 86 30 86 Q50 86 50 78 L50 50 Q50 32 46 23 Z"
        fill="#1A1416"
        stroke={accent}
        strokeWidth="0.8"
        strokeOpacity="0.4"
      />
      <rect x="16" y="45" width="28" height="26" rx="2" fill={accent} opacity="0.06" />
      <line x1="16" y1="45" x2="44" y2="45" stroke={accent} strokeWidth="0.7" strokeOpacity="0.3" />
      <line x1="16" y1="71" x2="44" y2="71" stroke={accent} strokeWidth="0.7" strokeOpacity="0.3" />
      <path d="M14 30 Q13 52 14 66" stroke="white" strokeWidth="1.5" strokeOpacity="0.07" fill="none" strokeLinecap="round" />
    </svg>
  );
}
