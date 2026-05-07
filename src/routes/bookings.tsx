import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Star, MapPin, CheckCircle2, Clock } from "lucide-react";
import { useStore, isReviewable, type Booking } from "@/lib/store";

export const Route = createFileRoute("/bookings")({
  head: () => ({ meta: [{ title: "My trips — LuxeLanka" }, { name: "description", content: "Track and review your Sri Lanka bookings." }] }),
  component: BookingsPage,
});

function BookingsPage() {
  const { bookings, listings, rateBooking } = useStore();
  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">My trips</h1>
      <p className="mt-2 text-muted-foreground">Past, present and future — all synced.</p>

      <div className="mt-8 space-y-4">
        {bookings.length === 0 && <div className="rounded-2xl glass p-12 text-center text-muted-foreground">No bookings yet. Find something on the map.</div>}
        {bookings.map((b, i) => {
          const listing = listings.find(l => l.id === b.listingId);
          if (!listing) return null;
          const reviewable = isReviewable(b);
          const completed = new Date(b.endDate) < new Date();
          return (
            <motion.div key={b.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="overflow-hidden rounded-2xl glass">
              <div className="flex flex-col md:flex-row">
                <img src={listing.image} alt={listing.title} className="h-48 w-full object-cover md:h-auto md:w-56" />
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">{listing.category}</div>
                      <h3 className="mt-1 text-lg font-semibold">{listing.title}</h3>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {listing.city}</p>
                    </div>
                    <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs ${
                      completed ? "bg-secondary text-muted-foreground" : "bg-primary/20 text-primary"
                    }`}>
                      {completed ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {completed ? "Completed" : "Upcoming"}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                    <div><div className="text-muted-foreground">Check-in</div><div className="mt-0.5 font-medium">{new Date(b.startDate).toLocaleDateString()}</div></div>
                    <div><div className="text-muted-foreground">Check-out</div><div className="mt-0.5 font-medium">{new Date(b.endDate).toLocaleDateString()}</div></div>
                    <div><div className="text-muted-foreground">Total</div><div className="mt-0.5 font-medium">${b.total}</div></div>
                  </div>

                  {b.rating ? (
                    <div className="mt-4 rounded-xl bg-secondary/50 p-3 text-sm">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < b.rating! ? "fill-accent text-accent" : "text-muted-foreground/40"}`} />
                        ))}
                      </div>
                      {b.review && <p className="mt-1 text-muted-foreground">"{b.review}"</p>}
                    </div>
                  ) : reviewable ? (
                    <ReviewForm onSubmit={(r, c) => rateBooking(b.id, r, c)} />
                  ) : !completed ? (
                    <div className="mt-4 text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Reviewable after check-out</div>
                  ) : null}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ReviewForm({ onSubmit }: { onSubmit: (rating: number, comment: string) => void }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  return (
    <div className="mt-4 rounded-xl bg-secondary/40 p-3">
      <div className="text-xs font-medium">Rate your stay</div>
      <div className="mt-1.5 flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <button key={i} onClick={() => setRating(i + 1)} onMouseEnter={() => setHover(i + 1)} onMouseLeave={() => setHover(0)}>
            <Star className={`h-5 w-5 transition ${i < (hover || rating) ? "fill-accent text-accent" : "text-muted-foreground/40"}`} />
          </button>
        ))}
      </div>
      <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share a quick note…" rows={2} className="mt-2 w-full resize-none rounded-lg bg-input px-3 py-2 text-xs outline-none focus:ring-2 ring-primary" />
      <button disabled={!rating} onClick={() => onSubmit(rating, comment)} className="mt-2 rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-40">Submit review</button>
    </div>
  );
}
