"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const getVisitorId = (): string => {
  if (typeof window === "undefined") return "";

  const storageKey = "visitor_id";
  let visitorId = localStorage.getItem(storageKey);

  if (!visitorId) {
    visitorId =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    localStorage.setItem(storageKey, visitorId);
  }

  return visitorId;
};

export function ViewTracker() {
  const recordView = useMutation(api.analytics.recordView);

  useEffect(() => {
    const recordViewOnce = async () => {
      try {
        const visitorId = getVisitorId();
        if (!visitorId) return;

        await recordView({ visitorId });
      } catch (error) {
        console.error("Failed to record view:", error);
      }
    };

    recordViewOnce();
  }, [recordView]);

  return null;
}
