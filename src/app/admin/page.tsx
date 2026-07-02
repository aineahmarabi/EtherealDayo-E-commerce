"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { api } from "../../../convex/_generated/api";
import { Skeleton } from "@/components/ui/Skeleton";
import { TrendingUp, ShoppingBag, Users, AlertTriangle, Plus } from "lucide-react";
import Link from "next/link";

function formatKES(amount: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getGreeting(hour: number): { text: string } {
  if (hour >= 5 && hour < 12) return { text: "Good Morning" };
  if (hour >= 12 && hour < 17) return { text: "Good Afternoon" };
  if (hour >= 17 && hour < 21) return { text: "Good Evening" };
  return { text: "Good Night" };
}

type DateRange = "today" | "yesterday" | "7d" | "30d";

const DATE_CHIPS: { label: string; value: DateRange }[] = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
];

function getRange(range: DateRange): { from: number; to: number } {
  const now = Date.now();
  const day = 86400000;
  switch (range) {
    case "today": return { from: new Date().setHours(0, 0, 0, 0), to: now };
    case "yesterday": return { from: new Date().setHours(0, 0, 0, 0) - day, to: new Date().setHours(0, 0, 0, 0) };
    case "7d": return { from: now - 7 * day, to: now };
    case "30d": return { from: now - 30 * day, to: now };
  }
}

