"use client";

import { use, useState } from "react";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { api } from "../../../../convex/_generated/api";
import { formatPrice } from "@/lib/utils";
import { CheckCircle, Copy } from "lucide-react";

export default function OrderConfirmationPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = use(params);
  const [copied, setCopied] = useState(false);
  const order = useQuery(api.orders.getByNumber, { number });
  const products = useQuery(api.products.listActive);

  const handleCopy = () => {
    navigator.clipboard.writeText(number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (order === undefined) {
    return (
      <div className="min-h-dvh bg-ink flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border border-gold/30 mx-auto mb-4 animate-pulse" />
          <p className="text-muted-text font-body">Loading your order…</p>
        </div>
      </div>
    );
  }

  if (order === null) {
    return (
      <div className="min-h-dvh bg-ink flex items-center justify-center">
        <div className="text-center">
          <p className="font-display text-2xl text-bone">Order not found</p>
          <Link href="/" className="mt-4 inline-block text-gold font-body underline underline-offset-4">
            Return home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-ink">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center gap-8 text-center"
        >
          {/* Checkmark */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <CheckCircle size={56} className="text-gold" />
          </motion.div>

          <div className="flex flex-col gap-2">
            <h1 className="font-display text-3xl md:text-4xl text-bone tracking-tight">
              Order Confirmed
            </h1>
            <p className="text-muted-text font-body">
              Thank you, {order.customerName}. Your fragrances are on their way.
            </p>
          </div>

          {/* Order number */}
          <div 
            onClick={handleCopy}
            className="px-8 py-4 border border-gold/20 rounded-2xl bg-bordeaux-deep/10 cursor-pointer hover:bg-bordeaux-deep/20 transition-colors group relative"
          >
            <p className="text-[10px] tracking-[0.35em] uppercase text-muted-text font-body">Order Number</p>
            <div className="flex items-center justify-center gap-3 mt-1">
              <p className="font-display text-xl text-gold">{order.number}</p>
              <Copy size={14} className="text-gold/50 group-hover:text-gold transition-colors" />
            </div>
            {copied && (
              <motion.span 
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gold uppercase tracking-widest font-body"
              >
                Copied
              </motion.span>
            )}
          </div>

          {/* Items */}
          <div className="w-full">
            <div className="hairline mb-6" />
            <ul className="flex flex-col divide-y divide-gold/10">
              {order.lineItems.map((item, i) => {
                const product = products?.find(p => p.name === item.productName);
                const imageUrl = product?.images?.[0] || "/placeholder.jpg";
                
                return (
                  <li key={i} className="py-4 flex items-center justify-between gap-4 text-left">
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 flex-shrink-0 bg-bordeaux-deep/10 border border-gold/10 rounded-xl overflow-hidden relative p-1">
                        <img src={imageUrl} alt={item.productName} className="object-contain w-full h-full" />
                      </div>
                      <div>
                        <p className="text-base font-display text-bone">{item.productName}</p>
                        <p className="text-sm text-muted-text font-body mt-1">{item.size} · {item.concentration} · ×{item.qty}</p>
                      </div>
                    </div>
                    <span className="text-base font-body text-bone flex-shrink-0">{formatPrice(item.price * item.qty)}</span>
                  </li>
                );
              })}
            </ul>
            <div className="hairline mt-4 mb-4" />
            <div className="flex flex-col gap-1.5 text-sm font-body">
              <div className="flex justify-between text-bone/60">
                <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-bone/60">
                <span>Shipping</span><span>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span>
              </div>
              <div className="flex justify-between font-display text-base text-bone pt-1">
                <span>Total</span><span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 text-center max-w-sm mt-2">
            {order.paymentMethod === "card" ? (
              <p className="text-sm text-bone font-body p-4 border border-gold/30 rounded-xl bg-gold/5">
                Your order is being taken care of. You will be communicated on means to pay.
              </p>
            ) : order.paymentMethod === "cod" ? (
              <p className="text-sm text-bone font-body p-4 border border-gold/30 rounded-xl bg-gold/5">
                Please prepare the exact amount in cash for delivery. You will receive a notification once dispatched.
              </p>
            ) : null}
            <p className="text-xs text-muted-text font-body">
              A confirmation has been sent to <span className="text-bone">{order.customerEmail}</span>.
            </p>
          </div>

          <Link
            href="/catalog"
            className="px-8 py-4 rounded-full border border-gold/30 text-sm text-gold hover:bg-bordeaux-deep/30 transition-colors font-body tracking-widest uppercase"
          >
            Continue Exploring
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
