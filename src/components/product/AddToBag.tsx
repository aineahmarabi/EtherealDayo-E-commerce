"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Check, Zap } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";
import { cn, formatPrice } from "@/lib/utils";
import React from "react";

type Variant = {
  _id?: string;
  id?: string;
  size: string;
  concentration: string;
  price: number;
};

type Props = {
  productId: string;
  productName: string;
  brandName: string;
  variants: Variant[];
  image?: string;
};

export function AddToBag({ productId, productName, brandName, variants, image = "" }: Props) {
  const router = useRouter();
  const { addItem, triggerFly } = useCartStore();
  const [selectedId, setSelectedId] = useState<string>(
    (variants[0]?.id ?? variants[0]?._id) ?? ""
  );
  const [added, setAdded] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const selectedVariant = variants.find(
    (v) => (v.id ?? v._id) === selectedId
  ) ?? variants[0];

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!selectedVariant) return;
    const vid = selectedVariant.id ?? selectedVariant._id ?? "";
    addItem({
      productId,
      variantId: vid,
      productName,
      brandName,
      size: selectedVariant.size,
      concentration: selectedVariant.concentration,
      price: selectedVariant.price,
      quantity: 1,
      image,
    });
    // Fire the flying animation from button centre
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    triggerFly({
      fromX: rect.left + rect.width / 2,
      fromY: rect.top + rect.height / 2,
      image: image || undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const handleBuyNow = () => {
    if (!selectedVariant) return;
    const vid = selectedVariant.id ?? selectedVariant._id ?? "";
    addItem({
      productId,
      variantId: vid,
      productName,
      brandName,
      size: selectedVariant.size,
      concentration: selectedVariant.concentration,
      price: selectedVariant.price,
      quantity: 1,
      image,
    });
    router.push("/checkout");
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Variant pills */}
      <div className="flex flex-wrap gap-2.5" role="group" aria-label="Select size">
        {variants.map((v) => {
          const vid = v.id ?? v._id ?? "";
          const isActive = selectedId === vid;
          return (
            <button
              key={vid}
              onClick={() => setSelectedId(vid)}
              className={cn(
                "px-4 py-2 rounded-full border text-sm font-body transition-all duration-300 cursor-pointer",
                isActive
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-gold/20 text-bone/60 hover:border-gold/40 hover:text-bone"
              )}
              aria-pressed={isActive}
            >
              {v.size} {v.concentration}
            </button>
          );
        })}
      </div>

      {/* Price */}
      {selectedVariant && (
        <p className="font-display text-2xl text-bone">
          {formatPrice(selectedVariant.price)}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          ref={btnRef}
          onClick={(e) => handleAdd(e)}
          disabled={added}
          className={cn(
            "relative flex-1 py-4 rounded-full flex items-center justify-center gap-3",
            "text-sm tracking-widest uppercase font-body transition-all duration-300 cursor-pointer border",
            added
              ? "bg-gold/10 border-gold text-gold"
              : "bg-transparent border-gold/30 text-bone hover:border-gold hover:text-gold hover:bg-gold/5"
          )}
          aria-label={`Add ${productName} to bag`}
        >
          <AnimatePresence mode="wait">
            {added ? (
              <motion.span
                key="added"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <Check size={16} />
                Added
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <ShoppingBag size={16} />
                Add to Bag
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <button
          onClick={handleBuyNow}
          className={cn(
            "relative flex-1 py-4 rounded-full flex items-center justify-center gap-3",
            "text-sm tracking-widest uppercase font-body transition-all duration-300 cursor-pointer",
            "bg-gold text-noir hover:bg-gold-soft border border-transparent hover:border-gold"
          )}
          aria-label={`Buy ${productName} now`}
        >
          <Zap size={16} />
          Buy it Now
        </button>
      </div>
    </div>
  );
}
