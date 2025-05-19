import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

// Get all products with their images URLs
export const getProducts = query({
  handler: async (ctx) => {
    const products = await ctx.db.query("products").order("desc").collect();

    const batchSize = 10;
    const result = [];

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);

      const processedBatch = await Promise.all(
        batch.map(async (product) => {
          try {
            const mainImageUrl = await ctx.storage.getUrl(product.mainImage);

            return {
              ...product,
              mainImageUrl,
              galleryUrls: [],
            };
          } catch (error) {
            console.error(`Error processing product ${product._id}:`, error);
            return {
              ...product,
              mainImageUrl: null,
              galleryUrls: [],
            };
          }
        })
      );

      result.push(...processedBatch);
    }

    return result;
  },
});

// Get top selling products based on order items
export const getTopSellingProducts = query({
  handler: async (ctx) => {
    const orderItems = await ctx.db.query("orderItems").collect();

    const productSales: Record<
      string,
      { productId: Id<"products">; totalQuantity: number; totalRevenue: number }
    > = {};

    for (const item of orderItems) {
      const productId = item.productId;
      const productIdStr = productId.toString();

      if (!productSales[productIdStr]) {
        productSales[productIdStr] = {
          productId,
          totalQuantity: 0,
          totalRevenue: 0,
        };
      }

      productSales[productIdStr].totalQuantity += item.quantity;
      productSales[productIdStr].totalRevenue += item.total;
    }

    const sortedProducts = Object.values(productSales).sort(
      (a, b) => b.totalQuantity - a.totalQuantity
    );

    const topProducts = [];

    for (const productSale of sortedProducts.slice(0, 4)) {
      const product = await ctx.db.get(productSale.productId);
      if (product && "name" in product && "mainImage" in product) {
        topProducts.push({
          id: product._id,
          name: product.name,
          sales: productSale.totalQuantity,
          revenue: productSale.totalRevenue,
          mainImageUrl: await ctx.storage.getUrl(product.mainImage),
        });
      }
    }

    return topProducts;
  },
});

// Get a single product by ID
export const getProduct = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) return null;

    try {
      const mainImageUrl = await ctx.storage.getUrl(product.mainImage);

      const galleryUrls = await Promise.all(
        product.gallery.map(async (imageId) => {
          try {
            return await ctx.storage.getUrl(imageId);
          } catch (error) {
            console.error(`Error getting URL for image ${imageId}:`, error);
            return null;
          }
        })
      );

      const validGalleryUrls = galleryUrls.filter((url) => url !== null);

      return {
        ...product,
        mainImageUrl,
        galleryUrls: validGalleryUrls,
      };
    } catch (error) {
      console.error(`Error processing product ${args.productId}:`, error);
      return {
        ...product,
        mainImageUrl: null,
        galleryUrls: [],
      };
    }
  },
});

// Save or update a product
export const saveProduct = mutation({
  args: {
    id: v.optional(v.id("products")),
    name: v.string(),
    description: v.string(),
    mainImage: v.id("_storage"),
    gallery: v.array(v.id("_storage")),
    price: v.number(),
    discountPercentage: v.number(),
    quantity: v.number(),
    sizes: v.array(
      v.object({
        name: v.string(),
        price: v.number(),
      })
    ),
    colors: v.array(
      v.object({
        name: v.string(),
        value: v.string(),
      })
    ),
    categoryId: v.id("categories"),
    badges: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...productData } = args;
    const now = new Date().toISOString();

    const sortedSizes = [...productData.sizes].sort((a, b) => {
      const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL"];
      return sizeOrder.indexOf(a.name) - sizeOrder.indexOf(b.name);
    });

    const mainPrice =
      sortedSizes.length > 0 ? sortedSizes[0].price : productData.price;

    if (id) {
      return await ctx.db.patch(id, {
        ...productData,
        price: mainPrice,
        updatedAt: now,
      });
    }

    return await ctx.db.insert("products", {
      ...productData,
      price: mainPrice,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Delete a product
export const deleteProduct = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");

    await ctx.storage.delete(product.mainImage);

    for (const imageId of product.gallery) {
      await ctx.storage.delete(imageId);
    }

    await ctx.db.delete(args.productId);
    return true;
  },
});

// Get products by category
export const getProductsByCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("categoryId"), args.categoryId))
      .collect();
  },
});
