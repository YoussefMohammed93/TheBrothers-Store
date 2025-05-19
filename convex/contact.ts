import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get contact page content
export const getContactPage = query({
  handler: async (ctx) => {
    const contactPage = await ctx.db.query("contactPage").first();
    return contactPage || {};
  },
});

// Save contact page content
export const saveContactPage = mutation({
  args: {
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    mapLocation: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    workingHours: v.optional(v.string()),
    formTitle: v.optional(v.string()),
    formDescription: v.optional(v.string()),
    mapTitle: v.optional(v.string()),
    mapDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("contactPage").first();

    if (existing) {
      const updates: Partial<typeof args> = {};
      Object.entries(args).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === "mapLocation") {
            updates.mapLocation = value as { lat: number; lng: number };
          } else {
            updates[key as Exclude<keyof typeof args, "mapLocation">] =
              value as string;
          }
        }
      });
      return await ctx.db.patch(existing._id, updates);
    } else {
      const defaultContactPage = {
        title: "تواصل معنا",
        description:
          "نحن هنا لمساعدتك والإجابة على جميع استفساراتك. يمكنك التواصل معنا من خلال النموذج أدناه أو باستخدام معلومات الاتصال المتوفرة.",
        phone: "+966 12 345 6789",
        email: "info@example.com",
        address: "شارع الملك فهد، حي العليا، الرياض، المملكة العربية السعودية",
        workingHours:
          "الأحد - الخميس: 9:00 صباح::< - 5:00\nالجمعة - السبت: مغلق",
        formTitle: "أرسل لنا رسالة",
        formDescription:
          "املأ النموذج أدناه وسنقوم بالرد عليك في أقرب وقت ممكن",
        mapTitle: "موقعنا",
        mapDescription: "يمكنك زيارتنا في موقعنا خلال ساعات العمل",
      };

      const completeData = {
        ...defaultContactPage,
        ...args,
      };

      return await ctx.db.insert("contactPage", completeData);
    }
  },
});

// Submit contact form
export const submitContactForm = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    subject: v.optional(v.string()),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("contactSubmissions", {
      ...args,
      status: "new",
      createdAt: new Date().toISOString(),
    });
  },
});

// Get all contact submissions
export const getContactSubmissions = query({
  handler: async (ctx) => {
    return await ctx.db.query("contactSubmissions").order("desc").collect();
  },
});

// Get contact submissions by status
export const getContactSubmissionsByStatus = query({
  args: {
    status: v.string(),
  },
  handler: async (ctx, { status }) => {
    return await ctx.db
      .query("contactSubmissions")
      .withIndex("by_status", (q) => q.eq("status", status))
      .order("desc")
      .collect();
  },
});

// Update contact submission status
export const updateContactSubmissionStatus = mutation({
  args: {
    id: v.id("contactSubmissions"),
    status: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { id, status, notes }) => {
    const submission = await ctx.db.get(id);
    if (!submission) {
      throw new Error("Submission not found");
    }

    return await ctx.db.patch(id, {
      status,
      notes: notes !== undefined ? notes : submission.notes,
      updatedAt: new Date().toISOString(),
    });
  },
});

// Delete contact submission
export const deleteContactSubmission = mutation({
  args: {
    id: v.id("contactSubmissions"),
  },
  handler: async (ctx, { id }) => {
    return await ctx.db.delete(id);
  },
});

// Add this query to get new submissions count
export const getNewSubmissionsCount = query({
  handler: async (ctx) => {
    const submissions = await ctx.db
      .query("contactSubmissions")
      .filter((q) => q.eq(q.field("status"), "new"))
      .collect();
    return submissions.length;
  },
});

// Get contact banner content
export const getContactBanner = query({
  handler: async (ctx) => {
    const contactBanner = await ctx.db.query("contactBanner").first();
    return contactBanner || null;
  },
});

// Save contact banner content
export const saveContactBanner = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    isVisible: v.boolean(),
    contactItems: v.array(
      v.object({
        title: v.string(),
        description: v.string(),
        image: v.id("_storage"),
        order: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("contactBanner").first();

    if (existing) {
      return await ctx.db.patch(existing._id, args);
    } else {
      return await ctx.db.insert("contactBanner", args);
    }
  },
});
