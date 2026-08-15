"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type ViewedItem = {
  id: string;
  viewedAt: number;
};

type RecentlyViewedContextType = {
  ids: string[];
  addViewed: (id: string) => void;
};

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined);

const MAX_ITEMS = 12;

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ViewedItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("thomex-recently-viewed");
    if (saved) {
      setItems(JSON.parse(saved));
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("thomex-recently-viewed", JSON.stringify(items));
    }
  }, [items, loaded]);

  const addViewed = (id: string) => {
    setItems((prev) => {
      const withoutCurrent = prev.filter((i) => i.id !== id);
      const updated = [{ id, viewedAt: Date.now() }, ...withoutCurrent];
      return updated.slice(0, MAX_ITEMS);
    });
  };

  const ids = items.map((i) => i.id);

  return (
    <RecentlyViewedContext.Provider value={{ ids, addViewed }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext);
  if (!context) throw new Error("useRecentlyViewed must be used within RecentlyViewedProvider");
  return context;
}
