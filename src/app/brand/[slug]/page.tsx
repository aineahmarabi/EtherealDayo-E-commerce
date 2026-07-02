"use client";

import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { use } from "react";
import { api } from "../../../../convex/_generated/api";
import { ProductCard } from "@/components/product/ProductCard";
import { CollectionGridSkeleton } from "@/components/ui/Skeleton";
import { Skeleton } from "@/components/ui/Skeleton";

const ease = [0.16, 1, 0.3, 1] as const;

export default function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const brand = useQuery(api.brands.getBySlug, { slug });
  const products = useQuery(
    api.products.listByBrand,
    brand?._id ? { brandId: brand._id } : "skip"
  );

  return (
    <div className="min-h-dvh bg-ink">
      {/* Header */}
      <section className="relative pt-40 pb-16 px-4 sm:px-6 lg:px-8 border-b border-gold/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-10 bg-gold pointer-events-none" />
        <div className="max-w-7xl mx-auto relative">
          {brand === undefined ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-72" />
              <Skeleton className="h-4 w-full max-w-lg" />
              <Skeleton className="h-4 w-4/5 max-w-md" />
            </div>
          ) : brand === null ? (
            <div>
              <h1 className="font-display text-4xl text-bone">Brand not found</h1>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full border border-gold/40 flex items-center justify-center">
                  <span className="font-display text-2xl text-gold">{brand.name.charAt(0)}</span>
                </div>
                <div>
                  <span className="text-[11px] tracking-[0.35em] uppercase font-body text-gold block">The House</span>
                  <h1 className="font-display text-3xl md:text-5xl text-bone tracking-tight">{brand.name}</h1>
                </div>
              </div>
              <p className="text-muted-text font-body text-base max-w-xl leading-relaxed">
                {brand.description}
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Products */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {products === undefined || products.length === 0 ? (
            <CollectionGridSkeleton count={6} />
          ) : (
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8"
            >
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
