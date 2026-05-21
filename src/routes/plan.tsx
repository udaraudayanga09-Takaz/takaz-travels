import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Users, Mail, Send, Sparkles, ArrowRight } from "lucide-react";
import { SriLankaMap, REGIONS } from "@/components/SriLankaMap";
import { useStore } from "@/lib/store";
import { ListingCard } from "@/components/ListingCard";
import { submitTripPlan } from "@/lib/luxe.functions";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "Plan your Sri Lanka trip — Takaz" },
      { name: "description", content: "Build a custom multi-region Sri Lanka itinerary. Hover the interactive map to discover destinations, then send us your plan." },
      { property: "og:title", content: "Plan your Sri Lanka trip — Takaz" },
      { property: "og:description", content: "Interactive map, region-by-region picks, and a custom itinerary built around you." },
    ],
  }),
  component: PlanPage,
});

function PlanPage() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const { listings } = useStore();
  const submit = useServerFn(submitTripPlan);

  const counts = useMemo(() => {
    const map: Record<string, { vehicles: number; stays: number; from: number }> = {};
    REGIONS.forEach(r => {
      const matches = listings.filter(l => l.city.toLowerCase() === r.id);
      const prices = matches.map(l => l.pricePerDay);
      map[r.id] = {
        vehicles: matches.filter(l => l.type === "vehicle").length,
        stays: matches.filter(l => l.type === "stay").length,
        from: prices.length ? Math.min(...prices) : 0,
      };
    });
    return map;
  }, [listings]);

  const region = selected ? REGIONS.find(r => r.id === selected) : null;
  const regionListings = region ? listings.filter(l => l.city.toLowerCase() === region.id) : [];

  const onSelect = (id: string) => {
    setSelected(id);
    setTimeout(() => document.getElementById("location-detail")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  // form state
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [party, setParty] = useState(2);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const togglePicked = (id: string) =>
    setPicked(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || picked.length === 0) {
      setError("Add an email and pick at least one region.");
      return;
    }
    setBusy(true);
    try {
      await submit({ data: { contactEmail: email, contactName: name || undefined, regions: picked, partySize: party, startDate: start || null, endDate: end || null, notes: notes || undefined } });
      setSent(true);
    } catch (err: any) {
      setError(err?.message ?? "Could not submit");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs">
          <Sparkles className="h-3.5 w-3.5 text-accent" /> Interactive itinerary builder
        </span>
        <h1 className="mt-4 text-4xl md:text-6xl font-semibold tracking-tight">Plan your <span className="text-gradient">Sri Lanka</span> trip</h1>
        <p className="mt-3 text-muted-foreground">Hover any region to preview. Tap a pin to load local stays and rides. Then send us your plan — a local expert replies within 24 h.</p>
      </motion.div>

      {/* Map */}
      <div className="mt-12 grid items-center gap-10 md:grid-cols-[1fr_360px]">
        <SriLankaMap
          selected={selected}
          hovered={hovered}
          onHover={setHovered}
          onSelect={onSelect}
          counts={counts}
        />
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Six regions, one island</h2>
          <p className="text-muted-foreground text-sm">From Colombo's coast to Jaffna's palmyra north, Sri Lanka packs jungle fortresses, cloud forests, surf coves and ancient cities into one compact island. Hover a pin to see the highlights.</p>
          <div className="grid grid-cols-2 gap-2">
            {REGIONS.map(r => (
              <button
                key={r.id}
                onMouseEnter={() => setHovered(r.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onSelect(r.id)}
                className={`flex items-center gap-2 rounded-xl glass px-3 py-2 text-left text-xs transition hover:border-primary/40 ${selected === r.id ? "ring-1 ring-primary" : ""}`}
              >
                <MapPin className="h-3 w-3 text-primary" />
                <span className="truncate">{r.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Location detail */}
      <div id="location-detail" className="mt-20 scroll-mt-24">
        <AnimatePresence mode="wait">
          {region && (
            <motion.div key={region.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <div className="rounded-3xl glass-strong p-8 md:p-12">
                <div className="grid gap-8 md:grid-cols-2">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-primary">Region</span>
                    <h2 className="mt-2 text-3xl md:text-5xl font-semibold">{region.name}</h2>
                    <p className="mt-4 text-muted-foreground leading-relaxed">{region.blurb}</p>
                    <div className="mt-6 rounded-2xl bg-secondary/40 p-4">
                      <div className="text-xs uppercase tracking-widest text-accent">Best time to visit</div>
                      <div className="mt-1 font-medium">{region.bestTime}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-accent">Must-see highlights</div>
                    <ul className="mt-3 space-y-2">
                      {region.highlights.map(h => (
                        <li key={h} className="flex items-start gap-3 rounded-xl glass p-3">
                          <ArrowRight className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                          <span className="text-sm">{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {regionListings.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-xl font-semibold">Stays & rides in {region.name}</h3>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {regionListings.map((l, i) => <ListingCard key={l.id} listing={l} index={i} onClick={() => {}} />)}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!region && (
          <div className="rounded-3xl glass p-12 text-center text-muted-foreground">
            Tap a region pin on the map to load its highlights and local listings.
          </div>
        )}
      </div>

      {/* Build my trip */}
      <div className="mt-24 rounded-3xl glass-strong p-8 md:p-12">
        <div className="grid gap-10 md:grid-cols-[1fr_1.2fr]">
          <div>
            <span className="text-xs uppercase tracking-widest text-primary">Build my trip</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-semibold">Tell us where, we'll handle the how.</h2>
            <p className="mt-4 text-muted-foreground">A local trip designer will craft a free itinerary with vehicles, stays and routes, then share it within 24 hours.</p>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li>• Free, no credit card required</li>
              <li>• Edits are unlimited until you're happy</li>
              <li>• Locked-in transparent pricing</li>
            </ul>
          </div>
          {sent ? (
            <div className="grid place-items-center rounded-2xl bg-secondary/30 p-10 text-center">
              <Sparkles className="h-10 w-10 text-accent" />
              <h3 className="mt-3 text-xl font-semibold">Plan received!</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">Check your inbox — a designer will reach out within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-2 rounded-xl glass px-3 py-2.5">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" className="w-full bg-transparent text-sm outline-none" />
                </label>
                <label className="flex items-center gap-2 rounded-xl glass px-3 py-2.5">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="w-full bg-transparent text-sm outline-none" />
                </label>
                <label className="flex items-center gap-2 rounded-xl glass px-3 py-2.5">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <input type="date" value={start} onChange={e => setStart(e.target.value)} className="w-full bg-transparent text-sm outline-none" />
                </label>
                <label className="flex items-center gap-2 rounded-xl glass px-3 py-2.5">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <input type="date" value={end} onChange={e => setEnd(e.target.value)} className="w-full bg-transparent text-sm outline-none" />
                </label>
                <label className="flex items-center gap-2 rounded-xl glass px-3 py-2.5 sm:col-span-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Travellers</span>
                  <input type="number" min={1} max={20} value={party} onChange={e => setParty(Number(e.target.value))} className="ml-auto w-16 bg-transparent text-right text-sm outline-none" />
                </label>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Regions</div>
                <div className="flex flex-wrap gap-2">
                  {REGIONS.map(r => (
                    <button key={r.id} type="button" onClick={() => togglePicked(r.id)} className={`rounded-full px-3 py-1.5 text-xs transition ${picked.includes(r.id) ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"}`}>
                      {r.name}
                    </button>
                  ))}
                </div>
              </div>
              <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Tell us your dream trip — surf, ayurveda, safari, family-friendly?" className="w-full rounded-xl glass px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground resize-none" />
              {error && <div className="rounded-xl bg-destructive/20 px-3 py-2 text-xs text-destructive-foreground">{error}</div>}
              <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60 transition hover:scale-[1.01]">
                {busy ? "Sending…" : <>Send my plan <Send className="h-4 w-4" /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
