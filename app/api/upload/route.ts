import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST() {
  try {
    const uploadUrl = await convex.mutation(api.files.generateUploadUrl, {});
    return Response.json({ uploadUrl });
  } catch (error) {
    console.error("Failed to generate upload URL:", error);
    return Response.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
