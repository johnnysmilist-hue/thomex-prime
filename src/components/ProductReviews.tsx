"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchReviews, fetchUserReview, upsertReview, deleteReview, Review } from "@/lib/supabaseReviews";

export default function ProductReviews({ productId }: { productId: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [hasReviewed, setHasReviewed] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await fetchReviews(productId);
    setReviews(data || []);

    if (user) {
      const { data: mine } = await fetchUserReview(productId, user.id);
      if (mine) {
        setMyRating(mine.rating);
        setMyComment(mine.comment || "");
        setHasReviewed(true);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, user]);

  const handleSubmit = async () => {
    if (!user || myRating === 0) return;
    setSaving(true);
    const username = user.user_metadata?.username || user.email?.split("@")[0] || "Customer";
    await upsertReview({
      product_id: productId,
      user_id: user.id,
      username,
      rating: myRating,
      comment: myComment,
    });
    setSaving(false);
    setHasReviewed(true);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete your review?")) return;
    await deleteReview(id, productId);
    setMyRating(0);
    setMyComment("");
    setHasReviewed(false);
    load();
  };

  return (
    <div className="mt-8">
      {user ? (
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-5 mb-6">
          <p className="text-sm font-semibold text-black dark:text-white mb-3">
            {hasReviewed ? "Update your review" : "Leave a review"}
          </p>
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setMyRating(star)}
                className={star <= myRating ? "text-yellow-500 text-xl" : "text-gray-300 dark:text-gray-700 text-xl"}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={myComment}
            onChange={(e) => setMyComment(e.target.value)}
            placeholder="Share your thoughts about this product..."
            rows={3}
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm resize-none mb-3"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={saving || myRating === 0}
              className="bg-brand text-white px-5 py-2 rounded-md text-sm font-semibold disabled:opacity-60"
            >
              {saving ? "Saving..." : hasReviewed ? "Update Review" : "Submit Review"}
            </button>
            {hasReviewed && (
              <button
                onClick={() => {
                  const mine = reviews.find((r) => r.user_id === user.id);
                  if (mine) handleDelete(mine.id);
                }}
                className="text-red-500 text-sm font-semibold px-3"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          <a href="/signin" className="text-brand font-semibold">Sign in</a> to leave a review.
        </p>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No reviews yet — be the first!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-black dark:text-white">{review.username}</p>
                <span className="text-yellow-500 text-xs">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
              </div>
              {review.comment && <p className="text-sm text-gray-600 dark:text-gray-300">{review.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
