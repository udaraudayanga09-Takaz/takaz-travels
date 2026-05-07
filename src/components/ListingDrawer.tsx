import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, Star, MapPin, Shield, Calendar, Minus, Plus, CheckCircle2 } from "lucide-react";
import type { Listing } from "@/data/listings";
import { useStore } from "@/lib/store";

export function ListingDrawer({ listing, onClose }: { listing: Listing | null; onClose: () => void }) {
  const { addBooking } = useStore();
  const [days, setDays] = useState(3);
  const [step, setStep] = useState<"details" | "form" | "success">("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const total = listing ? listing.pricePerDay * days : 0;
  const fees = Math.round(total * 0.12);

  const confirm = () => {
    if (!listing) return;
    const start = new Date();
    const end = new Date(); end.setDate(end.getDate() + days);
    addBooking({
      listingId: listing.id,
      guestName: name || "Demo Tourist",
      guestEmail: email || "demo@luxe.lk",
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      days,
      total: total + fees,
    });
    setStep("success");
  };

  return (
    <AnimatePresence>
      {listing && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto glass-strong no-scrollbar"
          >
            <button onClick={onClose} className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full glass hover:scale-105 transition">
              <X className="h-5 w-5" />
            </button>

            {step === "success" ? (
              <div className="flex h-full flex-col items-center justify-center gap-6 p-8 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="grid h-20 w-20 place-items-center rounded-full bg-primary/20">
                  <CheckCircle2 className="h-10 w-10 text-primary" />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-semibold">Booking confirmed</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Your trip to {listing.city} is locked in. Check your bookings tab to see the full itinerary.</p>
                </div>
                <button onClick={onClose} className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition">Done</button>
              </div>
            ) : (
              <>
                <div className="relative h-64 overflow-hidden">
                  <img src={listing.image} alt={listing.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div>
                      <span className="rounded-full glass px-3 py-1 text-xs">{listing.category}</span>
                      <h2 className="mt-2 text-2xl font-semibold">{listing.title}</h2>
                    </div>
                    {listing.verified && (
                      <span className="flex items-center gap-1 rounded-full bg-primary/20 px-3 py-1 text-xs text-primary">
                        <Shield className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-6 p-6">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-primary" /> {listing.city}</span>
                    <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-accent text-accent" /> {listing.rating || "New"} {listing.reviews ? `(${listing.reviews})` : ""}</span>
                  </div>

                  <p className="text-sm leading-relaxed text-muted-foreground">{listing.description}</p>
                  <div className="text-xs text-muted-foreground">Hosted by <span className="text-foreground">{listing.host}</span></div>

                  {step === "details" ? (
                    <>
                      <div className="rounded-2xl glass p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Duration</span>
                          <div className="flex items-center gap-3">
                            <button onClick={() => setDays(Math.max(1, days - 1))} className="grid h-8 w-8 place-items-center rounded-full bg-secondary"><Minus className="h-4 w-4" /></button>
                            <span className="w-16 text-center text-sm tabular-nums">{days} {days === 1 ? "day" : "days"}</span>
                            <button onClick={() => setDays(days + 1)} className="grid h-8 w-8 place-items-center rounded-full bg-secondary"><Plus className="h-4 w-4" /></button>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between text-muted-foreground"><span>${listing.pricePerDay} × {days}</span><span>${total}</span></div>
                          <div className="flex justify-between text-muted-foreground"><span>Service fee</span><span>${fees}</span></div>
                          <div className="mt-2 flex justify-between border-t border-border pt-2 font-semibold"><span>Total</span><motion.span key={total} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>${total + fees}</motion.span></div>
                        </div>
                      </div>
                      <button onClick={() => setStep("form")} className="w-full rounded-full bg-gradient-to-r from-primary to-[oklch(0.65_0.18_200)] py-3.5 font-medium text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-95 transition">
                        Reserve · ${total + fees}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <h3 className="font-semibold flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> Your details</h3>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" className="w-full rounded-xl bg-input px-4 py-3 text-sm outline-none focus:ring-2 ring-primary" />
                        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-xl bg-input px-4 py-3 text-sm outline-none focus:ring-2 ring-primary" />
                      </div>
                      <button onClick={confirm} className="w-full rounded-full bg-gradient-to-r from-primary to-[oklch(0.65_0.18_200)] py-3.5 font-medium text-primary-foreground hover:opacity-95 transition">
                        Confirm booking
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
