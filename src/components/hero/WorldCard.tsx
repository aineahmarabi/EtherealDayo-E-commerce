"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { WorldConfig } from "@/lib/types";

type Props = {
  world: WorldConfig;
  height: "sm" | "md" | "lg";
  delay?: number;
};

const heightMap = {
  sm: "h-48 md:h-56",
  md: "h-56 md:h-64",
  lg: "h-64 md:h-72",
};

export function WorldCard({ world, height, delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className="relative flex-shrink-0"
    >
      <Link href={world.href} aria-label={`Explore ${world.label}`}>
        <motion.div
          whileHover={{ scale: 1.05, y: -6 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          className="group relative cursor-pointer"
        >
          {/* Accent glow */}
          <div
            className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-700"
            style={{ backgroundColor: world.accent }}
          />

          {/* Card */}
          <div
            className={`relative w-32 md:w-40 ${heightMap[height]} rounded-2xl border bg-gradient-to-b from-bordeaux-deep/60 to-noir/80 backdrop-blur-sm overflow-hidden flex flex-col`}
            style={{ borderColor: `${world.accent}33` }}
          >
            {/* Bottle placeholder area */}
            <div className="flex-1 flex items-center justify-center p-4">
              <BottleSVG accent={world.accent} />
            </div>

            {/* Bottom label */}
            <div
              className="px-3 py-3 border-t flex flex-col gap-0.5"
              style={{ borderColor: `${world.accent}22` }}
            >
              {world.tag && (
                <span
                  className="text-[9px] tracking-[0.3em] uppercase font-body"
                  style={{ color: world.accent }}
                >
                  {world.tag}
                </span>
              )}
              <span className="text-sm font-display text-bone leading-tight">
                {world.label}
              </span>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

function BottleSVG({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 60 90" className="w-16 h-24" aria-hidden="true">
      {/* Cap */}
      <rect x="22" y="2" width="16" height="12" rx="3" fill={accent} opacity="0.7" />
      {/* Neck */}
      <rect x="24" y="14" width="12" height="6" rx="2" fill={accent} opacity="0.4" />
      {/* Collar */}
      <rect x="18" y="20" width="24" height="3" rx="1.5" fill={accent} opacity="0.5" />
      {/* Body */}
      <path
        d="M14 23 Q10 32 10 50 L10 78 Q10 86 30 86 Q50 86 50 78 L50 50 Q50 32 46 23 Z"
        fill="#1A1416"
        stroke={accent}
        strokeWidth="1"
        strokeOpacity="0.4"
      />
      {/* Label area */}
      <rect x="16" y="45" width="28" height="26" rx="2" fill={accent} opacity="0.08" />
      <line x1="16" y1="45" x2="44" y2="45" stroke={accent} strokeWidth="0.8" strokeOpacity="0.4" />
      <line x1="16" y1="71" x2="44" y2="71" stroke={accent} strokeWidth="0.8" strokeOpacity="0.4" />
      {/* Reflection */}
      <path
        d="M14 28 Q13 45 14 60"
        stroke="white"
        strokeWidth="1.5"
        strokeOpacity="0.08"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
