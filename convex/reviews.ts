import { v } from "convex/values";
import { getCurrentUserOrThrow } from "./users";
import { mutation, query } from "./_generated/server";

// Get all reviews for a product
export const getProductReviews = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .order("desc")
      .collect();

    const reviewsWithUserInfo = await Promise.all(
      reviews.map(async (review) => {
        const user = await ctx.db.get(review.userId);
        return {
          ...review,
          userName: user
            ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
            : "مستخدم",
          userImage: user?.imageUrl,
        };
      })
    );

    return reviewsWithUserInfo;
  },
});

// Get all reviews for the current user
export const getUserReviews = query({
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);

    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    const reviewsWithProductInfo = await Promise.all(
      reviews.map(async (review) => {
        const product = await ctx.db.get(review.productId);
        return {
          ...review,
          productName: product?.name || "منتج غير متوفر",
          productImage: product
            ? await ctx.storage.getUrl(product.mainImage)
            : null,
        };
      })
    );

    return reviewsWithProductInfo;
  },
});

// Get all reviews for admin dashboard
export const getAllReviews = query({
  handler: async (ctx) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_created")
      .order("desc")
      .collect();

    const reviewsWithInfo = await Promise.all(
      reviews.map(async (review) => {
        const user = await ctx.db.get(review.userId);
        const product = await ctx.db.get(review.productId);

        return {
          ...review,
          userName: user
            ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
            : "مستخدم",
          userImage: user?.imageUrl,
          productName: product?.name || "منتج غير متوفر",
          productImage: product
            ? await ctx.storage.getUrl(product.mainImage)
            : null,
        };
      })
    );

    return reviewsWithInfo;
  },
});

// Add a new review
export const addReview = mutation({
  args: {
    productId: v.id("products"),
    rating: v.number(),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const existingReview = await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    if (existingReview) {
      return await ctx.db.patch(existingReview._id, {
        rating: args.rating,
        comment: args.comment,
        createdAt: new Date().toISOString(),
      });
    }

    return await ctx.db.insert("reviews", {
      userId: user._id,
      productId: args.productId,
      rating: args.rating,
      comment: args.comment,
      createdAt: new Date().toISOString(),
    });
  },
});

// Delete a review
export const deleteReview = mutation({
  args: {
    reviewId: v.id("reviews"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const review = await ctx.db.get(args.reviewId);

    if (!review) {
      throw new Error("Review not found");
    }

    if (review.userId !== user._id) {
      throw new Error("Unauthorized to delete this review");
    }

    await ctx.db.delete(args.reviewId);
    return true;
  },
});

// Admin delete review (no user check)
export const adminDeleteReview = mutation({
  args: {
    reviewId: v.id("reviews"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.reviewId);
    return true;
  },
});

// Get featured reviews for the main page
export const getFeaturedReviews = query({
  handler: async (ctx) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .order("desc")
      .collect();

    const reviewsWithInfo = await Promise.all(
      reviews.map(async (review) => {
        const user = await ctx.db.get(review.userId);
        const product = await ctx.db.get(review.productId);

        return {
          ...review,
          userName: user
            ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
            : "مستخدم",
          userImage: user?.imageUrl,
          productName: product?.name || "منتج غير متوفر",
          productImage: product
            ? await ctx.storage.getUrl(product.mainImage)
            : null,
        };
      })
    );

    return reviewsWithInfo;
  },
});

// Toggle featured status of a review
export const toggleReviewFeatured = mutation({
  args: {
    reviewId: v.id("reviews"),
    featured: v.boolean(),
  },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);

    if (!review) {
      throw new Error("Review not found");
    }

    await ctx.db.patch(args.reviewId, {
      featured: args.featured,
    });

    return true;
  },
});

// Get product rating summary (average rating and count)
export const getProductRating = query({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        reviewCount: 0,
      };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    return {
      averageRating,
      reviewCount: reviews.length,
    };
  },
});

// Get ratings for multiple products at once
export const getProductsRatings = query({
  args: {
    productIds: v.array(v.id("products")),
  },
  handler: async (ctx, args) => {
    const result: Record<
      string,
      { averageRating: number; reviewCount: number }
    > = {};

    // Initialize with zero ratings for all products
    for (const productId of args.productIds) {
      result[productId.toString()] = { averageRating: 0, reviewCount: 0 };
    }

    // If no product IDs, return empty result
    if (args.productIds.length === 0) {
      return result;
    }

    // Use a more efficient approach - query reviews with index and batch process
    // Process in smaller batches to avoid timeouts
    const batchSize = 10;
    for (let i = 0; i < args.productIds.length; i += batchSize) {
      const batchIds = args.productIds.slice(i, i + batchSize);

      // Process each product ID in the batch
      await Promise.all(
        batchIds.map(async (productId) => {
          try {
            // Query reviews directly for this product using the index
            const reviews = await ctx.db
              .query("reviews")
              .withIndex("by_product", (q) => q.eq("productId", productId))
              .collect();

            if (reviews.length > 0) {
              const totalRating = reviews.reduce(
                (sum, review) => sum + review.rating,
                0
              );
              result[productId.toString()] = {
                averageRating: totalRating / reviews.length,
                reviewCount: reviews.length,
              };
            }
          } catch (error) {
            console.error(
              `Error fetching reviews for product ${productId}:`,
              error
            );
            // Keep the default zero values in result
          }
        })
      );
    }

    return result;
  },
});
