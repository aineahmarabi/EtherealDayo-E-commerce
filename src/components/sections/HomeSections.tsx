"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { CollectionGridSkeleton, BrandCardSkeleton } from "@/components/ui/Skeleton";
import { ProductCard } from "@/components/product/ProductCard";
import { ArrowRight } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

function SectionReveal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionHeader({ label, title, href }: { label: string; title: string; href: string }) {
  return (
    <div className="flex items-end justify-between mb-10">
      <div className="flex flex-col gap-2">
        <span className="text-[11px] tracking-[0.3em] uppercase text-gold font-body">{label}</span>
        <h2 className="font-display text-2xl md:text-3xl text-bone tracking-tight">{title}</h2>
      </div>
      <Link
        href={href}
        className="hidden sm:flex items-center gap-2 text-sm text-muted-text hover:text-bone transition-colors font-body group"
      >
        View all
        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}

function BestsellerRow() {
  const bestsellers = useQuery(api.products.listBestsellers);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <SectionReveal>
          <SectionHeader
            label="Most Coveted"
            title="Bestsellers"
            href="/bestsellers"
          />
        </SectionReveal>
        {bestsellers === undefined || bestsellers.length === 0 ? (
          <CollectionGridSkeleton count={4} />
        ) : (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.08 } },
            }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8"
          >
            {bestsellers.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

function BrandsRow() {
  const brands = useQuery(api.brands.list);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-gold/5">
      <div className="max-w-7xl mx-auto">
        <SectionReveal>
          <SectionHeader
            label="The Houses"
            title="Shop by Brand"
            href="/brands"
          />
        </SectionReveal>

        {brands === undefined || brands.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => <BrandCardSkeleton key={i} />)}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
          >
            {brands.map((brand) => (
              <motion.div
                key={brand._id}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
                }}
              >
                <Link
                  href={`/brand/${brand.slug}`}
                  className="group flex flex-col items-center gap-3 p-6 rounded-2xl border border-gold/10 bg-bordeaux-deep/10 hover:border-gold/30 hover:bg-bordeaux-deep/20 transition-all duration-500"
                >
                  {/* Brand monogram */}
                  <div className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center group-hover:border-gold/60 transition-colors">
                    <span className="font-display text-lg text-gold">{brand.name.charAt(0)}</span>
                  </div>
                  <span className="text-sm font-display text-bone text-center leading-tight">{brand.name}</span>
                  <p className="text-xs text-muted-text font-body text-center line-clamp-2">{brand.description}</p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

function NewArrivalsRow() {
  const newArrivals = useQuery(api.products.listNewArrivals);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-gold/5">
      <div className="max-w-7xl mx-auto">
        <SectionReveal>
          <SectionHeader
            label="Just Arrived"
            title="New Arrivals"
            href="/new-arrivals"
          />
        </SectionReveal>
        {newArrivals === undefined || newArrivals.length === 0 ? (
          <CollectionGridSkeleton count={4} />
        ) : (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8"
          >
            {newArrivals.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

function EditorialBand() {
  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 border-t border-gold/5">
      <div className="max-w-3xl mx-auto text-center">
        <SectionReveal>
          <div className="hairline mb-12 max-w-xs mx-auto" />
          <blockquote className="font-display text-2xl md:text-4xl text-bone/70 leading-relaxed tracking-tight">
            &ldquo;Perfume is the most intense form of{" "}
            <em className="text-dusty-rose not-italic">memory.&rdquo;</em>
          </blockquote>
          <div className="hairline mt-12 max-w-xs mx-auto" />
        </SectionReveal>
      </div>
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-20 text-center">
      <p className="text-muted-text font-body text-sm">{message}</p>
    </div>
  );
}

export function HomeSections() {
  return (
    <div className="bg-ink">
      <BestsellerRow />
      <BrandsRow />
      <NewArrivalsRow />
      <EditorialBand />
    </div>
  );
}
