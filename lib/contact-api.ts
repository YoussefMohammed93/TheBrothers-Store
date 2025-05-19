import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { Id } from "@/convex/_generated/dataModel";

export interface ContactItem {
  title: string;
  description: string;
  image: Id<"_storage">;
  order: number;
}

export interface ContactBannerData {
  title: string;
  description: string;
  isVisible: boolean;
  contactItems: ContactItem[];
}

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function getContactBanner(): Promise<ContactBannerData | null> {
  try {
    const data = await client.query(api.contact.getContactBanner);
    return data as ContactBannerData;
  } catch (error) {
    console.error("Error fetching contact banner data:", error);
    return null;
  }
}
