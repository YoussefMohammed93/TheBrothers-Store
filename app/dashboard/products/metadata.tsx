import { Metadata } from "next";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await convex.query(api.settings.get);

    const storeName = settings?.storeName || "تسوق";

    const title = `${storeName} | لوحة التحكم - المنتجات`;

    return {
      title,
      description: "إدارة منتجات المتجر - إضافة وتعديل وحذف المنتجات",
    };
  } catch (error) {
    console.error("Error generating dashboard products metadata:", error);

    return {
      title: "تسوق | لوحة التحكم - المنتجات",
      description: "إدارة منتجات المتجر - إضافة وتعديل وحذف المنتجات",
    };
  }
}
