import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

const lineItemValidator = v.object({
  variantId: v.string(),
  productName: v.string(),
  size: v.string(),
  concentration: v.string(),
  qty: v.number(),
  price: v.number(),
});

const addressValidator = v.object({
  line1: v.string(),
  line2: v.optional(v.string()),
  city: v.string(),
  state: v.string(),
  zip: v.string(),
  country: v.string(),
});

export const list = query({
  args: {
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { status, limit = 50 }) => {
    let q = ctx.db.query("orders").order("desc");
    if (status) {
      q = ctx.db
        .query("orders")
        .withIndex("by_status", (idx) => idx.eq("status", status as "new" | "dispatched" | "fulfilled" | "refunded" | "cancelled"))
        .order("desc");
    }
    const results = await q.collect();
    return results.slice(0, limit);
  },
});

export const getByNumber = query({
  args: { number: v.string() },
  handler: async (ctx, { number }) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_number", (q) => q.eq("number", number))
      .unique();
  },
});

export const create = mutation({
  args: {
    number: v.string(),
    channel: v.union(v.literal("web"), v.literal("manual")),
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.optional(v.string()),
    shippingAddress: v.optional(addressValidator),
    lineItems: v.array(lineItemValidator),
    subtotal: v.number(),
    shipping: v.number(),
    tax: v.number(),
    total: v.number(),
    giftMessage: v.optional(v.string()),
    stripePaymentIntentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Generate sequential order ID
    const allOrders = await ctx.db.query("orders").collect();
    const sequence = allOrders.length + 1;
    const finalNumber = `ED-${sequence.toString().padStart(5, "0")}`;

    const { number, ...restArgs } = args;

    const orderId = await ctx.db.insert("orders", {
      ...restArgs,
      number: finalNumber,
      status: "new",
      emailSent: false,
    });

    // Decrement stock for each line item
    for (const item of args.lineItems) {
      const variants = await ctx.db.query("variants").collect();
      const variant = variants.find((v) => v._id.toString() === item.variantId);
      if (variant) {
        await ctx.db.patch(variant._id, { stock: variant.stock - item.qty });
      }
    }

    // Upsert customer record
    const existing = await ctx.db
      .query("customers")
      .withIndex("by_email", (q) => q.eq("email", args.customerEmail))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        totalOrders: existing.totalOrders + 1,
        totalSpent: existing.totalSpent + args.total,
        name: args.customerName,
      });
    } else {
      await ctx.db.insert("customers", {
        name: args.customerName,
        email: args.customerEmail,
        phone: args.customerPhone,
        tags: [],
        totalOrders: 1,
        totalSpent: args.total,
      });
    }

    return orderId;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("orders"),
    status: v.union(
      v.literal("new"),
      v.literal("dispatched"),
      v.literal("fulfilled"),
      v.literal("refunded"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, { id, status }) => {
    const order = await ctx.db.get(id);
    if (!order) throw new Error("Order not found");

    const oldStatus = order.status;

    // Fulfill: Deduct inventory
    if (status === "fulfilled" && oldStatus !== "fulfilled") {
      for (const item of order.lineItems) {
        const variantId = ctx.db.normalizeId("variants", item.variantId);
        if (variantId) {
          const variant = await ctx.db.get(variantId);
          if (variant) {
            await ctx.db.patch(variantId, { stock: variant.stock - item.qty });
          }
        }
      }
    }

    // Cancel/Refund: Restore inventory if it was previously fulfilled
    if ((status === "cancelled" || status === "refunded") && oldStatus === "fulfilled") {
      for (const item of order.lineItems) {
        const variantId = ctx.db.normalizeId("variants", item.variantId);
        if (variantId) {
          const variant = await ctx.db.get(variantId);
          if (variant) {
            await ctx.db.patch(variantId, { stock: variant.stock + item.qty });
          }
        }
      }
    }

    await ctx.db.patch(id, { status });
  },
});

export const metrics = query({
  args: {
    from: v.number(),
    to: v.number(),
  },
  handler: async (ctx, { from, to }) => {
    const orders = await ctx.db
      .query("orders")
      .filter((q) =>
        q.and(
          q.gte(q.field("_creationTime"), from),
          q.lte(q.field("_creationTime"), to),
          q.neq(q.field("status"), "refunded"),
          q.neq(q.field("status"), "cancelled")
        )
      )
      .collect();

    const revenue = orders.reduce((sum, o) => sum + o.total, 0);
    const count = orders.length;
    const avgOrder = count > 0 ? revenue / count : 0;
    const totalItems = orders.reduce((sum, o) => sum + o.lineItems.reduce((s, i) => s + i.qty, 0), 0);

    // Generate 10 data points for the sparklines
    const points = 10;
    const interval = (to - from) / points;
    const chartData = {
      revenue: Array(points).fill(0),
      count: Array(points).fill(0),
      totalItems: Array(points).fill(0),
    };

    if (interval > 0) {
      orders.forEach((o) => {
        let bucket = Math.floor((o._creationTime - from) / interval);
        if (bucket >= points) bucket = points - 1;
        if (bucket < 0) bucket = 0;
        
        chartData.revenue[bucket] += o.total;
        chartData.count[bucket] += 1;
        chartData.totalItems[bucket] += o.lineItems.reduce((s, i) => s + i.qty, 0);
      });
    }

    return { revenue, count, avgOrder, totalItems, chartData };
  },
});

export const remove = mutation({
  args: { id: v.id("orders") },
  handler: async (ctx, { id }) => {
    const order = await ctx.db.get(id);
    if (!order) return;

    // If deleting a fulfilled order, restore inventory
    if (order.status === "fulfilled") {
      for (const item of order.lineItems) {
        const variantId = ctx.db.normalizeId("variants", item.variantId);
        if (variantId) {
          const variant = await ctx.db.get(variantId);
          if (variant) {
            await ctx.db.patch(variantId, { stock: variant.stock + item.qty });
          }
        }
      }
    }

    await ctx.db.delete(id);
  },
});
