"use client";

import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { api } from "../../../convex/_generated/api";
import { BrandCardSkeleton } from "@/components/ui/Skeleton";

const ease = [0.16, 1, 0.3, 1] as const;

export default function BrandsPage() {
  const brands = useQuery(api.brands.list);

  return (
    <div className="min-h-dvh bg-ink">
      {/* Header */}
      <section className="relative pt-40 pb-20 px-4 sm:px-6 lg:px-8 border-b border-gold/5 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[35%] bottom-0 left-0 right-0 sm:inset-0 z-0">
            <picture>
              <source media="(max-width: 768px)" srcSet="/images/hero/shop_by_brand_mobile.png" />
              <img
                src="/images/hero/shop_by_brand_desktop.png"
                alt=""
                className="w-full h-full object-cover object-bottom sm:object-center opacity-90 sm:opacity-70"
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/60 to-transparent sm:w-2/3" />
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-ink to-transparent sm:hidden" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="flex flex-col gap-3"
          >
            <span className="text-[11px] tracking-[0.35em] uppercase font-body text-gold">
              The Houses
            </span>
            <h1 className="font-display text-4xl md:text-6xl text-bone tracking-tight">
              Shop by Brand
            </h1>
            <p className="text-muted-text font-body text-base max-w-md mt-1">
              Each house has a singular vision. Begin with the one that speaks to you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Brands grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {brands === undefined || brands.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <BrandCardSkeleton key={i} />)}
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {brands.map((brand) => (
                <motion.div
                  key={brand._id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
                  }}
                >
                  <Link
                    href={`/brand/${brand.slug}`}
                    className="group flex flex-col gap-5 p-8 rounded-2xl border border-gold/10 bg-bordeaux-deep/10 hover:border-gold/30 hover:bg-bordeaux-deep/20 transition-all duration-500"
                  >
                    {/* Monogram */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full border border-gold/30 group-hover:border-gold/60 transition-colors flex items-center justify-center flex-shrink-0">
                        <span className="font-display text-2xl text-gold">{brand.name.charAt(0)}</span>
                      </div>
                      <h2 className="font-display text-xl text-bone group-hover:text-gold transition-colors duration-300">
                        {brand.name}
                      </h2>
                    </div>
                    <p className="text-sm text-muted-text font-body leading-relaxed line-clamp-3">
                      {brand.description}
                    </p>
                    <span className="text-xs tracking-widest uppercase text-gold/60 group-hover:text-gold transition-colors font-body mt-auto">
                      Explore collection →
                    </span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
