"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/lib/supabaseClient";
import { fetchSiteFaqs, SiteFaq } from "@/lib/supabaseSiteFaqs";

type FormState = {
  id: string | null;
  category_id: string;
  category_label: string;
  question: string;
  answer: string;
  sort_order: number;
};

const emptyForm: FormState = {
  id: null,
  category_id: "",
  category_label: "",
  question: "",
  answer: "",
  sort_order: 0,
};

export default function AdminFaqs() {
  const [faqs, setFaqs] = useState<SiteFaq[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadFaqs = async () => {
    setLoading(true);
    const { data } = await fetchSiteFaqs();
    setFaqs((data as SiteFaq[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const categoryOptions = Array.from(
    new Map(faqs.map((f) => [f.category_id, f.category_label])).entries()
  );

  const openNewForm = () => {
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (faq: SiteFaq) => {
    setForm({
      id: faq.id,
      category_id: faq.category_id,
      category_label: faq.category_label,
      question: faq.question,
      answer: faq.answer,
      sort_order: faq.sort_order,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(emptyForm);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category_id.trim() || !form.category_label.trim() || !form.question.trim() || !form.answer.trim()) {
      return;
    }
    setSaving(true);

    if (form.id) {
      await supabase
        .from("site_faqs")
        .update({
          category_id: form.category_id.trim(),
          category_label: form.category_label.trim(),
          question: form.question.trim(),
          answer: form.answer.trim(),
          sort_order: form.sort_order,
        })
        .eq("id", form.id);
    } else {
      await supabase.from("site_faqs").insert({
        category_id: form.category_id.trim(),
        category_label: form.category_label.trim(),
        question: form.question.trim(),
        answer: form.answer.trim(),
        sort_order: form.sort_order,
      });
    }

    setSaving(false);
    closeForm();
    loadFaqs();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    await supabase.from("site_faqs").delete().eq("id", id);
    loadFaqs();
  };

  // Group for display
  const grouped = faqs.reduce<Record<string, { label: string; items: SiteFaq[] }>>((acc, faq) => {
    if (!acc[faq.category_id]) acc[faq.category_id] = { label: faq.category_label, items: [] };
    acc[faq.category_id].items.push(faq);
    return acc;
  }, {});

  return (
    <AdminLayout title="FAQs">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage the questions shown on your public FAQ page.
        </p>
        <button
          onClick={openNewForm}
          className="text-sm px-4 py-2 rounded-md bg-brand text-white font-semibold shrink-0"
        >
          + Add FAQ
        </button>
      </div>

      {loading && <p className="text-sm text-gray-400">Loading...</p>}
      {!loading && faqs.length === 0 && (
        <p className="text-sm text-gray-400">No FAQs yet. Click "Add FAQ" to create one.</p>
      )}

      <div className="space-y-6">
        {Object.entries(grouped).map(([catId, cat]) => (
          <div key={catId} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <p className="text-sm font-bold text-black dark:text-white">{cat.label}</p>
              <p className="text-[10px] text-gray-400">{catId}</p>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {cat.items
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((faq) => (
                  <div key={faq.id} className="px-4 py-3 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-black dark:text-white">{faq.question}</p>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{faq.answer}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openEditForm(faq)}
                        className="text-xs px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-black dark:text-white"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(faq.id)}
                        className="text-xs px-3 py-1.5 rounded-md border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-lg p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-black dark:text-white">
                {form.id ? "Edit FAQ" : "New FAQ"}
              </p>
              <button onClick={closeForm} className="text-gray-400 hover:text-black dark:hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Category ID (slug)</label>
                <input
                  type="text"
                  list="category-ids"
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  placeholder="e.g. ordering-shipping"
                  className="w-full mt-1 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-black dark:text-white focus:outline-none"
                />
                <datalist id="category-ids">
                  {categoryOptions.map(([id]) => (
                    <option key={id} value={id} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Category label</label>
                <input
                  type="text"
                  value={form.category_label}
                  onChange={(e) => setForm({ ...form, category_label: e.target.value })}
                  placeholder="e.g. Ordering & Shipping"
                  className="w-full mt-1 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-black dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Question</label>
                <input
                  type="text"
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-black dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Answer</label>
                <textarea
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  rows={4}
                  className="w-full mt-1 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-black dark:text-white focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Sort order</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-full mt-1 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 rounded-md bg-brand text-white text-sm font-semibold disabled:opacity-60"
                >
                  {saving ? "Saving..." : form.id ? "Save changes" : "Create FAQ"}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 rounded-md border border-gray-200 dark:border-gray-700 text-sm text-black dark:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
