import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get footer data
export const getFooter = query({
  handler: async (ctx) => {
    const footer = await ctx.db.query("footer").first();

    if (!footer) {
      return {
        storeName: "تسوق",
        description:
          "نقدم لكم أفضل المنتجات بأعلى جودة وأفضل الأسعار. تسوق معنا واستمتع بتجربة تسوق فريدة مع خدمة عملاء متميزة وشحن سريع لجميع أنحاء المملكة.",
        socialLinks: [
          {
            name: "فيسبوك",
            image: "./facebook.png",
            url: "https://facebook.com",
            order: 0,
          },
          {
            name: "انستغرام",
            image: "./instagram.png",
            url: "https://instagram.com",
            order: 1,
          },
          {
            name: "تويتر",
            image: "./twitter.png",
            url: "https://twitter.com",
            order: 2,
          },
          {
            name: "لينكد ان",
            image: "./linkedin.png",
            url: "https://linkedin.com",
            order: 3,
          },
        ],
        footerLinks: [
          {
            title: "تسوق",
            links: [
              { label: "المنتجات", href: "/products", order: 0 },
              { label: "المفضلة", href: "/wishlist", order: 1 },
              { label: "طلباتي", href: "/orders", order: 2 },
            ],
            order: 0,
          },
          {
            title: "الشركة",
            links: [
              { label: "من نحن", href: "/about", order: 0 },
              { label: "اتصل بنا", href: "/contact", order: 1 },
              { label: "الشروط والأحكام", href: "/terms", order: 2 },
            ],
            order: 1,
          },
        ],
      };
    }

    return footer;
  },
});

