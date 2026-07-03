"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { generateOrderNumber } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ChevronRight, Lock, Tag, X } from "lucide-react";

function formatKES(amount: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

type Step = "contact" | "shipping" | "payment" | "review";
const STEPS: Step[] = ["contact", "shipping", "payment", "review"];
const STEP_LABELS = { contact: "Contact", shipping: "Shipping", payment: "Payment", review: "Review" };

function StepIndicator({ current }: { current: Step }) {
  const idx = STEPS.indexOf(current);
  return (
    <div className="flex items-center gap-2 text-xs font-body">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 ${i <= idx ? "text-gold" : "text-muted-text"}`}>
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${i < idx ? "bg-gold border-gold text-noir" : i === idx ? "border-gold text-gold" : "border-muted-text/30 text-muted-text"}`}>
              {i < idx ? "✓" : i + 1}
            </div>
            <span className="hidden sm:inline">{STEP_LABELS[s]}</span>
          </div>
          {i < STEPS.length - 1 && <ChevronRight size={12} className="text-muted-text/40" />}
        </div>
      ))}
    </div>
  );
}

function Field({ label, name, type = "text", required, placeholder, value, onChange }: {
  label: string; name: string; type?: string; required?: boolean;
  placeholder?: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-xs tracking-widest uppercase text-muted-text font-body">
        {label}{required && " *"}
      </label>
      <input
        id={name} name={name} type={type} required={required}
        placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-bordeaux-deep/10 border border-gold/15 rounded-lg px-4 py-3 text-sm text-bone font-body placeholder:text-muted-text focus:border-gold/40 focus:outline-none transition-colors"
      />
    </div>
  );
}

type ShippingRate = { _id: string; name: string; price: number; isActive: boolean };

const PICKUP_OPTION: ShippingRate = { _id: "pickup", name: "Pick Up — Free", price: 0, isActive: true };

