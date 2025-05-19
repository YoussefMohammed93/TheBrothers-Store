import { v } from "convex/values";
import { getCurrentUserOrThrow } from "./users";
import { mutation, query } from "./_generated/server";

// Get user's cart with product details
export const getUserCart = query({
  handler: async (ctx) => {
    try {
      const user = await getCurrentUserOrThrow(ctx);

      const cartItems = await ctx.db
        .query("cart")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();

      if (cartItems.length === 0) {
        return [];
      }

      const cartWithProducts = await Promise.all(
        cartItems.map(async (item) => {
          const product = await ctx.db.get(item.productId);
          if (!product) return null;

          return {
            ...item,
            product: {
              ...product,
              mainImageUrl: await ctx.storage.getUrl(product.mainImage),
              galleryUrls: await Promise.all(
                product.gallery.map(
                  async (imageId) => await ctx.storage.getUrl(imageId)
                )
              ),
            },
          };
        })
      );

      return cartWithProducts.filter(Boolean);
    } catch (error) {
      console.error("Error fetching cart:", error);
      return [];
    }
  },
});

// Get cart count
export const getCartCount = query({
  handler: async (ctx) => {
    try {
      const user = await getCurrentUserOrThrow(ctx);

      const count = await ctx.db
        .query("cart")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect()
        .then((items) => {
          return items.reduce((total, item) => total + item.quantity, 0);
        });

      return count;
    } catch {
      return 0;
    }
  },
});

// Add a product to the cart
export const addToCart = mutation({
  args: {
    productId: v.id("products"),
    quantity: v.number(),
    selectedSize: v.optional(v.string()),
    selectedColor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    let finalSelectedSize = args.selectedSize;
    if (!finalSelectedSize && product.sizes.length > 0) {
      finalSelectedSize = product.sizes[0].name;
    }

    let finalSelectedColor = args.selectedColor;
    if (!finalSelectedColor && product.colors.length > 0) {
      finalSelectedColor = product.colors[0].name;
    }

    const existing = await ctx.db
      .query("cart")
      .withIndex("by_user_and_product", (q) =>
        q.eq("userId", user._id).eq("productId", args.productId)
      )
      .first();

    const now = new Date().toISOString();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        quantity: existing.quantity + args.quantity,
        selectedSize: finalSelectedSize || existing.selectedSize,
        selectedColor: finalSelectedColor || existing.selectedColor,
        updatedAt: now,
      });
    }

    return await ctx.db.insert("cart", {
      userId: user._id,
      productId: args.productId,
      quantity: args.quantity,
      selectedSize: finalSelectedSize,
      selectedColor: finalSelectedColor,
      addedAt: now,
      updatedAt: now,
    });
  },
});

// Update cart item quantity
export const updateCartItemQuantity = mutation({
  args: {
    cartItemId: v.id("cart"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const cartItem = await ctx.db.get(args.cartItemId);
    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    if (cartItem.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    return await ctx.db.patch(args.cartItemId, {
      quantity: args.quantity,
      updatedAt: new Date().toISOString(),
    });
  },
});

// Remove an item from the cart
export const removeFromCart = mutation({
  args: {
    cartItemId: v.id("cart"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const cartItem = await ctx.db.get(args.cartItemId);
    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    if (cartItem.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.cartItemId);
    return true;
  },
});

// Remove a product from the cart by product ID
export const removeProductFromCart = mutation({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const cartItem = await ctx.db
      .query("cart")
      .withIndex("by_user_and_product", (q) =>
        q.eq("userId", user._id).eq("productId", args.productId)
      )
      .first();

    if (!cartItem) {
      throw new Error("Product not in cart");
    }

    await ctx.db.delete(cartItem._id);
    return true;
  },
});

// Clear the entire cart
export const clearCart = mutation({
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);

    const cartItems = await ctx.db
      .query("cart")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    await Promise.all(cartItems.map((item) => ctx.db.delete(item._id)));
    return true;
  },
});
