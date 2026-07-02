"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Skeleton } from "@/components/ui/Skeleton";
import { TrendingUp, ShoppingBag, Users, Search } from "lucide-react";

function formatKES(amount: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

type Range = "7d" | "30d" | "90d";
const RANGES: { label: string; value: Range }[] = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "90 Days", value: "90d" },
];

function getRange(r: Range) {
  const now = Date.now();
  const day = 86400000;
  const days = r === "7d" ? 7 : r === "30d" ? 30 : 90;
  return { from: now - days * day, to: now };
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>("30d");
  const { from, to } = useMemo(() => getRange(range), [range]);

  const metrics = useQuery(api.orders.metrics, { from, to });
  const searchMisses = useQuery(api.search.getMisses);

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-bone">Analytics</h1>
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-4 py-2 rounded-full text-xs font-body transition-all cursor-pointer ${range === r.value ? "bg-gold text-noir" : "border border-gold/20 text-muted-text hover:text-bone"}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Revenue", value: metrics ? formatKES(metrics.revenue) : undefined, icon: TrendingUp },
          { label: "Orders", value: metrics?.count, icon: ShoppingBag },
          { label: "Avg Order", value: metrics ? formatKES(metrics.avgOrder) : undefined, icon: Users },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex flex-col gap-3 p-6 rounded-2xl border border-gold/10 bg-bordeaux-deep/10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-widest uppercase text-muted-text font-body">{label}</span>
              <Icon size={14} className="text-gold" />
            </div>
            {metrics === undefined ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <span className="font-display text-xl text-bone">{value ?? "0"}</span>
            )}
          </div>
        ))}
      </div>

      {/* Search misses — what visitors searched that returned no results */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Search size={14} className="text-muted-text" />
          <h2 className="font-display text-base text-bone">Zero-Result Searches</h2>
          <span className="text-[10px] text-muted-text font-body ml-auto">Terms visitors searched that found nothing — potential inventory gaps</span>
        </div>
        <div className="rounded-2xl border border-gold/10 overflow-hidden">
          {searchMisses === undefined ? (
            <div className="p-6 flex flex-col gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : searchMisses.length === 0 ? (
            <div className="py-12 text-center text-muted-text font-body">No zero-result searches recorded</div>
          ) : (
            <table className="w-full text-sm font-body">
              <thead className="border-b border-gold/10 bg-bordeaux-deep/10">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] tracking-widest uppercase text-muted-text">Term</th>
                  <th className="px-4 py-3 text-right text-[10px] tracking-widest uppercase text-muted-text">Times Searched</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/5">
                {searchMisses.map((miss) => (
                  <tr key={miss._id} className="hover:bg-bordeaux-deep/10 transition-colors">
                    <td className="px-4 py-3 text-bone font-mono text-xs">{miss.term}</td>
                    <td className="px-4 py-3 text-right text-muted-text">{miss.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
