import { useEffect, useState } from "react";
import { Star, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { refreshStats } from "@/lib/useListingStats";

type Review = {
  id: string;
  reviewer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_name?: string | null;
};

export function ReviewsSection({ listingId }: { listingId: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [eligible, setEligible] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: rs } = await supabase
        .from("listing_reviews")
        .select("id,reviewer_id,rating,comment,created_at")
        .eq("listing_id", listingId)
        .order("created_at", { ascending: false });
      if (!alive) return;
      const list = (rs ?? []) as Review[];

      const ids = Array.from(new Set(list.map((r) => r.reviewer_id)));
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id,full_name")
          .in("id", ids);
        const map = new Map((profs ?? []).map((p: any) => [p.id, p.full_name]));
        list.forEach((r) => { r.reviewer_name = map.get(r.reviewer_id) ?? null; });
      }
      setReviews(list);

      if (user) {
        const today = new Date().toISOString().slice(0, 10);
        const { data: bk } = await supabase
          .from("bookings")
          .select("id,end_date,status,reviewer:listing_reviews(id)" as any)
          .eq("listing_id", listingId)
          .eq("user_id", user.id)
          .neq("status", "cancelled")
          .lte("end_date", today)
          .limit(1);
        const already = list.some((r) => r.reviewer_id === user.id);
        setEligible(Boolean(bk && bk.length > 0) && !already);
      } else {
        setEligible(false);
      }
    })();
    return () => { alive = false; };
  }, [listingId, user]);

  async function submit() {
    if (!user) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("listing_reviews").insert({
        listing_id: listingId,
        reviewer_id: user.id,
        rating,
        comment: comment.trim() || null,
      });
      if (error) throw error;
      toast.success("Review posted");
      setShowForm(false);
      setComment("");
      refreshStats();
      const { data: rs } = await supabase
        .from("listing_reviews")
        .select("id,reviewer_id,rating,comment,created_at")
        .eq("listing_id", listingId)
        .order("created_at", { ascending: false });
      setReviews((rs ?? []) as Review[]);
      setEligible(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Could not post review");
    } finally {
      setBusy(false);
    }
  }

  const avg = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  return (
    <div className="rounded-2xl glass p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Reviews</div>
          <div className="mt-1 flex items-center gap-2">
            <Star className="h-5 w-5 fill-accent text-accent" />
            <span className="text-lg font-semibold">{avg || "—"}</span>
            <span className="text-sm text-muted-foreground">· {reviews.length} {reviews.length === 1 ? "review" : "reviews"}</span>
          </div>
        </div>
        {eligible && (
          <button onClick={() => setShowForm((v) => !v)} className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground">
            {showForm ? "Cancel" : "Leave a review"}
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
                  <Star className={`h-7 w-7 transition ${n <= rating ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="Share how your stay or ride went…"
              className="w-full rounded-xl bg-background/60 border border-border px-3 py-2 text-sm outline-none focus:border-primary resize-none"
            />
            <button onClick={submit} disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60">
              <Send className="h-4 w-4" /> {busy ? "Posting…" : "Post review"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {reviews.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet. Be the first after your stay.</p>}
        {reviews.map((r) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-background/40 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{r.reviewer_name || "Traveller"}</span>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-accent text-accent" : "text-muted-foreground/40"}`} />
                ))}
              </div>
            </div>
            {r.comment && <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>}
            <div className="mt-1 text-[11px] text-muted-foreground/70">{format(new Date(r.created_at), "MMM d, yyyy")}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