// Save footer data
export const saveFooter = mutation({
  args: {
    storeName: v.string(),
    description: v.string(),
    socialLinks: v.array(
      v.object({
        name: v.string(),
        image: v.union(v.string(), v.id("_storage"), v.null()),
        url: v.string(),
        order: v.number(),
      })
    ),
    footerLinks: v.array(
      v.object({
        title: v.string(),
        links: v.array(
          v.object({
            label: v.string(),
            href: v.string(),
            order: v.number(),
            image: v.optional(v.id("_storage")),
          })
        ),
        order: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("footer").first();

    if (existing) {
      return await ctx.db.patch(existing._id, args);
    }

    return await ctx.db.insert("footer", args);
  },
});

// Add a social link
export const addSocialLink = mutation({
  args: {
    name: v.string(),
    image: v.union(v.string(), v.id("_storage"), v.null()),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const footer = await ctx.db.query("footer").first();

    if (!footer) {
      throw new Error("Footer not found");
    }

    const socialLinks = [...(footer.socialLinks || [])];
    const newOrder = socialLinks.length;

    socialLinks.push({
      ...args,
      order: newOrder,
    });

    return await ctx.db.patch(footer._id, {
      socialLinks,
    });
  },
});

// Update a social link
export const updateSocialLink = mutation({
  args: {
    index: v.number(),
    name: v.string(),
    image: v.union(v.string(), v.id("_storage"), v.null()),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const { index, ...data } = args;
    const footer = await ctx.db.query("footer").first();

    if (!footer) {
      throw new Error("Footer not found");
    }

    const socialLinks = [...(footer.socialLinks || [])];

    if (index < 0 || index >= socialLinks.length) {
      throw new Error("Invalid social link index");
    }

    socialLinks[index] = {
      ...socialLinks[index],
      ...data,
    };

    return await ctx.db.patch(footer._id, {
      socialLinks,
    });
  },
});

// Delete a social link
export const deleteSocialLink = mutation({
  args: {
    index: v.number(),
  },
  handler: async (ctx, args) => {
    const footer = await ctx.db.query("footer").first();

    if (!footer) {
      throw new Error("Footer not found");
    }

    const socialLinks = [...(footer.socialLinks || [])];

    if (args.index < 0 || args.index >= socialLinks.length) {
      throw new Error("Invalid social link index");
    }

    socialLinks.splice(args.index, 1);

    socialLinks.forEach((link, idx) => {
      link.order = idx;
    });

    return await ctx.db.patch(footer._id, {
      socialLinks,
    });
  },
});

// Update social links order
export const updateSocialLinksOrder = mutation({
  args: {
    socialLinks: v.array(
      v.object({
        name: v.string(),
        image: v.union(v.string(), v.id("_storage"), v.null()),
        url: v.string(),
        order: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const footer = await ctx.db.query("footer").first();

    if (!footer) {
      throw new Error("Footer not found");
    }

    return await ctx.db.patch(footer._id, {
      socialLinks: args.socialLinks,
    });
  },
});

// Add a footer link section
export const addFooterLinkSection = mutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const footer = await ctx.db.query("footer").first();

    if (!footer) {
      throw new Error("Footer not found");
    }

    const footerLinks = [...(footer.footerLinks || [])];
    const newOrder = footerLinks.length;

    footerLinks.push({
      title: args.title,
      links: [],
      order: newOrder,
    });

    return await ctx.db.patch(footer._id, {
      footerLinks,
    });
  },
});

// Update a footer link section
export const updateFooterLinkSection = mutation({
  args: {
    sectionIndex: v.number(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const footer = await ctx.db.query("footer").first();

    if (!footer) {
      throw new Error("Footer not found");
    }

    const footerLinks = [...(footer.footerLinks || [])];

    if (args.sectionIndex < 0 || args.sectionIndex >= footerLinks.length) {
      throw new Error("Invalid footer link section index");
    }

    footerLinks[args.sectionIndex].title = args.title;

    return await ctx.db.patch(footer._id, {
      footerLinks,
    });
  },
});

// Delete a footer link section
export const deleteFooterLinkSection = mutation({
  args: {
    sectionIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const footer = await ctx.db.query("footer").first();

    if (!footer) {
      throw new Error("Footer not found");
    }

    const footerLinks = [...(footer.footerLinks || [])];

    if (args.sectionIndex < 0 || args.sectionIndex >= footerLinks.length) {
      throw new Error("Invalid footer link section index");
    }

    footerLinks.splice(args.sectionIndex, 1);

    footerLinks.forEach((section, idx) => {
      section.order = idx;
    });

    return await ctx.db.patch(footer._id, {
      footerLinks,
    });
  },
});

// Add a link to a footer section
export const addFooterLink = mutation({
  args: {
    sectionIndex: v.number(),
    label: v.string(),
    href: v.string(),
  },
  handler: async (ctx, args) => {
    const footer = await ctx.db.query("footer").first();

    if (!footer) {
      throw new Error("Footer not found");
    }

    const footerLinks = [...(footer.footerLinks || [])];

    if (args.sectionIndex < 0 || args.sectionIndex >= footerLinks.length) {
      throw new Error("Invalid footer link section index");
    }

    const section = footerLinks[args.sectionIndex];
    const links = [...(section.links || [])];
    const newOrder = links.length;

    links.push({
      label: args.label,
      href: args.href,
      order: newOrder,
    });

    section.links = links;

    return await ctx.db.patch(footer._id, {
      footerLinks,
    });
  },
});

// Update a footer link
export const updateFooterLink = mutation({
  args: {
    sectionIndex: v.number(),
    linkIndex: v.number(),
    label: v.string(),
    href: v.string(),
    image: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const footer = await ctx.db.query("footer").first();

    if (!footer) {
      throw new Error("Footer not found");
    }

    const footerLinks = [...(footer.footerLinks || [])];

    if (args.sectionIndex < 0 || args.sectionIndex >= footerLinks.length) {
      throw new Error("Invalid footer link section index");
    }

    const section = footerLinks[args.sectionIndex];
    const links = [...(section.links || [])];

    if (args.linkIndex < 0 || args.linkIndex >= links.length) {
      throw new Error("Invalid footer link index");
    }

    links[args.linkIndex] = {
      ...links[args.linkIndex],
      label: args.label,
      href: args.href,
      image: args.image || links[args.linkIndex].image,
    };

    section.links = links;

    return await ctx.db.patch(footer._id, {
      footerLinks,
    });
  },
});

// Delete a footer link
export const deleteFooterLink = mutation({
  args: {
    sectionIndex: v.number(),
    linkIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const footer = await ctx.db.query("footer").first();

    if (!footer) {
      throw new Error("Footer not found");
    }

    const footerLinks = [...(footer.footerLinks || [])];

    if (args.sectionIndex < 0 || args.sectionIndex >= footerLinks.length) {
      throw new Error("Invalid footer link section index");
    }

    const section = footerLinks[args.sectionIndex];
    const links = [...(section.links || [])];

    if (args.linkIndex < 0 || args.linkIndex >= links.length) {
      throw new Error("Invalid footer link index");
    }

    links.splice(args.linkIndex, 1);

    links.forEach((link, idx) => {
      link.order = idx;
    });

    section.links = links;

    return await ctx.db.patch(footer._id, {
      footerLinks,
    });
  },
});

// Update footer links order
export const updateFooterLinksOrder = mutation({
  args: {
    footerLinks: v.array(
      v.object({
        title: v.string(),
        links: v.array(
          v.object({
            label: v.string(),
            href: v.string(),
            order: v.number(),
            image: v.optional(v.id("_storage")),
          })
        ),
        order: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const footer = await ctx.db.query("footer").first();

    if (!footer) {
      throw new Error("Footer not found");
    }

    return await ctx.db.patch(footer._id, {
      footerLinks: args.footerLinks,
    });
  },
});
