import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate an upload URL for a new file
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Save a storage ID (this is usually not needed)
export const saveStorageId = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return args.storageId;
  },
});

// Get the URL for a stored file
export const getImageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Get the URLs for multiple stored files
export const getMultipleImageUrls = query({
  args: {
    storageIds: v.array(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const urls = await Promise.all(
      args.storageIds.map(async (id) => {
        return await ctx.storage.getUrl(id);
      })
    );
    return urls;
  },
});

// Delete a stored file
export const deleteStorageId = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId);
    return true;
  },
});
