import { Id } from "@/convex/_generated/dataModel";

export interface TeamMember {
  bio: string;
  name: string;
  order: number;
  position: string;
  imageUrl?: string;
  image?: Id<"_storage">;
}

export interface AboutPageData {
  _id?: Id<"aboutPage">;
  _creationTime?: number;
  title: string;
  description: string;
  mainImage?: Id<"_storage">;
  mainImageUrl?: string | null;
  companyHistory: string;
  companyHistoryImage?: Id<"_storage">;
  companyHistoryImageUrl?: string | null;
  companyHistoryVisible?: boolean;
  vision: string;
  mission: string;
  values: string;
  visionMissionValuesVisible?: boolean;
  teamTitle: string;
  teamDescription: string;
  teamMembers: TeamMember[];
  teamVisible?: boolean;
  isVisible: boolean;
}
