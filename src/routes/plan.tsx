import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar as CalendarIcon, Sparkles, ArrowRight, Bed, Car, Plus, Check, Star, Trash2, ShoppingBag, CheckCircle2, LogIn, X, ArrowUp, ArrowDown, Pencil } from "lucide-react";
import { format, differenceInCalendarDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";

import { SriLankaMap, REGIONS } from "@/components/SriLankaMap";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import type { Listing } from "@/data/listings";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/plan")({
  validateSearch: (search: Record<string, unknown>) => ({
    regions: typeof search.regions === "string" ? search.regions : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Plan your Sri Lanka trip — Takaz" },
      { name: "description", content: "Pick regions and dates, then build a custom trip with real available stays and vehicles. Book it all in one checkout." },
      { property: "og:title", content: "Plan your Sri Lanka trip — Takaz" },
      { property: "og:description", content: "Pick regions and dates, then build a custom trip with real available stays and vehicles. Book it all in one checkout." },
    ],
  }),
  component: PlanPage,
});


const SERVICE_FEE_RATE = 0.12;

type AnyListing = Listing | DbListing;
type DbListing = {
  id: string;
  type: "stay" | "vehicle";
  title: string;
  category: string;
  city: string;
  pricePerDay: number;
  rating: number;
  reviews: number;
  image: string;
  host: string;
  verified: boolean;
  description: string;
  source: "db";
};

function isDb(l: AnyListing): l is DbListing {
  return (l as DbListing).source === "db";
}

