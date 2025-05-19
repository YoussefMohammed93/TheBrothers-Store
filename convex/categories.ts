import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all categories ordered by their position
export const getCategories = query({
  handler: async (ctx) => {
    return await ctx.db.query("categories").withIndex("by_order").collect();
  },
});

// Get the categories page data
export const getCategoriesPage = query({
  handler: async (ctx) => {
    return await ctx.db.query("categoriesPage").first();
  },
});

// Save the categories page data
export const saveCategoriesPage = mutation({
  args: {
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    isVisible: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("categoriesPage").first();
    if (existing) {
      const updates: {
        title?: string;
        description?: string;
        isVisible?: boolean;
      } = {};
      if (args.title !== undefined) updates.title = args.title;
      if (args.description !== undefined)
        updates.description = args.description;
      if (args.isVisible !== undefined) updates.isVisible = args.isVisible;
      return await ctx.db.patch(existing._id, updates);
    }
    return await ctx.db.insert("categoriesPage", {
      title: args.title ?? "",
      description: args.description ?? "",
      isVisible: args.isVisible ?? true,
    });
  },
});

// Save a category
export const saveCategory = mutation({
  args: {
    id: v.optional(v.id("categories")),
    name: v.string(),
    image: v.id("_storage"),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    if (id) {
      return await ctx.db.patch(id, data);
    }
    return await ctx.db.insert("categories", {
      ...data,
    });
  },
});

// Delete a category
export const deleteCategory = mutation({
  args: {
    id: v.id("categories"),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.id);
    if (!category) {
      throw new Error("Category not found");
    }

    if (category.image) {
      await ctx.storage.delete(category.image);
    }

    await ctx.db.delete(args.id);
    return true;
  },
});

// Update the order of categories
export const updateCategoriesOrder = mutation({
  args: {
    categories: v.array(
      v.object({
        id: v.id("categories"),
        order: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    await Promise.all(
      args.categories.map(({ id, order }) => ctx.db.patch(id, { order }))
    );
    return true;
  },
});

// Delete a category image
export const deleteCategoryImage = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.delete(storageId);
  },
});

// Get a single category by ID, or null if not found
export const getCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const category = (await ctx.db.get(args.categoryId)) ?? null;
    return category;
  },
});

// Get products by category ID
export const getProductsByCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("categoryId"), args.categoryId))
      .collect();

    return products;
  },
});
