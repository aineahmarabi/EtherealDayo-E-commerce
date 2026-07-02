"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { api } from "../../../../convex/_generated/api";
import { ProductHeroSkeleton, CollectionGridSkeleton } from "@/components/ui/Skeleton";
import { AddToBag } from "@/components/product/AddToBag";
import { ProductCard } from "@/components/product/ProductCard";
import { ArrowLeft } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

function ScentMeter({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs tracking-widest uppercase text-muted-text font-body">{label}</span>
        <span className="text-xs text-bone/50 font-body">{value}%</span>
      </div>
      <div className="h-1 rounded-full bg-bordeaux-deep/40 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2, ease }}
          className="h-full rounded-full bg-gradient-to-r from-burgundy to-gold"
        />
      </div>
    </div>
  );
}

function ScentPyramid({
  top,
  heart,
  base,
}: {
  top: string[];
  heart: string[];
  base: string[];
}) {
  const tiers = [
    { label: "Top Notes", notes: top, delay: 0 },
    { label: "Heart Notes", notes: heart, delay: 0.1 },
    { label: "Base Notes", notes: base, delay: 0.2 },
  ];

  return (
    <div className="flex flex-col gap-6">
      {tiers.map(({ label, notes, delay }) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay, ease }}
          className="flex flex-col gap-2"
        >
          <span className="text-[10px] tracking-[0.3em] uppercase text-gold font-body">{label}</span>
          <div className="flex flex-wrap gap-2">
            {notes.map((note) => (
              <span
                key={note}
                className="px-3 py-1 rounded-full border border-gold/20 text-xs text-bone/70 font-body bg-bordeaux-deep/20"
              >
                {note}
              </span>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function BottleDisplay({ image, name }: { image?: string; name: string }) {
  if (image) {
    return (
      <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-noir">
        <Image src={image} alt={name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
      </div>
    );
  }
  return (
    <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-b from-bordeaux-deep/30 to-noir flex items-center justify-center border border-gold/10">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-gold/5 blur-3xl" />
      {/* Bottle SVG placeholder */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 100 160" className="w-28 h-44" aria-hidden="true">
          <rect x="36" y="4" width="28" height="22" rx="5" fill="#C9A961" opacity="0.7" />
          <rect x="38" y="26" width="24" height="8" rx="3" fill="#C9A961" opacity="0.4" />
          <rect x="28" y="34" width="44" height="5" rx="2.5" fill="#C9A961" opacity="0.5" />
          <path
            d="M20 39 Q14 54 14 80 L14 138 Q14 152 50 152 Q86 152 86 138 L86 80 Q86 54 80 39 Z"
            fill="#1A1416"
            stroke="#C9A961"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />
          <rect x="24" y="82" width="52" height="44" rx="3" fill="#C9A961" opacity="0.06" />
          <line x1="24" y1="82" x2="76" y2="82" stroke="#C9A961" strokeWidth="1" strokeOpacity="0.3" />
          <line x1="24" y1="126" x2="76" y2="126" stroke="#C9A961" strokeWidth="1" strokeOpacity="0.3" />
          <path d="M20 50 Q18 90 20 118" stroke="white" strokeWidth="3" strokeOpacity="0.06" fill="none" strokeLinecap="round" />
        </svg>
      </motion.div>
    </div>
  );
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const data = useQuery(api.products.getBySlug, { slug });
  const related = useQuery(
    api.products.listActive
  );

  if (data === undefined) {
    return (
      <div className="min-h-dvh bg-ink pt-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ProductHeroSkeleton />
        </div>
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="min-h-dvh bg-ink pt-40 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-3xl text-bone">Fragrance not found</h1>
          <Link href="/catalog" className="mt-4 inline-block text-gold hover:text-gold-soft font-body underline underline-offset-4">
            Back to catalog
          </Link>
        </div>
      </div>
    );
  }

  const product = data;
  const variants = (product as { variants?: Array<{ _id: string; size: string; concentration: string; price: number }> }).variants ?? [];
  const mainImage = product.images?.[0];

  // Related: same family or audience, exclude self
  const relatedProducts = related
    ?.filter(
      (p) =>
        p._id !== product._id &&
        (p.family === product.family || p.audience === product.audience)
    )
    .slice(0, 4);

  return (
    <div className="min-h-dvh bg-ink">
      {/* Back link */}
      <div className="pt-24 pb-0 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 text-sm text-muted-text hover:text-bone transition-colors font-body mt-4"
        >
          <ArrowLeft size={14} />
          Back to catalog
        </Link>
      </div>

      {/* Product hero */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Left: bottle + thumbnails */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease }}
              className="flex flex-col gap-4"
            >
              <BottleDisplay image={mainImage} name={product.name} />
              {/* Thumbnail strip */}
              {product.images.length > 1 && (
                <div className="flex gap-3">
                  {product.images.slice(0, 4).map((img, i) => (
                    <div key={i} className="w-20 h-20 rounded-lg overflow-hidden border border-gold/20 bg-bordeaux-deep/30 flex-shrink-0">
                      <Image src={img} alt={`${product.name} view ${i + 1}`} width={80} height={80} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Right: info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease }}
              className="flex flex-col gap-7 pt-2"
            >
              {/* Brand + name */}
              <div className="flex flex-col gap-2">
                <Link
                  href={`/brand/${(product as { brandSlug?: string }).brandSlug ?? "#"}`}
                  className="text-xs tracking-[0.3em] uppercase text-gold hover:text-gold-soft font-body transition-colors"
                >
                  {product.brandName}
                </Link>
                <h1 className="font-display text-3xl md:text-5xl text-bone tracking-tight leading-tight">
                  {product.name}
                </h1>
                <p className="text-sm text-muted-text font-body">
                  {product.family} · {product.perfumer} · {product.year}
                </p>
              </div>

              {/* Divider */}
              <div className="hairline" />

              {/* Add to bag */}
              <AddToBag
                productId={product._id}
                productName={product.name}
                brandName={product.brandName}
                variants={variants.map((v) => ({ ...v, id: v._id }))}
                image={mainImage}
              />

              {/* Divider */}
              <div className="hairline" />

              {/* Scent meters */}
              <div className="flex flex-col gap-4">
                <p className="text-[10px] tracking-[0.3em] uppercase text-gold font-body">Performance</p>
                <ScentMeter label="Sillage" value={product.sillage} />
                <ScentMeter label="Longevity" value={product.longevity} />
                <ScentMeter label="Intensity" value={product.intensity} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Scent pyramid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-gold/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-display text-2xl text-bone mb-8 tracking-tight">Scent Profile</h2>
              <ScentPyramid
                top={product.notesTop}
                heart={product.notesHeart}
                base={product.notesBase}
              />
            </div>
            <div>
              <h2 className="font-display text-2xl text-bone mb-6 tracking-tight">The Story</h2>
              <p className="text-muted-text font-body leading-relaxed text-base">
                {product.story}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      {(related === undefined || (relatedProducts && relatedProducts.length > 0)) && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-gold/5">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-display text-2xl text-bone mb-10 tracking-tight">You May Also Like</h2>
            {relatedProducts === undefined ? (
              <CollectionGridSkeleton count={4} />
            ) : (
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8"
              >
                {relatedProducts.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </motion.div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
