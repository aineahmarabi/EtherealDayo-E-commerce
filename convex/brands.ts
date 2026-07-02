import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("brands").order("asc").collect();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("brands")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    logo: v.optional(v.string()),
    description: v.string(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("brands", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("brands"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    logo: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("brands") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
