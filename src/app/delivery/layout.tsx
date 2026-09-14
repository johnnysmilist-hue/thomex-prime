"use client";

import { useState, useEffect } from "react";
import DeliveryGuard from "@/components/DeliveryGuard";
import StationSidebar from "@/components/StationSidebar";
import StationOfficerContext from "@/context/StationOfficerContext";
import { fetchStationById } from "@/lib/supabaseStations";
import { DeliveryOfficer } from "@/lib/supabaseDeliveryOfficers";

function ShellForOfficer({ officer, children }: { officer: DeliveryOfficer; children: React.ReactNode }) {
  const [stationName, setStationName] = useState("Unassigned");

  useEffect(() => {
    if (officer.id === "ALL") {
      setStationName("All Stations");
      return;
    }
    if (!officer.station_id) {
      setStationName("Unassigned");
      return;
    }
    fetchStationById(officer.station_id).then((r) => {
      if (r.data) setStationName(r.data.name);
    });
  }, [officer.id, officer.station_id]);

  return (
    <StationOfficerContext.Provider value={officer}>
      <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
        <StationSidebar officer={officer} stationName={stationName} />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </StationOfficerContext.Provider>
  );
}

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  return (
    <DeliveryGuard>
      {(officer) => <ShellForOfficer officer={officer}>{children}</ShellForOfficer>}
    </DeliveryGuard>
  );
}
