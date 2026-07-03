import { query, mutation, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

async function withImageUrls(ctx: QueryCtx, product: any) {
  const images = await Promise.all(product.images.map(async (img: string) => {
    if (!img) return null;
    if (img.includes("/api/storage/")) {
      const id = img.split("/api/storage/")[1].split("?")[0];
      try {
        const file = await ctx.db.get(id as Id<"_storage">);
        if (!file) return null;
        return await ctx.storage.getUrl(id as Id<"_storage">);
      } catch {
        return null;
      }
    }
    if (!img.includes("/") && img.trim() !== "") {
      try {
        const file = await ctx.db.get(img as Id<"_storage">);
        if (!file) return null;
        return await ctx.storage.getUrl(img as Id<"_storage">);
      } catch {}
      return null;
    }
    return img;
  }));
  
  const validImages = images.filter((img): img is string => img !== null && img !== "");

  const variants = await ctx.db
    .query("variants")
    .withIndex("by_product", (q) => q.eq("productId", product._id))
    .collect();
  return { ...product, images: validImages, variants };
}

export const listActive = query({
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
    return await Promise.all(products.map(p => withImageUrls(ctx, p)));
  },
});

export const listByAudience = query({
  args: { audience: v.union(v.literal("her"), v.literal("him")) },
  handler: async (ctx, { audience }) => {
    const her = await ctx.db
      .query("products")
      .withIndex("by_audience", (q) => q.eq("audience", audience))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
    const unisex = await ctx.db
      .query("products")
      .withIndex("by_audience", (q) => q.eq("audience", "unisex"))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
    const all = [...her, ...unisex];
    return await Promise.all(all.map(p => withImageUrls(ctx, p)));
  },
});

export const listBestsellers = query({
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_bestseller", (q) => q.eq("isBestseller", true))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
    return await Promise.all(products.map(p => withImageUrls(ctx, p)));
  },
});

export const listNewArrivals = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, { days = 30 }) => {
    const cutoff = Date.now() - days * 86400000;
    const all = await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
    const newArrivals = all.filter((p) => p.publishedAt >= cutoff);
    return await Promise.all(newArrivals.map(p => withImageUrls(ctx, p)));
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!product) return null;
    const variants = await ctx.db
      .query("variants")
      .withIndex("by_product", (q) => q.eq("productId", product._id))
      .collect();
    const pWithImages = await withImageUrls(ctx, product);
    return { ...pWithImages, variants };
  },
});

export const listByBrand = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, { brandId }) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_brand", (q) => q.eq("brandId", brandId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
    return await Promise.all(products.map(p => withImageUrls(ctx, p)));
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, { query: q }) => {
    if (!q.trim()) return [];
    const lower = q.toLowerCase();
    const all = await ctx.db
      .query("products")
      .withIndex("by_status", (s) => s.eq("status", "active"))
      .collect();
    const results = all.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.brandName.toLowerCase().includes(lower) ||
        p.family.toLowerCase().includes(lower) ||
        [...p.notesTop, ...p.notesHeart, ...p.notesBase].some((n) =>
          n.toLowerCase().includes(lower)
        )
    );
    return await Promise.all(results.map(p => withImageUrls(ctx, p)));
  },
});

export const listAll = query({
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    return await Promise.all(products.map(p => withImageUrls(ctx, p)));
  }
});

export const getById = query({
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => {
    const product = await ctx.db.get(id);
    if (!product) return null;
    return await withImageUrls(ctx, product);
  },
});

export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => {
    // Remove all variants first
    const variants = await ctx.db
      .query("variants")
      .withIndex("by_product", (q) => q.eq("productId", id))
      .collect();
    for (const v of variants) {
      await ctx.db.delete(v._id);
    }
    await ctx.db.delete(id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    brandId: v.id("brands"),
    brandName: v.string(),
    audience: v.union(v.literal("her"), v.literal("him"), v.literal("unisex")),
    family: v.string(),
    notesTop: v.array(v.string()),
    notesHeart: v.array(v.string()),
    notesBase: v.array(v.string()),
    perfumer: v.string(),
    year: v.number(),
    sillage: v.number(),
    longevity: v.number(),
    intensity: v.number(),
    story: v.string(),
    images: v.array(v.string()),
    isBestseller: v.boolean(),
    publishedAt: v.number(),
    status: v.union(v.literal("active"), v.literal("draft")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("products", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    story: v.optional(v.string()),
    family: v.optional(v.string()),
    perfumer: v.optional(v.string()),
    year: v.optional(v.number()),
    sillage: v.optional(v.number()),
    longevity: v.optional(v.number()),
    intensity: v.optional(v.number()),
    notesTop: v.optional(v.array(v.string())),
    notesHeart: v.optional(v.array(v.string())),
    notesBase: v.optional(v.array(v.string())),
    audience: v.optional(v.union(v.literal("her"), v.literal("him"), v.literal("unisex"))),
    isBestseller: v.optional(v.boolean()),
    status: v.optional(v.union(v.literal("active"), v.literal("draft"))),
    images: v.optional(v.array(v.string())),
    publishedAt: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch);
  },
});
