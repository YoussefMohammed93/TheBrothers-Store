import { Metadata } from "next";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await convex.query(api.settings.get);

    const storeName = settings?.storeName || "تسوق";

    const title = `${storeName} | لوحة التحكم - الكوبونات`;

    return {
      title,
      description: "إدارة كوبونات الخصم - إنشاء وتعديل وحذف كوبونات الخصم",
    };
  } catch (error) {
    console.error("Error generating dashboard coupons metadata:", error);

    return {
      title: "تسوق | لوحة التحكم - الكوبونات",
      description: "إدارة كوبونات الخصم - إنشاء وتعديل وحذف كوبونات الخصم",
    };
  }
}
