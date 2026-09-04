"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  fetchShippingRates,
  updateShippingRate,
  ShippingRate,
  fetchCountryRates,
  updateCountryRate,
  addCountryRate,
  CountryRate,
} from "@/lib/supabaseShipping";

export default function AdminShippingPage() {
  const [tab, setTab] = useState<"kenya" | "international">("kenya");

  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [countryRates, setCountryRates] = useState<CountryRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const [newCountry, setNewCountry] = useState("");
  const [newFee, setNewFee] = useState("");
  const [addingCountry, setAddingCountry] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: kenyaData }, { data: countryData }] = await Promise.all([
      fetchShippingRates(),
      fetchCountryRates(),
    ]);
    setRates((kenyaData as ShippingRate[]) || []);
    setCountryRates((countryData as CountryRate[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpdateKenya = async (id: string, fee: number) => {
    setSavingId(id);
    setRates((prev) => prev.map((r) => (r.id === id ? { ...r, fee } : r)));
    await updateShippingRate(id, fee);
    setSavingId(null);
  };

  const handleUpdateCountry = async (id: string, fee: number) => {
    setSavingId(id);
    setCountryRates((prev) => prev.map((r) => (r.id === id ? { ...r, fee } : r)));
    await updateCountryRate(id, fee);
    setSavingId(null);
  };

  const handleAddCountry = async () => {
    if (!newCountry.trim()) return;
    setAddingCountry(true);
    const fee = parseFloat(newFee) || 0;
    const { data } = await addCountryRate(newCountry.trim(), fee);
    if (data) setCountryRates((prev) => [...prev, data as CountryRate].sort((a, b) => a.country.localeCompare(b.country)));
    setNewCountry("");
    setNewFee("");
    setAddingCountry(false);
  };

  const filteredKenya = rates.filter((r) => r.county.toLowerCase().includes(search.toLowerCase()));
  const filteredCountries = countryRates.filter((r) => r.country.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout title="Shipping Rates">
      <p className="text-sm text-gray-500 dark:text-gray-400 -mt-4 mb-6">
        Set delivery fees by location. Customers see the matching fee automatically applied at checkout.
      </p>

      <div className="flex gap-1 mb-4">
        <button
          onClick={() => { setTab("kenya"); setSearch(""); }}
          className={"text-sm px-4 py-2 rounded-md font-medium transition-colors " + (tab === "kenya" ? "bg-brand text-white" : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300")}
        >
          Kenya (Counties)
        </button>
        <button
          onClick={() => { setTab("international"); setSearch(""); }}
          className={"text-sm px-4 py-2 rounded-md font-medium transition-colors " + (tab === "international" ? "bg-brand text-white" : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300")}
        >
          International
        </button>
      </div>

      <div className="relative max-w-xs mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={tab === "kenya" ? "Search county..." : "Search country..."}
          className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-black dark:text-white focus:outline-none"
        />
      </div>

      {tab === "international" && (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 mb-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Add a country</label>
            <input
              type="text"
              value={newCountry}
              onChange={(e) => setNewCountry(e.target.value)}
              placeholder="Country name"
              className="px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-black dark:text-white focus:outline-none w-48"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Fee (KSh)</label>
            <input
              type="number"
              min="0"
              value={newFee}
              onChange={(e) => setNewFee(e.target.value)}
              placeholder="0"
              className="px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-black dark:text-white focus:outline-none w-28"
            />
          </div>
          <button
            onClick={handleAddCountry}
            disabled={addingCountry || !newCountry.trim()}
            className="bg-brand text-white text-sm font-semibold px-4 py-1.5 rounded-md disabled:opacity-60"
          >
            {addingCountry ? "Adding..." : "Add Country"}
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white dark:bg-gray-900">
              <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-xs text-gray-500 dark:text-gray-400 uppercase">
                <th className="px-5 py-3 font-semibold">{tab === "kenya" ? "County" : "Country"}</th>
                <th className="px-5 py-3 font-semibold">Shipping Fee (KSh)</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={2} className="px-5 py-8 text-center text-gray-400">Loading...</td></tr>
              )}

              {!loading && tab === "kenya" && filteredKenya.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 dark:border-gray-800/60">
                  <td className="px-5 py-3 text-black dark:text-white font-medium">{r.county}</td>
                  <td className="px-5 py-3">
                    <input
                      type="number"
                      min="0"
                      defaultValue={r.fee}
                      onBlur={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        if (val !== r.fee) handleUpdateKenya(r.id, val);
                      }}
                      className="w-28 px-2 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white text-sm focus:outline-none focus:border-brand"
                    />
                    {savingId === r.id && <span className="text-xs text-gray-400 ml-2">Saving...</span>}
                  </td>
                </tr>
              ))}

              {!loading && tab === "international" && filteredCountries.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 dark:border-gray-800/60">
                  <td className="px-5 py-3 text-black dark:text-white font-medium">{r.country}</td>
                  <td className="px-5 py-3">
                    <input
                      type="number"
                      min="0"
                      defaultValue={r.fee}
                      onBlur={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        if (val !== r.fee) handleUpdateCountry(r.id, val);
                      }}
                      className="w-28 px-2 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white text-sm focus:outline-none focus:border-brand"
                    />
                    {savingId === r.id && <span className="text-xs text-gray-400 ml-2">Saving...</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