const LOCAL_SHIPPING_RATES: ShippingRate[] = [
  { _id: "pickup", name: "Pick Up from our Shop", price: 0, isActive: true },
  { _id: "cbd", name: "Delivery within CBD", price: 100, isActive: true },
  { _id: "supermetro", name: "Thika, Kikuyu, Ruiru, Juja, Syokimau, Ngong, Kitengela etc via Super Metro, Rembo sacco etc", price: 200, isActive: true },
  { _id: "nairobi-hospital", name: "Upperhill, Valley Road, Community, Hurlingham, Nairobi Hospital, Pangani, Ngara, KNH, Oijo Road etc", price: 300, isActive: true },
  { _id: "westlands", name: "Riverside, Westlands, ABC, Kilimani, Kileleshwa, Westgate, Parklands, MP Shah, Aga Khan, Oshwal", price: 350, isActive: true },
  { _id: "bellevue", name: "South B, South C, Mbagathi, Madaraka, Lang'ata, Nairobi West, Bellevue, Nextgen Mall, Carnivore, Panari", price: 350, isActive: true },
  { _id: "lavington", name: "Junction Mall, Lavington, Kibra, Dagoreti Corner, Kawangware, Wanyee, Kabiria, Riruta, Naivasha Road Areas", price: 400, isActive: true },
  { _id: "garden-city", name: "Roasters, Mountain Mall, Garden City, TRM, USIU, Ngumba", price: 400, isActive: true },
  { _id: "umoja", name: "Shauri Moyo, Huruma, Kariobangi, Donholm, Umoja, Kayole, Buruburu, Komarock, Dandora, Saika", price: 400, isActive: true },
  { _id: "courier", name: "Outside Nairobi via courier — 2NK, Northrift, Easycoach, Ena Coach", price: 450, isActive: true },
  { _id: "gigiri", name: "Gigiri, Village Market, Runda, Ruaka", price: 500, isActive: true },
  { _id: "loresho", name: "Kangemi, Loresho, Mountain View, Spring Valley, Peponi Road, Lower Kabete Areas", price: 500, isActive: true },
  { _id: "muthaiga", name: "Muthaiga North, Ridgeways, Fourways, Thindigua Areas", price: 500, isActive: true },
  { _id: "zimmerman", name: "Zimmerman, Thome, Githurai 44/45, Kahawa West / Wendani / Sukari", price: 500, isActive: true },
  { _id: "karen", name: "Galleria Mall, Karen Area", price: 700, isActive: true },
  { _id: "rongai", name: "Rongai, Kikuyu, Kiambu, Ngong Town, Tatu City", price: 800, isActive: true },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const cartTotal = total();
  const createOrder = useMutation(api.orders.create);

  const shippingRates = LOCAL_SHIPPING_RATES;

  const [step, setStep] = useState<Step>("contact");
  const [placing, setPlacing] = useState(false);
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [address, setAddress] = useState({ line1: "", line2: "", city: "", state: "", zip: "", country: "Kenya" });
  const [selectedShippingId, setSelectedShippingId] = useState("pickup");
  const [gift, setGift] = useState({ enabled: false, message: "" });

  // Discount code state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<null | { code: string; amount: number; label: string }>(null);
  const [couponError, setCouponError] = useState("");
  const validateCoupon = useQuery(
    api.discountCodes.validate,
    couponInput.length > 0 ? { code: couponInput, subtotal: cartTotal } : "skip"
  );

  const selectedRate = shippingRates.find(r => r._id === selectedShippingId) ?? PICKUP_OPTION;
  const subtotal = cartTotal;
  const shippingCost = selectedRate.price;
  const discount = appliedCoupon?.amount ?? 0;
  const orderTotal = Math.max(0, subtotal + shippingCost - discount);

  function handleApplyCoupon() {
    if (validateCoupon === undefined) return;
    if (!validateCoupon.valid) {
      setCouponError(validateCoupon.message ?? "Invalid code");
      return;
    }
    setCouponError("");
    const d = validateCoupon as { valid: true; discount: { code: string; type: string; value: number }; amount: number };
    setAppliedCoupon({
      code: d.discount.code,
      amount: d.amount,
      label: d.discount.type === "percent" ? `${d.discount.value}% off` : `KES ${d.discount.value} off`,
    });
    setCouponInput("");
  }

  if (items.length === 0) {
    return (
      <div className="min-h-dvh bg-ink flex items-center justify-center px-4">
        <div className="text-center">
          <p className="font-display text-2xl text-bone mb-4">Your bag is empty</p>
          <Link href="/catalog" className="text-gold hover:text-gold-soft font-body underline underline-offset-4">Browse fragrances</Link>
        </div>
      </div>
    );
  }

  const placeOrder = async () => {
    if (placing) return;
    setPlacing(true);
    try {
      const number = generateOrderNumber();
      await createOrder({
        number,
        channel: "web",
        customerName: contact.name,
        customerEmail: contact.email,
        customerPhone: contact.phone || undefined,
        shippingAddress: selectedShippingId === "pickup" ? undefined : address,
        lineItems: items.map((i) => ({
          variantId: i.variantId,
          productName: i.productName,
          size: i.size,
          concentration: i.concentration,
          qty: i.quantity,
          price: i.price,
        })),
        subtotal,
        shipping: shippingCost,
        tax: 0,
        total: orderTotal,
        giftMessage: gift.enabled ? gift.message : undefined,
      });
      clearCart();
      router.push(`/order/${number}`);
    } catch (err) {
      console.error("Order failed:", err);
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-dvh bg-ink">
      <header className="sticky top-0 z-50 border-b border-gold/10 bg-noir/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display text-base tracking-widest uppercase text-bone">Ethereal Dayo</Link>
          <div className="flex items-center gap-2 text-xs text-muted-text font-body">
            <Lock size={12} /> Secure Checkout
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid lg:grid-cols-[1fr_380px] gap-12">
        {/* Left: form */}
        <div className="flex flex-col gap-8">
          <StepIndicator current={step} />

          <motion.div key={step} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}>

            {step === "contact" && (
              <div className="flex flex-col gap-6">
                <h2 className="font-display text-2xl text-bone">Contact</h2>
                <Field label="Full Name" name="name" required placeholder="Your name" value={contact.name} onChange={(v) => setContact({ ...contact, name: v })} />
                <Field label="Email" name="email" type="email" required placeholder="your@email.com" value={contact.email} onChange={(v) => setContact({ ...contact, email: v })} />
                <Field label="Phone (optional)" name="phone" type="tel" placeholder="+254 700 000000" value={contact.phone} onChange={(v) => setContact({ ...contact, phone: v })} />
                <button onClick={() => setStep("shipping")} disabled={!contact.name || !contact.email}
                  className="py-4 bg-gold text-noir rounded-full text-sm tracking-widest uppercase font-body hover:bg-gold-soft transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                  Continue to Shipping
                </button>
              </div>
            )}

            {step === "shipping" && (
              <div className="flex flex-col gap-6">
                <h2 className="font-display text-2xl text-bone">Delivery Method</h2>

                {/* Shipping method selection */}
                <div className="flex flex-col gap-3">
                  <p className="text-xs tracking-widest uppercase text-muted-text font-body">Choose your delivery option</p>
                  {shippingRatesRaw === undefined ? (
                    <div className="h-20 bg-white/5 rounded-xl animate-pulse" />
                  ) : (
                    shippingRates.map((rate) => (
                      <label key={rate._id} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${selectedShippingId === rate._id ? "border-gold bg-bordeaux-deep/20" : "border-gold/15 hover:border-gold/30"}`}>
                        <input type="radio" name="shipping" value={rate._id} checked={selectedShippingId === rate._id}
                          onChange={() => { setSelectedShippingId(rate._id); if (rate._id === "pickup") setAddress({ line1: "", line2: "", city: "", state: "", zip: "", country: "Kenya" }); }}
                          className="accent-gold w-4 h-4" />
                        <div className="flex-1">
                          <p className="text-sm font-body text-bone">{rate.name}</p>
                        </div>
                        <span className="text-sm text-gold font-body font-medium">
                          {rate.price === 0 ? "Free" : formatKES(rate.price)}
                        </span>
                      </label>
                    ))
                  )}
                </div>

                {/* Address — only show if not pickup */}
                {selectedShippingId !== "pickup" && (
                  <div className="flex flex-col gap-4">
                    <h3 className="text-base font-display text-bone">Shipping Address</h3>
                    <Field label="Address Line 1" name="line1" required placeholder="123 Kimathi St" value={address.line1} onChange={(v) => setAddress({ ...address, line1: v })} />
                    <Field label="Address Line 2" name="line2" placeholder="Apt, Floor, etc." value={address.line2} onChange={(v) => setAddress({ ...address, line2: v })} />
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="City" name="city" required value={address.city} onChange={(v) => setAddress({ ...address, city: v })} />
                      <Field label="Area / County" name="state" required value={address.state} onChange={(v) => setAddress({ ...address, state: v })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Postal Code" name="zip" value={address.zip} onChange={(v) => setAddress({ ...address, zip: v })} />
                      <Field label="Country" name="country" required value={address.country} onChange={(v) => setAddress({ ...address, country: v })} />
                    </div>
                  </div>
                )}

                {/* Gift option */}
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={gift.enabled} onChange={(e) => setGift({ ...gift, enabled: e.target.checked })} className="w-4 h-4 accent-gold cursor-pointer" />
                    <span className="text-sm text-bone/70 group-hover:text-bone font-body transition-colors">This is a gift</span>
                  </label>
                  {gift.enabled && (
                    <textarea placeholder="Gift message (optional)" value={gift.message}
                      onChange={(e) => setGift({ ...gift, message: e.target.value })} rows={3}
                      className="w-full bg-bordeaux-deep/10 border border-gold/15 rounded-lg px-4 py-3 text-sm text-bone font-body placeholder:text-muted-text focus:border-gold/40 focus:outline-none transition-colors resize-none" />
                  )}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep("contact")} className="flex-1 py-4 border border-gold/20 text-bone/60 hover:text-bone rounded-full text-sm font-body transition-colors cursor-pointer">Back</button>
                  <button onClick={() => setStep("payment")}
                    disabled={selectedShippingId !== "pickup" && (!address.line1 || !address.city)}
                    className="flex-[2] py-4 bg-gold text-noir rounded-full text-sm tracking-widest uppercase font-body hover:bg-gold-soft transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {step === "payment" && (
              <div className="flex flex-col gap-6">
                <h2 className="font-display text-2xl text-bone">Payment</h2>
                <div className="p-6 rounded-xl border border-gold/15 bg-bordeaux-deep/10">
                  <p className="text-sm text-muted-text font-body text-center">
                    Stripe payment integration — wire in your publishable key via{" "}
                    <code className="text-gold text-xs bg-noir px-1.5 py-0.5 rounded">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep("shipping")} className="flex-1 py-4 border border-gold/20 text-bone/60 hover:text-bone rounded-full text-sm font-body transition-colors cursor-pointer">Back</button>
                  <button onClick={() => setStep("review")} className="flex-[2] py-4 bg-gold text-noir rounded-full text-sm tracking-widest uppercase font-body hover:bg-gold-soft transition-colors cursor-pointer">
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {step === "review" && (
              <div className="flex flex-col gap-6">
                <h2 className="font-display text-2xl text-bone">Review &amp; Place Order</h2>
                <div className="flex flex-col gap-3 p-5 rounded-xl border border-gold/15 bg-bordeaux-deep/10">
                  <p className="text-xs tracking-widest uppercase text-muted-text font-body">{selectedShippingId === "pickup" ? "Pick Up" : "Shipping to"}</p>
                  <p className="text-sm font-body text-bone">{contact.name} · {contact.email}</p>
                  {selectedShippingId !== "pickup" && (
                    <p className="text-sm font-body text-bone/70">{address.line1}{address.line2 && `, ${address.line2}`}, {address.city}, {address.state}</p>
                  )}
                  <p className="text-sm font-body text-gold">{selectedRate.name} — {selectedRate.price === 0 ? "Free" : formatKES(selectedRate.price)}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep("payment")} className="flex-1 py-4 border border-gold/20 text-bone/60 hover:text-bone rounded-full text-sm font-body transition-colors cursor-pointer">Back</button>
                  <button onClick={placeOrder} disabled={placing}
                    className="flex-[2] py-4 bg-gold text-noir rounded-full text-sm tracking-widest uppercase font-body hover:bg-gold-soft transition-colors disabled:opacity-60 cursor-pointer">
                    {placing ? "Placing order…" : `Place Order · ${formatKES(orderTotal)}`}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right: order summary */}
        <aside className="flex flex-col gap-6 lg:sticky lg:top-24 self-start">
          <h3 className="font-display text-lg text-bone">Order Summary</h3>
          <ul className="flex flex-col gap-4">
            {items.map((item) => (
              <li key={item.variantId} className="flex items-center gap-3">
                <div className="w-12 h-14 rounded-lg bg-bordeaux-deep/40 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 30 42" className="w-7 h-10" aria-hidden="true">
                    <rect x="10" y="1" width="10" height="7" rx="2" fill="#C9A961" opacity="0.5" />
                    <path d="M5 8 Q3 14 3 22 L3 38 Q3 42 15 42 Q27 42 27 38 L27 22 Q27 14 25 8 Z" fill="#2A0A12" stroke="#C9A961" strokeWidth="0.6" strokeOpacity="0.35" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-text font-body">{item.brandName}</p>
                  <p className="text-sm font-display text-bone truncate">{item.productName}</p>
                  <p className="text-xs text-muted-text font-body">{item.size} · ×{item.quantity}</p>
                </div>
                <span className="text-sm font-body text-bone flex-shrink-0">{formatKES(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <hr className="border-gold/10" />

          {/* Discount code input */}
          <div className="flex flex-col gap-2">
            <p className="text-xs tracking-widest uppercase text-muted-text font-body">Discount Code</p>
            {appliedCoupon ? (
              <div className="flex items-center gap-2 p-3 rounded-xl border border-green-500/30 bg-green-900/10">
                <Tag size={14} className="text-green-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono text-bone">{appliedCoupon.code}</p>
                  <p className="text-xs text-green-400 font-body">{appliedCoupon.label} — -{formatKES(appliedCoupon.amount)}</p>
                </div>
                <button onClick={() => setAppliedCoupon(null)} className="text-muted-text hover:text-dusty-rose transition-colors p-1"><X size={14} /></button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                  placeholder="Enter code"
                  className="flex-1 px-3 py-2 text-sm bg-noir border border-gold/15 rounded-lg text-bone font-body placeholder:text-muted-text focus:border-gold/40 focus:outline-none transition-colors"
                />
                <button onClick={handleApplyCoupon} className="px-4 py-2 bg-gold/20 hover:bg-gold/30 text-gold text-xs font-body rounded-lg transition-colors cursor-pointer whitespace-nowrap">
                  Apply
                </button>
              </div>
            )}
            {couponError && <p className="text-xs text-dusty-rose font-body">{couponError}</p>}
          </div>

          <hr className="border-gold/10" />

          {/* Totals */}
          <div className="flex flex-col gap-2 text-sm font-body">
            <div className="flex justify-between text-bone/70">
              <span>Subtotal</span><span>{formatKES(subtotal)}</span>
            </div>
            <div className="flex justify-between text-bone/70">
              <span>Shipping</span>
              <span>{shippingCost === 0 ? "Free" : formatKES(shippingCost)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-green-400">
                <span>Discount ({appliedCoupon.code})</span>
                <span>-{formatKES(appliedCoupon.amount)}</span>
              </div>
            )}
            <hr className="border-gold/10 my-1" />
            <div className="flex justify-between font-display text-base text-bone">
              <span>Total</span><span>{formatKES(orderTotal)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
