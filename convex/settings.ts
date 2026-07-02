import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const DEFAULT_PIN = "14328";

export const get = query({
  handler: async (ctx) => {
    const rows = await ctx.db.query("settings").collect();
    return Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<string, any>;
  },
});

export const upsert = mutation({
  args: { key: v.string(), value: v.any() },
  handler: async (ctx, { key, value }) => {
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { value });
    } else {
      await ctx.db.insert("settings", { key, value });
    }
  },
});

export const verifyPin = mutation({
  args: { pin: v.string() },
  handler: async (ctx, { pin }) => {
    const stored = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "adminPin"))
      .unique();
    const correctPin = stored ? String(stored.value) : DEFAULT_PIN;
    return pin === correctPin;
  },
});

export const updatePin = mutation({
  args: { currentPin: v.string(), newPin: v.string() },
  handler: async (ctx, { currentPin, newPin }) => {
    const stored = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "adminPin"))
      .unique();
    const correctPin = stored ? String(stored.value) : DEFAULT_PIN;
    if (currentPin !== correctPin) {
      throw new Error("Current PIN is incorrect");
    }
    if (newPin.length < 4) {
      throw new Error("PIN must be at least 4 digits");
    }
    if (stored) {
      await ctx.db.patch(stored._id, { value: newPin });
    } else {
      await ctx.db.insert("settings", { key: "adminPin", value: newPin });
    }
    return true;
  },
});
