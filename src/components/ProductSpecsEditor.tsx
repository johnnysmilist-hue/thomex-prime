"use client";

import { useState, useEffect } from "react";
import {
  fetchProductSpecs,
  addProductSpec,
  updateProductSpec,
  deleteProductSpec,
  ProductSpec,
} from "@/lib/supabaseProductSpecs";

export default function ProductSpecsEditor({ productId }: { productId: string }) {
  const [specs, setSpecs] = useState<ProductSpec[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await fetchProductSpecs(productId);
    setSpecs((data as ProductSpec[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (productId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleAdd = async () => {
    if (!newLabel.trim() || !newValue.trim()) return;
    setSaving(true);
    const nextOrder = specs.length > 0 ? Math.max(...specs.map((s) => s.sort_order)) + 1 : 0;
    await addProductSpec(productId, newLabel.trim(), newValue.trim(), nextOrder);
    setNewLabel("");
    setNewValue("");
    setSaving(false);
    load();
  };

  const handleUpdate = async (id: string, label: string, value: string) => {
    setSpecs((prev) => prev.map((s) => (s.id === id ? { ...s, label, value } : s)));
    await updateProductSpec(id, label, value);
  };

  const handleDelete = async (id: string) => {
    setSpecs((prev) => prev.filter((s) => s.id !== id));
    await deleteProductSpec(id);
  };

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
      <p className="text-sm font-semibold text-black dark:text-white mb-1">Product Specifications</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Shown in the &quot;Additional Information&quot; tab on the product page.
      </p>

      {loading ? (
        <p className="text-xs text-gray-400">Loading specs...</p>
      ) : (
        <div className="space-y-2 mb-4">
          {specs.length === 0 && (
            <p className="text-xs text-gray-400">No specs added yet — this product's Additional Information tab will show &quot;No specifications listed.&quot;</p>
          )}
          {specs.map((spec) => (
            <div key={spec.id} className="flex items-center gap-2">
              <input
                type="text"
                defaultValue={spec.label}
                onBlur={(e) => handleUpdate(spec.id, e.target.value, spec.value)}
                placeholder="Label (e.g. Weight)"
                className="w-1/3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-2 py-1.5 text-xs"
              />
              <input
                type="text"
                defaultValue={spec.value}
                onBlur={(e) => handleUpdate(spec.id, spec.label, e.target.value)}
                placeholder="Value (e.g. 384.8 g)"
                className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-2 py-1.5 text-xs"
              />
              <button
                type="button"
                onClick={() => handleDelete(spec.id)}
                className="text-red-500 text-xs font-semibold px-2 shrink-0"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Label (e.g. Battery Life)"
          className="w-1/3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-2 py-1.5 text-xs"
        />
        <input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="Value (e.g. Up to 20 hours)"
          className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-2 py-1.5 text-xs"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={saving}
          className="bg-brand text-white text-xs font-semibold px-3 py-1.5 rounded-md disabled:opacity-60 shrink-0"
        >
          {saving ? "..." : "Add"}
        </button>
      </div>
    </div>
  );
}
