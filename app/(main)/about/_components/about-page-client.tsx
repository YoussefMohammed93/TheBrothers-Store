"use client";

import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import { AboutPageData } from "./about-page-types";
import { AboutPageContent } from "./about-page-content";
import { AboutPageSkeleton } from "./about-page-skeleton";
import { AboutPageNotVisible } from "./about-page-not-visible";

export function AboutPageClient() {
  const [isLoading, setIsLoading] = useState(true);

  const aboutPageData = useQuery(api.about.getAboutPage);

  useEffect(() => {
    if (aboutPageData !== undefined) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [aboutPageData]);

  if (isLoading || aboutPageData === undefined) {
    return <AboutPageSkeleton />;
  }

  if (aboutPageData && aboutPageData.isVisible === false) {
    return <AboutPageNotVisible />;
  }

  return (
    <AboutPageContent aboutPageData={aboutPageData as AboutPageData | null} />
  );
}
