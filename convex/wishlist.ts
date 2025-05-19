import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

// Get user's wishlist with product details
export const getUserWishlist = query({
  handler: async (ctx) => {
    try {
      const user = await getCurrentUserOrThrow(ctx);

      const wishlistItems = await ctx.db
        .query("wishlist")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .order("desc")
        .collect();

      if (wishlistItems.length === 0) {
        return [];
      }

      const wishlistWithProducts = await Promise.all(
        wishlistItems.map(async (item) => {
          try {
            const product = await ctx.db.get(item.productId);
            if (!product) return null;

            let mainImageUrl = null;
            try {
              mainImageUrl = await ctx.storage.getUrl(product.mainImage);
            } catch (imageError) {
              console.error("Error getting main image URL:", imageError);
            }

            let galleryUrls: (string | null)[] = [];
            try {
              galleryUrls = await Promise.all(
                product.gallery.map(async (imageId) => {
                  try {
                    return await ctx.storage.getUrl(imageId);
                  } catch {
                    return null;
                  }
                })
              );
              galleryUrls = galleryUrls.filter(Boolean);
            } catch (galleryError) {
              console.error("Error getting gallery URLs:", galleryError);
            }

            return {
              _id: item._id,
              productId: item.productId,
              addedAt: item.addedAt,
              product: {
                ...product,
                mainImageUrl,
                galleryUrls,
              },
            };
          } catch (itemError) {
            console.error("Error processing wishlist item:", itemError);
            return null;
          }
        })
      );

      return wishlistWithProducts.filter(Boolean);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      return [];
    }
  },
});

// Check if a product is in the user's wishlist
export const isInWishlist = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    try {
      const user = await getCurrentUserOrThrow(ctx);

      const wishlistItem = await ctx.db
        .query("wishlist")
        .withIndex("by_user_and_product", (q) =>
          q.eq("userId", user._id).eq("productId", args.productId)
        )
        .first();

      return !!wishlistItem;
    } catch {
      return false;
    }
  },
});

// Add a product to the wishlist
export const addToWishlist = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const existing = await ctx.db
      .query("wishlist")
      .withIndex("by_user_and_product", (q) =>
        q.eq("userId", user._id).eq("productId", args.productId)
      )
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("wishlist", {
      userId: user._id,
      productId: args.productId,
      addedAt: new Date().toISOString(),
    });
  },
});

// Remove a product from the wishlist
export const removeFromWishlist = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const wishlistItem = await ctx.db
      .query("wishlist")
      .withIndex("by_user_and_product", (q) =>
        q.eq("userId", user._id).eq("productId", args.productId)
      )
      .first();

    if (!wishlistItem) {
      throw new Error("Item not in wishlist");
    }

    await ctx.db.delete(wishlistItem._id);
    return true;
  },
});

// Clear the entire wishlist
export const clearWishlist = mutation({
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);

    const wishlistItems = await ctx.db
      .query("wishlist")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const item of wishlistItems) {
      await ctx.db.delete(item._id);
    }

    return true;
  },
});

// Get wishlist count
export const getWishlistCount = query({
  handler: async (ctx) => {
    try {
      const user = await getCurrentUserOrThrow(ctx);

      const items = await ctx.db
        .query("wishlist")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();

      return items.length;
    } catch {
      return false;
    }
  },
});
