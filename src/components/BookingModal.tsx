import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { X, Star, MapPin, Shield, Minus, Plus, CheckCircle2, CalendarIcon, AlertTriangle, LogIn, MessageCircle, Send } from "lucide-react";
import { format, differenceInCalendarDays } from "date-fns";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";

import type { Listing } from "@/data/listings";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { ReviewsSection } from "@/components/ReviewsSection";
import { getListingOwnerId, sendMessage } from "@/lib/messages";
import { fetchUnavailableDates, rangeHasUnavailable } from "@/lib/availability";

const SERVICE_FEE_RATE = 0.12;

export function BookingModal({ listing, onClose }: { listing: Listing | null; onClose: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [range, setRange] = useState<DateRange | undefined>(() => {
    const start = new Date();
    const end = new Date(); end.setDate(end.getDate() + 3);
    return { from: start, to: end };
  });
  const [guests, setGuests] = useState(2);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [licenceVerified, setLicenceVerified] = useState<boolean | null>(null);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageBody, setMessageBody] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [unavailable, setUnavailable] = useState<Date[]>([]);

  const isSelfDriveVehicle = listing?.type === "vehicle";

  useEffect(() => {
    if (!listing) { setSuccess(false); setUnavailable([]); return; }
    setSuccess(false);
    fetchUnavailableDates(listing.id).then(setUnavailable).catch(() => setUnavailable([]));
    if (user && isSelfDriveVehicle) {
      supabase.from("profiles").select("licence_verified").eq("id", user.id).maybeSingle()
        .then(({ data }) => setLicenceVerified(Boolean(data?.licence_verified)));
    } else {
      setLicenceVerified(null);
    }
  }, [listing, user, isSelfDriveVehicle]);

  const nights = useMemo(() => {
    if (!range?.from || !range?.to) return 0;
    return Math.max(1, differenceInCalendarDays(range.to, range.from));
  }, [range]);

  const subtotal = listing ? listing.pricePerDay * nights : 0;
  const fee = Math.round(subtotal * SERVICE_FEE_RATE * 100) / 100;
  const total = Math.round((subtotal + fee) * 100) / 100;

  const blockedBecauseLicence = isSelfDriveVehicle && licenceVerified === false;

  async function submit() {
    if (!listing || !user || !range?.from || !range?.to) return;
    if (blockedBecauseLicence) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("bookings").insert({
        user_id: user.id,
        listing_id: listing.id,
        listing_type: listing.type,
        listing_title: listing.title,
        guest_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Tourist",
        guest_email: user.email!,
        start_date: format(range.from, "yyyy-MM-dd"),
        end_date: format(range.to, "yyyy-MM-dd"),
        days: nights,
        total,
        status: "pending",
      });
      if (error) throw error;
      setSuccess(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMessageHost() {
    if (!listing) return;
    if (!user) { navigate({ to: "/login" }); return; }
    setSendingMessage(true);
    try {
      const ownerId = await getListingOwnerId(listing.id);
      if (!ownerId) {
        toast.error("This demo listing's host isn't on Takaz yet.");
        return;
      }
      if (ownerId === user.id) { toast.error("That's your own listing."); return; }
      await sendMessage({ receiverId: ownerId, listingId: listing.id, body: messageBody });
      toast.success("Message sent to host");
      setMessageBody("");
      setMessageOpen(false);
      navigate({ to: "/messages" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setSendingMessage(false);
    }
  }

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
            <button onClick={onClose} className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full glass hover:scale-105 transition" aria-label="Close">
              <X className="h-5 w-5" />
            </button>

            {success ? (
              <div className="flex h-full flex-col items-center justify-center gap-6 p-8 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="grid h-20 w-20 place-items-center rounded-full bg-primary/20">
                  <CheckCircle2 className="h-10 w-10 text-primary" />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-semibold">Request sent</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your booking request for <span className="text-foreground">{listing.title}</span> is now <span className="text-primary">pending</span>. The host will confirm shortly — check your bookings page for updates.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link to="/bookings" className="rounded-full glass px-5 py-2.5 text-sm font-medium">My bookings</Link>
                  <button onClick={onClose} className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">Done</button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative h-56 overflow-hidden">
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

                <div className="space-y-5 p-6">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-primary" /> {listing.city}</span>
                    <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-accent text-accent" /> {listing.rating} ({listing.reviews})</span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{listing.description}</p>

                  <div className="rounded-2xl glass p-4 space-y-3">
                    <button
                      onClick={() => (user ? setMessageOpen(v => !v) : navigate({ to: "/login" }))}
                      className="flex w-full items-center justify-between gap-3 text-left"
                    >
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <MessageCircle className="h-4 w-4 text-primary" /> Message {listing.host}
                      </span>
                      <span className="text-xs text-muted-foreground">{messageOpen ? "Close" : "Ask a question"}</span>
                    </button>
                    {messageOpen && user && (
                      <div className="space-y-2">
                        <Textarea
                          value={messageBody}
                          onChange={(e) => setMessageBody(e.target.value)}
                          placeholder={`Hi ${listing.host}, I'm interested in ${listing.title}…`}
                          rows={3}
                          maxLength={2000}
                        />
                        <button
                          onClick={handleMessageHost}
                          disabled={sendingMessage || messageBody.trim().length === 0}
                          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
                        >
                          <Send className="h-4 w-4" /> {sendingMessage ? "Sending…" : "Send message"}
                        </button>
                      </div>
                    )}
                  </div>



                  {!user ? (
                    <div className="rounded-2xl glass p-5 text-center space-y-3">
                      <LogIn className="mx-auto h-6 w-6 text-primary" />
                      <p className="text-sm">Sign in to request this booking.</p>
                      <Link to="/login" className="inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">Sign in to continue</Link>
                    </div>
                  ) : blockedBecauseLicence ? (
                    <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 space-y-3">
                      <div className="flex items-center gap-2 font-semibold text-destructive">
                        <AlertTriangle className="h-5 w-5" /> Licence verification required
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Self-drive vehicles need a verified international driving permit (IDP) before you can book.
                      </p>
                      <Link to="/verify" className="inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">Verify my licence</Link>
                    </div>
                  ) : (
                    <>
                      {/* Dates */}
                      <div className="rounded-2xl glass p-4 space-y-3">
                        <div className="text-xs uppercase tracking-wide text-muted-foreground">Check-in → Check-out</div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !range && "text-muted-foreground")}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {range?.from ? (
                                range.to ? <>{format(range.from, "LLL d, y")} – {format(range.to, "LLL d, y")}</> : format(range.from, "LLL d, y")
                              ) : <span>Pick your dates</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="range"
                              selected={range}
                              onSelect={setRange}
                              numberOfMonths={1}
                              disabled={{ before: new Date() }}
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-sm">Guests</span>
                          <div className="flex items-center gap-3">
                            <button onClick={() => setGuests(Math.max(1, guests - 1))} className="grid h-8 w-8 place-items-center rounded-full bg-secondary"><Minus className="h-4 w-4" /></button>
                            <span className="w-12 text-center text-sm tabular-nums">{guests}</span>
                            <button onClick={() => setGuests(Math.min(16, guests + 1))} className="grid h-8 w-8 place-items-center rounded-full bg-secondary"><Plus className="h-4 w-4" /></button>
                          </div>
                        </div>
                      </div>

                      {/* Breakdown */}
                      <div className="rounded-2xl glass p-4 space-y-1.5 text-sm">
                        <div className="flex justify-between text-muted-foreground">
                          <span>${listing.pricePerDay} × {nights} {nights === 1 ? "night" : "nights"}</span>
                          <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Takaz service fee (12%)</span>
                          <span>${fee.toFixed(2)}</span>
                        </div>
                        <div className="mt-2 flex justify-between border-t border-border pt-2 font-semibold">
                          <span>Total</span>
                          <motion.span key={total} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>${total.toFixed(2)}</motion.span>
                        </div>
                      </div>

                      <button
                        onClick={submit}
                        disabled={submitting || nights < 1}
                        className="w-full rounded-full bg-gradient-to-r from-primary to-[oklch(0.65_0.18_200)] py-3.5 font-medium text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-95 transition disabled:opacity-50"
                      >
                        {submitting ? "Sending request…" : `Request to book · $${total.toFixed(2)}`}
                      </button>
                      <p className="text-center text-xs text-muted-foreground">You won't be charged yet. The host has 24 hours to confirm.</p>
                    </>
                  )}

                  <ReviewsSection listingId={listing.id} />
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
