"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ShoppingBag, Search, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore, useSearchStore } from "@/store/cartStore";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { cn } from "@/lib/utils";
import { getBrandImage } from "@/lib/brandImages";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [brandDropOpen, setBrandDropOpen] = useState(false);
  const dropTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { itemCount, openCart } = useCartStore();
  const { openSearch } = useSearchStore();
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const count = mounted ? itemCount() : 0;

  const brands = useQuery(api.brands.list);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Lock body scroll while mobile menu is open so the hero canvas
     doesn't swipe behind the menu sheet.                          */
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [menuOpen]);

  const handleBrandEnter = () => {
    if (dropTimer.current) clearTimeout(dropTimer.current);
    setBrandDropOpen(true);
  };
  const handleBrandLeave = () => {
    dropTimer.current = setTimeout(() => setBrandDropOpen(false), 200);
  };

  if (pathname.startsWith("/admin") || pathname === "/checkout") {
    return null;
  }

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-500",
          scrolled
            ? "border-b border-gold/10 bg-noir/90 backdrop-blur-md"
            : "bg-transparent"
        )}
      >
        <nav
          className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center"
          aria-label="Main navigation"
        >
          {/* === DESKTOP ===
              All nav links centered as one unit — icons pinned far right.
          */}
          <div className="hidden lg:flex flex-1 items-center relative">
            {/* Official Logo on the far left */}
            <Link href="/" className="z-10 flex-shrink-0 relative overflow-hidden h-[50px] w-[220px]" aria-label="Ethereal Dayo — Home">
              <Image src="/logo.png" alt="Ethereal Dayo" width={300} height={300} className="object-contain w-[300px] h-[300px] absolute top-1/2 left-[-15px] -translate-y-1/2" priority />
            </Link>

            {/* All nav links — absolutely centered in the full nav width */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex items-center gap-6 pointer-events-auto">
                <NavLink href="/for-her">For Her</NavLink>
                <NavLink href="/catalog">Catalog</NavLink>

                {/* Shop by Brand dropdown */}
                <div
                  className="relative"
                  onMouseEnter={handleBrandEnter}
                  onMouseLeave={handleBrandLeave}
                >
                  <button
                    className="flex items-center gap-1 text-sm tracking-wide text-bone/80 hover:text-bone transition-colors duration-200 font-body cursor-pointer"
                    aria-expanded={brandDropOpen}
                    aria-haspopup="true"
                  >
                    Shop by Brand
                    <motion.span
                      animate={{ rotate: brandDropOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-[10px] ml-0.5"
                    >
                      ▾
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {brandDropOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-56 rounded-xl border border-gold/20 bg-noir/95 backdrop-blur-sm py-2 shadow-2xl z-10"
                        onMouseEnter={handleBrandEnter}
                        onMouseLeave={handleBrandLeave}
                      >
                        <Link
                          href="/brands"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-text hover:text-bone hover:bg-bordeaux-deep/40 transition-colors font-body"
                        >
                          <span className="w-6 h-6 rounded-sm bg-bordeaux/30 flex items-center justify-center text-[10px] text-gold">ALL</span>
                          All Houses
                        </Link>
                        <div className="hairline my-2 mx-4" />
                        {brands === undefined || brands.length === 0 ? (
                          <div className="px-4 py-2 text-xs text-muted-text">Loading…</div>
                        ) : (
                          brands.map((brand) => (
                            <Link
                              key={brand._id}
                              href={`/brand/${brand.slug}`}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-bone/70 hover:text-bone hover:bg-bordeaux-deep/40 transition-colors font-body"
                              onClick={() => setBrandDropOpen(false)}
                            >
                              {(() => {
                                const img = getBrandImage(brand.slug);
                                return img ? (
                                  <span className="w-6 h-6 rounded-full overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
                                    <Image src={img} alt={brand.name} width={20} height={20} className="object-contain w-5 h-5" />
                                  </span>
                                ) : (
                                  <span className="w-6 h-6 rounded-sm bg-bordeaux-deep border border-gold/20 flex items-center justify-center text-[9px] text-gold font-display flex-shrink-0">
                                    {brand.name.charAt(0)}
                                  </span>
                                );
                              })()}
                              {brand.name}
                            </Link>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <NavLink href="/for-him">For Him</NavLink>
              </div>
            </div>

            {/* Icons — always at the far right edge */}
            <div className="ml-auto flex items-center gap-5">
              <button
                onClick={openSearch}
                aria-label="Search fragrances"
                className="text-bone/70 hover:text-gold transition-colors duration-200 cursor-pointer"
              >
                <Search size={18} />
              </button>
              <button
                onClick={openCart}
                aria-label={`Cart — ${count} item${count !== 1 ? "s" : ""}`}
                data-cart-icon
                className="relative text-bone/70 hover:text-gold transition-colors duration-200 cursor-pointer"
              >
                <ShoppingBag size={18} />
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gold text-noir text-[10px] font-bold flex items-center justify-center leading-none"
                  >
                    {count > 9 ? "9+" : count}
                  </motion.span>
                )}
              </button>
            </div>
          </div>

          {/* === MOBILE === */}
          <div className="flex lg:hidden w-full items-center justify-between">
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="text-bone/70 hover:text-bone transition-colors cursor-pointer"
            >
              <Menu size={22} />
            </button>

            <Link
              href="/"
              className="z-10 flex-shrink-0 relative overflow-hidden h-[40px] w-[180px]"
              aria-label="Ethereal Dayo — Home"
            >
              <Image src="/logo.png" alt="Ethereal Dayo" width={240} height={240} className="object-contain w-[240px] h-[240px] absolute top-1/2 left-[-10px] -translate-y-1/2" priority />
            </Link>

            <div className="flex items-center gap-4">
              <button
                onClick={openSearch}
                aria-label="Search"
                className="text-bone/70 hover:text-gold transition-colors cursor-pointer"
              >
                <Search size={18} />
              </button>
              <button
                onClick={openCart}
                aria-label={`Cart — ${count} item${count !== 1 ? "s" : ""}`}
                data-cart-icon
                className="relative text-bone/70 hover:text-gold transition-colors cursor-pointer"
              >
                <ShoppingBag size={18} />
                {count > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gold text-noir text-[10px] font-bold flex items-center justify-center">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile menu sheet */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-noir/80 backdrop-blur-sm lg:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
              className="fixed inset-y-0 left-0 z-[70] w-80 bg-noir border-r border-gold/10 flex flex-col lg:hidden"
              /* Stop touch events from reaching the canvas beneath */
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-gold/10 flex-shrink-0">
                <span className="font-display text-sm tracking-widest uppercase text-bone">
                  ⟡ Ethereal Dayo ⟡
                </span>
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  className="text-bone/60 hover:text-bone transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable nav area — overscroll-contain prevents page scroll leak */}
              <nav
                className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-8 flex flex-col gap-1"
                style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
              >
                <MobileNavLink href="/" onClick={() => setMenuOpen(false)}>Home</MobileNavLink>
                <MobileNavLink href="/for-her" onClick={() => setMenuOpen(false)}>For Her</MobileNavLink>
                <MobileNavLink href="/for-him" onClick={() => setMenuOpen(false)}>For Him</MobileNavLink>
                <MobileNavLink href="/bestsellers" onClick={() => setMenuOpen(false)}>Bestsellers</MobileNavLink>
                <MobileNavLink href="/new-arrivals" onClick={() => setMenuOpen(false)}>New Arrivals</MobileNavLink>
                <MobileNavLink href="/catalog" onClick={() => setMenuOpen(false)}>Full Catalog</MobileNavLink>

                <div className="hairline my-5" />

                <p className="text-xs text-muted-text uppercase tracking-widest mb-3">Shop by Brand</p>
                <MobileNavLink href="/brands" onClick={() => setMenuOpen(false)}>All Houses</MobileNavLink>
                {brands === undefined || brands.length === 0 ? (
                  <div className="py-3 pl-2 text-sm text-muted-text font-body">Loading…</div>
                ) : (
                  brands.map((brand) => (
                    <MobileNavLink
                      key={brand._id}
                      href={`/brand/${brand.slug}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {brand.name}
                    </MobileNavLink>
                  ))
                )}

                <div className="hairline my-5" />

                <MobileNavLink href="/contact" onClick={() => setMenuOpen(false)}>Contact &amp; Inquiry</MobileNavLink>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm tracking-wide text-bone/80 hover:text-bone transition-colors duration-200 relative group font-body"
    >
      {children}
      <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gold group-hover:w-full transition-all duration-300" />
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="py-3 text-bone/70 hover:text-bone text-base font-body transition-colors border-b border-gold/5 last:border-0"
    >
      {children}
    </Link>
  );
}
