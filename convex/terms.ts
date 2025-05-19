import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Update terms
export const update = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    introduction: v.string(),
    accountTerms: v.string(),
    paymentTerms: v.string(),
    shippingPolicy: v.string(),
    returnPolicy: v.string(),
    introductionVisible: v.boolean(),
    accountTermsVisible: v.boolean(),
    paymentTermsVisible: v.boolean(),
    shippingPolicyVisible: v.boolean(),
    returnPolicyVisible: v.boolean(),
    contactInfoVisible: v.boolean(),
    isVisible: v.boolean(),
    contactInfo: v.object({
      email: v.string(),
      phone: v.string(),
      address: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const termsId = await ctx.db.query("terms").first();

    if (!termsId) {
      return ctx.db.insert("terms", {
        ...args,
        lastUpdated: new Date().toISOString(),
      });
    }

    return ctx.db.patch(termsId._id, {
      ...args,
      lastUpdated: new Date().toISOString(),
    });
  },
});

// Get terms
export const get = query({
  handler: async (ctx) => {
    return ctx.db.query("terms").first();
  },
});
