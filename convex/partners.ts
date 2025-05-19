import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all partners ordered by their position
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("partners").order("asc").collect();
  },
});

// Get the partners page data
export const getPartnersPage = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("partnersPage").first();
  },
});

// Get all partners with their image URLs
export const getPartners = query({
  handler: async (ctx) => {
    const partners = await ctx.db
      .query("partners")
      .withIndex("by_order")
      .order("asc")
      .collect();

    const partnersWithUrls = await Promise.all(
      partners.map(async (partner) => ({
        ...partner,
        imageUrl: await ctx.storage.getUrl(partner.image),
      }))
    );

    return partnersWithUrls;
  },
});

// Save the partners page data
export const savePage = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    isVisible: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("partnersPage").first();

    if (existing) {
      return await ctx.db.patch(existing._id, args);
    }

    return await ctx.db.insert("partnersPage", args);
  },
});

// Save a partner
export const savePartner = mutation({
  args: {
    id: v.optional(v.id("partners")),
    name: v.string(),
    image: v.id("_storage"),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;

    if (id) {
      return await ctx.db.patch(id, data);
    }

    const partners = await ctx.db.query("partners").collect();
    return await ctx.db.insert("partners", {
      ...data,
      order: args.order ?? partners.length,
    });
  },
});

// Delete a partner
export const deletePartner = mutation({
  args: {
    id: v.id("partners"),
  },
  handler: async (ctx, { id }) => {
    const partner = await ctx.db.get(id);
    if (partner?.image) {
      await ctx.storage.delete(partner.image);
    }
    await ctx.db.delete(id);
  },
});

// Update the order of partners
export const updatePartnersOrder = mutation({
  args: {
    partners: v.array(
      v.object({
        id: v.id("partners"),
        order: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    await Promise.all(
      args.partners.map(({ id, order }) => ctx.db.patch(id, { order }))
    );
    return true;
  },
});
