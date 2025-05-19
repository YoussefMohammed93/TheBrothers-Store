import { Metadata } from "next";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await convex.query(api.settings.get);

    const storeName = settings?.storeName || "تسوق";

    const title = `${storeName} | لوحة التحكم - الرئيسية`;

    return {
      title,
      description: "الصفحة الرئيسية للوحة التحكم - عرض إحصائيات المتجر",
    };
  } catch (error) {
    console.error("Error generating dashboard home metadata:", error);

    return {
      title: "تسوق | لوحة التحكم - الرئيسية",
      description: "الصفحة الرئيسية للوحة التحكم - عرض إحصائيات المتجر",
    };
  }
}
