"use client";

import React, {
  useState,
  useEffect,
  ReactNode,
  useContext,
  createContext,
} from "react";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";

// Define currency types
export type CurrencyCode = "SAR" | "EGP" | "USD";

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
}

// Currency data
export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  SAR: {
    code: "SAR",
    symbol: "ر.س",
    name: "ريال سعودي",
  },
  EGP: {
    code: "EGP",
    symbol: "ج.م",
    name: "جنيه مصري",
  },
  USD: {
    code: "USD",
    symbol: "$",
    name: "دولار أمريكي",
  },
};

type CurrencyContextType = {
  currency: CurrencyInfo;
  isLoading: boolean;
  setCurrency: (currencyCode: CurrencyCode) => void;
  formatPrice: (amount: number) => string;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  // API queries and mutations
  const settings = useQuery(api.settings.get);
  const saveSettings = useMutation(api.settings.save);

  // State declarations
  const [isLoading, setIsLoading] = useState(true);
  const [currency, setCurrencyState] = useState<CurrencyInfo>(CURRENCIES.SAR);

  // Effects
  useEffect(() => {
    if (settings) {
      const defaultCurrency = settings.defaultCurrency as CurrencyCode;
      if (defaultCurrency && CURRENCIES[defaultCurrency]) {
        setCurrencyState(CURRENCIES[defaultCurrency]);
      }
      setIsLoading(false);
    }
  }, [settings]);

  // Handler functions
  const setCurrency = async (currencyCode: CurrencyCode) => {
    if (CURRENCIES[currencyCode]) {
      setCurrencyState(CURRENCIES[currencyCode]);

      if (settings) {
        try {
          await saveSettings({
            ...settings,
            defaultCurrency: currencyCode,
          });
        } catch {}
      }
    }
  };

  const formatPrice = (amount: number): string => {
    return `${amount.toLocaleString("ar-SA")} ${currency.symbol}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        isLoading,
        setCurrency,
        formatPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
