"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { api } from "../../../convex/_generated/api";

const ease = [0.16, 1, 0.3, 1] as const;

type Product = {
  _id: string;
  name: string;
  slug?: string;
  brandName: string;
  images: string[];
};

const COLLECTIONS = [
  { label: "For Her", href: "/for-her" },
  { label: "For Him", href: "/for-him" },
  { label: "Bestsellers", href: "/bestsellers" },
  { label: "New Arrivals", href: "/new-arrivals" },
] as const;

/* Per-column loop durations (literal classes so Tailwind can see them). */
const DURATIONS = [
  "[animation-duration:80s]",
  "[animation-duration:100s]",
  "[animation-duration:70s]",
  "[animation-duration:95s]",
  "[animation-duration:85s]",
  "[animation-duration:75s]",
  "[animation-duration:90s]",
] as const;

/* Number of gallery columns for the current viewport width. */
function useColumnCount() {
  const [cols, setCols] = useState(4);
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      setCols(w < 640 ? 3 : w < 1024 ? 4 : w < 1280 ? 6 : 7);
    };
    calc();
    window.addEventListener("resize", calc, { passive: true });
    return () => window.removeEventListener("resize", calc);
  }, []);
  return cols;
}

function Tile({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${product.slug ?? product._id}`}
      className="group relative block aspect-[4/5] w-full overflow-hidden rounded-2xl border border-bone/10 bg-gradient-to-b from-bordeaux-deep/60 to-ink/80 transition-colors hover:border-gold/60"
      aria-label={`${product.name} by ${product.brandName}`}
    >
      <Image
        src={product.images[0]}
        alt={product.name}
        fill
        sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 15vw"
        className="object-contain p-3 transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-noir/95 to-transparent p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <p className="truncate text-[10px] uppercase tracking-[0.25em] text-gold">
          {product.brandName}
        </p>
        <p className="truncate text-xs text-bone">{product.name}</p>
      </div>
    </Link>
  );
}

function GalleryColumn({
  items,
  index,
}: {
  items: Product[];
  index: number;
}) {
  /* Repeat until one "half" is tall enough, then double it for a seamless loop. */
  const half = useMemo(() => {
    if (items.length === 0) return [];
    const out: Product[] = [];
    while (out.length < 6) out.push(...items);
    return out;
  }, [items]);

  const down = index % 2 === 1;
  const offset = index % 2 === 1 ? "mt-0" : "-mt-20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease, delay: 0.15 + index * 0.08 }}
      className={`flex-1 overflow-hidden ${offset}`}
    >
      <div
        className={`flex flex-col gap-3 will-change-transform ${
          down ? "marquee-down" : "marquee-up"
        } ${DURATIONS[index % DURATIONS.length]}`}
      >
        {[...half, ...half].map((p, i) => (
          <Tile key={`${p._id}-${i}`} product={p} />
        ))}
      </div>
    </motion.div>
  );
}

export function Hero() {
  const products = useQuery(api.products.listActive) as Product[] | undefined;
  const cols = useColumnCount();

  /* Every product that has an image, spread round-robin across the columns. */
  const withImages = useMemo(
    () => (products ?? []).filter((p) => p.images && p.images.length > 0),
    [products]
  );
  const columns = useMemo(() => {
    const buckets: Product[][] = Array.from({ length: cols }, () => []);
    withImages.forEach((p, i) => buckets[i % cols].push(p));
    return buckets;
  }, [withImages, cols]);

  const brandCount = useMemo(
    () => new Set((products ?? []).map((p) => p.brandName)).size,
    [products]
  );

  return (
    <section
      className="relative isolate h-dvh min-h-[640px] w-full overflow-hidden bg-noir"
      aria-label="Ethereal Dayo — Maison de Parfum"
    >
      {/* ── Gallery of every bottle ─────────────────────────────── */}
      <div className="marquee-pause absolute inset-0 -z-10 flex -rotate-6 scale-110 gap-3 px-3 opacity-75 sm:opacity-100">
        {columns.map((items, i) => (
          <GalleryColumn key={`${cols}-${i}`} items={items} index={i} />
        ))}
      </div>

      {/* ── Atmosphere: glow + vignette + text-readability scrims ─ */}
      <div className="pointer-events-none absolute inset-0 -z-[5] bg-[radial-gradient(ellipse_at_30%_50%,rgba(89,40,166,0.35),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 -z-[5] bg-gradient-to-b from-noir/80 via-transparent to-noir/90" />
      <div className="pointer-events-none absolute inset-0 -z-[5] bg-gradient-to-r from-noir/90 via-noir/45 to-transparent lg:from-noir/95 lg:via-noir/50" />
      <div className="pointer-events-none absolute inset-0 -z-[5] bg-noir/50 sm:hidden" />

      {/* ── Copy ────────────────────────────────────────────────── */}
      <div className="pointer-events-none relative mx-auto flex h-full max-w-7xl items-center px-4 pt-20 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="mb-4 text-xs uppercase tracking-[0.5em] text-gold"
          >
            Maison de Parfum
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.1 }}
            className="font-display text-5xl font-light leading-tight tracking-tighter text-bone sm:text-6xl lg:text-7xl"
          >
            Ethereal{" "}
            <span className="font-semibold text-gold">Dayo</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.2 }}
            className="mt-6 max-w-md text-base leading-relaxed text-bone/80 sm:text-lg"
          >
            {withImages.length > 0
              ? `${products?.length ?? withImages.length} signature fragrances from ${brandCount} coveted houses, ready to explore.`
              : "Signature fragrances from the world's most coveted houses."}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.3 }}
            className="pointer-events-auto mt-8 flex flex-wrap items-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 text-sm font-medium uppercase tracking-widest text-noir transition-opacity hover:opacity-90"
              >
                Shop the Collection
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
              <Link
                href="/brands"
                className="inline-flex items-center rounded-xl border border-bone/30 bg-noir/40 px-6 py-3 text-sm font-medium uppercase tracking-widest text-bone backdrop-blur-md transition-colors hover:border-gold hover:text-gold"
              >
                Shop by Brand
              </Link>
            </motion.div>
          </motion.div>

          <motion.ul
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.5 } } }}
            className="pointer-events-auto mt-10 flex flex-wrap gap-3"
          >
            {COLLECTIONS.map((c) => (
              <motion.li
                key={c.href}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
                }}
              >
                <Link
                  href={c.href}
                  className="inline-block rounded-xl border border-bone/20 bg-noir/50 px-4 py-2 text-xs uppercase tracking-[0.25em] text-bone/80 backdrop-blur-md transition-colors hover:border-gold hover:text-gold"
                >
                  {c.label}
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
