import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { Id } from "@/convex/_generated/dataModel";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function getMultipleImageUrls(
  storageIds: Id<"_storage">[]
): Promise<string[]> {
  try {
    if (!storageIds || storageIds.length === 0) {
      return [];
    }

    const urls = await client.query(api.files.getMultipleImageUrls, {
      storageIds,
    });

    return urls as string[];
  } catch (error) {
    console.error("Error fetching image URLs:", error);
    return [];
  }
}
