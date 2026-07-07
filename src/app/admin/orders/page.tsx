"use client";

import { useState, useMemo, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";
import { api } from "../../../../convex/_generated/api";
import { formatPrice, formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { Search, Plus, X, User, MapPin, Package, ChevronRight, CheckCircle2, Download, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

type Status = "all" | "new" | "dispatched" | "fulfilled" | "refunded" | "cancelled";

const STATUS_OPTIONS: Status[] = ["all", "new", "dispatched", "fulfilled", "refunded", "cancelled"];

function statusColor(status: string) {
  switch (status) {
    case "new": return "bg-gold/10 text-gold";
    case "dispatched": return "bg-blue-600/30 text-blue-300";
    case "fulfilled": return "bg-green-900/30 text-green-400";
    case "refunded": return "bg-blue-900/30 text-blue-400";
    case "cancelled": return "bg-bordeaux/20 text-dusty-rose";
    default: return "bg-muted-text/10 text-muted-text";
  }
}

export default function OrdersPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<Status>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const orders = useQuery(api.orders.list, {
    status: filter === "all" ? undefined : filter,
    limit: 100,
  });
  const updateStatus = useMutation(api.orders.updateStatus);
  const bulkImport = useMutation(api.orders.bulkImport);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleExport = () => {
    if (!orders) return;
    const rows: any[] = [];
    for (const o of orders) {
      if (o.lineItems.length === 0) {
        rows.push({
          number: o.number, channel: o.channel, customerName: o.customerName,
          customerEmail: o.customerEmail, customerPhone: o.customerPhone || "",
          shippingLine1: o.shippingAddress?.line1 || "", shippingLine2: o.shippingAddress?.line2 || "",
          shippingCity: o.shippingAddress?.city || "", shippingState: o.shippingAddress?.state || "",
          shippingZip: o.shippingAddress?.zip || "", shippingCountry: o.shippingAddress?.country || "",
          subtotal: o.subtotal, shipping: o.shipping, tax: o.tax, total: o.total,
          giftMessage: o.giftMessage || "", status: o.status,
          variantId: "", productName: "", size: "", concentration: "", qty: 0, price: 0
        });
      } else {
        for (const item of o.lineItems) {
          rows.push({
            number: o.number, channel: o.channel, customerName: o.customerName,
            customerEmail: o.customerEmail, customerPhone: o.customerPhone || "",
            shippingLine1: o.shippingAddress?.line1 || "", shippingLine2: o.shippingAddress?.line2 || "",
            shippingCity: o.shippingAddress?.city || "", shippingState: o.shippingAddress?.state || "",
            shippingZip: o.shippingAddress?.zip || "", shippingCountry: o.shippingAddress?.country || "",
            subtotal: o.subtotal, shipping: o.shipping, tax: o.tax, total: o.total,
            giftMessage: o.giftMessage || "", status: o.status,
            variantId: item.variantId, productName: item.productName, size: item.size, 
            concentration: item.concentration, qty: item.qty, price: item.price
          });
        }
      }
    }
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data.map((r: any) => ({
            number: r.number || "",
            channel: ["web", "manual"].includes(r.channel) ? r.channel : "web",
            customerName: r.customerName || "",
            customerEmail: r.customerEmail || "",
            customerPhone: r.customerPhone || "",
            shippingLine1: r.shippingLine1 || "",
            shippingLine2: r.shippingLine2 || "",
            shippingCity: r.shippingCity || "",
            shippingState: r.shippingState || "",
            shippingZip: r.shippingZip || "",
            shippingCountry: r.shippingCountry || "",
            subtotal: Number(r.subtotal) || 0,
            shipping: Number(r.shipping) || 0,
            tax: Number(r.tax) || 0,
            total: Number(r.total) || 0,
            giftMessage: r.giftMessage || "",
            status: ["new", "dispatched", "fulfilled", "refunded", "cancelled"].includes(r.status) ? r.status : "new",
            variantId: r.variantId || "",
            productName: r.productName || "",
            size: r.size || "",
            concentration: r.concentration || "",
            qty: Number(r.qty) || 0,
            price: Number(r.price) || 0,
          }));
          await bulkImport({ rows });
          showToast(`Imported ${rows.length} line items successfully!`);
        } catch (error) {
          console.error(error);
          showToast("Failed to import. Check console and CSV format.");
        } finally {
          setImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      },
    });
  };

  const filtered = orders?.filter(
    (o) =>
      o.number.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const selectedOrder = orders?.find((o) => o._id === selected);

  return (
    <div className="flex flex-col gap-6 max-w-7xl">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="fixed top-6 right-6 z-50 px-5 py-3 bg-purple-700/90 backdrop-blur-sm text-white text-sm font-body rounded-xl shadow-xl border border-purple-500/50"
          >
            <CheckCircle2 size={14} className="inline mr-2" />{toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-bone">Orders</h1>
        <div className="flex items-center gap-2">
          <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImport} className="hidden" />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-muted-text border border-gold/20 hover:border-gold/40 hover:text-bone rounded-full font-body transition-colors disabled:opacity-50"
          >
            <Upload size={13} /> {importing ? "Importing..." : "Import"}
          </button>
          <button 
            onClick={handleExport}
            disabled={!orders}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-muted-text border border-gold/20 hover:border-gold/40 hover:text-bone rounded-full font-body transition-colors disabled:opacity-50"
          >
            <Download size={13} /> Export
          </button>
          <button
            onClick={() => router.push("/admin/orders/new")}
            className="flex items-center gap-2 px-4 py-2.5 bg-gold text-noir rounded-full text-xs tracking-widest uppercase font-body hover:bg-gold-soft transition-colors cursor-pointer"
          >
            <Plus size={13} />
            Create Order
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-body capitalize transition-all cursor-pointer ${
                filter === s ? "bg-gold text-noir" : "border border-gold/20 text-muted-text hover:text-bone"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="relative ml-auto flex items-center">
          <Search size={13} className="absolute left-3 text-muted-text pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders…"
            className="pl-8 pr-4 py-2 text-xs bg-bordeaux-deep/10 border border-gold/15 rounded-lg text-bone font-body placeholder:text-muted-text focus:border-gold/40 focus:outline-none w-64 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gold/10 overflow-hidden">
        {orders === undefined ? (
          <div className="p-6 flex flex-col gap-3">
            {[0,1,2,3,4].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead className="border-b border-gold/10 bg-bordeaux-deep/10">
                <tr>
                  {["Order #", "Date", "Customer", "Items", "Total", "Channel", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] tracking-widest uppercase text-muted-text whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/5">
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-text">No orders found</td></tr>
                ) : filtered.map((order) => (
                  <tr
                    key={order._id}
                    className={`hover:bg-bordeaux-deep/10 transition-colors cursor-pointer ${selected === order._id ? "bg-purple-900/10" : ""}`}
                    onClick={() => setSelected(order._id === selected ? null : order._id)}
                  >
                    <td className="px-4 py-3 text-gold font-mono text-xs">{order.number}</td>
                    <td className="px-4 py-3 text-bone/60 text-xs whitespace-nowrap">{formatDate(order._creationTime)}</td>
                    <td className="px-4 py-3">
                      <p className="text-bone truncate max-w-[140px]">{order.customerName}</p>
                      <p className="text-muted-text text-xs truncate max-w-[140px]">{order.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-bone/70">{order.lineItems.length}</td>
                    <td className="px-4 py-3 text-bone font-medium">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[9px] tracking-wider uppercase px-2 py-0.5 rounded-full ${order.channel === "manual" ? "bg-violet-900/30 text-violet-400" : "bg-bordeaux-deep/30 text-muted-text"}`}>
                        {order.channel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide ${statusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ChevronRight size={14} className={`transition-transform text-muted-text ${selected === order._id ? "rotate-90 text-gold" : ""}`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Slide-down Panel */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            key={selectedOrder._id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-purple-700/30 bg-purple-950/20 backdrop-blur-sm overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-purple-700/20 bg-purple-950/20">
              <div className="flex items-center gap-3">
                <span className="font-display text-lg text-bone">Order {selectedOrder.number}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${statusColor(selectedOrder.status)}`}>{selectedOrder.status}</span>
                {selectedOrder.channel === "manual" && (
                  <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-violet-900/30 text-violet-400">Manual</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-text font-body">{formatDate(selectedOrder._creationTime)}</span>
                <button onClick={() => setSelected(null)} className="p-1.5 rounded-full text-muted-text hover:text-bone hover:bg-white/5 transition-colors ml-2"><X size={15} /></button>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-purple-700/20">
              {/* Customer */}
              <div className="p-6 flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-1"><User size={13} className="text-purple-400" /><span className="text-[10px] uppercase tracking-widest text-muted-text font-body">Customer</span></div>
                <p className="text-bone font-body font-medium">{selectedOrder.customerName}</p>
                <p className="text-muted-text text-xs">{selectedOrder.customerEmail}</p>
                {selectedOrder.customerPhone && <p className="text-muted-text text-xs">{selectedOrder.customerPhone}</p>}
                {selectedOrder.shippingAddress && (
                  <div className="mt-2 pt-2 border-t border-purple-700/20">
                    <div className="flex items-center gap-2 mb-1"><MapPin size={13} className="text-purple-400" /><span className="text-[10px] uppercase tracking-widest text-muted-text font-body">Shipping</span></div>
                    <p className="text-bone text-xs">{selectedOrder.shippingAddress.line1}</p>
                    {selectedOrder.shippingAddress.line2 && <p className="text-muted-text text-xs">{selectedOrder.shippingAddress.line2}</p>}
                    <p className="text-muted-text text-xs">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip}</p>
                    <p className="text-muted-text text-xs">{selectedOrder.shippingAddress.country}</p>
                  </div>
                )}
                {selectedOrder.giftMessage && (
                  <div className="mt-2 pt-2 border-t border-purple-700/20">
                    <p className="text-[10px] uppercase tracking-widest text-muted-text font-body mb-1">Gift Message</p>
                    <p className="text-bone/70 text-xs italic">&ldquo;{selectedOrder.giftMessage}&rdquo;</p>
                  </div>
                )}
              </div>

              {/* Line Items */}
              <div className="p-6 flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-1"><Package size={13} className="text-purple-400" /><span className="text-[10px] uppercase tracking-widest text-muted-text font-body">Line Items</span></div>
                <div className="flex flex-col gap-2">
                  {selectedOrder.lineItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 py-2 border-b border-purple-700/10 last:border-0">
                      <div className="flex-1">
                        <p className="text-sm text-bone font-body">{item.productName}</p>
                        <p className="text-[10px] text-muted-text">{item.size} · {item.concentration}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gold text-xs">{formatPrice(item.price * item.qty)}</p>
                        <p className="text-muted-text text-[10px]">×{item.qty} @ {formatPrice(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-purple-700/20 flex flex-col gap-1 text-xs font-body">
                  <div className="flex justify-between text-muted-text"><span>Subtotal</span><span>{formatPrice(selectedOrder.subtotal)}</span></div>
                  <div className="flex justify-between text-muted-text"><span>Shipping</span><span>{formatPrice(selectedOrder.shipping)}</span></div>
                  <div className="flex justify-between text-muted-text"><span>Tax</span><span>{formatPrice(selectedOrder.tax)}</span></div>
                  <div className="flex justify-between text-bone font-medium text-sm pt-1 border-t border-purple-700/20 mt-1">
                    <span className="font-display">Total</span><span className="text-gold">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="p-6 flex flex-col gap-4">
                <p className="text-[10px] uppercase tracking-widest text-muted-text font-body">Update Status</p>
                <div className="flex flex-col gap-2">
                  {(["new", "dispatched", "fulfilled", "refunded", "cancelled"] as const).map((s) => {
                    const isActive = selectedOrder.status === s;
                    const dotColor = s === "new" ? "bg-gold" : s === "dispatched" ? "bg-blue-300" : s === "fulfilled" ? "bg-green-400" : s === "refunded" ? "bg-blue-400" : "bg-red-400";
                    const btnCls = isActive
                      ? "border-purple-500 bg-purple-900/40 text-purple-200"
                      : "border-gold/15 text-muted-text hover:border-gold/30 hover:text-bone";
                    return (
                      <button key={s} onClick={() => updateStatus({ id: selectedOrder._id, status: s })}
                        className={`flex items-center gap-2.5 text-xs px-4 py-2.5 rounded-xl border transition-all cursor-pointer capitalize font-body ${btnCls}`}
                      >
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
                        {s}
                        {isActive && <span className="ml-auto text-[9px] text-purple-400">Current</span>}
                      </button>
                    );
                  })}
                </div>
                <div className="pt-4 border-t border-purple-700/20">
                  <p className="text-[10px] uppercase tracking-widest text-muted-text font-body mb-2">Order ID</p>
                  <p className="text-[10px] text-muted-text font-mono break-all">{selectedOrder._id}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
