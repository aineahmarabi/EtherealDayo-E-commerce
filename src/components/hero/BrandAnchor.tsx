"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function BrandAnchor() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
      className="relative z-10 flex-shrink-0"
    >
      <Link href="/catalog" aria-label="Enter the Ethereal Dayo catalog">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
          className="relative group cursor-pointer"
        >
          {/* Aura glow behind card */}
          <div className="absolute inset-0 -inset-4 rounded-3xl bg-burgundy/20 blur-2xl group-hover:bg-burgundy/30 transition-colors duration-700" />

          {/* Card */}
          <div className="relative w-44 md:w-52 rounded-2xl border border-gold/30 bg-gradient-to-b from-bordeaux-deep/80 to-noir/90 backdrop-blur-sm p-6 md:p-8 flex flex-col items-center gap-4">
            {/* Top hairline */}
            <div className="w-full hairline" />

            {/* Brand name */}
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="font-display text-base md:text-lg text-bone tracking-widest leading-tight">
                Ethereal
              </span>
              <span className="font-display text-xl md:text-2xl text-bone tracking-widest leading-tight">
                Dayo
              </span>
            </div>

            {/* Sub */}
            <span className="text-[9px] tracking-[0.35em] uppercase text-gold font-body">
              Maison de Parfum
            </span>

            {/* Bottom hairline */}
            <div className="w-full hairline" />

            {/* Enter cue */}
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="text-[10px] tracking-[0.4em] uppercase text-gold/70 font-body"
            >
              Enter
            </motion.span>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
