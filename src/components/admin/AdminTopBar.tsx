"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, Bell, X, Package, MessageSquare, ChevronRight, User, Tag, ShoppingBag, Menu } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface AdminTopBarProps {
  onMenuClick?: () => void;
}

export function AdminTopBar({ onMenuClick }: AdminTopBarProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  const searchResults = useQuery(api.adminSearch.global, { searchTerm }) || [];
  const allOrders = useQuery(api.orders.list, { limit: 50 }) || [];
  const allInquiries = useQuery(api.inquiries.list, { unreadOnly: true }) || [];

  const newOrders = allOrders.filter(o => o.status === "new");
  const unreadInquiries = allInquiries.filter(i => !i.read);

  const totalNotifications = newOrders.length + unreadInquiries.length;

  // Handle outside clicks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setBellOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "product": return <Package size={14} />;
      case "order": return <ShoppingBag size={14} />;
      case "customer": return <User size={14} />;
      case "inquiry": return <MessageSquare size={14} />;
      case "brand": return <Tag size={14} />;
      default: return <Search size={14} />;
    }
  };

  return (
    <div className="h-14 lg:h-16 px-3 lg:px-6 border-b border-gold/10 bg-noir flex items-center justify-between sticky top-0 z-40 gap-2">
      
      {/* Mobile Menu & Logo */}
      <div className="flex lg:hidden items-center gap-1 -ml-1 flex-shrink-0">
        <button onClick={onMenuClick} className="p-1.5 text-bone hover:bg-white/5 rounded-md transition-colors">
          <Menu size={20} />
        </button>
        <Link href="/admin" className="relative overflow-hidden h-[36px] w-[100px] flex-shrink-0 hidden sm:block">
          <Image src="/logo.png" alt="Ethereal Dayo" width={160} height={160} className="object-contain w-[140px] h-[140px] absolute top-1/2 left-[-10px] -translate-y-1/2" priority />
        </Link>
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-lg" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" size={14} />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            className="w-full bg-ink border border-gold/20 rounded-full py-1.5 lg:py-2 pl-9 pr-3 text-xs lg:text-sm text-bone placeholder:text-muted-text focus:outline-none focus:border-gold/50 transition-colors"
          />
          {searchTerm && (
            <button onClick={() => { setSearchTerm(""); setSearchOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text hover:text-bone">
              <X size={14} />
            </button>
          )}
        </div>

        <AnimatePresence>
          {searchOpen && searchTerm && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full mt-2 left-0 w-[500px] max-w-[calc(100vw-32px)] bg-ink border border-gold/20 rounded-xl shadow-2xl overflow-hidden z-50"
            >
              {searchResults.length > 0 ? (
                <div className="max-h-96 overflow-y-auto py-2">
                  <div className="px-3 py-1 text-[10px] uppercase tracking-widest text-gold font-body">Results</div>
                  {searchResults.map((res) => (
                    <button
                      key={`${res.type}-${res.id}`}
                      onClick={() => {
                        router.push(res.href);
                        setSearchOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-start gap-3 transition-colors border-b border-white/5 last:border-0"
                    >
                      <div className="w-8 h-8 rounded-md bg-bordeaux-deep/30 text-gold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {getIcon(res.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-bone font-body truncate">{res.title}</p>
                        <p className="text-xs text-muted-text font-body truncate mt-0.5">{res.subtitle}</p>
                      </div>
                      <span className="text-[10px] uppercase text-muted-text px-2 py-1 bg-white/5 rounded mt-1">
                        {res.type}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-sm text-muted-text font-body">
                  No results found for "{searchTerm}"
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Notifications */}
      <div className="relative ml-2 lg:ml-4 flex-shrink-0" ref={bellRef}>
        <button
          onClick={() => setBellOpen(!bellOpen)}
          className="relative p-2 text-muted-text hover:text-bone transition-colors rounded-full hover:bg-white/5 cursor-pointer"
        >
          <Bell size={20} />
          {totalNotifications > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-dusty-rose ring-2 ring-noir" />
          )}
        </button>

        <AnimatePresence>
          {bellOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transformTemplate={(_, generated) => `${generated} translateZ(0)`}
              className="absolute top-full mt-2 right-0 w-80 max-w-[calc(100vw-32px)] bg-ink border border-gold/20 rounded-xl shadow-2xl overflow-hidden z-50 origin-top-right"
            >
              <div className="px-4 py-3 border-b border-gold/10 flex items-center justify-between">
                <span className="font-body text-sm text-bone">Notifications</span>
                {totalNotifications > 0 && (
                  <span className="text-[10px] text-dusty-rose bg-dusty-rose/10 px-2 py-0.5 rounded-full font-medium">
                    {totalNotifications} new
                  </span>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {totalNotifications === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-text font-body">
                    You're all caught up!
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {newOrders.map(order => (
                      <Link
                        key={`order-${order._id}`}
                        href="/admin/orders"
                        onClick={() => setBellOpen(false)}
                        className="px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 flex items-start gap-3 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-full bg-gold/10 text-gold flex items-center justify-center flex-shrink-0 mt-0.5">
                          <ShoppingBag size={14} />
                        </div>
                        <div>
                          <p className="text-sm text-bone font-body">New Order <span className="text-gold">#{order.number}</span></p>
                          <p className="text-xs text-muted-text mt-0.5">{formatTimeAgo(order._creationTime)}</p>
                        </div>
                      </Link>
                    ))}
                    {unreadInquiries.map(inquiry => (
                      <Link
                        key={`inquiry-${inquiry._id}`}
                        href="/admin/inquiries"
                        onClick={() => setBellOpen(false)}
                        className="px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 flex items-start gap-3 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-full bg-dusty-rose/10 text-dusty-rose flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MessageSquare size={14} />
                        </div>
                        <div>
                          <p className="text-sm text-bone font-body">New Inquiry from <span className="text-bone truncate max-w-[120px] inline-block align-bottom">{inquiry.name}</span></p>
                          <p className="text-xs text-muted-text mt-0.5">{formatTimeAgo(inquiry._creationTime)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function formatTimeAgo(timestamp: number) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
