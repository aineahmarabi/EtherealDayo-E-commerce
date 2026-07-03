"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";

type ProductLike = {
  _id: string;
  name: string;
  slug?: string;
  brandName: string;
  family: string;
  images: string[];
  variants?: Array<{ _id: string; price: number; size: string; concentration: string }>;
};

const ease = [0.16, 1, 0.3, 1] as const;

export function ProductCard({ product }: { product: ProductLike }) {
  const slug = (product as { slug?: string }).slug ?? product._id;
  const minPrice = product.variants && product.variants.length > 0
    ? Math.min(...product.variants.map((v) => v.price))
    : null;
  const image = product.images?.[0];
  const { addItem, triggerFly } = useCartStore();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.variants || product.variants.length === 0) return;
    const v = product.variants[0];
    addItem({
      productId: product._id,
      variantId: v._id,
      productName: product.name,
      brandName: product.brandName,
      size: v.size,
      concentration: v.concentration,
      price: v.price,
      quantity: 1,
      image: image ?? "",
    });
    // Fire shooting-star animation from the button
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    triggerFly({
      fromX: rect.left + rect.width / 2,
      fromY: rect.top + rect.height / 2,
      image: image || undefined,
    });
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
      }}
    >
      <Link href={`/product/${slug}`} className="group flex flex-col gap-3">
        {/* Image / bottle */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.4, ease }}
          className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] flex items-center justify-center p-4 border border-gold/5"
        >
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              className="object-contain p-4 transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <BottlePlaceholderCard />
          )}
          {/* Hover veil */}
          <div className="absolute inset-0 bg-bordeaux-deep/0 group-hover:bg-bordeaux-deep/40 transition-colors duration-500" />
          
          {/* Quick Add Button */}
          {product.variants && product.variants.length > 0 && (
            <div className="absolute bottom-4 left-4 right-4 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out z-10">
              <button
                onClick={handleQuickAdd}
                className="w-full py-2.5 rounded-lg bg-gold text-noir text-[10px] tracking-widest uppercase font-body hover:bg-gold-soft transition-colors shadow-lg"
              >
                Quick Add
              </button>
            </div>
          )}
        </motion.div>

        {/* Info */}
        <div className="flex flex-col gap-1 px-0.5">
          <span className="text-[10px] tracking-[0.2em] uppercase text-muted-text font-body">
            {product.brandName}
          </span>
          <span className="text-sm font-display text-bone leading-snug group-hover:text-gold/90 transition-colors duration-300">
            {product.name}
          </span>
          <span className="text-[11px] text-muted-text font-body">{product.family}</span>
          {minPrice !== null && (
            <span className="text-sm text-bone/70 font-body mt-0.5">
              {formatPrice(minPrice)}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

function BottlePlaceholderCard() {
  return (
    <svg viewBox="0 0 80 120" className="w-20 h-28 opacity-60" aria-hidden="true">
      <rect x="30" y="3" width="20" height="16" rx="4" fill="#C9A961" opacity="0.6" />
      <rect x="32" y="19" width="16" height="5" rx="2.5" fill="#C9A961" opacity="0.4" />
      <rect x="24" y="24" width="32" height="4" rx="2" fill="#C9A961" opacity="0.5" />
      <path
        d="M18 28 Q14 40 14 62 L14 106 Q14 116 40 116 Q66 116 66 106 L66 62 Q66 40 62 28 Z"
        fill="#2A0A12"
        stroke="#C9A961"
        strokeWidth="1"
        strokeOpacity="0.35"
      />
      <rect x="22" y="60" width="36" height="30" rx="2" fill="#C9A961" opacity="0.07" />
      <line x1="22" y1="60" x2="58" y2="60" stroke="#C9A961" strokeWidth="0.8" strokeOpacity="0.3" />
      <line x1="22" y1="90" x2="58" y2="90" stroke="#C9A961" strokeWidth="0.8" strokeOpacity="0.3" />
      <path
        d="M18 35 Q17 62 18 80"
        stroke="white"
        strokeWidth="2"
        strokeOpacity="0.06"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
