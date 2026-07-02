"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Skeleton } from "@/components/ui/Skeleton";
import { Settings, Globe, Mail, CreditCard, Save, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";

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
