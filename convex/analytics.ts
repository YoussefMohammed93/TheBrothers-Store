import { v } from "convex/values";
import { getCurrentUser } from "./users";
import { mutation, query } from "./_generated/server";

// Record a new website view with 24-hour unique visitor tracking
export const recordView = mutation({
  args: {
    visitorId: v.string(),
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toISOString();

    const currentUser = await getCurrentUser(ctx);
    const isAuthenticated = !!currentUser;

    const existingVisitor = await ctx.db
      .query("visitorSessions")
      .withIndex("by_visitor_id", (q) => q.eq("visitorId", args.visitorId))
      .first();

    let isNewUniqueView = false;

    if (existingVisitor) {
      if (existingVisitor.lastVisitDate !== today) {
        isNewUniqueView = true;

        await ctx.db.patch(existingVisitor._id, {
          lastVisitDate: today,
          lastVisitTimestamp: now,
          isAuthenticated,
          userId: currentUser ? currentUser._id : undefined,
        });
      }
    } else {
      isNewUniqueView = true;

      await ctx.db.insert("visitorSessions", {
        visitorId: args.visitorId,
        lastVisitDate: today,
        lastVisitTimestamp: now,
        isAuthenticated,
        userId: currentUser ? currentUser._id : undefined,
      });
    }

    const existingRecord = await ctx.db
      .query("websiteViews")
      .withIndex("by_date", (q) => q.eq("date", today))
      .first();

    if (existingRecord) {
      await ctx.db.patch(existingRecord._id, {
        count: existingRecord.count + 1,
        uniqueCount: isNewUniqueView
          ? existingRecord.uniqueCount + 1
          : existingRecord.uniqueCount,
        updatedAt: now,
      });
      return {
        totalViews: existingRecord.count + 1,
        uniqueViews: isNewUniqueView
          ? existingRecord.uniqueCount + 1
          : existingRecord.uniqueCount,
      };
    } else {
      await ctx.db.insert("websiteViews", {
        date: today,
        count: 1,
        uniqueCount: 1,
        updatedAt: now,
      });
      return {
        totalViews: 1,
        uniqueViews: 1,
      };
    }
  },
});

// Get total website views
export const getTotalViews = query({
  args: {},
  handler: async (ctx) => {
    const records = await ctx.db.query("websiteViews").collect();

    const totalViews = records.reduce((sum, record) => sum + record.count, 0);
    const uniqueViews = records.reduce(
      (sum, record) => sum + record.uniqueCount,
      0
    );

    return {
      totalViews,
      uniqueViews,
    };
  },
});

// Get total unique visitors (for backward compatibility)
export const getTotalUniqueViews = query({
  args: {},
  handler: async (ctx) => {
    const records = await ctx.db.query("websiteViews").collect();
    const uniqueViews = records.reduce(
      (sum, record) => sum + record.uniqueCount,
      0
    );
    return uniqueViews;
  },
});

// Get views for the last 7 days
export const getRecentViews = query({
  args: {},
  handler: async (ctx) => {
    const records = await ctx.db.query("websiteViews").order("desc").take(7);

    return records;
  },
});

// Get views for a specific date range
export const getViewsByDateRange = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("websiteViews")
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), args.startDate),
          q.lte(q.field("date"), args.endDate)
        )
      )
      .collect();

    return records;
  },
});
