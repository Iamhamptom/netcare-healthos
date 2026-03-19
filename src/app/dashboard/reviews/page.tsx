"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Plus, Loader2, Trash2, RefreshCw } from "lucide-react";
import Modal from "@/components/dashboard/Modal";
import EmptyState from "@/components/dashboard/EmptyState";

interface Review {
  id: string;
  rating: number;
  comment: string;
  source: string;
  authorName: string;
  createdAt: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ rating: 5, comment: "", source: "google", authorName: "" });
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  async function syncGoogleReviews() {
    setSyncing(true);
    setSyncMsg("");
    try {
      const res = await fetch("/api/google/reviews", { method: "POST" });
      const data = await res.json();
      if (data.error) { setSyncMsg(data.error); }
      else { setSyncMsg(`Synced ${data.synced} new review${data.synced !== 1 ? "s" : ""} from Google`); await fetchReviews(); }
    } catch { setSyncMsg("Failed to sync"); }
    setSyncing(false);
  }

  async function fetchReviews() {
    const res = await fetch("/api/reviews");
    const data = await res.json();
    setReviews(data.reviews || []);
  }

  useEffect(() => { fetchReviews(); }, []);

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  async function createReview(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ rating: 5, comment: "", source: "google", authorName: "" });
    setModalOpen(false);
    await fetchReviews();
    setLoading(false);
  }

  async function deleteReview(id: string) {
    await fetch(`/api/reviews/${id}`, { method: "DELETE" });
    await fetchReviews();
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Star className="w-5 h-5 text-yellow-400" />
          <h2 className="text-lg font-semibold">Reviews</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={syncGoogleReviews}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-[var(--border)] hover:bg-white/10 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} /> Sync Google
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--gold)] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Add Review
          </button>
        </div>
      </div>

      {syncMsg && (
        <div className="px-4 py-2 rounded-lg bg-[var(--teal)]/10 text-[var(--teal)] text-sm">
          {syncMsg}
        </div>
      )}

      {/* Average rating card */}
      <div className="p-6 rounded-xl glass-panel flex items-center gap-6">
        <div className="text-4xl font-bold">{avgRating}</div>
        <div>
          <div className="flex gap-1 mb-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-5 h-5 ${s <= Math.round(Number(avgRating) || 0) ? "text-yellow-400 fill-yellow-400" : "text-[var(--ivory)]/10"}`}
              />
            ))}
          </div>
          <p className="text-sm text-[var(--text-secondary)]">{reviews.length} reviews total</p>
        </div>
      </div>

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <EmptyState icon={Star} title="No reviews yet" description="Add your first review to track patient feedback" />
      ) : (
        <div className="space-y-3">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-xl glass-panel"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${s <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-[var(--ivory)]/10"}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-[var(--text-secondary)] bg-[var(--charcoal)]/20 px-2 py-0.5 rounded-full">{review.source}</span>
                  </div>
                  <p className="text-sm font-medium">{review.authorName || "Anonymous"}</p>
                </div>
                <button onClick={() => deleteReview(review.id)} className="p-1 text-[var(--text-secondary)] hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {review.comment && <p className="text-sm text-[var(--text-secondary)]">{review.comment}</p>}
              <p className="text-xs text-[var(--text-secondary)]/50 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Review Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Review">
        <form onSubmit={createReview} className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, rating: s })}
                  className="p-1"
                >
                  <Star className={`w-6 h-6 ${s <= form.rating ? "text-yellow-400 fill-yellow-400" : "text-[var(--ivory)]/10"}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Author Name</label>
            <input
              type="text"
              value={form.authorName}
              onChange={(e) => setForm({ ...form, authorName: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg text-sm text-[var(--ivory)] focus:outline-none focus:border-[var(--primary)]/40"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Source</label>
            <select
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg text-sm text-[var(--ivory)] focus:outline-none focus:border-[var(--primary)]/40"
            >
              <option value="google">Google</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="facebook">Facebook</option>
              <option value="in-person">In Person</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Comment</label>
            <textarea
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg text-sm text-[var(--ivory)] resize-none focus:outline-none focus:border-[var(--primary)]/40"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[var(--gold)] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Add Review
          </button>
        </form>
      </Modal>
    </div>
  );
}
