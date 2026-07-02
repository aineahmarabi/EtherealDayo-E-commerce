import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { unreadOnly: v.optional(v.boolean()) },
  handler: async (ctx, { unreadOnly }) => {
    const all = await ctx.db.query("inquiries").order("desc").collect();
    return unreadOnly ? all.filter((i) => !i.read) : all;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("inquiries", {
      ...args,
      read: false,
      emailSent: false,
    });
  },
});

export const markRead = mutation({
  args: { id: v.id("inquiries") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { read: true });
  },
});

export const unreadCount = query({
  handler: async (ctx) => {
    const all = await ctx.db.query("inquiries").collect();
    return all.filter((i) => !i.read).length;
  },
});
