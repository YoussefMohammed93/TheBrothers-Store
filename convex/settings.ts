import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all settings
export const get = query({
  handler: async (ctx) => {
    const settings = await ctx.db.query("settings").first();
    return settings || null;
  },
});

// Get shipping settings specifically
export const getShippingSettings = query({
  handler: async (ctx) => {
    const settings = await ctx.db.query("settings").first();
    if (!settings) {
      return {
        shippingCost: 15,
        freeShippingThreshold: null,
      };
    }
    return {
      shippingCost: settings.shippingCost,
      freeShippingThreshold: settings.freeShippingThreshold,
    };
  },
});

// Save settings
export const save = mutation({
  args: {
    shippingCost: v.number(),
    freeShippingThreshold: v.union(v.number(), v.null()),
    defaultCurrency: v.optional(v.string()),
    storeName: v.optional(v.string()),
    storePhone: v.optional(v.string()),
    storeEmail: v.optional(v.string()),
    storeAddress: v.optional(v.string()),
    logo: v.optional(v.id("_storage")),
    showLogo: v.optional(v.boolean()),
    adhkarEnabled: v.optional(v.boolean()),
    adhkarInterval: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("settings").first();

    if (existing) {
      return await ctx.db.patch(existing._id, args);
    }

    return await ctx.db.insert("settings", args);
  },
});
