"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Skeleton } from "@/components/ui/Skeleton";
import { FileText, Save, Truck, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

const inputCls = "w-full px-3 py-2.5 text-sm bg-noir border border-gold/15 rounded-lg text-bone font-body placeholder:text-muted-text focus:border-gold/40 focus:outline-none transition-colors";

const CONTENT_KEYS = [
  { key: "hero_tagline", label: "Hero Tagline", placeholder: "Where do you begin?", multiline: false },
  { key: "hero_subtitle", label: "Hero Subtitle", placeholder: "Discover rare, niche fragrances curated for the discerning.", multiline: false },
  { key: "about_story", label: "Brand Story", placeholder: "Write the Ethereal Dayo origin story…", multiline: true },
  { key: "shipping_policy", label: "Shipping Policy", placeholder: "All orders ship within 2–3 business days…", multiline: true },
  { key: "returns_policy", label: "Returns Policy", placeholder: "We accept returns within 14 days…", multiline: true },
];

export default function ContentPage() {
  const settings = useQuery(api.settings.get);
  const upsert = useMutation(api.settings.upsert);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const shippingRates = useQuery(api.shipping.list);
  const createRate = useMutation(api.shipping.create);
  const updateRate = useMutation(api.shipping.update);
  const removeRate = useMutation(api.shipping.remove);

  const [showAddRate, setShowAddRate] = useState(false);
  const [newRate, setNewRate] = useState({ name: "", price: "" });

  function getValue(key: string) {
    return key in values ? values[key] : (settings?.[key] ?? "");
  }

  async function handleSave(key: string) {
    await upsert({ key, value: values[key] ?? settings?.[key] ?? "" });
    setSaved((s) => ({ ...s, [key]: true }));
    setTimeout(() => setSaved((s) => ({ ...s, [key]: false })), 2000);
  }

  async function handleAddRate(e: React.FormEvent) {
    e.preventDefault();
    await createRate({
      name: newRate.name.trim(),
      price: parseFloat(newRate.price) || 0,
      isActive: true,
    });
    setNewRate({ name: "", price: "" });
    setShowAddRate(false);
  }

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="flex items-center gap-2">
        <FileText size={14} className="text-muted-text" />
        <h1 className="font-display text-2xl text-bone">Content</h1>
      </div>

      {/* Shipping Zones */}
      <div className="flex flex-col gap-4 p-6 rounded-2xl border border-gold/10 bg-white/[0.02] shadow-sm">
        <div className="flex items-center gap-2">
          <Truck size={14} className="text-gold" />
          <h2 className="font-display text-base text-bone">Shipping Zones & Rates</h2>
          <button
            onClick={() => setShowAddRate(!showAddRate)}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-[11px] tracking-widest uppercase font-body bg-gold text-noir rounded-lg hover:bg-gold-soft transition-colors cursor-pointer"
          >
            <Plus size={11} /> Add Zone
          </button>
        </div>
        <p className="text-xs text-muted-text font-body">
          These shipping options appear at checkout. Pick Up is always free. Set prices in KES.
        </p>

        {/* Pick Up — always free, locked */}
        <div className="flex items-center gap-3 py-3 px-4 rounded-xl border border-gold/10 bg-green-900/10">
          <div className="flex-1">
            <p className="text-sm font-body text-bone">Pick Up</p>
            <p className="text-xs text-muted-text font-body mt-0.5">Customer collects in person — always free</p>
          </div>
          <span className="text-sm text-green-400 font-body font-medium">KES 0 — Free</span>
        </div>

        {showAddRate && (
          <form onSubmit={handleAddRate} className="flex gap-3 items-end p-4 rounded-xl border border-gold/15 bg-noir/40">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[10px] uppercase tracking-wider text-muted-text font-body">Zone / Method Name *</label>
              <input required value={newRate.name} onChange={e => setNewRate(r => ({ ...r, name: e.target.value }))} className={inputCls} placeholder="e.g. Nairobi CBD Delivery" />
            </div>
            <div className="flex flex-col gap-1 w-32">
              <label className="text-[10px] uppercase tracking-wider text-muted-text font-body">Price (KES) *</label>
              <input required type="number" value={newRate.price} onChange={e => setNewRate(r => ({ ...r, price: e.target.value }))} className={inputCls} placeholder="500" />
            </div>
            <button type="submit" className="px-4 py-2.5 bg-gold text-noir rounded-lg text-xs uppercase tracking-wider font-medium hover:bg-gold-soft transition-colors cursor-pointer whitespace-nowrap">Add</button>
            <button type="button" onClick={() => setShowAddRate(false)} className="px-4 py-2.5 text-xs text-muted-text hover:text-bone transition-colors cursor-pointer font-body">Cancel</button>
          </form>
        )}

        {shippingRates === undefined ? (
          <Skeleton className="h-20 w-full" />
        ) : shippingRates.length === 0 ? (
          <p className="text-sm text-muted-text font-body py-2 text-center">No custom shipping zones yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-gold/5">
            {shippingRates.map((rate) => (
              <div key={rate._id} className="flex items-center gap-3 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-bone font-body">{rate.name}</p>
                  <p className="text-xs text-muted-text font-body mt-0.5">KES {rate.price.toLocaleString()}</p>
                </div>
                <button onClick={() => updateRate({ id: rate._id, isActive: !rate.isActive })} className="text-muted-text hover:text-gold transition-colors cursor-pointer p-1">
                  {rate.isActive ? <ToggleRight size={18} className="text-green-400" /> : <ToggleLeft size={18} />}
                </button>
                <button onClick={() => removeRate({ id: rate._id })} className="text-muted-text hover:text-dusty-rose transition-colors cursor-pointer p-1">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CMS Content Fields */}
      <div className="flex flex-col gap-5">
        {CONTENT_KEYS.map(({ key, label, placeholder, multiline }) => (
          <div key={key} className="flex flex-col gap-2 p-5 rounded-2xl border border-gold/10 bg-white/[0.02] shadow-sm">
            <label className="text-[10px] tracking-widest uppercase text-muted-text font-body">{label}</label>
            {settings === undefined ? (
              <Skeleton className="h-10 w-full" />
            ) : multiline ? (
              <textarea
                value={getValue(key)}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                rows={4}
                placeholder={placeholder}
                className={inputCls + " resize-none"}
              />
            ) : (
              <input
                value={getValue(key)}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                placeholder={placeholder}
                className={inputCls}
              />
            )}
            <div className="flex justify-end">
              <button
                onClick={() => handleSave(key)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gold text-noir rounded-lg text-xs tracking-widest uppercase font-body hover:bg-gold-soft transition-colors cursor-pointer font-medium"
              >
                <Save size={11} />
                {saved[key] ? "Saved!" : "Save"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
