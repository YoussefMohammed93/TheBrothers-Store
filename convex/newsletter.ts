import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get newsletter settings
export const get = query({
  handler: async (ctx) => {
    const newsletter = await ctx.db.query("newsletter").first();
    return newsletter || null;
  },
});

// Save newsletter settings
export const save = mutation({
  args: {
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    isVisible: v.optional(v.boolean()),
    featureOneTitle: v.optional(v.string()),
    featureOneImage: v.optional(v.string()),
    featureTwoTitle: v.optional(v.string()),
    featureTwoImage: v.optional(v.string()),
    buttonText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("newsletter").first();

    if (existing) {
      const updates: {
        title?: string;
        description?: string;
        isVisible?: boolean;
        featureOneTitle?: string;
        featureOneImage?: string;
        featureTwoTitle?: string;
        featureTwoImage?: string;
        buttonText?: string;
      } = {};

      if (args.title !== undefined) updates.title = args.title;
      if (args.description !== undefined)
        updates.description = args.description;
      if (args.isVisible !== undefined) updates.isVisible = args.isVisible;
      if (args.featureOneTitle !== undefined)
        updates.featureOneTitle = args.featureOneTitle;
      if (args.featureOneImage !== undefined)
        updates.featureOneImage = args.featureOneImage;
      if (args.featureTwoTitle !== undefined)
        updates.featureTwoTitle = args.featureTwoTitle;
      if (args.featureTwoImage !== undefined)
        updates.featureTwoImage = args.featureTwoImage;
      if (args.buttonText !== undefined) updates.buttonText = args.buttonText;

      return await ctx.db.patch(existing._id, updates);
    }

    return await ctx.db.insert("newsletter", {
      title: args.title ?? "اشترك في نشرتنا البريدية",
      description:
        args.description ?? "كن أول من يعلم عن أحدث المنتجات والعروض الحصرية",
      isVisible: args.isVisible ?? true,
      featureOneTitle: args.featureOneTitle ?? "",
      featureOneImage: args.featureOneImage ?? "",
      featureTwoTitle: args.featureTwoTitle ?? "",
      featureTwoImage: args.featureTwoImage ?? "",
      buttonText: args.buttonText ?? "اشترك الآن",
      subscribers: [],
    });
  },
});

// Subscribe to newsletter
export const subscribe = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const newsletter = await ctx.db.query("newsletter").first();

    if (!newsletter) {
      throw new Error("Newsletter not configured");
    }

    const existingSubscriber = newsletter.subscribers.find(
      (sub) => sub.email === args.email
    );

    if (existingSubscriber) {
      throw new Error("Email already subscribed");
    }

    const updatedSubscribers = [
      ...newsletter.subscribers,
      {
        email: args.email,
        subscribedAt: new Date().toISOString(),
        isRead: false,
      },
    ];

    await ctx.db.patch(newsletter._id, {
      subscribers: updatedSubscribers,
    });

    return true;
  },
});

// Get all subscribers
export const getSubscribers = query({
  handler: async (ctx) => {
    const newsletter = await ctx.db.query("newsletter").first();
    return newsletter?.subscribers || [];
  },
});

// Remove subscriber
export const removeSubscriber = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const newsletter = await ctx.db.query("newsletter").first();

    if (!newsletter) {
      throw new Error("Newsletter not configured");
    }

    const updatedSubscribers = newsletter.subscribers.filter(
      (sub) => sub.email !== args.email
    );

    await ctx.db.patch(newsletter._id, {
      subscribers: updatedSubscribers,
    });

    return true;
  },
});

// Add query to get unread subscribers count
export const getUnreadSubscribers = query({
  handler: async (ctx) => {
    const newsletter = await ctx.db.query("newsletter").first();
    if (!newsletter) return [];
    return newsletter.subscribers.filter((sub) => !sub.isRead);
  },
});

// Add mutation to mark subscribers as read
export const markAsRead = mutation({
  handler: async (ctx) => {
    const newsletter = await ctx.db.query("newsletter").first();
    if (!newsletter) return;

    const updatedSubscribers = newsletter.subscribers.map((sub) => ({
      ...sub,
      isRead: true,
    }));

    await ctx.db.patch(newsletter._id, {
      subscribers: updatedSubscribers,
    });
  },
});
