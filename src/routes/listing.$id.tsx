import { useMemo, useState } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInCalendarDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import {
  Star, MapPin, Shield, X, ChevronLeft, ChevronRight, Minus, Plus,
  CalendarIcon, Wifi, Snowflake, Utensils, Waves, Car as CarIcon, Tv,
  Coffee, Wind, ShieldCheck, Sparkles, PawPrint, Cigarette,
} from "lucide-react";

import { LISTINGS, type Listing } from "@/data/listings";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { statFor, useListingStats } from "@/lib/useListingStats";
import { ReviewsSection } from "@/components/ReviewsSection";
import { ListingCard } from "@/components/ListingCard";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

const SERVICE_FEE_RATE = 0.12;

const AMENITIES = [
  { icon: Wifi, label: "Fast Wi-Fi" },
  { icon: Snowflake, label: "Air conditioning" },
  { icon: Utensils, label: "Full kitchen" },
  { icon: Waves, label: "Pool access" },
  { icon: CarIcon, label: "Free parking" },
  { icon: Tv, label: "Smart TV" },
  { icon: Coffee, label: "Espresso bar" },
  { icon: Wind, label: "Ocean breeze" },
];

const HOUSE_RULES = [
  { icon: ShieldCheck, label: "Check-in after 2:00 PM" },
  { icon: Sparkles, label: "Checkout by 11:00 AM" },
  { icon: Cigarette, label: "No smoking indoors" },
  { icon: PawPrint, label: "Pets on request" },
];

