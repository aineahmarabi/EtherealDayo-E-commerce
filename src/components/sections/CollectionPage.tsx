"use client";

import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { CollectionGridSkeleton } from "@/components/ui/Skeleton";
import { ProductCard } from "@/components/product/ProductCard";
import { api } from "../../../convex/_generated/api";

const ease = [0.16, 1, 0.3, 1] as const;

type Props = {
  label: string;
  title: string;
  subtitle?: string;
  accentColor: string;
  queryName: "listActive" | "listBestsellers" | "listNewArrivals";
  audience?: "her" | "him";
  heroImageDesktop?: string;
  heroImageMobile?: string;
};

type ProductResult = {
  _id: string;
  name: string;
  slug?: string;
  brandName: string;
  family: string;
  images: string[];
  variants?: Array<{ _id: string; price: number; size: string; concentration: string }>;
};

export function CollectionPage({ label, title, subtitle, accentColor, queryName, audience, heroImageDesktop, heroImageMobile }: Props) {
  const listActive = useQuery(
    api.products.listActive,
    queryName === "listActive" && !audience ? {} : "skip"
  );
  const listBestsellers = useQuery(
    api.products.listBestsellers,
    queryName === "listBestsellers" ? {} : "skip"
  );
  const listNewArrivals = useQuery(
    api.products.listNewArrivals,
    queryName === "listNewArrivals" ? { days: 60 } : "skip"
  );
  const listByAudience = useQuery(
    api.products.listByAudience,
    audience ? { audience } : "skip"
  );

  let products: ProductResult[] | undefined;
  if (audience) {
    products = listByAudience as ProductResult[] | undefined;
  } else if (queryName === "listBestsellers") {
    products = listBestsellers as ProductResult[] | undefined;
  } else if (queryName === "listNewArrivals") {
    products = listNewArrivals as ProductResult[] | undefined;
  } else {
    products = listActive as ProductResult[] | undefined;
  }

  return (
    <div className="min-h-dvh bg-ink">
      {/* Hero banner */}
      <section className="relative pt-40 pb-20 px-4 sm:px-6 lg:px-8 border-b border-gold/5 overflow-hidden">
        {heroImageDesktop ? (
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[35%] bottom-0 left-0 right-0 sm:inset-0 z-0">
              <picture>
                {heroImageMobile && (
                  <source media="(max-width: 768px)" srcSet={heroImageMobile} />
                )}
                <img
                  src={heroImageDesktop}
                  alt=""
                  className="w-full h-full object-cover object-bottom sm:object-center opacity-90 sm:opacity-70"
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/60 to-transparent sm:w-2/3" />
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-ink to-transparent sm:hidden" />
            </div>
          </div>
        ) : (
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none z-0"
            style={{ backgroundColor: accentColor }}
          />
        )}
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="flex flex-col gap-3"
          >
            <span className="text-[11px] tracking-[0.35em] uppercase font-body" style={{ color: accentColor }}>
              {label}
            </span>
            <h1 className="font-display text-4xl md:text-6xl text-bone tracking-tight">{title}</h1>
            {subtitle && <p className="text-muted-text font-body text-base max-w-md mt-1">{subtitle}</p>}
          </motion.div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {products === undefined || products.length === 0 ? (
            <CollectionGridSkeleton count={8} />
          ) : (
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6"
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

