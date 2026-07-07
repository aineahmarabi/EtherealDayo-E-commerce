"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatPrice } from "@/lib/utils";
import { Search } from "lucide-react";
import { useState } from "react";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const customers = useQuery(api.customers.list);

  const filtered = customers?.filter(
    (c) =>
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-bone">Customers</h1>
          <p className="text-sm text-muted-text font-body mt-1">Guest customers derived from orders. No accounts.</p>
        </div>
      </div>

      <div className="relative max-w-sm flex items-center">
        <Search size={13} className="absolute left-3 text-muted-text pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers…"
          className="pl-8 pr-4 py-2 text-xs bg-bordeaux-deep/10 border border-gold/15 rounded-lg text-bone font-body placeholder:text-muted-text focus:border-gold/40 focus:outline-none w-full transition-colors"
        />
      </div>

      <div className="rounded-2xl border border-gold/10 overflow-hidden">
        {customers === undefined ? (
          <div className="p-6 flex flex-col gap-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead className="border-b border-gold/10 bg-bordeaux-deep/10">
                <tr>
                  {["Name", "Email", "Phone", "Orders", "Total Spent"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] tracking-widest uppercase text-muted-text whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/5">
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-text">No customers found</td></tr>
                ) : filtered.map((customer) => (
                  <tr key={customer._id} className="hover:bg-bordeaux-deep/10 transition-colors">
                    <td className="px-4 py-3 text-bone">{customer.name}</td>
                    <td className="px-4 py-3 text-muted-text text-xs">{customer.email}</td>
                    <td className="px-4 py-3 text-bone/60 text-xs">{customer.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-bone/70">{customer.totalOrders}</td>
                    <td className="px-4 py-3 text-bone">{formatPrice(customer.totalSpent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
