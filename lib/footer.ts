import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");

export const revalidate = 3600;

export async function getFooter() {
  try {
    const footerData = await convex.query(api.footer.getFooter);
    return footerData;
  } catch (error) {
    console.error("Error fetching footer data:", error);
    return null;
  }
}
