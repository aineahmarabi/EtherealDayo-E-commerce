import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const record = mutation({
  args: { path: v.string() },
  handler: async (ctx, { path }) => {
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const existing = await ctx.db
      .query("pageViews")
      .withIndex("by_path_date", (q) => q.eq("path", path).eq("date", date))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { count: existing.count + 1 });
    } else {
      await ctx.db.insert("pageViews", { path, date, count: 1 });
    }
  },
});

export const getSummary = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, { days = 30 }) => {
    const all = await ctx.db.query("pageViews").collect();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffStr = cutoffDate.toISOString().slice(0, 10);

    const filtered = all.filter((v) => v.date >= cutoffStr);

    // Total visits
    const totalVisits = filtered.reduce((s, v) => s + v.count, 0);

    // Top pages
    const pageTotals: Record<string, number> = {};
    for (const v of filtered) {
      pageTotals[v.path] = (pageTotals[v.path] ?? 0) + v.count;
    }
    const topPages = Object.entries(pageTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }));

    // Daily visits (last N days)
    const dailyMap: Record<string, number> = {};
    for (const v of filtered) {
      dailyMap[v.date] = (dailyMap[v.date] ?? 0) + v.count;
    }
    const dailyVisits = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    return { totalVisits, topPages, dailyVisits };
  },
});