function StatItem({
  label, value, loading, accent = "gold", data = []
}: {
  label: string; value?: string | number; loading?: boolean;
  accent?: string; data?: number[]
}) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const path = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((val - min) / range) * 80 - 10;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const strokeClass = accent === "gold" ? "stroke-gold" : "stroke-dusty-rose";

  return (
    <div className="flex flex-col gap-2 flex-1 px-4 py-2 border-r border-gold/10 last:border-r-0">
      <div className="inline-block border-b border-dashed border-gold/30 pb-0.5 max-w-max">
        <span className="text-[13px] font-medium text-bone font-body">{label}</span>
      </div>
      <div className="flex items-end gap-3 h-7">
        {loading ? (
          <Skeleton className="h-6 w-16" />
        ) : (
          <div className="flex items-end gap-2 text-[15px] text-bone font-body font-medium">
            {value ?? "—"} <span className="text-muted-text font-normal">—</span>
          </div>
        )}
        
        {/* Sparkline Graph Inline */}
        {!loading && data.length > 0 && (
          <div className="w-16 h-6 ml-auto flex-shrink-0">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
              <path
                d={path}
                fill="none"
                className={strokeClass}
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>("today");
  const range = useMemo(() => getRange(dateRange), [dateRange]);

  // Live clock
  const [now, setNow] = useState(() => new Date());
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const greeting = getGreeting(now.getHours());

  const metrics = useQuery(api.orders.metrics, { from: range.from, to: range.to });
  const recentOrders = useQuery(api.orders.list, { limit: 8 });
  const recentInquiries = useQuery(api.inquiries.list, { unreadOnly: false });

  // Low-stock: variants with stock ≤ 5
  const allVariants = useQuery(api.variants.listAll);
  const lowStock = allVariants?.filter((v) => v.stock <= 5) ?? [];

  return (
    <div className="flex flex-col gap-10 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl text-bone">{greeting.text}</h1>
          </div>
          <p className="text-sm text-muted-text font-body">
            {now.toLocaleDateString("en-KE", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
          {mounted ? (
            <p className="text-xs text-purple-400/80 font-body tracking-widest tabular-nums">
              {now.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}
            </p>
          ) : (
            <Skeleton className="h-4 w-24 bg-white/5 mt-1" />
          )}
        </div>
        <Link
          href="/admin/orders/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-gold text-noir rounded-full text-xs tracking-widest uppercase font-body hover:bg-gold-soft transition-colors"
        >
          <Plus size={13} />
          Create Order
        </Link>
      </div>

      {/* Date chips */}
      <div className="flex gap-2 flex-wrap">
        {DATE_CHIPS.map((chip) => (
          <button
            key={chip.value}
            onClick={() => setDateRange(chip.value)}
            className={`px-4 py-2 rounded-full text-xs font-body transition-all cursor-pointer ${
              dateRange === chip.value
                ? "bg-gold text-noir"
                : "border border-gold/20 text-muted-text hover:text-bone hover:border-gold/40"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Stats Inline Container */}
      <div className="flex bg-white/[0.02] border border-gold/10 rounded-xl shadow-sm p-3 w-full overflow-x-auto">
        <div className="flex min-w-[700px] w-full">
          <StatItem
            label="Revenue"
            value={metrics ? formatKES(metrics.revenue) : undefined}
            loading={metrics === undefined}
            data={metrics?.chartData?.revenue ?? []}
          />
          <StatItem
            label="Total Sales"
            value={metrics ? metrics.totalItems : undefined}
            loading={metrics === undefined}
            data={metrics?.chartData?.totalItems ?? []}
          />
          <StatItem
            label="Orders"
            value={metrics?.count}
            loading={metrics === undefined}
            data={metrics?.chartData?.count ?? []}
          />
          <StatItem
            label="Low Stock"
            value={allVariants === undefined ? undefined : lowStock.length}
            loading={allVariants === undefined}
            accent="dusty-rose"
            data={[]}
          />
        </div>
      </div>

      {/* Recent orders + inquiries */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Orders */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base text-bone">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-gold hover:text-gold-soft font-body transition-colors">View all →</Link>
          </div>
          <div className="rounded-2xl border border-gold/10 overflow-hidden">
            {recentOrders === undefined ? (
              <div className="p-6 flex flex-col gap-3">
                {[0, 1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="p-8 text-center text-muted-text font-body text-sm">No orders yet</div>
            ) : (
              <table className="w-full text-sm font-body">
                <thead className="border-b border-gold/10 bg-bordeaux-deep/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-[10px] tracking-widest uppercase text-muted-text">Order</th>
                    <th className="px-4 py-3 text-left text-[10px] tracking-widest uppercase text-muted-text">Customer</th>
                    <th className="px-4 py-3 text-right text-[10px] tracking-widest uppercase text-muted-text">Total</th>
                    <th className="px-4 py-3 text-right text-[10px] tracking-widest uppercase text-muted-text">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/5">
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-bordeaux-deep/10 transition-colors">
                      <td className="px-4 py-3 text-gold">{order.number}</td>
                      <td className="px-4 py-3 text-bone/70 truncate max-w-[120px]">{order.customerName}</td>
                      <td className="px-4 py-3 text-right text-bone">{formatKES(order.total)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
                          order.status === "new" ? "bg-gold/10 text-gold" :
                          order.status === "fulfilled" ? "bg-green-900/30 text-green-400" :
                          "bg-bordeaux/20 text-dusty-rose"
                        }`}>
                          {order.channel === "manual" && "M · "}{order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Inquiries */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base text-bone">Recent Inquiries</h2>
            <Link href="/admin/inquiries" className="text-xs text-gold hover:text-gold-soft font-body transition-colors">View all →</Link>
          </div>
          <div className="rounded-2xl border border-gold/10 overflow-hidden">
            {recentInquiries === undefined ? (
              <div className="p-6 flex flex-col gap-3">
                {[0, 1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : recentInquiries.length === 0 ? (
              <div className="p-8 text-center text-muted-text font-body text-sm">No inquiries yet</div>
            ) : (
              <ul className="divide-y divide-gold/5">
                {recentInquiries.slice(0, 5).map((inq) => (
                  <li key={inq._id} className="px-4 py-3 flex items-start gap-3">
                    {!inq.read && <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 flex-shrink-0" />}
                    <div className={`flex-1 min-w-0 ${inq.read ? "pl-3.5" : ""}`}>
                      <p className="text-sm text-bone font-body truncate">{inq.name}</p>
                      <p className="text-xs text-muted-text font-body truncate">{inq.message.substring(0, 60)}…</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Low stock notice */}
      {lowStock.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-5 rounded-xl border border-dusty-rose/30 bg-bordeaux/10"
        >
          <AlertTriangle size={16} className="text-dusty-rose mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-bone font-body">
              <strong>{lowStock.length} variant{lowStock.length > 1 ? "s" : ""}</strong> at or below low-stock threshold.
              <span className="text-muted-text ml-1 text-xs">Storefront is unaffected — products continue to display and sell regardless of stock.</span>
            </p>
            <Link href="/admin/inventory" className="text-xs text-gold hover:text-gold-soft font-body mt-1 inline-block underline underline-offset-2">
              View inventory →
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