export const Route = createFileRoute("/listing/$id")({
  loader: ({ params }) => {
    const listing = LISTINGS.find((l) => l.id === params.id);
    if (!listing) throw notFound();
    return { listing };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Listing not found" }, { name: "robots", content: "noindex" }] };
    const l = loaderData.listing;
    return {
      meta: [
        { title: `${l.title} · ${l.city} — Takaz` },
        { name: "description", content: l.description },
        { property: "og:title", content: `${l.title} — ${l.city}` },
        { property: "og:description", content: l.description },
        { property: "og:image", content: l.image },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ListingDetail,
  errorComponent: ({ error }) => (
    <div className="min-h-[60vh] grid place-items-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <Link to="/" className="mt-4 inline-flex rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground">Back home</Link>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-[60vh] grid place-items-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Listing not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">That stay or ride isn't available anymore.</p>
        <Link to="/" className="mt-4 inline-flex rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground">Explore all stays</Link>
      </div>
    </div>
  ),
});

function buildGallery(l: Listing): string[] {
  const all: string[] = [l.image, ...LISTINGS.map((x) => x.image)];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const src of all) { if (!seen.has(src)) { seen.add(src); out.push(src); } }
  return out.slice(0, 5);
}

function ListingDetail() {
  const { listing } = Route.useLoaderData();
  const navigate = useNavigate();
  const { user } = useAuth();
  const stats = useListingStats();
  const s = statFor(stats, listing.id, listing.rating, listing.reviews);
  const photos = useMemo(() => buildGallery(listing), [listing]);

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [range, setRange] = useState<DateRange | undefined>(() => {
    const start = new Date();
    const end = new Date(); end.setDate(end.getDate() + 3);
    return { from: start, to: end };
  });
  const [guests, setGuests] = useState(2);
  const [submitting, setSubmitting] = useState(false);

  const nights = useMemo(() => {
    if (!range?.from || !range?.to) return 0;
    return Math.max(1, differenceInCalendarDays(range.to, range.from));
  }, [range]);

  const subtotal = listing.pricePerDay * nights;
  const fee = Math.round(subtotal * SERVICE_FEE_RATE * 100) / 100;
  const total = Math.round((subtotal + fee) * 100) / 100;

  const similar = LISTINGS.filter((l) => l.city === listing.city && l.id !== listing.id).slice(0, 8);
  const mapSrc = `https://www.google.com/maps?q=${listing.geoLat},${listing.geoLng}&z=13&output=embed`;

  const openGallery = (i: number) => { setGalleryIndex(i); setGalleryOpen(true); };
  const prev = () => setGalleryIndex((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setGalleryIndex((i) => (i + 1) % photos.length);

  async function requestBook() {
    if (!user) { navigate({ to: "/login" }); return; }
    if (!range?.from || !range?.to || nights < 1) { toast.error("Pick your dates"); return; }
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
      toast.success("Booking request sent");
      navigate({ to: "/bookings" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  }

  const hostInitials = listing.host.split(" ").map((p) => p[0]).slice(0, 2).join("");

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-semibold sm:text-4xl">{listing.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-accent text-accent" /> {s.count > 0 ? `${s.avg.toFixed(2)} · ${s.count} reviews` : "New"}</span>
          <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-primary" /> {listing.city}, Sri Lanka</span>
          {listing.verified && (
            <span className="flex items-center gap-1 text-primary"><Shield className="h-4 w-4" /> Verified host</span>
          )}
        </div>
      </div>

      {/* Photo grid */}
      <div className="relative grid h-[420px] grid-cols-1 gap-2 overflow-hidden rounded-3xl sm:grid-cols-4 sm:grid-rows-2">
        <button
          onClick={() => openGallery(0)}
          className="relative col-span-1 row-span-2 overflow-hidden sm:col-span-2"
        >
          <img src={photos[0]} alt={listing.title} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
        </button>
        {photos.slice(1, 5).map((p: string, i: number) => (
          <button
            key={i}
            onClick={() => openGallery(i + 1)}
            className="relative hidden overflow-hidden sm:block"
          >
            <img src={p} alt={`${listing.title} photo ${i + 2}`} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
          </button>
        ))}
        <button
          onClick={() => openGallery(0)}
          className="absolute bottom-4 right-4 rounded-full bg-background/90 px-4 py-2 text-sm font-medium shadow-md backdrop-blur hover:bg-background"
        >
          Show all photos
        </button>
      </div>

      {/* Body */}
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          {/* Host */}
          <div className="flex items-center justify-between border-b border-border pb-6">
            <div>
              <h2 className="text-xl font-semibold">{listing.category} hosted by {listing.host}</h2>
              <p className="mt-1 text-sm text-muted-foreground">Up to {8} guests · Instant confirmation on request</p>
            </div>
            <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-lg font-semibold text-primary-foreground">
              {hostInitials}
            </div>
          </div>

          {/* Description */}
          <section>
            <h3 className="text-lg font-semibold">About this {listing.type === "stay" ? "stay" : "ride"}</h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {listing.description} Set in the heart of {listing.city}, this {listing.category.toLowerCase()} blends
              local craftsmanship with modern comfort — thoughtfully curated for travellers who want the real Sri Lanka
              without compromise. Expect a smooth check-in, 24/7 host support, and every detail dialled in.
            </p>
          </section>

          {/* Amenities */}
          <section>
            <h3 className="text-lg font-semibold">What this place offers</h3>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {AMENITIES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 rounded-xl glass p-3 text-sm">
                  <Icon className="h-5 w-5 text-primary" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* House rules */}
          <section>
            <h3 className="text-lg font-semibold">House rules</h3>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {HOUSE_RULES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 rounded-xl bg-background/40 p-3 text-sm">
                  <Icon className="h-5 w-5 text-accent" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Map */}
          <section>
            <h3 className="text-lg font-semibold">Where you'll be</h3>
            <p className="mt-1 text-sm text-muted-foreground">Approximate location shared — exact address after booking.</p>
            <div className="mt-4 h-[360px] overflow-hidden rounded-2xl border border-border">
              <iframe
                title={`${listing.title} map`}
                src={mapSrc}
                loading="lazy"
                className="h-full w-full"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </section>
        </div>

        {/* Sticky booking panel */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl glass-strong p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-semibold">${listing.pricePerDay}</span>
                <span className="ml-1 text-sm text-muted-foreground">/ night</span>
              </div>
              <span className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-accent text-accent" />
                {s.count > 0 ? s.avg.toFixed(2) : "New"}
              </span>
            </div>

            <div className="mt-5 space-y-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !range && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {range?.from ? (
                      range.to ? <>{format(range.from, "LLL d")} – {format(range.to, "LLL d, y")}</> : format(range.from, "LLL d, y")
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

              <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5 text-sm">
                <span>Guests</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setGuests(Math.max(1, guests - 1))} className="grid h-8 w-8 place-items-center rounded-full bg-secondary"><Minus className="h-4 w-4" /></button>
                  <span className="w-8 text-center tabular-nums">{guests}</span>
                  <button onClick={() => setGuests(Math.min(16, guests + 1))} className="grid h-8 w-8 place-items-center rounded-full bg-secondary"><Plus className="h-4 w-4" /></button>
                </div>
              </div>
            </div>

            <button
              onClick={requestBook}
              disabled={submitting || nights < 1}
              className="mt-5 w-full rounded-full bg-gradient-to-r from-primary to-[oklch(0.65_0.18_200)] py-3.5 font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition hover:opacity-95 disabled:opacity-50"
            >
              {submitting ? "Sending request…" : "Request to book"}
            </button>

            <div className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span className="underline underline-offset-2">${listing.pricePerDay} × {nights} {nights === 1 ? "night" : "nights"}</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span className="underline underline-offset-2">Takaz service fee (12%)</span>
                <span>${fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3 font-semibold">
                <span>Total</span>
                <motion.span key={total} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>${total.toFixed(2)}</motion.span>
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-muted-foreground">You won't be charged yet. Host confirms within 24 hours.</p>
          </div>
        </aside>
      </div>

      {/* Reviews */}
      <div className="mt-14 border-t border-border pt-10">
        <ReviewsSection listingId={listing.id} />
      </div>

      {/* More in city */}
      {similar.length > 0 && (
        <div className="mt-14">
          <h3 className="text-xl font-semibold">More stays in {listing.city}</h3>
          <div className="mt-4 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 no-scrollbar">
            {similar.map((l, i) => (
              <div key={l.id} className="w-[280px] shrink-0 snap-start">
                <ListingCard listing={l} index={i} onClick={() => navigate({ to: "/listing/$id", params: { id: l.id } })} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen gallery */}
      <AnimatePresence>
        {galleryOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col bg-background/95 backdrop-blur-md"
          >
            <div className="flex items-center justify-between p-4">
              <span className="text-sm text-muted-foreground">{galleryIndex + 1} / {photos.length}</span>
              <button onClick={() => setGalleryOpen(false)} className="grid h-10 w-10 place-items-center rounded-full glass"><X className="h-5 w-5" /></button>
            </div>
            <div className="relative flex flex-1 items-center justify-center px-4">
              <button onClick={prev} className="absolute left-4 z-10 grid h-11 w-11 place-items-center rounded-full glass hover:scale-105"><ChevronLeft className="h-5 w-5" /></button>
              <motion.img
                key={galleryIndex}
                src={photos[galleryIndex]}
                alt=""
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                className="max-h-full max-w-full rounded-2xl object-contain"
              />
              <button onClick={next} className="absolute right-4 z-10 grid h-11 w-11 place-items-center rounded-full glass hover:scale-105"><ChevronRight className="h-5 w-5" /></button>
            </div>
            <div className="flex gap-2 overflow-x-auto p-4 no-scrollbar">
              {photos.map((p, i) => (
                <button key={i} onClick={() => setGalleryIndex(i)} className={cn("h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition", i === galleryIndex ? "border-primary" : "border-transparent opacity-60 hover:opacity-100")}>
                  <img src={p} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
