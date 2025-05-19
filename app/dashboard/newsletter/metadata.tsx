import { Metadata } from "next";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await convex.query(api.settings.get);

    const storeName = settings?.storeName || "تسوق";

    const title = `${storeName} | لوحة التحكم - النشرة البريدية`;

    return {
      title,
      description:
        "إدارة النشرة البريدية - عرض المشتركين وتعديل إعدادات النشرة",
    };
  } catch (error) {
    console.error("Error generating dashboard newsletter metadata:", error);

    return {
      title: "تسوق | لوحة التحكم - النشرة البريدية",
      description:
        "إدارة النشرة البريدية - عرض المشتركين وتعديل إعدادات النشرة",
    };
  }
}
