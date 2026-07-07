"use client";

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

const LOCAL_SHIPPING_RATES = [
  { name: "Pick Up from our Shop", price: 0, isActive: true },
  { name: "Delivery within CBD", price: 100, isActive: true },
  { name: "Thika, Kikuyu, Ruiru, Juja, Syokimau, Ngong, Kitengela etc via Super Metro, Rembo sacco etc", price: 200, isActive: true },
  { name: "Upperhill, Valley Road, Community, Hurlingham, Nairobi Hospital, Pangani, Ngara, KNH, Oijo Road etc", price: 300, isActive: true },
  { name: "Riverside, Westlands, ABC, Kilimani, Kileleshwa, Westgate, Parklands, MP Shah, Aga Khan, Oshwal", price: 350, isActive: true },
  { name: "South B, South C, Mbagathi, Madaraka, Lang'ata, Nairobi West, Bellevue, Nextgen Mall, Carnivore, Panari", price: 350, isActive: true },
  { name: "Junction Mall, Lavington, Kibra, Dagoreti Corner, Kawangware, Wanyee, Kabiria, Riruta, Naivasha Road Areas", price: 400, isActive: true },
  { name: "Roasters, Mountain Mall, Garden City, TRM, USIU, Ngumba", price: 400, isActive: true },
  { name: "Shauri Moyo, Huruma, Kariobangi, Donholm, Umoja, Kayole, Buruburu, Komarock, Dandora, Saika", price: 400, isActive: true },
  { name: "Outside Nairobi via courier — 2NK, Northrift, Easycoach, Ena Coach", price: 450, isActive: true },
  { name: "Gigiri, Village Market, Runda, Ruaka", price: 500, isActive: true },
  { name: "Kangemi, Loresho, Mountain View, Spring Valley, Peponi Road, Lower Kabete Areas", price: 500, isActive: true },
  { name: "Muthaiga North, Ridgeways, Fourways, Thindigua Areas", price: 500, isActive: true },
  { name: "Zimmerman, Thome, Githurai 44/45, Kahawa West / Wendani / Sukari", price: 500, isActive: true },
  { name: "Galleria Mall, Karen Area", price: 700, isActive: true },
  { name: "Rongai, Kikuyu, Kiambu, Ngong Town, Tatu City", price: 800, isActive: true }
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
    <div className="flex flex-col gap-8 max-w-6xl w-full">
      <div className="flex items-center gap-2">
        <Settings size={14} className="text-muted-text" />
        <h1 className="font-display text-2xl text-bone">Settings</h1>
      </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col gap-8">
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
        </div>
      </div>
</div>
  );
}
