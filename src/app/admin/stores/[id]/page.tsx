"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminGuard from "@/components/AdminGuard";
import AdminSidebar from "@/components/AdminSidebar";
import VerifiedBadge from "@/components/VerifiedBadge";
import { supabase } from "@/lib/supabaseClient";
import { fetchStoreById, updateStoreStatus, updateStoreAdminFields, Store } from "@/lib/supabaseStores";
import { fetchVendorMessages, sendVendorMessage, markMessagesRead, VendorMessage } from "@/lib/supabaseMessages";
import { createNotification } from "@/lib/supabaseNotifications";

type OrderItem = { id?: string; name: string; qty: number; price: number };
type OrderRow = { id: string; items: OrderItem[]; created_at: string };
type VendorProduct = { id: string; name: string; price: number; stock: number; status: string; image_url: string | null };

export default function AdminVendorDetailPage() {
  const params = useParams<{ id: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const [ordersCount, setOrdersCount] = useState(0);
  const [unitsSold, setUnitsSold] = useState(0);
  const [grossRevenue, setGrossRevenue] = useState(0);

  const [commissionInput, setCommissionInput] = useState("10");
  const [notesInput, setNotesInput] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  const [messages, setMessages] = useState<VendorMessage[]>([]);
  const [messageBody, setMessageBody] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: storeData } = await fetchStoreById(params.id);
    if (!storeData) {
      setLoading(false);
      return;
    }
    setStore(storeData);
    setCommissionInput(String(storeData.commission_rate ?? 10));
    setNotesInput(storeData.admin_notes || "");

    const { data: productRows } = await supabase
      .from("products")
      .select("id, name, price, stock, status, image_url")
      .eq("store_id", storeData.id)
      .order("created_at", { ascending: false });

    const vendorProducts = (productRows as VendorProduct[]) || [];
    setProducts(vendorProducts);

    const productIds = new Set(vendorProducts.map((p) => p.id));

    if (productIds.size > 0) {
      const { data: orderRows } = await supabase.from("orders").select("id, items, created_at");
      const allOrders = (orderRows as OrderRow[]) || [];

      let matchedOrders = 0;
      let units = 0;
      let revenue = 0;

      allOrders.forEach((order) => {
        const matchingItems = (order.items || []).filter((item) => item.id && productIds.has(item.id));
        if (matchingItems.length > 0) {
          matchedOrders += 1;
          matchingItems.forEach((item) => {
            units += item.qty;
            revenue += item.qty * item.price;
          });
        }
      });

      setOrdersCount(matchedOrders);
      setUnitsSold(units);
      setGrossRevenue(revenue);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [params.id]);

  useEffect(() => {
    if (!store) return;
    fetchVendorMessages(store.id).then((r) => setMessages(r.data || []));
    markMessagesRead(store.id, "admin");
  }, [store?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store || !messageBody.trim()) return;
    setSendingMessage(true);
    const { data } = await sendVendorMessage(store.id, "admin", messageBody.trim());
    if (data) {
      setMessages((prev) => [...prev, data]);
      await createNotification({
        recipient_type: "vendor",
        recipient_id: store.id,
        title: "New message from Thomex Admin",
        body: messageBody.trim().length > 80 ? messageBody.trim().slice(0, 80) + "..." : messageBody.trim(),
      });
    }
    setMessageBody("");
    setSendingMessage(false);
  };

  const handleStatusChange = async (status: string) => {
    if (!store) return;
    await updateStoreStatus(store.id, status);
    setStore({ ...store, status });
  };

  const handleToggleFeatured = async () => {
    if (!store) return;
    const featured = !store.featured;
    await updateStoreAdminFields(store.id, { featured });
    setStore({ ...store, featured });
  };

  const handleSaveCommission = async () => {
    if (!store) return;
    const rate = parseFloat(commissionInput);
    if (isNaN(rate)) return;
    await updateStoreAdminFields(store.id, { commission_rate: rate });
    setStore({ ...store, commission_rate: rate });
  };

  const handleSaveNotes = async () => {
    if (!store) return;
    setSavingNotes(true);
    await updateStoreAdminFields(store.id, { admin_notes: notesInput });
    setSavingNotes(false);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  const commissionAmount = grossRevenue * (parseFloat(commissionInput || "0") / 100);
  const vendorPayout = grossRevenue - commissionAmount;

  const statusColor = (status: string) => {
    if (status === "Approved") return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30";
    if (status === "Rejected") return "text-red-500 bg-red-50 dark:bg-red-950/30";
    if (status === "Suspended") return "text-orange-500 bg-orange-50 dark:bg-orange-950/30";
    return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30";
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <AdminGuard>
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6">
          <AdminSidebar />

          <div className="flex-1 min-w-0">
            {loading ? (
              <p className="text-sm text-gray-400">Loading vendor...</p>
            ) : !store ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Vendor not found.</p>
            ) : (
              <>
                <a href="/admin/stores" className="text-xs font-semibold text-brand mb-4 inline-block">← All Vendors</a>

                <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-900 overflow-hidden flex items-center justify-center text-gray-400 text-xs shrink-0">
                      {store.logo_url ? <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" /> : store.name.charAt(0)}
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-black dark:text-white flex items-center gap-2">
                        {store.name}
                        {store.status === "Approved" && <VerifiedBadge />}
                        {store.featured && (
                          <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 px-2 py-0.5 rounded-full">★ FEATURED</span>
                        )}
                      </h1>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{store.contact_email} • {store.contact_phone}</p>
                    </div>
                  </div>
                  <span className={"text-xs font-bold px-3 py-1 rounded-full " + statusColor(store.status)}>{store.status}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                  <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Products</p>
                    <p className="text-xl font-bold text-black dark:text-white">{products.length}</p>
                  </div>
                  <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Orders</p>
                    <p className="text-xl font-bold text-black dark:text-white">{ordersCount}</p>
                  </div>
                  <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Units Sold</p>
                    <p className="text-xl font-bold text-black dark:text-white">{unitsSold}</p>
                  </div>
                  <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Gross Revenue</p>
                    <p className="text-xl font-bold text-black dark:text-white">${grossRevenue.toFixed(2)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-5">
                    <p className="text-sm font-bold text-black dark:text-white mb-4">Vendor Actions</p>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {store.status !== "Approved" && (
                        <button onClick={() => handleStatusChange("Approved")} className="bg-brand text-white text-xs font-semibold px-3 py-1.5 rounded-md">Approve</button>
                      )}
                      {store.status === "Approved" && (
                        <button onClick={() => handleStatusChange("Suspended")} className="border border-orange-500 text-orange-500 text-xs font-semibold px-3 py-1.5 rounded-md">Suspend</button>
                      )}
                      {store.status === "Suspended" && (
                        <button onClick={() => handleStatusChange("Approved")} className="bg-brand text-white text-xs font-semibold px-3 py-1.5 rounded-md">Reactivate</button>
                      )}
                      {store.status !== "Rejected" && (
                        <button onClick={() => handleStatusChange("Rejected")} className="border border-red-500 text-red-500 text-xs font-semibold px-3 py-1.5 rounded-md">Reject</button>
                      )}
                      <button onClick={handleToggleFeatured} className="border border-yellow-500 text-yellow-600 dark:text-yellow-400 text-xs font-semibold px-3 py-1.5 rounded-md">
                        {store.featured ? "★ Unfeature" : "☆ Feature on Homepage"}
                      </button>
                    </div>

                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Commission Rate</p>
                    <div className="flex items-center gap-2 mb-5">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={commissionInput}
                        onChange={(e) => setCommissionInput(e.target.value)}
                        className="w-20 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-2 py-1.5 text-sm"
                      />
                      <span className="text-sm text-gray-500 dark:text-gray-400">%</span>
                      <button onClick={handleSaveCommission} className="text-xs font-semibold text-brand">Save</button>
                    </div>

                    {grossRevenue > 0 && (
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-3 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Platform commission ({commissionInput}%)</span>
                          <span className="text-black dark:text-white font-medium">${commissionAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Vendor payout</span>
                          <span className="text-black dark:text-white font-medium">${vendorPayout.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-5">
                    <p className="text-sm font-bold text-black dark:text-white mb-2">Private Admin Notes</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Only visible to admins — not shown to the vendor.</p>
                    <textarea
                      rows={5}
                      value={notesInput}
                      onChange={(e) => setNotesInput(e.target.value)}
                      placeholder="e.g. Late shipping twice in July, warned on Aug 3..."
                      className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-3 py-2 text-sm resize-none mb-2"
                    />
                    <div className="flex items-center gap-3">
                      <button onClick={handleSaveNotes} disabled={savingNotes} className="bg-gray-900 dark:bg-white dark:text-black text-white text-xs font-semibold px-3 py-1.5 rounded-md disabled:opacity-60">
                        {savingNotes ? "Saving..." : "Save Notes"}
                      </button>
                      {notesSaved && <span className="text-xs text-green-600 dark:text-green-400">Saved</span>}
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex gap-3">
                        {store.id_document_url ? (
                          <a href={store.id_document_url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-brand underline">View ID Document</a>
                        ) : (
                          <span className="text-xs text-gray-400">No ID document</span>
                        )}
                        {store.business_document_url ? (
                          <a href={store.business_document_url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-brand underline">View Business Document</a>
                        ) : (
                          <span className="text-xs text-gray-400">No business document</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-5 mb-8">
                  <p className="text-sm font-bold text-black dark:text-white mb-1">Messages</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Chat directly with this vendor.</p>

                  <div className="border border-gray-100 dark:border-gray-800 rounded-md h-64 overflow-y-auto p-3 space-y-2 mb-3">
                    {messages.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center mt-8">No messages yet.</p>
                    ) : (
                      messages.map((m) => (
                        <div key={m.id} className={"flex " + (m.sender === "admin" ? "justify-end" : "justify-start")}>
                          <div
                            className={
                              "max-w-[75%] rounded-lg px-3 py-2 text-xs " +
                              (m.sender === "admin"
                                ? "bg-brand text-white"
                                : "bg-gray-100 dark:bg-gray-800 text-black dark:text-white")
                            }
                          >
                            {m.sender === "vendor" && <p className="text-[10px] font-bold opacity-70 mb-0.5">{store.name}</p>}
                            <p>{m.body}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Reply to this vendor..."
                      value={messageBody}
                      onChange={(e) => setMessageBody(e.target.value)}
                      className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand"
                    />
                    <button type="submit" disabled={sendingMessage || !messageBody.trim()} className="bg-brand text-white px-4 py-2 rounded-md text-sm font-semibold disabled:opacity-60">
                      Send
                    </button>
                  </form>
                </div>

                <p className="text-sm font-bold text-black dark:text-white mb-3">Products ({products.length})</p>
                {products.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">This vendor hasn't listed any products yet.</p>
                ) : (
                  <div className="space-y-2">
                    {products.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3">
                        <div className="w-10 h-10 rounded bg-gray-100 dark:bg-gray-900 overflow-hidden shrink-0 flex items-center justify-center text-gray-400 text-[10px]">
                          {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : "Img"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-black dark:text-white truncate">{p.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">${p.price.toFixed(2)} • Stock: {p.stock} • {p.status}</p>
                        </div>
                        <a href={"/admin/products/" + p.id + "/edit"} className="text-xs font-semibold text-brand shrink-0">Edit</a>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </AdminGuard>
      <Footer />
    </main>
  );
}
