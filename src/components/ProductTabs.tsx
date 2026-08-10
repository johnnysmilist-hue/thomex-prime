"use client";

import { useState } from "react";

const specs = [
  { label: "Weight", value: "384.8 g" },
  { label: "Dimensions", value: "187.3 x 168.6 x 83.4 mm" },
  { label: "Material", value: "Aluminium & Mesh" },
  { label: "Colors", value: "Space Gray, Silver, Green, Sky Blue, Pink" },
  { label: "Battery Life", value: "Up to 20 hours" },
  { label: "Warranty", value: "1 Year" },
];

const tabs = ["Description", "Additional Information", "Reviews"];

export default function ProductTabs() {
  const [active, setActive] = useState(1);

  return (
    <div className="mt-12">
      <div className="flex gap-8 border-b border-gray-200 dark:border-gray-800 mb-6">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActive(i)}
            className={
              i === active
                ? "pb-3 text-sm font-semibold text-brand border-b-2 border-brand"
                : "pb-3 text-sm font-medium text-gray-500 dark:text-gray-400"
            }
          >
            {tab}
          </button>
        ))}
      </div>

      {active === 0 && (
        <p className="text-sm text-gray-600 dark:text-gray-300 max-w-2xl">
          The AirPods-Max delivers rich, immersive sound with active noise cancellation
          and a comfortable over-ear fit, built for all-day listening.
        </p>
      )}

      {active === 1 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 dark:border-gray-800">
            <thead>
              <tr className="bg-brand text-white">
                <th className="text-left px-4 py-2 font-semibold">Specification</th>
                <th className="text-left px-4 py-2 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody>
              {specs.map((spec, i) => (
                <tr
                  key={spec.label}
                  className={i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-950"}
                >
                  <td className="px-4 py-2 text-black dark:text-white font-medium">{spec.label}</td>
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {active === 2 && (
        <p className="text-sm text-gray-600 dark:text-gray-300">No reviews yet.</p>
      )}
    </div>
  );
}
