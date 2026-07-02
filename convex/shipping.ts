import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("shippingRates").collect();
  },
});

export const listActive = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("shippingRates")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    price: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("shippingRates", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("shippingRates"),
    name: v.optional(v.string()),
    price: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("shippingRates") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
