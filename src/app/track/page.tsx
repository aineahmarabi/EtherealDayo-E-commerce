"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { api } from "../../../convex/_generated/api";
import { formatPrice, formatDate } from "@/lib/utils";
import { Search, Package, ChevronRight, PackageOpen, ArrowRight } from "lucide-react";

export default function TrackOrderPage() {
  const [queryInput, setQueryInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Check local storage for the latest order
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("ethereal_latest_order");
      if (cached) {
        setQueryInput(cached);
        setSearchQuery(cached);
      }
    }
  }, []);

  const results = useQuery(
    api.orders.searchTracking,
    searchQuery.length > 3 ? { query: searchQuery } : "skip"
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(queryInput);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-gold/10 text-gold border-gold/20";
      case "dispatched": return "bg-blue-900/30 text-blue-300 border-blue-500/20";
      case "fulfilled": return "bg-green-900/30 text-green-400 border-green-500/20";
      case "refunded": return "bg-purple-900/30 text-purple-400 border-purple-500/20";
      case "cancelled": return "bg-bordeaux/20 text-dusty-rose border-red-500/20";
      default: return "bg-white/5 text-bone/60 border-white/10";
    }
  };

  const statusText = (status: string) => {
    switch (status) {
      case "new": return "Processing";
      case "dispatched": return "Dispatched";
      case "fulfilled": return "Delivered";
      case "refunded": return "Refunded";
      case "cancelled": return "Cancelled";
      default: return status;
    }
  };

  return (
    <div className="min-h-dvh bg-ink flex flex-col">
      <main className="flex-1 flex flex-col items-center pt-32 px-4 sm:px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-xl flex flex-col gap-8"
        >
          <div className="text-center flex flex-col gap-3">
            <h1 className="font-display text-3xl sm:text-4xl text-bone">Track Your Order</h1>
            <p className="text-muted-text font-body text-sm max-w-sm mx-auto">
              Enter your Order Number (e.g., ED-00001), Email, or Phone Number to check the status of your fragrance.
            </p>
          </div>

          <form onSubmit={handleSearch} className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/50 pointer-events-none" />
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Order #, Email, or Phone..."
              className="w-full bg-bordeaux-deep/10 border border-gold/30 hover:border-gold/50 focus:border-gold rounded-full pl-12 pr-32 py-4 text-base text-bone font-body placeholder:text-muted-text/70 transition-colors focus:outline-none"
            />
            <button
              type="submit"
              disabled={queryInput.length < 3}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gold hover:bg-gold-soft text-noir text-xs font-bold tracking-widest uppercase py-2.5 px-5 rounded-full transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              Track
            </button>
          </form>

          <AnimatePresence mode="wait">
            {searchQuery.length > 3 && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-4 mt-4"
              >
                {results === undefined ? (
                  <div className="flex flex-col gap-4">
                    {[1, 2].map(i => (
                      <div key={i} className="h-32 rounded-2xl bg-bordeaux-deep/5 border border-gold/10 animate-pulse" />
                    ))}
                  </div>
                ) : results.length === 0 ? (
                  <div className="text-center py-12 px-6 rounded-2xl border border-gold/10 bg-bordeaux-deep/5">
                    <PackageOpen size={32} className="text-gold/30 mx-auto mb-4" />
                    <p className="text-bone font-display text-lg">No orders found</p>
                    <p className="text-muted-text font-body text-sm mt-1">We couldn&apos;t find anything matching &quot;{searchQuery}&quot;.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <p className="text-xs tracking-widest uppercase text-muted-text font-body px-2">
                      Found {results.length} order{results.length === 1 ? '' : 's'}
                    </p>
                    {results.map((order) => (
                      <Link href={`/order/${order.number}`} key={order._id}>
                        <div className="group rounded-2xl border border-gold/15 bg-bordeaux-deep/10 p-5 sm:p-6 hover:bg-bordeaux-deep/20 transition-all cursor-pointer relative overflow-hidden flex flex-col sm:flex-row gap-5 sm:items-center justify-between">
                          <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-10 group-hover:opacity-20 transition-opacity">
                            <Package size={80} className="text-gold translate-x-4 -translate-y-4" />
                          </div>
                          
                          <div className="flex flex-col gap-3 relative z-10">
                            <div className="flex items-center gap-3">
                              <span className="font-display text-xl text-gold">{order.number}</span>
                              <span className={`px-2.5 py-1 rounded-full text-[10px] tracking-widest uppercase font-bold border ${statusColor(order.status)}`}>
                                {statusText(order.status)}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1 text-sm font-body text-bone/80">
                              <p>{formatDate(order._creationTime)}</p>
                              <p>{order.lineItems.length} item{order.lineItems.length === 1 ? '' : 's'} · {formatPrice(order.total)}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-gold text-xs tracking-widest uppercase font-bold relative z-10 sm:self-end">
                            View Receipt <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
