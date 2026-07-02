"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { formatPrice } from "@/lib/utils";
import {
  ArrowLeft, Save, Plus, Trash2, Star, Eye, EyeOff,
  Package, Edit3, CheckCircle2, X, AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/Skeleton";

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function RatingBar({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`h-1.5 w-5 rounded-full ${i < value ? "bg-gold" : "bg-gold/15"}`} />
      ))}
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-6 rounded-2xl border border-gold/10 bg-white/[0.02] backdrop-blur-sm flex flex-col gap-5">
      <h2 className="font-display text-base text-bone tracking-wide">{title}</h2>
      {children}
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] text-muted-text font-body uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-noir/80 border border-gold/15 rounded-lg px-4 py-2.5 text-sm text-bone focus:border-purple-400/60 focus:outline-none transition-all";
const selectCls = "w-full bg-noir/80 border border-gold/15 rounded-lg px-4 py-2.5 text-sm text-bone focus:border-purple-400/60 focus:outline-none transition-all";

// ────────────────────────────────────────────────────────────────────────────
// Variant Row (inline editing)
// ────────────────────────────────────────────────────────────────────────────

function VariantRow({
  variant,
  onUpdate,
  onRemove,
}: {
  variant: { _id: Id<"variants">; size: string; concentration: string; price: number; sku: string; stock: number };
  onUpdate: (id: Id<"variants">, patch: { price?: number; stock?: number; sku?: string }) => void;
  onRemove: (id: Id<"variants">) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(String(variant.price));
  const [stock, setStock] = useState(String(variant.stock));
  const [sku, setSku] = useState(variant.sku);

  const save = () => {
    onUpdate(variant._id, { price: Number(price), stock: Number(stock), sku });
    setEditing(false);
  };

  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg bg-white/[0.03] border border-gold/10 hover:border-gold/20 transition-all">
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2 items-center flex-wrap">
          <span className="text-bone font-body text-sm font-medium">{variant.size}</span>
          <span className="text-[9px] uppercase tracking-widest text-muted-text bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded-full">{variant.concentration}</span>
          <span className="text-[10px] text-muted-text font-body">SKU: {variant.sku}</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className={`text-xs font-body px-2 py-0.5 rounded-full ${variant.stock <= 5 ? "bg-red-900/30 text-red-400" : "bg-green-900/20 text-green-400"}`}>
            {variant.stock} in stock
          </span>
          <button onClick={() => setEditing(!editing)} className="p-1.5 rounded-md text-muted-text hover:text-bone hover:bg-white/5 transition-colors">
            <Edit3 size={13} />
          </button>
          <button onClick={() => onRemove(variant._id)} className="p-1.5 rounded-md text-muted-text hover:text-red-400 hover:bg-red-900/10 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {!editing && (
        <div className="flex gap-6 text-xs font-body">
          <span className="text-gold font-medium">{formatPrice(variant.price)}</span>
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gold/10">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-muted-text uppercase tracking-widest">Price ($)</label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} className={inputCls + " text-xs py-1.5"} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-muted-text uppercase tracking-widest">Stock</label>
                <input type="number" value={stock} onChange={e => setStock(e.target.value)} className={inputCls + " text-xs py-1.5"} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-muted-text uppercase tracking-widest">SKU</label>
                <input type="text" value={sku} onChange={e => setSku(e.target.value)} className={inputCls + " text-xs py-1.5"} />
              </div>
            </div>
            <div className="flex gap-2 mt-2 justify-end">
              <button onClick={() => setEditing(false)} className="px-3 py-1 text-xs text-muted-text hover:text-bone transition-colors"><X size={12} className="inline mr-1" />Cancel</button>
              <button onClick={save} className="px-3 py-1 text-xs bg-purple-600/80 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center gap-1">
                <CheckCircle2 size={12} />Save
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Add Variant Form
// ────────────────────────────────────────────────────────────────────────────

function AddVariantForm({ productId, onDone }: { productId: Id<"products">; onDone: () => void }) {
  const createVariant = useMutation(api.variants.create);
  const [form, setForm] = useState({ size: "", concentration: "EDP" as "EDP" | "Parfum" | "Extrait" | "EDT", price: "", sku: "", stock: "0" });
  const [loading, setLoading] = useState(false);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submit = async () => {
    if (!form.size || !form.price || !form.sku) return;
    setLoading(true);
    await createVariant({
      productId,
      size: form.size,
      concentration: form.concentration,
      price: Number(form.price),
      sku: form.sku,
      stock: Number(form.stock),
    });
    setForm({ size: "", concentration: "EDP", price: "", sku: "", stock: "0" });
    setLoading(false);
    onDone();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-purple-950/30 border border-purple-700/30 flex flex-col gap-3 mt-2"
    >
      <p className="text-xs text-purple-300 font-body uppercase tracking-widest">New Variant</p>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-[9px] text-muted-text uppercase tracking-widest">Size *</label>
          <input name="size" value={form.size} onChange={handle} placeholder="50ml" className={inputCls + " text-xs py-1.5"} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[9px] text-muted-text uppercase tracking-widest">Concentration</label>
          <select name="concentration" value={form.concentration} onChange={handle} className={selectCls + " text-xs py-1.5"}>
            <option>EDP</option>
            <option>Parfum</option>
            <option>Extrait</option>
            <option>EDT</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[9px] text-muted-text uppercase tracking-widest">Price ($) *</label>
          <input type="number" name="price" value={form.price} onChange={handle} placeholder="250" className={inputCls + " text-xs py-1.5"} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[9px] text-muted-text uppercase tracking-widest">SKU *</label>
          <input name="sku" value={form.sku} onChange={handle} placeholder="BR540-50-EDP" className={inputCls + " text-xs py-1.5"} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[9px] text-muted-text uppercase tracking-widest">Stock</label>
          <input type="number" name="stock" value={form.stock} onChange={handle} className={inputCls + " text-xs py-1.5"} />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onDone} className="px-3 py-1 text-xs text-muted-text hover:text-bone transition-colors">Cancel</button>
        <button onClick={submit} disabled={loading} className="px-4 py-1.5 text-xs bg-gold text-noir rounded-full font-body uppercase tracking-widest hover:bg-gold-soft transition-colors disabled:opacity-50">
          {loading ? "Adding..." : "Add Variant"}
        </button>
      </div>
    </motion.div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────────────────────

export default function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const productId = id as Id<"products">;

  const product = useQuery(api.products.getById, { id: productId });
  const variants = useQuery(api.variants.listByProduct, { productId });
  const brands = useQuery(api.brands.list);

  const updateProduct = useMutation(api.products.update);
  const updateVariant = useMutation(api.variants.update);
  const removeVariant = useMutation(api.variants.remove);
  const deleteProduct = useMutation(api.products.remove);

  const [addingVariant, setAddingVariant] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Local editable state mirrors product fields
  const [form, setForm] = useState<null | {
    name: string; story: string; status: "active" | "draft"; isBestseller: boolean;
    family: string; perfumer: string; year: string; sillage: string; longevity: string; intensity: string;
    notesTop: string; notesHeart: string; notesBase: string; images: string; brandId: string; audience: "her" | "him" | "unisex";
  }>(null);

  // Hydrate form from product on load
  if (product && !form) {
    setForm({
      name: product.name,
      story: product.story,
      status: product.status,
      isBestseller: product.isBestseller,
      family: product.family,
      perfumer: product.perfumer,
      year: String(product.year),
      sillage: String(product.sillage),
      longevity: String(product.longevity),
      intensity: String(product.intensity),
      notesTop: product.notesTop.join(", "),
      notesHeart: product.notesHeart.join(", "),
      notesBase: product.notesBase.join(", "),
      images: product.images.join(", "),
      brandId: product.brandId,
      audience: product.audience,
    });
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => prev ? { ...prev, [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value } : prev);
  };

  const handleSave = async () => {
    if (!form || !product) return;
    setSaving(true);
    try {
      await updateProduct({
        id: productId,
        name: form.name,
        slug: product.slug,
        story: form.story,
        status: form.status,
        isBestseller: form.isBestseller,
        images: form.images.split(",").map(n => n.trim()).filter(Boolean),
        sillage: Number(form.sillage),
        longevity: Number(form.longevity),
        intensity: Number(form.intensity),
      });
      showToast("Product saved successfully!");
    } catch {
      showToast("Error saving product.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    await deleteProduct({ id: productId });
    router.push("/admin/products");
  };

  // Loading state
  if (!product || !form) {
    return (
      <div className="flex flex-col gap-6 max-w-5xl">
        <Skeleton className="h-10 w-48" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Skeleton className="h-60 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
          <div className="flex flex-col gap-4">
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const totalStock = variants?.reduce((s, v) => s + v.stock, 0) ?? 0;

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* Toast */}
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

      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => router.push("/admin/products")} className="p-2 rounded-full border border-gold/20 text-muted-text hover:text-bone hover:border-gold/50 transition-colors">
          <ArrowLeft size={15} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-xl text-bone truncate">{form.name}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full font-body ${form.status === "active" ? "bg-green-900/30 text-green-400" : "bg-gold/10 text-gold"}`}>
              {form.status}
            </span>
            <span className="text-[10px] text-muted-text font-body">{product.brandName} · {product.slug}</span>
          </div>
        </div>
        <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-2 text-xs text-red-400 hover:text-red-300 border border-red-900/40 hover:border-red-700/50 rounded-full font-body transition-all">
          <Trash2 size={12} /> Delete
        </button>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-gold text-noir rounded-full text-xs tracking-widest uppercase font-body hover:bg-gold-soft transition-colors disabled:opacity-60">
          <Save size={13} />{saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Variants", value: variants?.length ?? 0, icon: Package },
          { label: "Total Stock", value: totalStock, icon: Package },
          { label: "Sillage", value: <RatingBar value={product.sillage} />, icon: null },
          { label: "Longevity", value: <RatingBar value={product.longevity} />, icon: null },
        ].map((stat, i) => (
          <div key={i} className="p-4 rounded-xl border border-gold/10 bg-white/[0.02] flex flex-col gap-1.5">
            <span className="text-[9px] uppercase tracking-widest text-muted-text font-body">{stat.label}</span>
            <span className="font-display text-xl text-bone">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Main Column ── */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* General */}
          <SectionCard title="General Information">
            <FieldRow label="Title">
              <input name="name" value={form.name} onChange={handleChange} className={inputCls} />
            </FieldRow>
            <FieldRow label="Story / Description">
              <textarea name="story" value={form.story} onChange={handleChange} rows={6} className={inputCls + " resize-none"} />
            </FieldRow>
          </SectionCard>

          {/* Fragrance Notes */}
          <SectionCard title="Fragrance Notes">
            <div className="grid sm:grid-cols-2 gap-4">
              <FieldRow label="Olfactive Family">
                <input name="family" value={form.family} onChange={handleChange} className={inputCls} />
              </FieldRow>
              <FieldRow label="Perfumer">
                <input name="perfumer" value={form.perfumer} onChange={handleChange} className={inputCls} />
              </FieldRow>
            </div>
            <FieldRow label="Top Notes (comma separated)">
              <input name="notesTop" value={form.notesTop} onChange={handleChange} className={inputCls} />
            </FieldRow>
            <FieldRow label="Heart Notes">
              <input name="notesHeart" value={form.notesHeart} onChange={handleChange} className={inputCls} />
            </FieldRow>
            <FieldRow label="Base Notes">
              <input name="notesBase" value={form.notesBase} onChange={handleChange} className={inputCls} />
            </FieldRow>
          </SectionCard>

          {/* Performance */}
          <SectionCard title="Performance Ratings (1–5)">
            <div className="grid grid-cols-3 gap-4">
              {(["sillage", "longevity", "intensity"] as const).map(key => (
                <FieldRow key={key} label={key.charAt(0).toUpperCase() + key.slice(1)}>
                  <input type="number" min="1" max="5" name={key} value={(form as Record<string, any>)[key]} onChange={handleChange} className={inputCls} />
                  <RatingBar value={Number((form as Record<string, any>)[key])} />
                </FieldRow>
              ))}
            </div>
          </SectionCard>

          {/* Variants */}
          <SectionCard title="Variants &amp; Pricing">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-text font-body">Manage size, concentration, pricing and stock per variant.</p>
              <button
                onClick={() => setAddingVariant(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-700/50 hover:bg-purple-700/80 text-purple-200 text-xs font-body rounded-full transition-all"
              >
                <Plus size={12} /> Add Variant
              </button>
            </div>

            {variants === undefined ? (
              <Skeleton className="h-16 w-full" />
            ) : variants.length === 0 && !addingVariant ? (
              <div className="py-8 flex flex-col items-center gap-2 text-muted-text">
                <AlertTriangle size={20} className="text-gold/40" />
                <p className="text-sm font-body">No variants yet. Add one to make this product purchasable.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {variants.map(v => (
                  <VariantRow
                    key={v._id}
                    variant={v}
                    onUpdate={(id, patch) => updateVariant({ id, ...patch })}
                    onRemove={(id) => removeVariant({ id })}
                  />
                ))}
              </div>
            )}

            <AnimatePresence>
              {addingVariant && (
                <AddVariantForm productId={productId} onDone={() => setAddingVariant(false)} />
              )}
            </AnimatePresence>
          </SectionCard>

          {/* Media */}
          <SectionCard title="Media &amp; Images">
            <FieldRow label="Image URLs (comma separated)">
              <textarea name="images" value={form.images} onChange={handleChange} rows={3} className={inputCls + " resize-none"} />
            </FieldRow>
            {form.images && (
              <div className="flex gap-2 flex-wrap mt-1">
                {form.images.split(",").map(url => url.trim()).filter(Boolean).map((url, i) => (
                  <div key={i} className="w-16 h-20 rounded-lg border border-gold/20 bg-noir/50 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* ── Sidebar ── */}
        <div className="flex flex-col gap-6">
          <SectionCard title="Organization">
            <FieldRow label="Status">
              <select name="status" value={form.status} onChange={handleChange} className={selectCls}>
                <option value="draft">Draft (Hidden)</option>
                <option value="active">Active (Published)</option>
              </select>
            </FieldRow>
            <FieldRow label="Brand">
              <select name="brandId" value={form.brandId} onChange={handleChange} className={selectCls}>
                {brands?.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </FieldRow>
            <FieldRow label="Audience">
              <select name="audience" value={form.audience} onChange={handleChange} className={selectCls}>
                <option value="unisex">Unisex</option>
                <option value="her">For Her</option>
                <option value="him">For Him</option>
              </select>
            </FieldRow>
            <label className="flex items-center gap-3 mt-1 cursor-pointer">
              <input type="checkbox" name="isBestseller" checked={form.isBestseller} onChange={handleChange} className="w-4 h-4 accent-gold" />
              <span className="text-sm text-bone font-body flex items-center gap-1.5"><Star size={13} className="text-gold fill-gold" />Mark as Bestseller</span>
            </label>
            <div className="pt-3 border-t border-gold/10 flex flex-col gap-1">
              <button
                onClick={() => updateProduct({ id: productId, status: form.status === "active" ? "draft" : "active" })}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs font-body text-muted-text hover:text-bone border border-gold/10 hover:border-gold/30 rounded-lg transition-all"
              >
                {form.status === "active" ? <EyeOff size={13} /> : <Eye size={13} />}
                {form.status === "active" ? "Unpublish" : "Publish to Storefront"}
              </button>
            </div>
          </SectionCard>

          {/* Quick variant summary */}
          {variants && variants.length > 0 && (
            <SectionCard title="Pricing Summary">
              {variants.map(v => (
                <div key={v._id} className="flex items-center justify-between text-xs font-body py-1 border-b border-gold/5 last:border-0">
                  <span className="text-muted-text">{v.size} {v.concentration}</span>
                  <span className="text-gold">{formatPrice(v.price)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between text-xs font-body pt-1">
                <span className="text-muted-text">Total Stock</span>
                <span className={`font-medium ${totalStock <= 5 ? "text-red-400" : "text-bone"}`}>{totalStock} units</span>
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}
