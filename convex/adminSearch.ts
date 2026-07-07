import { query } from "./_generated/server";
import { v } from "convex/values";

export type SearchResult = {
  id: string;
  type: "product" | "order" | "customer" | "inquiry" | "brand";
  title: string;
  subtitle: string;
  href: string;
  image?: string;
  slug?: string;
};

export const global = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const term = args.searchTerm.trim().toLowerCase();
    if (!term) return [];

    const results: SearchResult[] = [];

    // Products
    const products = await ctx.db.query("products").collect();
    for (const p of products) {
      if (
        p.name.toLowerCase().includes(term) ||
        p.brandName.toLowerCase().includes(term)
      ) {
        results.push({
          id: p._id,
          type: "product",
          title: p.name,
          subtitle: p.brandName,
          href: `/admin/products/${p._id}`,
        });
      }
    }

    // Orders
    const orders = await ctx.db.query("orders").collect();
    for (const o of orders) {
      if (
        o.number.toLowerCase().includes(term) ||
        o.customerName.toLowerCase().includes(term) ||
        o.customerEmail.toLowerCase().includes(term)
      ) {
        results.push({
          id: o._id,
          type: "order",
          title: `Order ${o.number}`,
          subtitle: o.customerName,
          href: `/admin/orders`,
        });
      }
    }

    // Customers
    const customers = await ctx.db.query("customers").collect();
    for (const c of customers) {
      if (
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term)
      ) {
        results.push({
          id: c._id,
          type: "customer",
          title: c.name,
          subtitle: c.email,
          href: `/admin/customers`,
        });
      }
    }

    // Inquiries
    const inquiries = await ctx.db.query("inquiries").collect();
    for (const i of inquiries) {
      if (
        i.name.toLowerCase().includes(term) ||
        i.email.toLowerCase().includes(term) ||
        i.message.toLowerCase().includes(term)
      ) {
        results.push({
          id: i._id,
          type: "inquiry",
          title: i.name,
          subtitle: i.email,
          href: `/admin/inquiries`,
        });
      }
    }

    // Brands
    const brands = await ctx.db.query("brands").collect();
    for (const b of brands) {
      if (b.name.toLowerCase().includes(term)) {
        results.push({
          id: b._id,
          type: "brand",
          title: b.name,
          subtitle: "Brand",
          href: `/admin/brands`,
          slug: b.slug,
        });
      }
    }

    // Sort by relevance
    results.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();

      // 1. Exact match
      const aExact = aTitle === term;
      const bExact = bTitle === term;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      // 2. Starts with
      const aStarts = aTitle.startsWith(term);
      const bStarts = bTitle.startsWith(term);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      // 3. Type priority (brands/products first if same match level)
      const typeWeight: Record<string, number> = {
        brand: 1,
        product: 2,
        order: 3,
        customer: 4,
        inquiry: 5,
      };
      if (typeWeight[a.type] !== typeWeight[b.type]) {
        return typeWeight[a.type] - typeWeight[b.type];
      }

      return 0;
    });

    return results.slice(0, 15);
  },
});
