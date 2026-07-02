import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => await ctx.db.query("discountCodes").collect(),
});

export const create = mutation({
  args: {
    code: v.string(),
    type: v.union(v.literal("percent"), v.literal("fixed")),
    value: v.number(),
    minOrder: v.optional(v.number()),
    maxUses: v.optional(v.number()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("discountCodes", { ...args, usedCount: 0 });
  },
});

export const toggle = mutation({
  args: { id: v.id("discountCodes"), isActive: v.boolean() },
  handler: async (ctx, { id, isActive }) => await ctx.db.patch(id, { isActive }),
});

export const remove = mutation({
  args: { id: v.id("discountCodes") },
  handler: async (ctx, { id }) => await ctx.db.delete(id),
});

export const validate = query({
  args: { code: v.string(), subtotal: v.number() },
  handler: async (ctx, { code, subtotal }) => {
    const discount = await ctx.db
      .query("discountCodes")
      .filter((q) => q.and(q.eq(q.field("code"), code.toUpperCase()), q.eq(q.field("isActive"), true)))
      .unique();
    if (!discount) return { valid: false, message: "Invalid or expired code" };
    if (discount.minOrder && subtotal < discount.minOrder) {
      return { valid: false, message: `Minimum order of KES ${discount.minOrder} required` };
    }
    if (discount.maxUses && discount.usedCount >= discount.maxUses) {
      return { valid: false, message: "This code has reached its usage limit" };
    }
    const amount = discount.type === "percent"
      ? Math.round((subtotal * discount.value) / 100)
      : discount.value;
    return { valid: true, discount, amount };
  },
});
