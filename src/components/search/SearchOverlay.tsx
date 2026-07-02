"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useSearchStore } from "@/store/cartStore";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { cn, debounce } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";

export function SearchOverlay() {
  const { isOpen, closeSearch } = useSearchStore();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useQuery(
    api.products.search,
    debouncedQuery.length >= 2 ? { query: debouncedQuery } : "skip"
  );
  const logMiss = useMutation(api.search.logMiss);

  const debouncedSet = useRef(
    debounce((...args: unknown[]) => setDebouncedQuery(args[0] as string), 150)
  ).current;

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setDebouncedQuery("");
    }
  }, [isOpen]);

  const loggedMissFor = useRef<string>("");

  // Log search misses
  useEffect(() => {
    if (debouncedQuery.length >= 2 && results !== undefined && results.length === 0) {
      if (loggedMissFor.current !== debouncedQuery) {
        logMiss({ term: debouncedQuery });
        loggedMissFor.current = debouncedQuery;
      }
    }
  }, [debouncedQuery, results, logMiss]);

  // Keyboard: close on Escape, navigate with arrows
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeSearch]);

  const handleInput = (v: string) => {
    setQuery(v);
    debouncedSet(v);
  };

  const showResults = debouncedQuery.length >= 2;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Veil */}
          <motion.div
            key="veil"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-noir/85 backdrop-blur-md"
            onClick={closeSearch}
            aria-hidden="true"
          />

          {/* Search panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
            className="fixed inset-x-0 top-0 z-[110] mx-auto max-w-2xl px-4 pt-20 pb-8"
            role="search"
            aria-label="Search fragrances"
          >
            {/* Input */}
            <div className="relative flex items-center border border-gold/30 rounded-2xl bg-ink/90 backdrop-blur-sm focus-within:border-gold/70 transition-colors">
              <Search size={18} className="absolute left-5 text-gold/60 pointer-events-none" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => handleInput(e.target.value)}
                placeholder="Search by name, note, family, or house…"
                className="w-full bg-transparent pl-12 pr-12 py-4 text-base text-bone placeholder:text-muted-text font-body outline-none"
                aria-label="Search"
                autoComplete="off"
                spellCheck={false}
              />
              {query && (
                <button
                  onClick={() => { setQuery(""); setDebouncedQuery(""); inputRef.current?.focus(); }}
                  aria-label="Clear search"
                  className="absolute right-5 text-muted-text hover:text-bone transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Results panel */}
            <AnimatePresence mode="wait">
              {showResults && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3 rounded-2xl border border-gold/15 bg-ink/95 backdrop-blur-sm overflow-hidden max-h-[60vh] overflow-y-auto"
                >
                  {results === undefined ? (
                    <div className="p-8 text-center text-muted-text font-body text-sm">
                      Searching…
                    </div>
                  ) : results.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="font-display text-bone/60 text-base">
                        No results for &ldquo;{debouncedQuery}&rdquo;
                      </p>
                      <p className="text-sm text-muted-text font-body mt-2">
                        Try a note, house, or olfactory family.
                      </p>
                      <Link
                        href="/bestsellers"
                        onClick={closeSearch}
                        className="inline-block mt-4 text-sm text-gold hover:text-gold-soft font-body underline underline-offset-4 transition-colors"
                      >
                        Explore Bestsellers →
                      </Link>
                    </div>
                  ) : (
                    <div className="py-2">
                      <p className="px-5 py-2 text-[11px] tracking-widest uppercase text-muted-text font-body">
                        Fragrances
                      </p>
                      {results.map((product) => {
                        // Search returns products without variant data; price shown separately on product page
                        const minPrice: number | null = null;
                        return (
                          <Link
                            key={product._id}
                            href={`/product/${(product as { slug?: string }).slug ?? product._id}`}
                            onClick={closeSearch}
                            className="flex items-center gap-4 px-5 py-3 hover:bg-bordeaux-deep/30 transition-colors"
                          >
                            <div className="w-10 h-12 rounded-md bg-bordeaux-deep/40 flex-shrink-0 flex items-center justify-center">
                              <SearchBottleIcon />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-display text-bone truncate">{product.name}</p>
                              <p className="text-xs text-muted-text font-body truncate">
                                {product.brandName} · {product.family}
                              </p>
                            </div>
                            {minPrice && (
                              <span className="text-sm text-gold font-body flex-shrink-0">
                                from {formatPrice(minPrice)}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {!showResults && !query && (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 rounded-2xl border border-gold/10 bg-ink/80 backdrop-blur-sm p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={14} className="text-gold" />
                    <p className="text-[11px] tracking-widest uppercase text-muted-text font-body">
                      Popular searches
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["oud", "rose", "leather", "amber", "incense", "vetiver"].map((term) => (
                      <button
                        key={term}
                        onClick={() => handleInput(term)}
                        className={cn(
                          "px-3 py-1.5 rounded-full border border-gold/20 text-xs text-bone/60",
                          "hover:border-gold/50 hover:text-bone transition-colors font-body cursor-pointer"
                        )}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Close hint */}
            <p className="mt-4 text-center text-xs text-muted-text font-body">
              Press{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-bordeaux-deep/40 border border-gold/10 text-bone/60 font-mono text-[10px]">
                ESC
              </kbd>{" "}
              to close
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SearchBottleIcon() {
  return (
    <svg viewBox="0 0 20 26" className="w-5 h-6" aria-hidden="true">
      <rect x="7" y="1" width="6" height="4" rx="1" fill="#C9A961" opacity="0.5" />
      <path d="M4 5 Q3 10 3 15 L3 23 Q3 25 10 25 Q17 25 17 23 L17 15 Q17 10 16 5 Z"
        fill="#2A0A12" stroke="#C9A961" strokeWidth="0.5" strokeOpacity="0.4" />
    </svg>
  );
}
