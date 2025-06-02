"use client";

import { toast } from "sonner";
import { useQuery } from "convex/react";
import adhkarData from "@/data/adhkar.json";
import { api } from "@/convex/_generated/api";
import { usePathname } from "next/navigation";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface Adhkar {
  id: number;
  text: string;
  category: string;
}

interface AdhkarContextType {
  isEnabled: boolean;
  interval: number;
  currentAdhkar: Adhkar | null;
}

const AdhkarContext = createContext<AdhkarContextType | undefined>(undefined);

export function AdhkarProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const settings = useQuery(api.settings.get);
  
  const [currentAdhkar, setCurrentAdhkar] = useState<Adhkar | null>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const isEnabled = settings?.adhkarEnabled ?? false;
  const interval = settings?.adhkarInterval ?? 5;
  
  const isDashboard = pathname?.startsWith('/dashboard');

  useEffect(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    if (isEnabled && !isDashboard && adhkarData.length > 0) {
      const showRandomAdhkar = () => {
        const randomIndex = Math.floor(Math.random() * adhkarData.length);
        const selectedAdhkar = adhkarData[randomIndex];
        setCurrentAdhkar(selectedAdhkar);
        
        toast(
          <div className="flex flex-col gap-2 text-right" dir="rtl">
            <div className="text-lg font-semibold text-primary">
              {selectedAdhkar.text}
            </div>
          </div>,
          {
            duration: 8000,
            position: "bottom-right",
            style: {
              background: "var(--background)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            },
          }
        );
      };

      const initialTimeout = setTimeout(showRandomAdhkar, 30000);
      
      const newIntervalId = setInterval(showRandomAdhkar, interval * 60 * 1000);
      setIntervalId(newIntervalId);

      return () => {
        clearTimeout(initialTimeout);
        clearInterval(newIntervalId);
      };
    }
  }, [isEnabled, interval, isDashboard]);

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  return (
    <AdhkarContext.Provider
      value={{
        isEnabled,
        interval,
        currentAdhkar,
      }}
    >
      {children}
    </AdhkarContext.Provider>
  );
}

export function useAdhkar() {
  const context = useContext(AdhkarContext);
  if (context === undefined) {
    throw new Error("useAdhkar must be used within an AdhkarProvider");
  }
  return context;
}
