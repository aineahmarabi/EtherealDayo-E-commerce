"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Check } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils";

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
  const { addItem, openCart } = useCartStore();
  const [selectedId, setSelectedId] = useState<string>(
    (variants[0]?.id ?? variants[0]?._id) ?? ""
  );
  const [added, setAdded] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const selectedVariant = variants.find(
    (v) => (v.id ?? v._id) === selectedId
  ) ?? variants[0];

  const handleAdd = () => {
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
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      openCart();
    }, 1200);
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
          ${selectedVariant.price.toLocaleString()}
        </p>
      )}

      {/* Add to bag */}
      <button
        ref={btnRef}
        onClick={handleAdd}
        disabled={added}
        className={cn(
          "relative w-full py-4 rounded-full flex items-center justify-center gap-3",
          "text-sm tracking-widest uppercase font-body transition-all duration-300 cursor-pointer",
          added
            ? "bg-gold/20 border border-gold text-gold"
            : "bg-gold text-noir hover:bg-gold-soft"
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
              Added to Bag
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
    </div>
  );
}
