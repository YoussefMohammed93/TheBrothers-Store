import { Metadata } from "next";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await convex.query(api.settings.get);

    const storeName = settings?.storeName || "تسوق";

    const title = `${storeName} | لوحة التحكم - الطلبات`;

    return {
      title,
      description: "إدارة طلبات المتجر - عرض وتحديث حالة الطلبات",
    };
  } catch (error) {
    console.error("Error generating dashboard orders metadata:", error);

    return {
      title: "تسوق | لوحة التحكم - الطلبات",
      description: "إدارة طلبات المتجر - عرض وتحديث حالة الطلبات",
    };
  }
}
