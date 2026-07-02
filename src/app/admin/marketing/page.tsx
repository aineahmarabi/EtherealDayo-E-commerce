"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Skeleton } from "@/components/ui/Skeleton";
import { Megaphone, Tag, Gift, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

const inputCls = "w-full px-3 py-2.5 text-sm bg-noir border border-gold/15 rounded-lg text-bone font-body placeholder:text-muted-text focus:border-gold/40 focus:outline-none transition-colors";
const selectCls = "px-3 py-2.5 text-sm bg-noir border border-gold/15 rounded-lg text-bone font-body focus:border-gold/40 focus:outline-none transition-colors";

export default function MarketingPage() {
  const settings = useQuery(api.settings.get);
  const discounts = useQuery(api.discountCodes.list);
  const updateSettings = useMutation(api.settings.upsert);
  const createDiscount = useMutation(api.discountCodes.create);
  const toggleDiscount = useMutation(api.discountCodes.toggle);
  const removeDiscount = useMutation(api.discountCodes.remove);

  const [banner, setBanner] = useState("");
  const [bannerSaved, setBannerSaved] = useState(false);

  const [showAddDiscount, setShowAddDiscount] = useState(false);
  const [discountForm, setDiscountForm] = useState({
    code: "", type: "percent" as "percent" | "fixed",
    value: "", minOrder: "", maxUses: "", isActive: true,
  });

  async function handleSaveBanner(e: React.FormEvent) {
    e.preventDefault();
    await updateSettings({ key: "site_banner", value: banner });
    setBannerSaved(true);
    setTimeout(() => setBannerSaved(false), 2000);
  }

  async function handleCreateDiscount(e: React.FormEvent) {
    e.preventDefault();
    await createDiscount({
      code: discountForm.code.toUpperCase().trim(),
      type: discountForm.type,
      value: parseFloat(discountForm.value) || 0,
      minOrder: discountForm.minOrder ? parseFloat(discountForm.minOrder) : undefined,
      maxUses: discountForm.maxUses ? parseInt(discountForm.maxUses) : undefined,
      isActive: discountForm.isActive,
    });
    setDiscountForm({ code: "", type: "percent", value: "", minOrder: "", maxUses: "", isActive: true });
    setShowAddDiscount(false);
  }

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <h1 className="font-display text-2xl text-bone">Marketing</h1>

      {/* Announcement Banner */}
      <div className="flex flex-col gap-4 p-6 rounded-2xl border border-gold/10 bg-white/[0.02] shadow-sm">
        <div className="flex items-center gap-2">
          <Megaphone size={14} className="text-gold" />
          <h2 className="font-display text-base text-bone">Announcement Banner</h2>
        </div>
        <p className="text-xs text-muted-text font-body">Shown as a slim banner below the navbar on all storefront pages. Leave empty to hide.</p>
        {settings === undefined ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <form onSubmit={handleSaveBanner} className="flex gap-3">
            <input
              defaultValue={settings?.site_banner ?? ""}
              onChange={(e) => setBanner(e.target.value)}
              placeholder="e.g. Free shipping on orders over KES 5,000"
              className={inputCls + " flex-1"}
            />
            <button type="submit" className="px-5 py-2.5 bg-gold text-noir rounded-lg text-xs tracking-widest uppercase font-body hover:bg-gold-soft transition-colors cursor-pointer whitespace-nowrap font-medium">
              {bannerSaved ? "Saved!" : "Save"}
            </button>
          </form>
        )}
      </div>

      {/* Discount Codes */}
      <div className="flex flex-col gap-4 p-6 rounded-2xl border border-gold/10 bg-white/[0.02] shadow-sm">
        <div className="flex items-center gap-2">
          <Tag size={14} className="text-gold" />
          <h2 className="font-display text-base text-bone">Discount Codes</h2>
          <button
            onClick={() => setShowAddDiscount(!showAddDiscount)}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-[11px] tracking-widest uppercase font-body bg-gold text-noir rounded-lg hover:bg-gold-soft transition-colors cursor-pointer"
          >
            <Plus size={11} /> Add Code
          </button>
        </div>
        <p className="text-xs text-muted-text font-body">Create and manage promo codes to apply at checkout.</p>

        {showAddDiscount && (
          <form onSubmit={handleCreateDiscount} className="flex flex-col gap-3 p-4 rounded-xl border border-gold/15 bg-noir/40">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-text font-body">Code *</label>
                <input required value={discountForm.code} onChange={e => setDiscountForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className={inputCls} placeholder="SUMMER20" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-text font-body">Type *</label>
                <select value={discountForm.type} onChange={e => setDiscountForm(f => ({ ...f, type: e.target.value as "percent" | "fixed" }))} className={selectCls + " w-full"}>
                  <option value="percent">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (KES)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-text font-body">{discountForm.type === "percent" ? "% Off" : "KES Off"} *</label>
                <input required type="number" value={discountForm.value} onChange={e => setDiscountForm(f => ({ ...f, value: e.target.value }))} className={inputCls} placeholder={discountForm.type === "percent" ? "20" : "500"} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-text font-body">Min Order (KES)</label>
                <input type="number" value={discountForm.minOrder} onChange={e => setDiscountForm(f => ({ ...f, minOrder: e.target.value }))} className={inputCls} placeholder="Optional" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-text font-body">Max Uses</label>
                <input type="number" value={discountForm.maxUses} onChange={e => setDiscountForm(f => ({ ...f, maxUses: e.target.value }))} className={inputCls} placeholder="Unlimited" />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={discountForm.isActive} onChange={e => setDiscountForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-gold" />
                  <span className="text-[13px] text-bone font-body">Active immediately</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2 mt-1">
              <button type="submit" className="px-4 py-2 bg-gold text-noir rounded-lg text-xs uppercase tracking-wider font-medium hover:bg-gold-soft transition-colors cursor-pointer">Create</button>
              <button type="button" onClick={() => setShowAddDiscount(false)} className="px-4 py-2 text-xs text-muted-text hover:text-bone transition-colors cursor-pointer font-body">Cancel</button>
            </div>
          </form>
        )}

        {discounts === undefined ? (
          <Skeleton className="h-20 w-full" />
        ) : discounts.length === 0 ? (
          <p className="text-sm text-muted-text font-body py-4 text-center">No discount codes yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-gold/5">
            {discounts.map((d) => (
              <div key={d._id} className="flex items-center gap-3 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-bone tracking-wider">{d.code}</span>
                    {d.isActive
                      ? <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-green-900/30 text-green-400">Active</span>
                      : <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-gold/10 text-muted-text">Inactive</span>
                    }
                  </div>
                  <p className="text-xs text-muted-text font-body mt-0.5">
                    {d.type === "percent" ? `${d.value}% off` : `KES ${d.value} off`}
                    {d.minOrder ? ` · min KES ${d.minOrder}` : ""}
                    {d.maxUses ? ` · ${d.usedCount}/${d.maxUses} used` : ` · ${d.usedCount} used`}
                  </p>
                </div>
                <button onClick={() => toggleDiscount({ id: d._id, isActive: !d.isActive })} className="text-muted-text hover:text-gold transition-colors cursor-pointer p-1">
                  {d.isActive ? <ToggleRight size={18} className="text-green-400" /> : <ToggleLeft size={18} />}
                </button>
                <button onClick={() => removeDiscount({ id: d._id })} className="text-muted-text hover:text-dusty-rose transition-colors cursor-pointer p-1">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gift Sets */}
      <div className="flex flex-col gap-4 p-6 rounded-2xl border border-gold/10 bg-white/[0.02] shadow-sm opacity-70">
        <div className="flex items-center gap-2">
          <Gift size={14} className="text-gold" />
          <h2 className="font-display text-base text-bone">Gift Sets</h2>
          <span className="ml-auto text-[10px] text-muted-text font-body border border-muted-text/20 px-2 py-0.5 rounded-full">Coming soon</span>
        </div>
        <p className="text-xs text-muted-text font-body">Bundle products into curated gift sets for special occasions. Database schema is ready — UI builder coming next.</p>
      </div>
    </div>
  );
}
