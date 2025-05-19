import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all coupons
export const getCoupons = query({
  handler: async (ctx) => {
    const coupons = await ctx.db.query("coupons").collect();
    return coupons;
  },
});

// Get a coupon by code
export const getCouponByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const coupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    return coupon;
  },
});

// Create a new coupon
export const createCoupon = mutation({
  args: {
    name: v.string(),
    code: v.string(),
    discountPercentage: v.number(),
    usageLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existingCoupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (existingCoupon) {
      throw new Error("Coupon code already exists");
    }

    const couponId = await ctx.db.insert("coupons", {
      name: args.name,
      code: args.code,
      discountPercentage: args.discountPercentage,
      usageLimit: args.usageLimit,
      usageCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return couponId;
  },
});

// Update an existing coupon
export const updateCoupon = mutation({
  args: {
    id: v.id("coupons"),
    name: v.optional(v.string()),
    code: v.optional(v.string()),
    discountPercentage: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    usageLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const coupon = await ctx.db.get(id);
    if (!coupon) {
      throw new Error("Coupon not found");
    }

    if (updates.code && updates.code !== coupon.code) {
      const existingCoupon = await ctx.db
        .query("coupons")
        .withIndex("by_code", (q) => q.eq("code", updates.code!))
        .first();

      if (existingCoupon) {
        throw new Error("Coupon code already exists");
      }
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    return id;
  },
});

// Delete a coupon
export const deleteCoupon = mutation({
  args: { id: v.id("coupons") },
  handler: async (ctx, args) => {
    const coupon = await ctx.db.get(args.id);
    if (!coupon) {
      throw new Error("Coupon not found");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Generate a random coupon code
export const generateCouponCode = mutation({
  handler: async () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  },
});

// Validate a coupon code
export const validateCoupon = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const coupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (!coupon) {
      return { valid: false, message: "Coupon not found" };
    }

    if (!coupon.isActive) {
      return { valid: false, message: "Coupon is not active" };
    }

    if (coupon.usageLimit !== undefined && coupon.usageCount !== undefined) {
      if (coupon.usageCount >= coupon.usageLimit) {
        return { valid: false, message: "Coupon usage limit reached" };
      }
    }

    return {
      valid: true,
      coupon: {
        _id: coupon._id,
        name: coupon.name,
        code: coupon.code,
        discountPercentage: coupon.discountPercentage,
        usageLimit: coupon.usageLimit,
        usageCount: coupon.usageCount,
      },
    };
  },
});

// Increment coupon usage count
export const incrementCouponUsage = mutation({
  args: { couponId: v.id("coupons") },
  handler: async (ctx, args) => {
    const coupon = await ctx.db.get(args.couponId);
    if (!coupon) {
      throw new Error("Coupon not found");
    }

    if (coupon.usageLimit !== undefined && coupon.usageCount !== undefined) {
      if (coupon.usageCount >= coupon.usageLimit) {
        throw new Error("Coupon usage limit reached");
      }

      await ctx.db.patch(args.couponId, {
        usageCount: (coupon.usageCount || 0) + 1,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await ctx.db.patch(args.couponId, {
        usageCount: 1,
        updatedAt: new Date().toISOString(),
      });
    }

    return true;
  },
});
