"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Skeleton } from "@/components/ui/Skeleton";
import { AlertTriangle, Plus, Minus } from "lucide-react";

export default function InventoryPage() {
  const variants = useQuery(api.variants.listAll);
  const products = useQuery(api.products.listAll);
  const adjustStock = useMutation(api.variants.adjustStock);

  const productMap = Object.fromEntries((products ?? []).map((p) => [p._id, p]));

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl text-bone">Inventory</h1>
        <p className="text-sm text-muted-text font-body mt-1">Owner-only stock ledger. Storefront always shows products regardless of stock level.</p>
      </div>

      {/* Reminder banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-gold/20 bg-bordeaux-deep/10">
        <AlertTriangle size={14} className="text-gold mt-0.5 flex-shrink-0" />
        <p className="text-xs text-bone/70 font-body">
          <strong className="text-bone">Stock is for your records only.</strong> Products are always purchasable on the storefront, even at 0 or negative stock. Adjust counts after manual sales, returns, or restocks.
        </p>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gold/10 overflow-hidden">
        {variants === undefined ? (
          <div className="p-6 flex flex-col gap-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead className="border-b border-gold/10 bg-bordeaux-deep/10">
                <tr>
                  {["Product", "Brand", "Size", "Conc.", "SKU", "Stock", "Adjust"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] tracking-widest uppercase text-muted-text whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/5">
              {variants.map((variant) => {
                const product = productMap[variant.productId];
                const isLow = variant.stock <= 5;
                return (
                  <tr key={variant._id} className="hover:bg-bordeaux-deep/10 transition-colors">
                    <td className="px-4 py-3 text-bone">{product?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-text text-xs">{product?.brandName ?? "—"}</td>
                    <td className="px-4 py-3 text-bone/80">{variant.size}</td>
                    <td className="px-4 py-3 text-bone/80">{variant.concentration}</td>
                    <td className="px-4 py-3 text-muted-text text-xs font-mono">{variant.sku}</td>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-sm ${isLow ? "text-dusty-rose" : "text-bone"}`}>
                        {variant.stock}
                        {variant.stock <= 0 && <span className="ml-1 text-[10px] text-muted-text">(still sells)</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => adjustStock({ id: variant._id, delta: -1 })}
                          className="w-6 h-6 rounded border border-gold/20 flex items-center justify-center text-bone/60 hover:text-bone hover:border-gold/40 transition-colors cursor-pointer"
                        >
                          <Minus size={10} />
                        </button>
                        <button
                          onClick={() => adjustStock({ id: variant._id, delta: 1 })}
                          className="w-6 h-6 rounded border border-gold/20 flex items-center justify-center text-bone/60 hover:text-bone hover:border-gold/40 transition-colors cursor-pointer"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
