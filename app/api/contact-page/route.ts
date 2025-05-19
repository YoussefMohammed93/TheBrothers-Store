import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET() {
  try {
    const data = await convex.query(api.contact.getContactPage);
    return Response.json({ data });
  } catch (error) {
    console.error("Failed to fetch contact page data:", error);
    return Response.json(
      { error: "Failed to fetch contact page data" },
      { status: 500 }
    );
  }
}
