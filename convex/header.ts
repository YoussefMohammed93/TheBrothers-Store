import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all header links ordered by their position
export const getHeaderLinks = query({
  args: {},
  handler: async (ctx) => {
    const links = await ctx.db.query("headerLinks").order("asc").collect();
    return links;
  },
});

// Save all header links (this will replace existing links)
export const saveHeaderLinks = mutation({
  args: {
    links: v.array(
      v.object({
        name: v.string(),
        href: v.string(),
        order: v.number(),
      })
    ),
  },
  handler: async (ctx, { links }) => {
    const existingLinks = await ctx.db.query("headerLinks").collect();
    for (const link of existingLinks) {
      await ctx.db.delete(link._id);
    }

    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      await ctx.db.insert("headerLinks", {
        name: link.name,
        href: link.href,
        order: link.order,
      });
    }

    return true;
  },
});
