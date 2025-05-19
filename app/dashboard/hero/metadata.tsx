import { Metadata } from "next";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await convex.query(api.settings.get);

    const storeName = settings?.storeName || "تسوق";

    const title = `${storeName} | لوحة التحكم - القسم الرئيسي`;
    return {
      title,
      description:
        "إدارة القسم الرئيسي للصفحة الرئيسية - تعديل العنوان والوصف والصور",
    };
  } catch (error) {
    console.error("Error generating dashboard hero metadata:", error);

    return {
      title: "تسوق | لوحة التحكم - القسم الرئيسي",
      description:
        "إدارة القسم الرئيسي للصفحة الرئيسية - تعديل العنوان والوصف والصور",
    };
  }
}
