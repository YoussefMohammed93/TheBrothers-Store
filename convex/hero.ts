import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get the hero data
export const getHero = query({
  args: {},
  handler: async (ctx) => {
    const hero = await ctx.db.query("hero").first();
    return hero || null;
  },
});

// Save the hero data
export const saveHero = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    mainImage: v.union(v.id("_storage"), v.null()),
    primaryButtonText: v.string(),
    primaryButtonHref: v.string(),
    secondaryButtonText: v.string(),
    secondaryButtonHref: v.string(),
    customerCount: v.number(),
    customerText: v.string(),
    customerImages: v.array(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("hero").first();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        ...args,
        mainImage: args.mainImage ?? undefined,
      });
    } else {
      return await ctx.db.insert("hero", {
        ...args,
        mainImage: args.mainImage ?? undefined,
      });
    }
  },
});
