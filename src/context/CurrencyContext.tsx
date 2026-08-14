"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { detectUserCurrency, fetchExchangeRates, formatPrice } from "@/lib/currency";

type CurrencyContextType = {
  currency: string;
  rates: Record<string, number>;
  loading: boolean;
  format: (amountInKES: number) => string;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState("KES");
  const [rates, setRates] = useState<Record<string, number>>({ KES: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [detectedCurrency, fetchedRates] = await Promise.all([
        detectUserCurrency(),
        fetchExchangeRates(),
      ]);
      setCurrency(detectedCurrency);
      setRates(fetchedRates);
      setLoading(false);
    };
    load();
  }, []);

  const format = (amountInKES: number) => formatPrice(amountInKES, currency, rates);

  return (
    <CurrencyContext.Provider value={{ currency, rates, loading, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used within CurrencyProvider");
  return context;
}
