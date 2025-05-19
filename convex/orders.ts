import { v } from "convex/values";
import { getCurrentUserOrThrow } from "./users";
import { mutation, query } from "./_generated/server";

// Get all orders for the current user
export const getUserOrders = query({
  handler: async (ctx) => {
    try {
      const user = await getCurrentUserOrThrow(ctx);

      const orders = await ctx.db
        .query("orders")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .order("desc")
        .collect();

      return orders;
    } catch (error) {
      console.error("Error fetching user orders:", error);
      return [];
    }
  },
});

// Get a specific order by ID with its items
export const getOrderById = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    try {
      const user = await getCurrentUserOrThrow(ctx);

      // Get the order
      const order = await ctx.db.get(args.orderId);

      // Check if order exists and belongs to the user
      if (!order || order.userId !== user._id) {
        return null;
      }

      // Get order items
      const orderItems = await ctx.db
        .query("orderItems")
        .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
        .collect();

      // Get product details for each item
      const itemsWithProductDetails = await Promise.all(
        orderItems.map(async (item) => {
          const product = await ctx.db.get(item.productId);
          let mainImageUrl = null;

          if (product && product.mainImage) {
            mainImageUrl = await ctx.storage.getUrl(product.mainImage);
          }

          return {
            ...item,
            product: product
              ? {
                  ...product,
                  mainImageUrl,
                }
              : null,
          };
        })
      );

      return {
        ...order,
        items: itemsWithProductDetails,
      };
    } catch (error) {
      console.error("Error fetching order:", error);
      return null;
    }
  },
});

// Create a new order
export const createOrder = mutation({
  args: {
    fullName: v.string(),
    email: v.string(),
    phone: v.string(),
    country: v.string(),
    city: v.string(),
    district: v.string(),
    street: v.string(),
    postalCode: v.optional(v.string()),
    notes: v.optional(v.string()),
    paymentMethod: v.string(),
    couponCode: v.optional(v.string()),
    couponDiscount: v.optional(v.number()),
    stripePaymentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the current user
    const user = await getCurrentUserOrThrow(ctx);

    // Get the user's cart
    const cartItems = await ctx.db
      .query("cart")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    if (cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    // Get shipping settings
    const settings = await ctx.db.query("settings").first();
    const shippingCost = settings?.shippingCost || 15;
    const freeShippingThreshold = settings?.freeShippingThreshold || null;

    // Calculate order totals
    let subtotal = 0;

    // Get product details for each cart item
    const cartItemsWithProducts = await Promise.all(
      cartItems.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        if (!product) return null;

        // Calculate item price (considering discount)
        const discountedPrice =
          product.price * (1 - product.discountPercentage / 100);
        const itemTotal = discountedPrice * item.quantity;

        // Add to subtotal
        subtotal += itemTotal;

        return {
          ...item,
          product,
          itemPrice: discountedPrice,
          itemTotal,
        };
      })
    );

    // Filter out null items
    const validCartItems = cartItemsWithProducts.filter(Boolean);

    if (validCartItems.length === 0) {
      throw new Error("No valid items in cart");
    }

    // Calculate shipping
    let shipping = shippingCost;
    if (freeShippingThreshold && subtotal >= freeShippingThreshold) {
      shipping = 0;
    }

    // Calculate discount
    const discount = args.couponDiscount || 0;

    // Calculate total
    const total = subtotal + shipping - discount;

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create the order
    const now = new Date().toISOString();

    // Determine payment status based on payment method
    let paymentStatus = "pending";
    if (args.paymentMethod === "cash_on_delivery") {
      paymentStatus = "pending"; // Will be paid on delivery
    } else if (args.paymentMethod === "stripe" && args.stripePaymentId) {
      paymentStatus = "succeeded"; // Stripe payment was successful
    }

    const orderId = await ctx.db.insert("orders", {
      userId: user._id,
      orderNumber,
      status: "pending",
      fullName: args.fullName,
      email: args.email,
      phone: args.phone,
      country: args.country,
      city: args.city,
      district: args.district,
      street: args.street,
      postalCode: args.postalCode,
      notes: args.notes,
      subtotal,
      shipping,
      discount,
      total,
      paymentMethod: args.paymentMethod,
      couponCode: args.couponCode,
      couponDiscount: args.couponDiscount,
      stripePaymentId: args.stripePaymentId,
      paymentStatus,
      isRead: false, // Mark new orders as unread
      createdAt: now,
      updatedAt: now,
    });

    // Create order items
    await Promise.all(
      validCartItems.map(async (item) => {
        await ctx.db.insert("orderItems", {
          orderId,
          productId: item!.productId,
          productName: item!.product.name,
          productPrice: item!.itemPrice,
          quantity: item!.quantity,
          selectedSize: item!.selectedSize,
          selectedColor: item!.selectedColor,
          total: item!.itemTotal,
        });

        // Update product quantity
        await ctx.db.patch(item!.productId, {
          quantity: Math.max(0, item!.product.quantity - item!.quantity),
        });
      })
    );

    // Clear the user's cart
    await Promise.all(cartItems.map((item) => ctx.db.delete(item._id)));

    // If a coupon was used, increment its usage count
    if (args.couponCode && typeof args.couponCode === "string") {
      const coupon = await ctx.db
        .query("coupons")
        .withIndex("by_code", (q) => q.eq("code", args.couponCode!))
        .first();

      if (coupon) {
        await ctx.db.patch(coupon._id, {
          usageCount: (coupon.usageCount || 0) + 1,
        });
      }
    }

    return {
      orderId,
      orderNumber,
    };
  },
});

// Admin: Get all orders
export const getAllOrders = query({
  handler: async (ctx) => {
    // In a real app, you would check if the user is an admin
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_created")
      .order("desc")
      .collect();

    return orders;
  },
});

// Admin: Update order status
export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    // In a real app, you would check if the user is an admin
    const order = await ctx.db.get(args.orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    await ctx.db.patch(args.orderId, {
      status: args.status,
      updatedAt: new Date().toISOString(),
    });

    return true;
  },
});

// Helper function to generate a unique order number
function generateOrderNumber() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `ORD-${timestamp}${random}`;
}

// Get count of unread orders
export const getUnreadOrdersCount = query({
  handler: async (ctx) => {
    const orders = await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();
    return orders.length;
  },
});

// Mark all orders as read
export const markAllOrdersAsRead = mutation({
  handler: async (ctx) => {
    const unreadOrders = await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    await Promise.all(
      unreadOrders.map((order) => ctx.db.patch(order._id, { isRead: true }))
    );

    return unreadOrders.length;
  },
});
