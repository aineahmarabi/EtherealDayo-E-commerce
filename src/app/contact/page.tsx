"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

const ease = [0.16, 1, 0.3, 1] as const;

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const createInquiry = useMutation(api.inquiries.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await createInquiry(form);
      setSubmitted(true);
    } catch (err) {
      console.error("Inquiry failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-ink">
      <section className="relative pt-40 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-8 bg-dusty-rose pointer-events-none" />
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="flex flex-col gap-3 mb-14"
          >
            <span className="text-[11px] tracking-[0.35em] uppercase font-body text-gold">Get in Touch</span>
            <h1 className="font-display text-4xl md:text-5xl text-bone tracking-tight">Contact & Inquiry</h1>
            <p className="text-muted-text font-body leading-relaxed mt-2 max-w-md">
              For bespoke consultation, gifting, or any question about our collection. We reply within one business day.
            </p>
          </motion.div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
              className="flex flex-col items-center gap-6 py-16 text-center"
            >
              <div className="w-14 h-14 rounded-full border border-gold flex items-center justify-center">
                <span className="text-gold text-xl">✓</span>
              </div>
              <div>
                <h2 className="font-display text-2xl text-bone">Message received</h2>
                <p className="text-muted-text font-body mt-2">
                  We&apos;ll be in touch at <span className="text-bone">{form.email}</span>
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              onSubmit={handleSubmit}
              className="flex flex-col gap-5"
            >
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-xs tracking-widest uppercase text-muted-text font-body">Name *</label>
                  <input
                    id="name" required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full bg-bordeaux-deep/10 border border-gold/15 rounded-lg px-4 py-3 text-sm text-bone font-body placeholder:text-muted-text focus:border-gold/40 focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-xs tracking-widest uppercase text-muted-text font-body">Email / Phone Number *</label>
                  <input
                    id="email" type="text" required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="your@email.com or +254..."
                    className="w-full bg-bordeaux-deep/10 border border-gold/15 rounded-lg px-4 py-3 text-sm text-bone font-body placeholder:text-muted-text focus:border-gold/40 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="message" className="text-xs tracking-widest uppercase text-muted-text font-body">Message *</label>
                <textarea
                  id="message" required rows={6}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us how we can help…"
                  className="w-full bg-bordeaux-deep/10 border border-gold/15 rounded-lg px-4 py-3 text-sm text-bone font-body placeholder:text-muted-text focus:border-gold/40 focus:outline-none transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="py-4 bg-gold text-noir rounded-full text-sm tracking-widest uppercase font-body hover:bg-gold-soft transition-colors disabled:opacity-60 cursor-pointer"
              >
                {submitting ? "Sending…" : "Send Message"}
              </button>
            </motion.form>
          )}
        </div>
      </section>
    </div>
  );
}
