"use client";

import { useCartStore } from "@/store/cartStore";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Plus, Minus, X, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQty, total } = useCartStore();
  const cartTotal = total();

  return (
    <div className="min-h-dvh bg-ink pt-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-3xl md:text-4xl text-bone tracking-tight mb-10">Your Bag</h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-6 py-24">
            <div className="w-16 h-16 rounded-full border border-gold/20 flex items-center justify-center">
              <ShoppingBag size={24} className="text-gold/40" />
            </div>
            <p className="font-display text-xl text-bone/50">Your bag is empty</p>
            <Link
              href="/catalog"
              className="px-6 py-3 rounded-full border border-gold/30 text-sm text-gold hover:bg-bordeaux-deep/30 transition-colors font-body"
            >
              Explore Fragrances
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <ul className="flex flex-col divide-y divide-gold/10">
              {items.map((item) => (
                <motion.li
                  key={item.variantId}
                  layout
                  exit={{ opacity: 0, x: 20 }}
                  className="py-6 flex gap-5"
                >
                  <div className="w-20 h-24 rounded-xl bg-bordeaux-deep/30 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {item.image ? (
                      <Image src={item.image} alt={item.productName} width={80} height={96} className="object-cover w-full h-full" />
                    ) : (
                      <svg viewBox="0 0 40 60" className="w-10 h-14" aria-hidden="true">
                        <rect x="14" y="2" width="12" height="8" rx="2" fill="#C9A961" opacity="0.6" />
                        <path d="M8 10 Q6 18 6 30 L6 54 Q6 58 20 58 Q34 58 34 54 L34 30 Q34 18 32 10 Z" fill="#2A0A12" stroke="#C9A961" strokeWidth="0.8" strokeOpacity="0.4" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <p className="text-xs text-muted-text font-body">{item.brandName}</p>
                    <p className="font-display text-base text-bone">{item.productName}</p>
                    <p className="text-xs text-muted-text font-body">{item.size} · {item.concentration}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2 border border-gold/20 rounded-full px-3 py-1.5">
                        <button onClick={() => updateQty(item.variantId, item.quantity - 1)} aria-label="Decrease" className="text-bone/60 hover:text-bone cursor-pointer"><Minus size={11} /></button>
                        <span className="text-sm font-body text-bone min-w-[1.5ch] text-center">{item.quantity}</span>
                        <button onClick={() => updateQty(item.variantId, item.quantity + 1)} aria-label="Increase" className="text-bone/60 hover:text-bone cursor-pointer"><Plus size={11} /></button>
                      </div>
                      <span className="font-body text-bone">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.variantId)} aria-label="Remove" className="self-start mt-1 text-muted-text hover:text-bone transition-colors cursor-pointer"><X size={14} /></button>
                </motion.li>
              ))}
            </ul>

            {/* Summary */}
            <div className="border-t border-gold/10 pt-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-text font-body">Subtotal</span>
                <span className="font-display text-xl text-bone">{formatPrice(cartTotal)}</span>
              </div>
              <p className="text-xs text-muted-text font-body">Shipping and tax calculated at checkout.</p>
              <Link
                href="/checkout"
                className="w-full py-4 flex items-center justify-center bg-gold text-noir rounded-full text-sm tracking-widest uppercase font-body hover:bg-gold-soft transition-colors"
              >
                Proceed to Checkout
              </Link>
              <Link
                href="/catalog"
                className="w-full py-3 text-center text-sm text-bone/50 hover:text-bone font-body transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
