"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Skeleton } from "@/components/ui/Skeleton";
import { Settings, Globe, Mail, CreditCard, Save, Lock, Eye, EyeOff, ShieldCheck, Truck, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

const STORE_KEYS = [
  { key: "store_name", label: "Store Name", placeholder: "Ethereal Dayo", icon: Globe },
  { key: "contact_email", label: "Contact / Reply-to Email", placeholder: "hello@etherealdayo.com", icon: Mail },
  { key: "currency_symbol", label: "Currency Symbol", placeholder: "KES", icon: CreditCard },
  { key: "currency_code", label: "Currency Code (ISO 4217)", placeholder: "KES", icon: CreditCard },
];

function PinInput({
  value,
  onChange,
  placeholder,
  show,
  onToggle,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative max-w-[240px]">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 8))}
        placeholder={placeholder}
        inputMode="numeric"
        className="w-full px-3 py-2.5 pr-10 text-sm bg-noir/40 border border-gold/15 rounded-lg text-bone font-body placeholder:text-muted-text focus:border-gold/40 focus:outline-none transition-colors tracking-[0.3em]"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text hover:text-bone transition-colors"
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const settings = useQuery(api.settings.get);
  const upsert = useMutation(api.settings.upsert);
  const updatePin = useMutation(api.settings.updatePin);

  const shippingRates = useQuery(api.shipping.list);
  const createRate = useMutation(api.shipping.create);
  const updateRate = useMutation(api.shipping.update);
  const removeRate = useMutation(api.shipping.remove);

  const [showAddRate, setShowAddRate] = useState(false);
  const [newRate, setNewRate] = useState({ name: "", price: "" });

  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  // PIN state
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pinStatus, setPinStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [pinLoading, setPinLoading] = useState(false);

  function getValue(key: string) {
    return key in values ? values[key] : (settings?.[key] ?? "");
  }

  async function handleSaveAll(e: React.FormEvent) {
    e.preventDefault();
    await Promise.all(
      STORE_KEYS.map(({ key }) =>
        upsert({ key, value: values[key] ?? settings?.[key] ?? "" })
      )
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleChangePin(e: React.FormEvent) {
    e.preventDefault();
    setPinStatus(null);
    if (newPin.length < 4) {
      setPinStatus({ type: "error", msg: "New PIN must be at least 4 digits." });
      return;
    }
    if (newPin !== confirmPin) {
      setPinStatus({ type: "error", msg: "New PINs do not match." });
      return;
    }
    setPinLoading(true);
    try {
      await updatePin({ currentPin, newPin });
      setPinStatus({ type: "success", msg: "PIN updated successfully." });
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
    } catch (err: any) {
      setPinStatus({ type: "error", msg: err?.message ?? "Failed to update PIN." });
    } finally {
      setPinLoading(false);
    }
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
    <div className="flex flex-col gap-8 max-w-2xl">
      <div className="flex items-center gap-2">
        <Settings size={14} className="text-muted-text" />
        <h1 className="font-display text-2xl text-bone">Settings</h1>
      </div>

      {/* Store settings */}
      <form onSubmit={handleSaveAll} className="flex flex-col gap-5 p-6 rounded-2xl border border-gold/10 bg-bordeaux-deep/10">
        <h2 className="font-display text-sm text-bone tracking-wide">Store Configuration</h2>
        {settings === undefined ? (
          <div className="flex flex-col gap-3">{STORE_KEYS.map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : (
          <>
            {STORE_KEYS.map(({ key, label, placeholder, icon: Icon }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-widest uppercase text-muted-text font-body flex items-center gap-1.5">
                  <Icon size={10} />
                  {label}
                </label>
                <input
                  value={getValue(key)}
                  onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="px-3 py-2.5 text-sm bg-noir/40 border border-gold/15 rounded-lg text-bone font-body placeholder:text-muted-text focus:border-gold/40 focus:outline-none transition-colors"
                />
              </div>
            ))}
            <button
              type="submit"
              className="flex items-center gap-1.5 self-start px-5 py-2.5 bg-gold text-noir rounded-full text-xs tracking-widest uppercase font-body hover:bg-gold-soft transition-colors cursor-pointer"
            >
              <Save size={11} />
              {saved ? "Saved!" : "Save Settings"}
            </button>
          </>
        )}
      </form>

      {/* Shipping Zones */}
      <div className="flex flex-col gap-4 p-6 rounded-2xl border border-gold/10 bg-bordeaux-deep/10">
        <div className="flex items-center gap-2">
          <Truck size={14} className="text-gold" />
          <h2 className="font-display text-sm text-bone tracking-wide">Shipping Zones & Rates</h2>
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
              <input required value={newRate.name} onChange={e => setNewRate(r => ({ ...r, name: e.target.value }))} className="px-3 py-2.5 text-sm bg-noir/40 border border-gold/15 rounded-lg text-bone font-body placeholder:text-muted-text focus:border-gold/40 focus:outline-none transition-colors" placeholder="e.g. Nairobi CBD Delivery" />
            </div>
            <div className="flex flex-col gap-1 w-32">
              <label className="text-[10px] uppercase tracking-wider text-muted-text font-body">Price (KES) *</label>
              <input required type="number" value={newRate.price} onChange={e => setNewRate(r => ({ ...r, price: e.target.value }))} className="px-3 py-2.5 text-sm bg-noir/40 border border-gold/15 rounded-lg text-bone font-body placeholder:text-muted-text focus:border-gold/40 focus:outline-none transition-colors" placeholder="500" />
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

      {/* Change PIN */}
      <form onSubmit={handleChangePin} className="flex flex-col gap-5 p-6 rounded-2xl border border-gold/10 bg-bordeaux-deep/10">
        <div className="flex items-center gap-2">
          <Lock size={13} className="text-gold" />
          <h2 className="font-display text-sm text-bone tracking-wide">Admin PIN</h2>
        </div>
        <p className="text-xs text-muted-text font-body -mt-2">
          Change the PIN used to access this admin panel. Must be at least 4 digits.
        </p>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] tracking-widest uppercase text-muted-text font-body">Current PIN</label>
          <PinInput value={currentPin} onChange={setCurrentPin} placeholder="••••" show={showCurrent} onToggle={() => setShowCurrent((v) => !v)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] tracking-widest uppercase text-muted-text font-body">New PIN</label>
          <PinInput value={newPin} onChange={setNewPin} placeholder="••••" show={showNew} onToggle={() => setShowNew((v) => !v)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] tracking-widest uppercase text-muted-text font-body">Confirm New PIN</label>
          <PinInput value={confirmPin} onChange={setConfirmPin} placeholder="••••" show={showConfirm} onToggle={() => setShowConfirm((v) => !v)} />
        </div>

        {pinStatus && (
          <p className={`text-xs font-body ${pinStatus.type === "success" ? "text-green-400 flex items-center gap-1.5" : "text-dusty-rose"}`}>
            {pinStatus.type === "success" && <ShieldCheck size={13} />}
            {pinStatus.msg}
          </p>
        )}

        <button
          type="submit"
          disabled={pinLoading || !currentPin || !newPin || !confirmPin}
          className="flex items-center gap-1.5 self-start px-5 py-2.5 bg-gold text-noir rounded-full text-xs tracking-widest uppercase font-body hover:bg-gold-soft transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Lock size={11} />
          {pinLoading ? "Updating..." : "Update PIN"}
        </button>
      </form>
    </div>
  );
}
