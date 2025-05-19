import {
  query,
  mutation,
  QueryCtx,
  internalMutation,
} from "./_generated/server";
import { v, Validator } from "convex/values";
import { UserJSON } from "@clerk/nextjs/server";

type UserRole = "user" | "admin";

// Get all users (admin only)
export const getUsers = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getCurrentUser(ctx);

    if (!currentUser || currentUser.userRole !== "admin") {
      throw new Error("Only admins can view all users");
    }

    return await ctx.db.query("users").collect();
  },
});

// Get the last 5 users
export const getRecentUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").order("desc").take(5);
  },
});

// Get the current user
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

// Check if the current user is an admin
export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return user?.userRole === "admin";
  },
});

// Upsert a user from Clerk
export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> },
  async handler(ctx, { data }) {
    const userAttributes = {
      email: data.email_addresses[0].email_address,
      clerkUserId: data.id,
      username: data.username ?? undefined,
      imageUrl: data.image_url ?? undefined,
      firstName: data.first_name ?? undefined,
      lastName: data.last_name ?? undefined,
      userRole: "user" as UserRole, // Default role is "user"
    };

    const user = await userByClerkUserId(ctx, data.id);

    if (user === null) {
      await ctx.db.insert("users", userAttributes);
    } else {
      await ctx.db.patch(user._id, userAttributes);
    }
  },
});

// Delete a user from Clerk
export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await userByClerkUserId(ctx, clerkUserId);

    if (user !== null) {
      await ctx.db.delete(user._id);
    } else {
      console.warn(`User with clerkUserId ${clerkUserId} not found`);
    }
  },
});

// Get the current user or throw an error
export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx);

  if (!userRecord) throw new Error("Can't get current user");

  return userRecord;
}

// Get the current user or null if not logged in
export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) return null;

  return await userByClerkUserId(ctx, identity.subject);
}
// Get a user by their Clerk user ID
async function userByClerkUserId(ctx: QueryCtx, clerkUserId: string) {
  return await ctx.db
    .query("users")
    .withIndex("byClerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
    .unique();
}

// Update a user's role (admin only)
export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    newRole: v.union(v.literal("user"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrThrow(ctx);

    if (currentUser.userRole !== "admin") {
      throw new Error("Only admins can update user roles");
    }

    return await ctx.db.patch(args.userId, { userRole: args.newRole });
  },
});
