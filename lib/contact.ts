import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

export interface ContactPageData {
  title: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  mapLocation: {
    lat: number;
    lng: number;
  };
  workingHours: string;
  formTitle: string;
  formDescription: string;
  mapTitle: string;
  mapDescription: string;
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function getContactPageData(): Promise<ContactPageData | null> {
  try {
    const data = await convex.query(api.contact.getContactPage);
    return data as ContactPageData | null;
  } catch (error) {
    console.error("Error fetching contact page data:", error);
    return null;
  }
}
