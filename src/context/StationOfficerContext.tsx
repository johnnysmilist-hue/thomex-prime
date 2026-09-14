"use client";

import { createContext, useContext } from "react";
import { DeliveryOfficer } from "@/lib/supabaseDeliveryOfficers";

const StationOfficerContext = createContext<DeliveryOfficer | null>(null);

export function useStationOfficer(): DeliveryOfficer {
  const ctx = useContext(StationOfficerContext);
  if (!ctx) {
    throw new Error("useStationOfficer must be used inside the /delivery layout");
  }
  return ctx;
}

export default StationOfficerContext;