function PlanPage() {
  const { user } = useAuth();
  const { listings: mockListings } = useStore();
  const { regions: regionsParam } = Route.useSearch();
  const [hovered, setHovered] = useState<string | null>(null);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  // selection — initialize from ?regions=ella,galle
  const [picked, setPicked] = useState<string[]>(() => {
    if (!regionsParam) return [];
    const ids = regionsParam.split(",").map((s: string) => s.trim()).filter(Boolean);
    const valid = new Set(REGIONS.map(r => r.id));
    return ids.filter((id: string) => valid.has(id));
  });


  const [range, setRange] = useState<DateRange | undefined>(() => {
    const start = new Date(); start.setDate(start.getDate() + 7);
    const end = new Date(); end.setDate(end.getDate() + 10);
    return { from: start, to: end };
  });
  const [searched, setSearched] = useState(false);
  const [dbListings, setDbListings] = useState<DbListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"stay" | "vehicle">("stay");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [editingStop, setEditingStop] = useState<string | null>(null);

  // basket
  const [stay, setStay] = useState<AnyListing | null>(null);
  const [vehicle, setVehicle] = useState<AnyListing | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string[] | null>(null);

  const nights = range?.from && range?.to ? Math.max(1, differenceInCalendarDays(range.to, range.from)) : 0;
  const stayCost = stay ? stay.pricePerDay * nights : 0;
  const vehicleCost = vehicle ? vehicle.pricePerDay * nights : 0;
  const subtotal = stayCost + vehicleCost;
  const fee = Math.round(subtotal * SERVICE_FEE_RATE * 100) / 100;
  const total = Math.round((subtotal + fee) * 100) / 100;

  const pickedRegionNames = useMemo(
    () => picked.map(id => REGIONS.find(r => r.id === id)?.name).filter(Boolean) as string[],
    [picked]
  );

  const counts = useMemo(() => {
    const map: Record<string, { vehicles: number; stays: number; from: number }> = {};
    REGIONS.forEach(r => {
      const matches = mockListings.filter(l => l.city.toLowerCase() === r.id);
      const prices = matches.map(l => l.pricePerDay);
      map[r.id] = {
        vehicles: matches.filter(l => l.type === "vehicle").length,
        stays: matches.filter(l => l.type === "stay").length,
        from: prices.length ? Math.min(...prices) : 0,
      };
    });
    return map;
  }, [mockListings]);

  const togglePicked = (id: string) =>
    setPicked(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const removeStop = (id: string) => {
    setPicked(p => p.filter(x => x !== id));
    if (activeRegion === id) setActiveRegion(null);
    if (editingStop === id) setEditingStop(null);
  };

  const moveStop = (id: string, dir: -1 | 1) => {
    setPicked(p => {
      const i = p.indexOf(id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= p.length) return p;
      const next = [...p];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };


  async function findAvailability() {
    if (picked.length === 0 || !range?.from || !range?.to) {
      toast.error("Pick at least one region and your trip dates.");
      return;
    }
    setLoading(true);
    setSearched(true);
    setStay(null); setVehicle(null);
    try {
      // OR ilike across selected region names
      const orClause = pickedRegionNames.map(n => `city.ilike.%${n}%`).join(",");
      const { data, error } = await supabase
        .from("provider_listings")
        .select("id, kind, title, description, city, daily_rate, photos, avg_rating, review_count")
        .eq("status", "approved")
        .or(orClause);
      if (error) throw error;
      const mapped: DbListing[] = (data ?? [])
        .filter((r: any) => r.kind === "stay" || r.kind === "vehicle")
        .map((r: any) => ({
          id: r.id,
          type: r.kind,
          title: r.title,
          category: r.kind === "stay" ? "Partner stay" : "Partner vehicle",
          city: r.city ?? "",
          pricePerDay: Number(r.daily_rate) || 0,
          rating: Number(r.avg_rating) || 0,
          reviews: Number(r.review_count) || 0,
          image: (r.photos && r.photos[0]) || "",
          host: "Verified partner",
          verified: true,
          description: r.description ?? "",
          source: "db",
        }));
      setDbListings(mapped);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load availability");
      setDbListings([]);
    } finally {
      setLoading(false);
      setTimeout(() => document.getElementById("availability")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }

  const available: AnyListing[] = useMemo(() => {
    if (!searched) return [];
    const mockMatches = mockListings.filter(l =>
      pickedRegionNames.some(n => l.city.toLowerCase() === n.toLowerCase())
    );
    return [...dbListings, ...mockMatches];
  }, [searched, dbListings, mockListings, pickedRegionNames]);

  const stays = available.filter(l => l.type === "stay");
  const vehicles = available.filter(l => l.type === "vehicle");

  async function bookTrip() {
    if (!user) { toast.error("Please sign in to book."); return; }
    if (!range?.from || !range?.to) return;
    if (!stay && !vehicle) { toast.error("Add at least a stay or a vehicle."); return; }
    setSubmitting(true);
    try {
      const items = [stay, vehicle].filter(Boolean) as AnyListing[];
      const rows = items.map(l => {
        const itemSubtotal = l.pricePerDay * nights;
        const itemFee = Math.round(itemSubtotal * SERVICE_FEE_RATE * 100) / 100;
        return {
          user_id: user.id,
          listing_id: String(l.id),
          listing_type: l.type,
          listing_title: l.title,
          guest_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Tourist",
          guest_email: user.email!,
          start_date: format(range.from!, "yyyy-MM-dd"),
          end_date: format(range.to!, "yyyy-MM-dd"),
          days: nights,
          total: Math.round((itemSubtotal + itemFee) * 100) / 100,
          status: "pending",
        };
      });
      const { data, error } = await supabase.from("bookings").insert(rows).select("id");
      if (error) throw error;
      setSuccess((data ?? []).map((d: any) => d.id));
      setStay(null); setVehicle(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs">
          <Sparkles className="h-3.5 w-3.5 text-accent" /> Trip basket · one checkout
        </span>
        <h1 className="mt-4 text-4xl md:text-6xl font-semibold tracking-tight">Plan your <span className="text-gradient">Sri Lanka</span> trip</h1>
        <p className="mt-3 text-muted-foreground">Pick regions, set your dates, then add a stay and a ride to your basket. Book the whole trip in one go.</p>
      </motion.div>

      {/* Map + region picker */}
      <div className="mt-12 grid items-start gap-10 md:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <SriLankaMap
            selected={activeRegion}
            hovered={hovered}
            onHover={setHovered}
            onSelect={(id) => { setActiveRegion(id); togglePicked(id); }}
            counts={counts}
            disableHoverZoom
          />

          {/* My trip stops */}
          <div className="rounded-3xl glass p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> My trip stops
              </h3>
              <span className="text-[11px] text-muted-foreground">{picked.length} stop{picked.length === 1 ? "" : "s"}</span>
            </div>
            {picked.length === 0 ? (
              <p className="mt-3 text-xs text-muted-foreground">Tap a pin on the map to add a stop to your trip.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {picked.map((id, i) => {
                  const r = REGIONS.find(x => x.id === id);
                  if (!r) return null;
                  const isEditing = editingStop === id;
                  return (
                    <li key={id} className="rounded-2xl bg-secondary/40 p-2.5">
                      <div className="flex items-center gap-2">
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/20 text-[11px] font-semibold text-primary">{i + 1}</span>
                        <button
                          onClick={() => setEditingStop(isEditing ? null : id)}
                          className="flex-1 truncate text-left text-sm font-medium hover:text-primary transition inline-flex items-center gap-1.5"
                          title="Edit notes"
                        >
                          {r.name}
                          <Pencil className="h-3 w-3 opacity-50" />
                        </button>
                        {notes[id] && !isEditing && (
                          <span className="hidden sm:inline text-[11px] text-muted-foreground truncate max-w-[120px]">· {notes[id]}</span>
                        )}
                        <button
                          onClick={() => moveStop(id, -1)}
                          disabled={i === 0}
                          className="grid h-7 w-7 place-items-center rounded-full hover:bg-primary/20 disabled:opacity-30"
                          aria-label="Move up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => moveStop(id, 1)}
                          disabled={i === picked.length - 1}
                          className="grid h-7 w-7 place-items-center rounded-full hover:bg-primary/20 disabled:opacity-30"
                          aria-label="Move down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => removeStop(id)}
                          className="grid h-7 w-7 place-items-center rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                          aria-label={`Remove ${r.name}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <AnimatePresence>
                        {isEditing && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <input
                              autoFocus
                              value={notes[id] ?? ""}
                              onChange={(e) => setNotes(n => ({ ...n, [id]: e.target.value }))}
                              onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setEditingStop(null); }}
                              placeholder='e.g. "2 nights here"'
                              className="mt-2 w-full rounded-lg bg-background/60 px-3 py-1.5 text-xs outline-none ring-1 ring-border focus:ring-primary"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">1. Where are you going?</h2>
            <p className="text-sm text-muted-foreground mt-1">Tap regions on the map or chips below.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-1">
            {REGIONS.map(r => {
              const on = picked.includes(r.id);
              return (
                <button
                  key={r.id}
                  onMouseEnter={() => setHovered(r.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => togglePicked(r.id)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs transition ${on ? "bg-primary text-primary-foreground" : "glass hover:border-primary/40"}`}
                >
                  {on ? <Check className="h-3 w-3" /> : <MapPin className="h-3 w-3 text-primary" />}
                  <span className="truncate">{r.name}</span>
                </button>
              );
            })}
          </div>

          <div>
            <h2 className="text-xl font-semibold mt-4">2. When?</h2>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("mt-2 w-full justify-start text-left font-normal glass", !range && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {range?.from
                    ? range.to ? <>{format(range.from, "LLL d, y")} – {format(range.to, "LLL d, y")}</> : format(range.from, "LLL d, y")
                    : <span>Pick your trip dates</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="range" selected={range} onSelect={setRange} numberOfMonths={1} disabled={{ before: new Date() }} className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
            <div className="mt-1 text-[11px] text-muted-foreground">{nights > 0 ? `${nights} ${nights === 1 ? "night" : "nights"}` : "Select check-in and check-out"}</div>
          </div>

          <button
            onClick={findAvailability}
            disabled={loading || picked.length === 0 || nights < 1}
            className="mt-2 w-full rounded-full bg-gradient-to-r from-primary to-[oklch(0.65_0.18_200)] py-3 font-medium text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-95 transition disabled:opacity-50"
          >
            {loading ? "Searching…" : "Find available stays & rides"}
          </button>
        </div>
      </div>

      {/* Availability */}
      <div id="availability" className="mt-20 scroll-mt-24">
        <AnimatePresence mode="wait">
          {searched && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex items-end justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-2xl md:text-3xl font-semibold">Available {format(range!.from!, "MMM d")} – {format(range!.to!, "MMM d")}</h2>
                  <p className="text-muted-foreground text-sm mt-1">In {pickedRegionNames.join(", ")} · {available.length} match{available.length === 1 ? "" : "es"}</p>
                </div>
                <div className="flex gap-2 glass rounded-full p-1">
                  <TabButton on={tab === "stay"} onClick={() => setTab("stay")} icon={Bed} label={`Stays (${stays.length})`} />
                  <TabButton on={tab === "vehicle"} onClick={() => setTab("vehicle")} icon={Car} label={`Vehicles (${vehicles.length})`} />
                </div>
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">
                <div>
                  {(tab === "stay" ? stays : vehicles).length === 0 ? (
                    <div className="rounded-3xl glass p-12 text-center text-sm text-muted-foreground">
                      No {tab === "stay" ? "stays" : "vehicles"} found for these regions yet. Try adding another region.
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {(tab === "stay" ? stays : vehicles).map((l, i) => {
                        const inBasket = tab === "stay" ? stay?.id === l.id : vehicle?.id === l.id;
                        return (
                          <motion.div key={String(l.id)} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                            className={`rounded-3xl glass overflow-hidden flex flex-col ${inBasket ? "ring-2 ring-primary" : ""}`}>
                            <div className="aspect-[16/10] bg-secondary/40 overflow-hidden">
                              {l.image ? <img src={l.image} alt={l.title} className="h-full w-full object-cover" /> : <div className="h-full w-full grid place-items-center text-muted-foreground"><Bed className="h-8 w-8" /></div>}
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-semibold truncate">{l.title}</h3>
                                {isDb(l) && <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[9px] uppercase tracking-widest text-primary">Live</span>}
                              </div>
                              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" /> {l.city}
                                {l.rating > 0 && <><Star className="h-3 w-3 fill-accent text-accent ml-1" /> {l.rating.toFixed(1)} ({l.reviews})</>}
                              </div>
                              {l.description && <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{l.description}</p>}
                              <div className="mt-auto pt-4 flex items-center justify-between">
                                <div className="text-sm"><span className="text-lg font-semibold">${l.pricePerDay}</span><span className="text-muted-foreground">/{tab === "stay" ? "night" : "day"}</span></div>
                                <button
                                  onClick={() => tab === "stay" ? setStay(inBasket ? null : l) : setVehicle(inBasket ? null : l)}
                                  className={`flex items-center gap-1 rounded-full px-4 py-2 text-xs font-medium transition ${inBasket ? "bg-primary/20 text-primary" : "bg-primary text-primary-foreground hover:scale-[1.02]"}`}
                                >
                                  {inBasket ? <><Check className="h-3.5 w-3.5" /> In basket</> : <><Plus className="h-3.5 w-3.5" /> Add to trip</>}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Basket sidebar */}
                <aside className="lg:sticky lg:top-24 h-fit rounded-3xl glass-strong p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Your trip basket</h3>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {range?.from && range?.to ? <>{format(range.from, "MMM d")} – {format(range.to, "MMM d")} · {nights} {nights === 1 ? "night" : "nights"}</> : "Pick dates"}
                  </div>

                  <BasketRow icon={Bed} label="Stay" item={stay} nights={nights} onRemove={() => setStay(null)} />
                  <BasketRow icon={Car} label="Vehicle" item={vehicle} nights={nights} onRemove={() => setVehicle(null)} />

                  <div className="rounded-2xl bg-secondary/40 p-3 space-y-1 text-sm">
                    <Row label={`Subtotal (${nights} × items)`} value={subtotal} />
                    <Row label="Takaz service fee (12%)" value={fee} />
                    <div className="mt-2 border-t border-border pt-2 flex justify-between font-semibold">
                      <span>Trip total</span>
                      <motion.span key={total} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>${total.toFixed(2)}</motion.span>
                    </div>
                  </div>

                  {!user ? (
                    <Link to="/login" className="flex w-full items-center justify-center gap-2 rounded-full glass py-3 text-sm font-medium">
                      <LogIn className="h-4 w-4" /> Sign in to book
                    </Link>
                  ) : (
                    <button
                      onClick={bookTrip}
                      disabled={submitting || (!stay && !vehicle) || nights < 1}
                      className="w-full rounded-full bg-gradient-to-r from-primary to-[oklch(0.65_0.18_200)] py-3 font-medium text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-95 transition disabled:opacity-50"
                    >
                      {submitting ? "Booking…" : `Book trip · $${total.toFixed(2)}`}
                    </button>
                  )}
                  <p className="text-center text-[11px] text-muted-foreground">Hosts confirm within 24 h. You won't be charged yet.</p>
                </aside>
              </div>
            </motion.div>
          )}
          {!searched && (
            <div className="rounded-3xl glass p-12 text-center text-muted-foreground">
              Pick regions and dates above, then tap <span className="text-foreground">Find available stays & rides</span>.
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Success modal */}
      <AnimatePresence>
        {success && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm" onClick={() => setSuccess(null)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="fixed left-1/2 top-1/2 z-50 w-[min(420px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-3xl glass-strong p-8 text-center">
              <button onClick={() => setSuccess(null)} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full glass"><X className="h-4 w-4" /></button>
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/20">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">Trip booked!</h3>
              <p className="mt-2 text-sm text-muted-foreground">{success.length} booking{success.length === 1 ? "" : "s"} sent for confirmation. Hosts have 24 hours to confirm.</p>
              <Link to="/bookings" className="mt-5 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">View my bookings</Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function TabButton({ on, onClick, icon: Icon, label }: { on: boolean; onClick: () => void; icon: typeof Bed; label: string }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition ${on ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

function BasketRow({ icon: Icon, label, item, nights, onRemove }: { icon: typeof Bed; label: string; item: AnyListing | null; nights: number; onRemove: () => void }) {
  return (
    <div className="rounded-2xl glass p-3">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground"><Icon className="h-3 w-3" /> {label}</div>
      {item ? (
        <div className="mt-2 flex items-center gap-3">
          {item.image ? <img src={item.image} alt="" className="h-12 w-12 rounded-lg object-cover" /> : <div className="h-12 w-12 rounded-lg bg-secondary" />}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{item.title}</div>
            <div className="text-xs text-muted-foreground">${item.pricePerDay} × {nights} = ${(item.pricePerDay * nights).toFixed(0)}</div>
          </div>
          <button onClick={onRemove} className="opacity-60 hover:opacity-100"><Trash2 className="h-4 w-4" /></button>
        </div>
      ) : (
        <div className="mt-2 text-xs text-muted-foreground">No {label.toLowerCase()} added yet.</div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{label}</span>
      <span>${value.toFixed(2)}</span>
    </div>
  );
}
