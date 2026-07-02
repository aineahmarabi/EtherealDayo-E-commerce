"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="py-3 text-sm text-gold font-body">
        Thank you — you&apos;ll hear from us soon.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex border border-gold/20 rounded-lg overflow-hidden focus-within:border-gold/50 transition-colors">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 bg-transparent px-4 py-3 text-sm text-bone placeholder:text-muted-text font-body outline-none"
          aria-label="Email address for newsletter"
          required
        />
        <button
          type="submit"
          aria-label="Subscribe"
          className="px-4 py-3 text-gold hover:text-gold-soft hover:bg-bordeaux-deep/30 transition-colors cursor-pointer flex items-center"
        >
          <Send size={16} />
        </button>
      </div>
      <p className="text-[11px] text-muted-text font-body">
        Unsubscribe at any time. No spam, ever.
      </p>
    </form>
  );
}
