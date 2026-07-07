"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { formatPrice, generateOrderNumber } from "@/lib/utils";
import {
  ArrowLeft, Search, Plus, Minus, Trash2, User,
  MapPin, Package, ShoppingBag, CheckCircle2, ChevronDown, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type LineItem = {
  variantId: string;
  productId: Id<"products">;
  productName: string;
  size: string;
  concentration: string;
  qty: number;
  price: number;
};

const inputCls =
  "w-full bg-noir/80 border border-gold/15 rounded-xl px-4 py-2.5 text-sm text-bone placeholder:text-muted-text focus:border-purple-400/60 focus:outline-none transition-all";
const selectCls =
  "w-full bg-noir/80 border border-gold/15 rounded-xl px-4 py-2.5 text-sm text-bone focus:border-purple-400/60 focus:outline-none transition-all";

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gold/10 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gold/10 bg-white/[0.02]">
        <Icon size={15} className="text-purple-400" />
        <h2 className="font-display text-sm text-bone tracking-wide">{title}</h2>
      </div>
      <div className="p-6 flex flex-col gap-4">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Product Search & Picker
// ─────────────────────────────────────────────────────────────────────────────

function ProductPicker({ onAdd }: { onAdd: (item: Omit<LineItem, "qty">) => void }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  const allProducts = useQuery(api.products.listAll);
  const allVariants = useQuery(api.variants.listAll);

  const filtered = useMemo(() => {
    if (!allProducts || !query.trim()) return [];
    return allProducts.filter(
      p =>
        p.status === "active" &&
        (p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.brandName.toLowerCase().includes(query.toLowerCase()))
    ).slice(0, 8);
  }, [allProducts, query]);

  const variantsForProduct = useMemo(() => {
    if (!allVariants || !selectedProduct) return [];
    return allVariants.filter(v => v.productId === selectedProduct);
  }, [allVariants, selectedProduct]);

  const handleProductSelect = (product: typeof allProducts extends (infer T)[] | undefined ? T : never) => {
    if (!product || !allVariants) return;
    
    const pId = (product as { _id: string })._id;
    const pName = (product as { name: string }).name;
    const vForP = allVariants.filter(v => v.productId === pId);
    
    if (vForP.length === 1) {
      const variant = vForP[0];
      onAdd({
        variantId: variant._id,
        productId: pId,
        productName: pName,
        size: variant.size,
        concentration: variant.concentration,
        price: variant.price,
      });
      setQuery("");
      setOpen(false);
      return;
    }

    setSelectedProduct(pId);
    setQuery(pName);
    setOpen(false);
    setSelectedVariant(null);
  };

  const handleAdd = (forceVariantId?: string) => {
    const targetVariant = forceVariantId || selectedVariant;
    if (!selectedProduct || !targetVariant || !allProducts || !allVariants) return;
    const product = allProducts.find(p => p._id === selectedProduct);
    const variant = allVariants.find(v => v._id === targetVariant);
    if (!product || !variant) return;
    onAdd({
      variantId: variant._id,
      productId: product._id,
      productName: product.name,
      size: variant.size,
      concentration: variant.concentration,
      price: variant.price,
    });
    setQuery("");
    setSelectedProduct(null);
    setSelectedVariant(null);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none" />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); setSelectedProduct(null); }}
          onFocus={() => setOpen(true)}
          placeholder="Search products by name or brand…"
          className={inputCls + " pl-9"}
        />
        {query && (
          <button type="button" onClick={() => { setQuery(""); setSelectedProduct(null); setOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text hover:text-bone">
            <X size={13} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && filtered.length > 0 && !selectedProduct && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="rounded-xl border border-gold/15 bg-noir/95 backdrop-blur-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto"
          >
            {filtered.map(product => (
              <button
                type="button"
                key={product._id}
                onClick={() => handleProductSelect(product)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-900/20 transition-colors text-left border-b border-gold/5 last:border-0"
              >
                {product.images && product.images.length > 0 ? (
                  <Image src={product.images[0]} alt={product.name} width={32} height={32} className="w-8 h-8 object-cover rounded bg-white/5 flex-shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded bg-white/5 flex-shrink-0 flex items-center justify-center">
                    <Package size={14} className="text-muted-text" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-bone font-body truncate">{product.name}</p>
                  <p className="text-[10px] text-muted-text">{product.brandName} · {product.family}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {selectedProduct && variantsForProduct.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-2">
          <p className="text-[10px] text-muted-text uppercase tracking-widest font-body">Select Size / Variant</p>
          <div className="flex flex-wrap gap-2">
            {variantsForProduct.map(v => (
              <button
                type="button"
                key={v._id}
                onClick={() => handleAdd(v._id)}
                className="px-4 py-2 rounded-lg border border-gold/20 text-muted-text hover:border-gold/40 hover:text-bone hover:bg-gold/5 text-xs font-body transition-all"
              >
                {v.size} {v.concentration} · {formatPrice(v.price)}
                <span className={`ml-2 text-[9px] ${v.stock <= 5 ? "text-red-400" : "text-green-500"}`}>
                  ({v.stock} left)
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {selectedProduct && variantsForProduct.length === 0 && (
        <p className="text-xs text-red-400 font-body">This product has no variants. Add variants in the product editor first.</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function CreateOrderPage() {
  const router = useRouter();
  const createOrder = useMutation(api.orders.create);
  const customers = useQuery(api.customers.list);

  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [customer, setCustomer] = useState({
    name: "", email: "", phone: "",
  });
  const [address, setAddress] = useState({
    line1: "", line2: "", city: "", state: "", zip: "", country: "Kenya",
  });
  const [shipping, setShipping] = useState("0");
  const [giftMessage, setGiftMessage] = useState("");
  const [addAddress, setAddAddress] = useState(false);
  const [customerQuery, setCustomerQuery] = useState("");
  const [showCustomerDrop, setShowCustomerDrop] = useState(false);

  // Filter existing customers for autocomplete
  const filteredCustomers = useMemo(() => {
    if (!customers || !customerQuery.trim()) return [];
    return customers.filter(
      c => c.name.toLowerCase().includes(customerQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(customerQuery.toLowerCase())
    ).slice(0, 5);
  }, [customers, customerQuery]);

  const subtotal = lineItems.reduce((s, i) => s + i.price * i.qty, 0);
  const shippingCost = Number(shipping);
  const total = subtotal + shippingCost;

  const adjustQty = (variantId: string, delta: number) => {
    setLineItems(prev =>
      prev.map(i => i.variantId === variantId
        ? { ...i, qty: Math.max(1, i.qty + delta) }
        : i
      )
    );
  };

  const removeItem = (variantId: string) =>
    setLineItems(prev => prev.filter(i => i.variantId !== variantId));

  const addItem = (item: Omit<LineItem, "qty">) => {
    setLineItems(prev => {
      const existing = prev.find(i => i.variantId === item.variantId);
      if (existing) return prev.map(i => i.variantId === item.variantId ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const autofillCustomer = (c: typeof customers extends (infer T)[] | undefined ? T : never) => {
    if (!c) return;
    setCustomer({ name: (c as { name: string }).name, email: (c as { email: string }).email, phone: (c as { phone?: string }).phone ?? "" });
    setCustomerQuery((c as { name: string }).name);
    setShowCustomerDrop(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lineItems.length === 0) { alert("Add at least one product."); return; }
    if (!customer.name || !customer.email) { alert("Customer name and email are required."); return; }
    setSubmitting(true);
    try {
      await createOrder({
        number: generateOrderNumber(),
        channel: "manual",
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone || undefined,
        shippingAddress: addAddress && address.line1 ? address : undefined,
        lineItems: lineItems.map(i => ({
          variantId: i.variantId,
          productName: i.productName,
          size: i.size,
          concentration: i.concentration,
          qty: i.qty,
          price: i.price,
        })),
        subtotal,
        shipping: shippingCost,
        tax: 0,
        total,
        giftMessage: giftMessage || undefined,
      });
      setSuccess(true);
      setTimeout(() => router.push("/admin/orders"), 1800);
    } catch (err) {
      console.error(err);
      alert("Failed to create order.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-3">
          <CheckCircle2 size={48} className="text-green-400" />
          <h2 className="font-display text-2xl text-bone">Order Created!</h2>
          <p className="text-muted-text font-body text-sm">Redirecting to orders…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => router.back()} className="p-2 rounded-full border border-gold/20 text-muted-text hover:text-bone hover:border-gold/50 transition-colors">
          <ArrowLeft size={15} />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-2xl text-bone">Create Order</h1>
          <p className="text-xs text-muted-text font-body mt-0.5">Manual / draft order · Channel: manual</p>
        </div>
        <button type="button" onClick={() => router.back()} className="px-4 py-2 text-xs text-muted-text hover:text-bone font-body transition-colors">Discard</button>
        <button type="submit" disabled={submitting || lineItems.length === 0} className="flex items-center gap-2 px-5 py-2.5 bg-gold text-noir rounded-full text-xs tracking-widest uppercase font-body hover:bg-gold-soft transition-colors disabled:opacity-50">
          <ShoppingBag size={13} /> {submitting ? "Creating…" : "Create Order"}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Main ── */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Product Picker */}
          <SectionCard title="Add Products" icon={Package}>
            <ProductPicker onAdd={addItem} />

            {lineItems.length > 0 && (
              <div className="flex flex-col gap-2 mt-2">
                <p className="text-[10px] text-muted-text uppercase tracking-widest font-body">Order Line Items</p>
                {lineItems.map(item => (
                  <div key={item.variantId} className="flex items-center gap-3 p-3 rounded-xl bg-purple-950/20 border border-purple-800/30">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-bone font-body font-medium truncate">{item.productName}</p>
                      <p className="text-[10px] text-muted-text">{item.size} · {item.concentration}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => adjustQty(item.variantId, -1)} className="p-1 rounded-md border border-gold/20 text-muted-text hover:text-bone hover:border-gold/40 transition-colors">
                        <Minus size={11} />
                      </button>
                      <span className="text-sm text-bone font-body w-6 text-center">{item.qty}</span>
                      <button type="button" onClick={() => adjustQty(item.variantId, 1)} className="p-1 rounded-md border border-gold/20 text-muted-text hover:text-bone hover:border-gold/40 transition-colors">
                        <Plus size={11} />
                      </button>
                    </div>
                    <span className="text-gold text-sm font-body font-medium w-20 text-right">{formatPrice(item.price * item.qty)}</span>
                    <button type="button" onClick={() => removeItem(item.variantId)} className="p-1 text-muted-text hover:text-red-400 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Customer */}
          <SectionCard title="Customer" icon={User}>
            <div className="relative">
              <Search size={13} className="absolute left-3.5 top-3.5 text-muted-text pointer-events-none" />
              <input
                value={customerQuery}
                onChange={e => { setCustomerQuery(e.target.value); setCustomer(prev => ({ ...prev, name: e.target.value })); setShowCustomerDrop(true); }}
                onFocus={() => setShowCustomerDrop(true)}
                placeholder="Search existing customer or type new name…"
                className={inputCls + " pl-9"}
              />
              <AnimatePresence>
                {showCustomerDrop && filteredCustomers.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute left-0 right-0 top-full mt-1 z-20 rounded-xl border border-gold/15 bg-noir/95 shadow-xl overflow-hidden"
                  >
                    {filteredCustomers.map(c => (
                      <button key={c._id} type="button" onClick={() => autofillCustomer(c)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-purple-900/20 transition-colors text-left border-b border-gold/5 last:border-0">
                        <div>
                          <p className="text-sm text-bone font-body">{c.name}</p>
                          <p className="text-[10px] text-muted-text">{c.email} · {c.totalOrders} orders · {formatPrice(c.totalSpent)} spent</p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-muted-text uppercase tracking-widest font-body">Full Name *</label>
                <input required value={customer.name} onChange={e => setCustomer(p => ({ ...p, name: e.target.value }))} className={inputCls} placeholder="Amani Ochieng" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-muted-text uppercase tracking-widest font-body">Email *</label>
                <input required type="email" value={customer.email} onChange={e => setCustomer(p => ({ ...p, email: e.target.value }))} className={inputCls} placeholder="amani.ochieng@gmail.com" />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-[10px] text-muted-text uppercase tracking-widest font-body">Phone (optional)</label>
                <input value={customer.phone} onChange={e => setCustomer(p => ({ ...p, phone: e.target.value }))} className={inputCls} placeholder="+254 712 345 678" />
              </div>
            </div>
          </SectionCard>

          {/* Shipping Address */}
          <SectionCard title="Shipping Address" icon={MapPin}>
            <button type="button" onClick={() => setAddAddress(!addAddress)}
              className="flex items-center gap-2 text-xs text-purple-300 hover:text-purple-200 font-body transition-colors self-start">
              <ChevronDown size={13} className={`transition-transform ${addAddress ? "rotate-180" : ""}`} />
              {addAddress ? "Remove address" : "Add shipping address"}
            </button>

            <AnimatePresence>
              {addAddress && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="grid sm:grid-cols-2 gap-3 pt-2">
                    <div className="sm:col-span-2 flex flex-col gap-1.5">
                      <label className="text-[10px] text-muted-text uppercase tracking-widest font-body">Street Line 1</label>
                      <input value={address.line1} onChange={e => setAddress(p => ({ ...p, line1: e.target.value }))} className={inputCls} placeholder="123 Kimathi Street" />
                    </div>
                    <div className="sm:col-span-2 flex flex-col gap-1.5">
                      <label className="text-[10px] text-muted-text uppercase tracking-widest font-body">Apartment, suite, etc.</label>
                      <input value={address.line2} onChange={e => setAddress(p => ({ ...p, line2: e.target.value }))} className={inputCls} placeholder="Apt 4B" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-muted-text uppercase tracking-widest font-body">City</label>
                      <input value={address.city} onChange={e => setAddress(p => ({ ...p, city: e.target.value }))} className={inputCls} placeholder="Nairobi" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-muted-text uppercase tracking-widest font-body">State / Region</label>
                      <input value={address.state} onChange={e => setAddress(p => ({ ...p, state: e.target.value }))} className={inputCls} placeholder="Nairobi County" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-muted-text uppercase tracking-widest font-body">Postal Code</label>
                      <input value={address.zip} onChange={e => setAddress(p => ({ ...p, zip: e.target.value }))} className={inputCls} placeholder="00100" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-muted-text uppercase tracking-widest font-body">Country</label>
                      <input value={address.country} onChange={e => setAddress(p => ({ ...p, country: e.target.value }))} className={inputCls} placeholder="Kenya" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </SectionCard>

          {/* Gift Message */}
          <SectionCard title="Notes &amp; Gift Message" icon={ShoppingBag}>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-muted-text uppercase tracking-widest font-body">Gift Message (optional)</label>
              <textarea
                value={giftMessage}
                onChange={e => setGiftMessage(e.target.value)}
                rows={3}
                className={inputCls + " resize-none"}
                placeholder="For the one who has everything…"
              />
            </div>
          </SectionCard>
        </div>

        {/* ── Sidebar: Order Summary ── */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-gold/10 bg-white/[0.02] overflow-hidden sticky top-6">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gold/10 bg-white/[0.02]">
              <ShoppingBag size={15} className="text-gold" />
              <h2 className="font-display text-sm text-bone tracking-wide">Order Summary</h2>
            </div>
            <div className="p-6 flex flex-col gap-4">
              {/* Line items summary */}
              {lineItems.length === 0 ? (
                <p className="text-xs text-muted-text font-body text-center py-4">No products added yet</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {lineItems.map(i => (
                    <div key={i.variantId} className="flex justify-between text-xs font-body py-1 border-b border-gold/5 last:border-0">
                      <div>
                        <p className="text-bone">{i.productName}</p>
                        <p className="text-muted-text">{i.size} · ×{i.qty}</p>
                      </div>
                      <span className="text-gold">{formatPrice(i.price * i.qty)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Shipping & Tax inputs */}
              <div className="border-t border-gold/10 pt-4 flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-muted-text uppercase tracking-widest font-body">Shipping (KES)</label>
                  <input type="number" min="0" value={shipping} onChange={e => setShipping(e.target.value)} className={inputCls + " text-xs py-2"} />
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-gold/10 pt-4 flex flex-col gap-2 text-sm font-body">
                <div className="flex justify-between text-muted-text">
                  <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-text">
                  <span>Shipping</span><span>{formatPrice(shippingCost)}</span>
                </div>
                <div className="flex justify-between text-bone font-medium text-base border-t border-gold/10 pt-2 mt-1">
                  <span className="font-display">Total</span>
                  <span className="text-gold font-display">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || lineItems.length === 0}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gold text-noir rounded-xl text-xs tracking-widest uppercase font-body hover:bg-gold-soft transition-colors disabled:opacity-50 mt-2"
              >
                <ShoppingBag size={14} />
                {submitting ? "Creating Order…" : "Confirm Order"}
              </button>

              <p className="text-[10px] text-muted-text text-center font-body">This will decrement stock and create a customer record automatically.</p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
