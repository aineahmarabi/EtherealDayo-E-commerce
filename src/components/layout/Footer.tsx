"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NewsletterForm } from "./NewsletterForm";

const NAV_LINKS = [
  { label: "For Her", href: "/for-her" },
  { label: "For Him", href: "/for-him" },
  { label: "Catalog", href: "/catalog" },
  { label: "Shop by Brand", href: "/brands" },
  { label: "Bestsellers", href: "/bestsellers" },
  { label: "New Arrivals", href: "/new-arrivals" },
];

const SUPPORT_LINKS = [
  { label: "Contact & Inquiry", href: "/contact" },
  { label: "Shipping", href: "/shipping" },
  { label: "Returns", href: "/returns" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin") || pathname.startsWith("/checkout")) {
    return null;
  }

  return (
    <footer className="bg-noir border-t border-gold/10">
      {/* Top hairline */}
      <div className="hairline" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 pt-20 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16">

          {/* Brand column */}
          <div className="md:col-span-1 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="font-display text-lg tracking-widest uppercase text-bone">
                Ethereal Dayo
              </span>
              <span className="text-xs tracking-[0.3em] uppercase text-gold">
                Maison de Parfum
              </span>
            </div>
            <p className="text-sm text-muted-text leading-relaxed font-body max-w-xs">
              Ultra-luxury niche fragrances, curated from the world&apos;s most
              singular perfumers. Every bottle, an argument for slowness.
            </p>
          </div>

          {/* Collections */}
          <div className="flex flex-col gap-5">
            <p className="text-[11px] tracking-[0.2em] uppercase text-gold font-body">
              Collections
            </p>
            <nav className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-bone/60 hover:text-bone transition-colors duration-200 font-body"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Support */}
          <div className="flex flex-col gap-5">
            <p className="text-[11px] tracking-[0.2em] uppercase text-gold font-body">
              Support
            </p>
            <nav className="flex flex-col gap-3">
              {[...SUPPORT_LINKS, ...LEGAL_LINKS].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-bone/60 hover:text-bone transition-colors duration-200 font-body"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col gap-5">
            <p className="text-[11px] tracking-[0.2em] uppercase text-gold font-body">
              Stay Rare
            </p>
            <p className="text-sm text-muted-text font-body leading-relaxed">
              New arrivals, rare drops, and olfactory dispatches — for those who choose carefully.
            </p>
            <NewsletterForm />
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gold/10 flex flex-col items-center justify-center gap-4">
          <p className="text-xs text-muted-text font-body text-center">
            © {new Date().getFullYear()} Ethereal Dayo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

