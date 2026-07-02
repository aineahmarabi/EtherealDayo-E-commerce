import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("customers").order("desc").collect();
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("customers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
  },
});

export const updateTags = mutation({
  args: { id: v.id("customers"), tags: v.array(v.string()) },
  handler: async (ctx, { id, tags }) => {
    await ctx.db.patch(id, { tags });
  },
});

export const updateNotes = mutation({
  args: { id: v.id("customers"), notes: v.string() },
  handler: async (ctx, { id, notes }) => {
    await ctx.db.patch(id, { notes });
  },
});
