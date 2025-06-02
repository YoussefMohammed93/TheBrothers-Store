import { v } from "convex/values";
import { defineSchema, defineTable } from "convex/server";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    clerkUserId: v.string(),
    username: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    userRole: v.union(v.literal("user"), v.literal("admin")),
  }).index("byClerkUserId", ["clerkUserId"]),

  headerLinks: defineTable({
    name: v.string(),
    href: v.string(),
    order: v.number(),
  }).index("by_order", ["order"]),

  hero: defineTable({
    title: v.string(),
    description: v.string(),
    mainImage: v.optional(v.id("_storage")),
    primaryButtonText: v.string(),
    primaryButtonHref: v.string(),
    secondaryButtonText: v.string(),
    secondaryButtonHref: v.string(),
    customerCount: v.number(),
    customerText: v.string(),
    customerImages: v.array(v.id("_storage")),
  }),

  categoriesPage: defineTable({
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    isVisible: v.optional(v.boolean()),
  }),

  categories: defineTable({
    name: v.string(),
    order: v.number(),
    image: v.id("_storage"),
  }).index("by_order", ["order"]),

  partnersPage: defineTable({
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    isVisible: v.optional(v.boolean()),
  }),

  partners: defineTable({
    name: v.string(),
    order: v.number(),
    image: v.id("_storage"),
  }).index("by_order", ["order"]),

  featuresPage: defineTable({
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    isVisible: v.optional(v.boolean()),
  }),

  features: defineTable({
    name: v.string(),
    description: v.string(),
    order: v.number(),
    image: v.id("_storage"),
  }).index("by_order", ["order"]),

  newsletter: defineTable({
    title: v.string(),
    description: v.string(),
    isVisible: v.boolean(),
    featureOneTitle: v.optional(v.string()),
    featureOneImage: v.optional(v.string()),
    featureTwoTitle: v.optional(v.string()),
    featureTwoImage: v.optional(v.string()),
    buttonText: v.optional(v.string()),
    subscribers: v.array(
      v.object({
        email: v.string(),
        subscribedAt: v.string(),
        isRead: v.boolean(),
      })
    ),
  }),

  products: defineTable({
    name: v.string(),
    description: v.string(),
    mainImage: v.id("_storage"),
    gallery: v.array(v.id("_storage")),
    price: v.number(),
    discountPercentage: v.number(),
    quantity: v.number(),

    colors: v.array(
      v.object({
        name: v.string(),
        value: v.string(),
      })
    ),
    categoryId: v.id("categories"),
    badges: v.array(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_category", ["categoryId"])
    .index("by_created", ["createdAt"]),

  reviews: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    rating: v.number(),
    comment: v.string(),
    createdAt: v.string(),
    featured: v.optional(v.boolean()),
  })
    .index("by_product", ["productId"])
    .index("by_user", ["userId"])
    .index("by_created", ["createdAt"])
    .index("by_featured", ["featured"]),

  pages: defineTable({
    name: v.string(),
    title: v.string(),
    slug: v.string(),
    order: v.number(),
    isVisible: v.boolean(),
  }).index("by_order", ["order"]),

  aboutPage: defineTable({
    title: v.string(),
    description: v.string(),
    mainImage: v.optional(v.id("_storage")),
    companyHistory: v.string(),
    companyHistoryImage: v.optional(v.id("_storage")),
    companyHistoryVisible: v.optional(v.boolean()),
    vision: v.string(),
    mission: v.string(),
    values: v.string(),
    visionMissionValuesVisible: v.optional(v.boolean()),
    teamTitle: v.string(),
    teamDescription: v.string(),
    teamMembers: v.array(
      v.object({
        name: v.string(),
        position: v.string(),
        bio: v.string(),
        image: v.optional(v.id("_storage")),
        order: v.number(),
      })
    ),
    teamVisible: v.optional(v.boolean()),
    isVisible: v.boolean(),
  }),

  terms: defineTable({
    title: v.string(),
    description: v.string(),
    introduction: v.string(),
    accountTerms: v.string(),
    paymentTerms: v.string(),
    shippingPolicy: v.string(),
    returnPolicy: v.string(),
    lastUpdated: v.string(),
    introductionVisible: v.boolean(),
    accountTermsVisible: v.boolean(),
    paymentTermsVisible: v.boolean(),
    shippingPolicyVisible: v.boolean(),
    returnPolicyVisible: v.boolean(),
    contactInfoVisible: v.boolean(),
    isVisible: v.boolean(),
    contactInfo: v.object({
      email: v.string(),
      phone: v.string(),
      address: v.string(),
    }),
  }),

  contactPage: defineTable({
    title: v.string(),
    description: v.string(),
    phone: v.string(),
    email: v.string(),
    address: v.string(),
    mapLocation: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    workingHours: v.string(),
    formTitle: v.string(),
    formDescription: v.string(),
    mapTitle: v.string(),
    mapDescription: v.string(),
  }),

  contactBanner: defineTable({
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
  }),

  contactSubmissions: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    subject: v.optional(v.string()),
    message: v.string(),
    status: v.string(),
    createdAt: v.string(),
    updatedAt: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"]),

  wishlist: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    addedAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_product", ["userId", "productId"]),

  cart: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    quantity: v.number(),
    selectedColor: v.optional(v.string()),
    addedAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_product", ["userId", "productId"]),

  coupons: defineTable({
    name: v.string(),
    code: v.string(),
    discountPercentage: v.number(),
    isActive: v.boolean(),
    usageLimit: v.optional(v.number()),
    usageCount: v.optional(v.number()),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_code", ["code"]),

  settings: defineTable({
    shippingCost: v.number(),
    freeShippingThreshold: v.union(v.number(), v.null()),
    defaultCurrency: v.optional(v.string()),
    storeName: v.optional(v.string()),
    storePhone: v.optional(v.string()),
    storeEmail: v.optional(v.string()),
    storeAddress: v.optional(v.string()),
    logo: v.optional(v.id("_storage")),
    showLogo: v.optional(v.boolean()),
    adhkarEnabled: v.optional(v.boolean()),
    adhkarInterval: v.optional(v.number()),
  }),

  footer: defineTable({
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
            image: v.optional(v.union(v.string(), v.id("_storage"), v.null())),
          })
        ),
        order: v.number(),
      })
    ),
  }),

  orders: defineTable({
    userId: v.id("users"),
    orderNumber: v.string(),
    status: v.string(),
    fullName: v.string(),
    email: v.string(),
    phone: v.string(),
    country: v.string(),
    city: v.string(),
    district: v.string(),
    street: v.string(),
    postalCode: v.optional(v.string()),
    notes: v.optional(v.string()),
    subtotal: v.number(),
    shipping: v.number(),
    discount: v.number(),
    total: v.number(),
    paymentMethod: v.string(),
    couponCode: v.optional(v.string()),
    couponDiscount: v.optional(v.number()),
    stripePaymentId: v.optional(v.string()),
    paymentStatus: v.optional(v.string()),
    isRead: v.optional(v.boolean()),
    createdAt: v.string(),
    updatedAt: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"])
    .index("by_order_number", ["orderNumber"])
    .index("by_read_status", ["isRead"]),

  orderItems: defineTable({
    orderId: v.id("orders"),
    productId: v.id("products"),
    productName: v.string(),
    productPrice: v.number(),
    quantity: v.number(),
    selectedSize: v.optional(v.string()),
    selectedColor: v.optional(v.string()),
    total: v.number(),
  }).index("by_order", ["orderId"]),

  websiteViews: defineTable({
    date: v.string(),
    count: v.number(),
    uniqueCount: v.number(),
    updatedAt: v.string(),
  }).index("by_date", ["date"]),

  visitorSessions: defineTable({
    visitorId: v.string(),
    lastVisitDate: v.string(),
    lastVisitTimestamp: v.string(),
    isAuthenticated: v.boolean(),
    userId: v.optional(v.id("users")),
  }).index("by_visitor_id", ["visitorId"]),
});
