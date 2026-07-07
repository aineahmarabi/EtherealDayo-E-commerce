"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { motion } from "framer-motion";
import Image from "next/image";
import { api } from "../../../../convex/_generated/api";
import { Skeleton } from "@/components/ui/Skeleton";
import { Plus, Search, Eye, EyeOff, Star } from "lucide-react";

function formatKES(amount: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function ProductGridImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <svg viewBox="0 0 60 90" className="w-14 h-20 opacity-50" aria-hidden="true">
        <rect x="22" y="2" width="16" height="12" rx="3" fill="#C9A961" opacity="0.6" />
        <path d="M14 23 Q10 32 10 50 L10 78 Q10 86 30 86 Q50 86 50 78 L50 50 Q50 32 46 23 Z" fill="#1A1416" stroke="#C9A961" strokeWidth="1" strokeOpacity="0.35" />
      </svg>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      onError={() => setError(true)}
    />
  );
}

export default function ProductsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const products = useQuery(api.products.listAll);
  const updateProduct = useMutation(api.products.update);

  const filtered = products?.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brandName.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="flex flex-col gap-6 max-w-7xl w-full overflow-x-hidden">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-bone">Products</h1>
        <button 
          onClick={() => router.push("/admin/products/new")}
          className="flex items-center gap-2 px-4 py-2.5 bg-gold text-noir rounded-full text-xs tracking-widest uppercase font-body hover:bg-gold-soft transition-colors cursor-pointer"
        >
          <Plus size={13} />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="pl-8 pr-4 py-2 text-xs bg-bordeaux-deep/10 border border-gold/15 rounded-lg text-bone font-body placeholder:text-muted-text focus:border-gold/40 focus:outline-none w-full transition-colors"
        />
      </div>

      {/* Grid */}
      {products === undefined ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center text-muted-text font-body">No products found</div>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {filtered.map((product) => (
            <motion.div
              key={product._id}
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
              onClick={() => router.push(`/admin/products/${product._id}`)}
              className="group relative flex flex-col gap-2 p-3 rounded-xl border border-gold/10 bg-bordeaux-deep/10 hover:border-gold/25 transition-all cursor-pointer"
            >
              <div className="aspect-[4/5] rounded-lg bg-gradient-to-b from-bordeaux-deep/40 to-noir flex items-center justify-center relative overflow-hidden">
                {product.images && product.images[0] ? (
                  <ProductGridImage
                    src={product.images[0]}
                    alt={product.name}
                  />
                ) : (
                  <svg viewBox="0 0 60 90" className="w-14 h-20 opacity-50" aria-hidden="true">
                    <rect x="22" y="2" width="16" height="12" rx="3" fill="#C9A961" opacity="0.6" />
                    <path d="M14 23 Q10 32 10 50 L10 78 Q10 86 30 86 Q50 86 50 78 L50 50 Q50 32 46 23 Z" fill="#1A1416" stroke="#C9A961" strokeWidth="1" strokeOpacity="0.35" />
                  </svg>
                )}
                {/* Status badge */}
                <div className={`absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-body ${product.status === "active" ? "bg-green-900/40 text-green-400" : "bg-bordeaux/30 text-dusty-rose"} z-10`}>
                  {product.status}
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-col gap-0.5 flex-1">
                <p className="text-xs text-muted-text font-body">{product.brandName}</p>
                <p className="text-sm font-display text-bone leading-snug">{product.name}</p>
                <p className="text-[11px] text-muted-text font-body">{product.family}</p>
                {product.variants?.[0]?.price && (
                  <p className="text-sm text-gold font-body mt-0.5">{formatKES(product.variants[0].price)}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-1 relative z-10">
                <button
                  onClick={(e) => { e.stopPropagation(); updateProduct({ id: product._id, isBestseller: !product.isBestseller }); }}
                  title="Toggle bestseller"
                  className={`p-1 rounded transition-colors cursor-pointer ${product.isBestseller ? "text-gold" : "text-muted-text hover:text-gold"}`}
                >
                  <Star size={13} fill={product.isBestseller ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); updateProduct({ id: product._id, status: product.status === "active" ? "draft" : "active" }); }}
                  title="Toggle status"
                  className="p-1 rounded text-muted-text hover:text-bone transition-colors cursor-pointer"
                >
                  {product.status === "active" ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
