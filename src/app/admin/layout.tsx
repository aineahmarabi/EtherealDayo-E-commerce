"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ShoppingBag, Package, Archive,
  Tag, Users, MessageSquare, Megaphone, FileText,
  BarChart2, Settings, ChevronRight, Menu, X, LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/store/adminAuthStore";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/inventory", label: "Inventory", icon: Archive },
  { href: "/admin/brands", label: "Brands & Worlds", icon: Tag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, logout } = useAdminAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Real-time badge counts
  const allOrders = useQuery(api.orders.list, { limit: 999 });
  const allInquiries = useQuery(api.inquiries.list, { unreadOnly: false });
  const orderCount = allOrders?.length ?? 0;
  const unreadInquiries = allInquiries?.filter(i => !i.read).length ?? 0;

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated && !isLoginPage) {
      router.replace("/admin/login");
    }
  }, [mounted, isAuthenticated, isLoginPage, router]);

  // Render login page without sidebar wrapper
  if (isLoginPage) return <>{children}</>;

  // While checking auth, show a subtle loader to avoid flash
  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-dvh bg-noir flex items-center justify-center">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
              className="w-2 h-2 rounded-full bg-gold"
            />
          ))}
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.replace("/admin/login");
  };

  return (
    <div className="min-h-dvh bg-noir flex">
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "flex flex-col w-64 border-r border-gold/10 bg-noir flex-shrink-0 fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:translate-x-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between px-6 py-6 border-b border-gold/10">
          <Link href="/admin" className="flex flex-col gap-0.5">
            <span className="font-display text-base tracking-widest uppercase text-bone">Ethereal Dayo</span>
            <span className="text-[9px] tracking-[0.3em] uppercase text-gold font-body">Admin Panel</span>
          </Link>
          <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden p-1 text-muted-text hover:text-bone transition-colors">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            const badge = item.href === "/admin/orders" ? orderCount
              : item.href === "/admin/inquiries" ? unreadInquiries
              : null;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body mb-0.5 transition-all duration-200 group",
                  isActive
                    ? "bg-bordeaux-deep/50 text-bone border-l-2 border-gold pl-[10px]"
                    : "text-muted-text hover:text-bone hover:bg-bordeaux-deep/20"
                )}
              >
                <Icon size={15} className={isActive ? "text-gold" : "text-muted-text group-hover:text-bone"} />
                {item.label}
                <span className="ml-auto flex items-center gap-1">
                  {badge != null && badge > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none ${
                      item.href === "/admin/inquiries" ? "bg-dusty-rose text-noir" : "bg-gold text-noir"
                    }`}>
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                  {isActive && !badge && <ChevronRight size={12} className="text-gold/50" />}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-gold/10 flex flex-col gap-1">
          <Link href="/" className="text-xs text-muted-text hover:text-gold font-body transition-colors px-2 py-1.5">
            ← View storefront
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-text hover:text-dusty-rose font-body transition-colors rounded-md hover:bg-bordeaux/10 cursor-pointer w-full text-left"
          >
            <LogOut size={13} />
            Lock Admin
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-64 min-h-dvh bg-ink flex flex-col max-w-full">
        <div className="lg:hidden flex items-center gap-4 px-4 h-14 border-b border-gold/10 bg-noir sticky top-0 z-30 shadow-sm">
          <button onClick={() => setMobileMenuOpen(true)} className="p-1.5 -ml-1.5 text-bone hover:bg-white/5 rounded-md transition-colors">
            <Menu size={20} />
          </button>
          <span className="font-display text-sm tracking-widest uppercase text-bone">Ethereal Dayo</span>
        </div>

        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 sm:p-6 lg:p-8 flex-1 overflow-x-hidden"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
