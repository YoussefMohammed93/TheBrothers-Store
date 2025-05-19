import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Add userRole field to existing users
export const addUserRole = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Starting migration: Adding userRole field to existing users");

    const users = await ctx.db.query("users").collect();
    console.log(`Found ${users.length} users to update`);

    let updatedCount = 0;

    for (const user of users) {
      if (!user.userRole) {
        await ctx.db.patch(user._id, { userRole: "user" as "user" | "admin" });
        updatedCount++;
        console.log(`Updated user ${user._id} with default role "user"`);
      } else {
        console.log(`User ${user._id} already has role: ${user.userRole}`);
      }
    }

    console.log(
      `Migration completed successfully. Updated ${updatedCount} users.`
    );
    return { success: true, usersUpdated: updatedCount };
  },
});

// Make the first user an admin
export const makeFirstUserAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Starting migration: Making first user an admin");

    const users = await ctx.db.query("users").order("asc").collect();

    if (users.length === 0) {
      console.log("No users found");
      return { success: false, reason: "No users found" };
    }

    const firstUser = users[0];
    console.log(`Found first user: ${firstUser._id} (${firstUser.email})`);

    await ctx.db.patch(firstUser._id, {
      userRole: "admin" as "user" | "admin",
    });
    console.log(`Updated user ${firstUser._id} to role "admin"`);

    console.log("Migration completed successfully");
    return {
      success: true,
      userId: firstUser._id,
      email: firstUser.email,
    };
  },
});

// Make a specific user an admin by email
export const makeUserAdmin = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(
      `Starting migration: Making user with email ${args.email} an admin`
    );

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (!user) {
      console.log(`No user found with email ${args.email}`);
      return { success: false, reason: "User not found" };
    }

    await ctx.db.patch(user._id, { userRole: "admin" as "user" | "admin" });
    console.log(`Updated user ${user._id} to role "admin"`);

    console.log("Migration completed successfully");
    return {
      success: true,
      userId: user._id,
      email: user.email,
    };
  },
});
