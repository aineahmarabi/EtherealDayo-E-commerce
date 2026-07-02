import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const logMiss = mutation({
  args: { term: v.string() },
  handler: async (ctx, { term }) => {
    const existing = await ctx.db
      .query("searchMisses")
      .withIndex("by_term", (q) => q.eq("term", term.toLowerCase()))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        count: existing.count + 1,
        lastAt: Date.now(),
      });
    } else {
      await ctx.db.insert("searchMisses", {
        term: term.toLowerCase(),
        count: 1,
        lastAt: Date.now(),
      });
    }
  },
});

export const getMisses = query({
  handler: async (ctx) => {
    const misses = await ctx.db.query("searchMisses").collect();
    return misses.sort((a, b) => b.count - a.count);
  },
});
