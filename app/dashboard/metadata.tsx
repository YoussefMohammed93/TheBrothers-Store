import { Metadata } from "next";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await convex.query(api.settings.get);

    const storeName = settings?.storeName || "تسوق";

    const title = `${storeName} | لوحة التحكم`;

    let logoUrl = "/favicon.ico";
    if (settings?.logo) {
      const imageUrl = await convex.query(api.files.getImageUrl, {
        storageId: settings.logo,
      });
      if (typeof imageUrl === "string") {
        logoUrl = imageUrl;
      }
    }

    return {
      title,
      description: "لوحة تحكم المتجر - إدارة المنتجات والطلبات والإعدادات",
      openGraph: {
        title,
        description: "لوحة تحكم المتجر - إدارة المنتجات والطلبات والإعدادات",
        type: "website",
        locale: "ar_SA",
        images: ["/dashboard.jpg"],
        siteName: storeName,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description: "لوحة تحكم المتجر - إدارة المنتجات والطلبات والإعدادات",
        images: ["/dashboard.jpg"],
      },
      icons: {
        icon: logoUrl,
        apple: logoUrl,
      },
      robots: {
        index: false,
        follow: false,
      },
    };
  } catch (error) {
    console.error("Error generating dashboard metadata:", error);

    return {
      title: "تسوق | لوحة التحكم",
      description: "لوحة تحكم المتجر - إدارة المنتجات والطلبات والإعدادات",
      openGraph: {
        title: "تسوق | لوحة التحكم",
        description: "لوحة تحكم المتجر - إدارة المنتجات والطلبات والإعدادات",
        type: "website",
        locale: "ar_SA",
        images: ["/dashboard.jpg"],
      },
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}
