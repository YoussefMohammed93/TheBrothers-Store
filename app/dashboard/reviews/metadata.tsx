import { Metadata } from "next";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await convex.query(api.settings.get);

    const storeName = settings?.storeName || "تسوق";

    const title = `${storeName} | لوحة التحكم - التقييمات`;

    return {
      title,
      description: "إدارة تقييمات المنتجات - عرض وإدارة تقييمات العملاء",
    };
  } catch (error) {
    console.error("Error generating dashboard reviews metadata:", error);

    return {
      title: "تسوق | لوحة التحكم - التقييمات",
      description: "إدارة تقييمات المنتجات - عرض وإدارة تقييمات العملاء",
    };
  }
}
