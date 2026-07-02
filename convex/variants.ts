import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByProduct = query({
  args: { productId: v.id("products") },
  handler: async (ctx, { productId }) => {
    return await ctx.db
      .query("variants")
      .withIndex("by_product", (q) => q.eq("productId", productId))
      .collect();
  },
});

export const listAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("variants").collect();
  },
});

export const create = mutation({
  args: {
    productId: v.id("products"),
    size: v.string(),
    concentration: v.union(
      v.literal("EDP"),
      v.literal("Parfum"),
      v.literal("Extrait"),
      v.literal("EDT")
    ),
    price: v.number(),
    sku: v.string(),
    stock: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("variants", args);
  },
});

export const adjustStock = mutation({
  args: { id: v.id("variants"), delta: v.number() },
  handler: async (ctx, { id, delta }) => {
    const variant = await ctx.db.get(id);
    if (!variant) throw new Error("Variant not found");
    await ctx.db.patch(id, { stock: variant.stock + delta });
  },
});

export const update = mutation({
  args: {
    id: v.id("variants"),
    price: v.optional(v.number()),
    stock: v.optional(v.number()),
    sku: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("variants") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
