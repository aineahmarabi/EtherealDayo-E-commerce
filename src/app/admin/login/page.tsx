"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAdminAuth } from "@/store/adminAuthStore";
import { motion, AnimatePresence } from "framer-motion";
import { Delete } from "lucide-react";

const KEYS = ["1","2","3","4","5","6","7","8","9","","0","⌫"];

export default function AdminLoginPage() {
  const router = useRouter();
  const { isAuthenticated, authenticate } = useAdminAuth();
  const verifyPin = useMutation(api.settings.verifyPin);

  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  // Already authed — go straight to admin
  useEffect(() => {
    if (isAuthenticated) router.replace("/admin");
  }, [isAuthenticated, router]);

  const submitPin = useCallback(async (submittedPin: string) => {
    if (submittedPin.length < 4) return;
    setLoading(true);
    setError("");
    try {
      const valid = await verifyPin({ pin: submittedPin });
      if (valid) {
        authenticate();
        router.replace("/admin");
      } else {
        setShake(true);
        setError("Incorrect PIN. Try again.");
        setPin("");
        setTimeout(() => setShake(false), 600);
      }
    } catch {
      setError("Something went wrong. Try again.");
      setPin("");
    } finally {
      setLoading(false);
    }
  }, [verifyPin, authenticate, router]);

  const handleKey = useCallback((key: string) => {
    if (loading) return;
    if (key === "⌫") {
      setPin((p) => p.slice(0, -1));
      setError("");
      return;
    }
    if (!key) return;
    const next = pin + key;
    setPin(next);
    setError("");
    if (next.length >= 5) {
      submitPin(next);
    }
  }, [pin, loading, submitPin]);

  // Physical keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") handleKey(e.key);
      if (e.key === "Backspace") handleKey("⌫");
      if (e.key === "Enter" && pin.length >= 4) submitPin(pin);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleKey, pin, submitPin]);

  return (
    <div className="min-h-dvh bg-noir flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center gap-8 w-full max-w-xs"
      >
        {/* Brand */}
        <div className="flex flex-col items-center gap-1">
          <span className="font-display text-2xl tracking-widest uppercase text-bone">
            Ethereal Dayo
          </span>
          <span className="text-[10px] tracking-[0.35em] uppercase text-gold font-body">
            Admin Access
          </span>
        </div>

        {/* PIN dots */}
        <motion.div
          animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-4"
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scale: i < pin.length ? 1.2 : 1,
                backgroundColor: shake
                  ? "#C97B89"
                  : i < pin.length
                  ? "#C9A961"
                  : "transparent",
              }}
              transition={{ duration: 0.15 }}
              className="w-3 h-3 rounded-full border border-gold/40"
            />
          ))}
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              key="err"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-dusty-rose font-body text-center -mt-4"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* PIN Pad */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {KEYS.map((key, i) => {
            if (key === "") return <div key={i} />;
            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleKey(key)}
                disabled={loading}
                className="h-14 rounded-2xl border border-gold/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-gold/30 transition-all duration-200 flex items-center justify-center text-bone font-display text-lg tracking-widest disabled:opacity-40 cursor-pointer"
              >
                {key === "⌫" ? <Delete size={18} className="text-muted-text" /> : key}
              </motion.button>
            );
          })}
        </div>

        {/* Loading */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
                  className="w-1.5 h-1.5 rounded-full bg-gold"
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-xs text-muted-text/40 font-body text-center">
          Enter your admin PIN to continue
        </p>
      </motion.div>
    </div>
  );
}
