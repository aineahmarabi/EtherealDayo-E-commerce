import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  brands: defineTable({
    name: v.string(),
    slug: v.string(),
    logo: v.optional(v.string()),
    description: v.string(),
    order: v.number(),
  }).index("by_slug", ["slug"]),

  products: defineTable({
    name: v.string(),
    slug: v.string(),
    brandId: v.id("brands"),
    brandName: v.string(),
    audience: v.union(v.literal("her"), v.literal("him"), v.literal("unisex")),
    family: v.string(),
    notesTop: v.array(v.string()),
    notesHeart: v.array(v.string()),
    notesBase: v.array(v.string()),
    perfumer: v.string(),
    year: v.number(),
    sillage: v.number(),
    longevity: v.number(),
    intensity: v.number(),
    story: v.string(),
    images: v.array(v.string()),
    isBestseller: v.boolean(),
    publishedAt: v.number(),
    status: v.union(v.literal("active"), v.literal("draft")),
  })
    .index("by_slug", ["slug"])
    .index("by_audience", ["audience"])
    .index("by_bestseller", ["isBestseller"])
    .index("by_brand", ["brandId"])
    .index("by_status", ["status"]),

  variants: defineTable({
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
  }).index("by_product", ["productId"]),

  orders: defineTable({
    number: v.string(),
    channel: v.union(v.literal("web"), v.literal("manual")),
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.optional(v.string()),
    shippingAddress: v.optional(
      v.object({
        line1: v.string(),
        line2: v.optional(v.string()),
        city: v.string(),
        state: v.string(),
        zip: v.string(),
        country: v.string(),
      })
    ),
    lineItems: v.array(
      v.object({
        variantId: v.string(),
        productName: v.string(),
        size: v.string(),
        concentration: v.string(),
        qty: v.number(),
        price: v.number(),
      })
    ),
    subtotal: v.number(),
    shipping: v.number(),
    tax: v.number(),
    total: v.number(),
    giftMessage: v.optional(v.string()),
    status: v.union(
      v.literal("new"),
      v.literal("fulfilled"),
      v.literal("refunded"),
      v.literal("cancelled")
    ),
    emailSent: v.optional(v.boolean()),
    stripePaymentIntentId: v.optional(v.string()),
  })
    .index("by_number", ["number"])
    .index("by_email", ["customerEmail"])
    .index("by_status", ["status"]),

  customers: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    tags: v.array(v.string()),
    notes: v.optional(v.string()),
    totalOrders: v.number(),
    totalSpent: v.number(),
  }).index("by_email", ["email"]),

  inquiries: defineTable({
    name: v.string(),
    email: v.string(),
    message: v.string(),
    read: v.boolean(),
    emailSent: v.optional(v.boolean()),
  }),

  searchMisses: defineTable({
    term: v.string(),
    count: v.number(),
    lastAt: v.number(),
  }).index("by_term", ["term"]),

  settings: defineTable({
    key: v.string(),
    value: v.any(),
  }).index("by_key", ["key"]),

  shippingRates: defineTable({
    name: v.string(),
    price: v.number(),
    isActive: v.boolean(),
  }),

  discountCodes: defineTable({
    code: v.string(),
    type: v.union(v.literal("percent"), v.literal("fixed")),
    value: v.number(),
    minOrder: v.optional(v.number()),
    maxUses: v.optional(v.number()),
    usedCount: v.number(),
    isActive: v.boolean(),
  }),

  giftSets: defineTable({
    name: v.string(),
    description: v.string(),
    productIds: v.array(v.id("products")),
    price: v.number(),
    isActive: v.boolean(),
  }),
});
