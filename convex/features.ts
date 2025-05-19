import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all features ordered by their position
export const getFeatures = query({
  handler: async (ctx) => {
    const features = await ctx.db
      .query("features")
      .withIndex("by_order")
      .order("asc")
      .collect();

    const featuresWithUrls = await Promise.all(
      features.map(async (feature) => ({
        ...feature,
        imageUrl: await ctx.storage.getUrl(feature.image),
      }))
    );

    return featuresWithUrls;
  },
});

// Get the features page data
export const getFeaturesPage = query({
  handler: async (ctx) => {
    return await ctx.db.query("featuresPage").first();
  },
});

// Save the features page data
export const saveFeaturesPage = mutation({
  args: {
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    isVisible: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("featuresPage").first();
    if (existing) {
      const updates: {
        title?: string;
        description?: string;
        isVisible?: boolean;
      } = {};
      if (args.title !== undefined) updates.title = args.title;
      if (args.description !== undefined)
        updates.description = args.description;
      if (args.isVisible !== undefined) updates.isVisible = args.isVisible;
      return await ctx.db.patch(existing._id, updates);
    }
    return await ctx.db.insert("featuresPage", {
      title: args.title ?? "",
      description: args.description ?? "",
      isVisible: args.isVisible ?? true,
    });
  },
});

// Save a feature
export const saveFeature = mutation({
  args: {
    id: v.optional(v.id("features")),
    name: v.string(),
    description: v.string(),
    image: v.id("_storage"),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    if (id) {
      return await ctx.db.patch(id, data);
    }
    const features = await ctx.db.query("features").collect();
    return await ctx.db.insert("features", {
      ...data,
      order: args.order ?? features.length,
    });
  },
});

// Delete a feature
export const deleteFeature = mutation({
  args: {
    id: v.id("features"),
  },
  handler: async (ctx, args) => {
    const feature = await ctx.db.get(args.id);
    if (!feature) {
      throw new Error("Feature not found");
    }

    if (feature.image) {
      await ctx.storage.delete(feature.image);
    }

    await ctx.db.delete(args.id);
    return true;
  },
});

// Update the order of features
export const updateFeaturesOrder = mutation({
  args: {
    features: v.array(
      v.object({
        id: v.id("features"),
        order: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    await Promise.all(
      args.features.map(({ id, order }) => ctx.db.patch(id, { order }))
    );
    return true;
  },
});
