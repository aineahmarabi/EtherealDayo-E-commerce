"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { isOpen, closeCart, items, removeItem, updateQty, total } = useCartStore();
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const cartTotal = mounted ? total() : 0;

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[80] bg-noir/70 backdrop-blur-sm"
            onClick={closeCart}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
            className="fixed right-0 inset-y-0 z-[90] w-full max-w-md bg-noir border-l border-gold/10 flex flex-col"
            aria-label="Shopping cart"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gold/10">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-gold" />
                <h2 className="font-display text-base tracking-widest uppercase text-bone">
                  Your Bag
                </h2>
                {items.length > 0 && (
                  <span className="text-xs text-muted-text font-body">
                    ({items.length} {items.length === 1 ? "item" : "items"})
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                aria-label="Close cart"
                className="text-bone/50 hover:text-bone transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-6 py-20">
                  <div className="w-16 h-16 rounded-full border border-gold/20 flex items-center justify-center">
                    <ShoppingBag size={24} className="text-gold/40" />
                  </div>
                  <div className="text-center">
                    <p className="font-display text-lg text-bone/60">Your bag is empty</p>
                    <p className="text-sm text-muted-text font-body mt-1">
                      Begin your collection.
                    </p>
                  </div>
                  <button
                    onClick={closeCart}
                    className="text-sm text-gold hover:text-gold-soft transition-colors font-body underline underline-offset-4 cursor-pointer"
                  >
                    Explore fragrances
                  </button>
                </div>
              ) : (
                <ul className="flex flex-col divide-y divide-gold/10">
                  {items.map((item) => (
                    <li key={item.variantId} className="py-5 flex gap-4">
                      {/* Product image */}
                      <div className="w-16 h-20 rounded-lg overflow-hidden bg-bordeaux-deep/30 flex-shrink-0 flex items-center justify-center">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.productName}
                            width={64}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <BottlePlaceholder accent="#C9A961" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 flex flex-col gap-1.5">
                        <p className="text-xs text-muted-text font-body">{item.brandName}</p>
                        <p className="text-sm font-display text-bone leading-tight">{item.productName}</p>
                        <p className="text-xs text-muted-text font-body">
                          {item.size} · {item.concentration}
                        </p>
                        <div className="flex items-center justify-between mt-auto pt-2">
                          {/* Qty stepper */}
                          <div className="flex items-center gap-2 border border-gold/20 rounded-full px-2 py-1">
                            <button
                              onClick={() => updateQty(item.variantId, item.quantity - 1)}
                              aria-label="Decrease quantity"
                              className="w-5 h-5 flex items-center justify-center text-bone/60 hover:text-bone transition-colors cursor-pointer"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-sm text-bone min-w-[1.5ch] text-center font-body">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQty(item.variantId, item.quantity + 1)}
                              aria-label="Increase quantity"
                              className="w-5 h-5 flex items-center justify-center text-bone/60 hover:text-bone transition-colors cursor-pointer"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <p className="text-sm font-body text-bone">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.variantId)}
                        aria-label={`Remove ${item.productName}`}
                        className="self-start mt-1 text-muted-text hover:text-bone transition-colors cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-6 border-t border-gold/10 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-text font-body">Subtotal</span>
                  <span className="font-display text-lg text-bone">{formatPrice(cartTotal)}</span>
                </div>
                <p className="text-xs text-muted-text font-body">
                  Shipping and tax calculated at checkout.
                </p>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full py-4 flex items-center justify-center bg-gold text-noir font-body text-sm tracking-widest uppercase rounded-full hover:bg-gold-soft transition-colors"
                >
                  Proceed to Checkout
                </Link>
                <button
                  onClick={closeCart}
                  className="w-full py-3 text-sm text-bone/60 hover:text-bone font-body transition-colors cursor-pointer"
                >
                  Keep exploring
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function BottlePlaceholder({ accent = "#C9A961" }: { accent?: string }) {
  return (
    <svg viewBox="0 0 40 60" className="w-8 h-12" aria-hidden="true">
      <rect x="15" y="2" width="10" height="8" rx="2" fill={accent} opacity="0.8" />
      <rect x="13" y="10" width="14" height="2" rx="1" fill={accent} opacity="0.6" />
      <path d="M10 12 Q8 20 8 30 L8 54 Q8 58 20 58 Q32 58 32 54 L32 30 Q32 20 30 12 Z"
        fill="#2A0A12" stroke={accent} strokeWidth="0.8" strokeOpacity="0.5" />
      <rect x="12" y="32" width="16" height="14" rx="1" fill={accent} opacity="0.15" />
      <line x1="12" y1="32" x2="28" y2="32" stroke={accent} strokeWidth="0.5" strokeOpacity="0.4" />
      <line x1="12" y1="46" x2="28" y2="46" stroke={accent} strokeWidth="0.5" strokeOpacity="0.4" />
    </svg>
  );
}
