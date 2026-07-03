import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

const productsToSeed = [
  { name: "Yara Moi EDP 100ml by Lattafa", price: 1900, stock: 3, brand: "Lattafa" },
  { name: "Tharwah Gold Perfumes Natural Spray EDP 100ml (3.4 oz)", price: 2450, stock: 3, brand: "Lattafa" },
  { name: "John Gustav Homme Classic EDP 100ml by Fragrance World", price: 1200, stock: 3, brand: "Fragrance World" },
  { name: "Now Women 100ml EDP by RAVE - Lattafa", price: 1550, stock: 3, brand: "RAVE" },
  { name: "Asad Zanzibar 100ml Spray", price: 1900, stock: 3, brand: "Lattafa" },
  { name: "Night Club Silky EDP 100ml by French Avenue", price: 1450, stock: 3, brand: "French Avenue" },
  { name: "Ebony Fume 80ml by Fragrance World", price: 1200, stock: 3, brand: "Fragrance World" },
  { name: "Tuscany Leather EDP 80ml by Fragrance World", price: 1200, stock: 3, brand: "Fragrance World" },
  { name: "Delilah Pour Femme by Maison Alhambra EDP", price: 1250, stock: 3, brand: "Maison Alhambra" },
  { name: "Proud of You Leather 100ml EDP by Fragrance World", price: 1150, stock: 3, brand: "Fragrance World" },
  { name: "Ana Abiyedh Rouge EDP 60ml by Lattafa", price: 1350, stock: 3, brand: "Lattafa" },
  { name: "Heibah 100ml by Ard Al Zaafaran", price: 1400, stock: 3, brand: "Ard Al Zaafaran" },
  { name: "Cocktail Intense 100ml by Fragrance World", price: 1150, stock: 3, brand: "Fragrance World" },
  { name: "Vulcan Feu 100ml French Avenue", price: 2750, stock: 3, brand: "French Avenue" },
  { name: "Cocoa Morado 100ml EDP by Fragrance World", price: 2700, stock: 3, brand: "Fragrance World" },
  { name: "Proud of You Tobacco 100ml by French Avenue", price: 1150, stock: 3, brand: "French Avenue" },
  { name: "Khamrah Qahwa EDP 100ml", price: 2500, stock: 3, brand: "Lattafa" },
  { name: "Imperium EDP by Fragrance World 100ml", price: 1350, stock: 3, brand: "Fragrance World" },
  { name: "Yara Candy 100ml", price: 1900, stock: 3, brand: "Lattafa" },
  { name: "Bade'e Al Oud Amethyst EDP Spray by Lattafa", price: 2150, stock: 3, brand: "Lattafa" },
  { name: "Teriaq Intense 100ml by Lattafa", price: 2700, stock: 3, brand: "Lattafa" },
  { name: "Just Wardi Edp 100ml", price: 1450, stock: 3, brand: "Fragrance World" },
  { name: "Nebras Perfumes Natural Spray EDP 100ml / 3.4 oz", price: 2450, stock: 3, brand: "Lattafa" },
  { name: "Sweet Paradise Edp 100ml French Avenue", price: 3000, stock: 3, brand: "French Avenue" },
  { name: "Asad 100ml EDP", price: 1900, stock: 3, brand: "Lattafa" },
  { name: "Ramz Lattafa Silver 100ml", price: 1300, stock: 3, brand: "Lattafa" },
  { name: "Atheeri EDP 100ml by Lattafa", price: 2700, stock: 3, brand: "Lattafa" },
  { name: "Khamrah by Lattafa", price: 2500, stock: 3, brand: "Lattafa" },
  { name: "Azzure Oud 100ml by Fragrance World", price: 2900, stock: 3, brand: "Fragrance World" },
  { name: "Éclair Affair 100ml French Avenue", price: 2700, stock: 3, brand: "French Avenue" },
  { name: "Sh'mallow Fluff 100ml Edp French Avenue", price: 2700, stock: 3, brand: "French Avenue" },
  { name: "Mashrabya by Lattafa 100ml", price: 1800, stock: 3, brand: "Lattafa" },
  { name: "Khamrah Dukhan EDP 100ml", price: 2500, stock: 3, brand: "Lattafa" },
  { name: "Lattafa Yara EDP Spray 50Ml", price: 350, stock: 3, brand: "Lattafa" },
  { name: "Yara by Lattafa Perfume For Women 3.4oz / 100ml New EDP", price: 1900, stock: 3, brand: "Lattafa" },
  { name: "Liquid Brun EDP 100ml", price: 2700, stock: 3, brand: "Lattafa" },
  { name: "Angam", price: 2600, stock: 3, brand: "Lattafa" },
  { name: "Angam Second Song", price: 2900, stock: 3, brand: "Lattafa" },
  { name: "Alqiam", price: 2450, stock: 3, brand: "Lattafa" },
  { name: "Lushcherry", price: 1200, stock: 3, brand: "Fragrance World" },
  { name: "Fakhar", price: 1800, stock: 3, brand: "Lattafa" },
  { name: "Qimmah", price: 1250, stock: 3, brand: "Lattafa" },
  { name: "Just Aswad", price: 1250, stock: 3, brand: "Fragrance World" },
  { name: "Ideal", price: 1150, stock: 3, brand: "Fragrance World" },
  { name: "Afeef", price: 2700, stock: 3, brand: "Lattafa" }
];

export const run = internalMutation({
  handler: async (ctx) => {
    let order = 10;
    for (const item of productsToSeed) {
      // Find or create brand
      let brandSlug = item.brand.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      let brand = await ctx.db
        .query("brands")
        .withIndex("by_slug", (q) => q.eq("slug", brandSlug))
        .first();

      if (!brand) {
        const brandId = await ctx.db.insert("brands", {
          name: item.brand,
          slug: brandSlug,
          description: `Discover fragrances from ${item.brand}`,
          order: order++,
        });
        brand = await ctx.db.get(brandId);
      }

      const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      
      const existingProduct = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();

      let productId = existingProduct?._id;

      if (!existingProduct) {
        productId = await ctx.db.insert("products", {
          name: item.name,
          slug: slug,
          brandId: brand!._id,
          brandName: brand!.name,
          audience: "unisex",
          family: "Amber Woody", // Default
          notesTop: ["Bergamot", "Spices"],
          notesHeart: ["Floral Notes", "Woods"],
          notesBase: ["Amber", "Musk", "Vanilla"],
          perfumer: "Unknown",
          year: new Date().getFullYear(),
          sillage: 70,
          longevity: 70,
          intensity: 70,
          story: `Experience the captivating aroma of ${item.name}.`,
          images: [],
          isBestseller: false,
          publishedAt: Date.now(),
          status: "active",
        });
      }

      // Add a variant for price and stock
      await ctx.db.insert("variants", {
        productId: productId!,
        size: "100ml", // Default, can be adjusted by owner later
        concentration: "EDP", // Default
        price: item.price,
        sku: slug + "-100ml",
        stock: item.stock,
      });
    }

    return `Inserted ${productsToSeed.length} products`;
  },
});
