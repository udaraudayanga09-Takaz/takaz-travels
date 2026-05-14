import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Map as MapIcon, LayoutGrid, Search, Sparkles, ArrowRight, Car, Home, ShieldCheck, Headphones, BadgeDollarSign, Users, Compass, Heart, Star, Quote, Mountain, Waves, Trees, Building2 } from "lucide-react";
import sigiriya from "@/assets/hero-srilanka.jpg";
import { useStore } from "@/lib/store";
import { ListingCard } from "@/components/ListingCard";
import { MapView } from "@/components/MapView";
import { ListingDrawer } from "@/components/ListingDrawer";
import { CITIES } from "@/data/listings";
import type { Listing } from "@/data/listings";
import hero from "@/assets/hero-srilanka.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Explore Sri Lanka — LuxeLanka" },
      { name: "description", content: "Discover vehicles and stays across Colombo, Kandy, Galle and Ella." },
    ],
  }),
  component: ExplorePage,
});

type View = "map" | "grid";
type Filter = "all" | "vehicle" | "stay";

function ExplorePage() {
  const { listings } = useStore();
  const [view, setView] = useState<View>("map");
  const [filter, setFilter] = useState<Filter>("all");
  const [city, setCity] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Listing | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  const filtered = useMemo(() => listings.filter(l => {
    if (filter !== "all" && l.type !== filter) return false;
    if (city !== "all" && l.city !== city) return false;
    if (query && !`${l.title} ${l.city} ${l.category}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  }), [listings, filter, city, query]);

  return (
    <div>
      {/* HERO */}
      <section ref={heroRef} className="relative h-[88vh] min-h-[560px] overflow-hidden">
        <motion.div style={{ y, scale }} className="absolute inset-0">
          <img src={hero} alt="Sri Lankan tea hills at golden hour" className="h-full w-full object-cover" />
          <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        </motion.div>
        <motion.div style={{ opacity }} className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-20">
          <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="inline-flex w-fit items-center gap-2 rounded-full glass px-3 py-1.5 text-xs">
            <Sparkles className="h-3.5 w-3.5 text-accent" /> The pearl of the Indian Ocean
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.8, ease: [0.16,1,0.3,1] }} className="mt-4 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            Sri Lanka,<br /><span className="text-gradient">cinematically yours.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
            Sync your ride and your stay in one place. Tuk-tuks to luxury SUVs. Beach villas to misty bungalows.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="mt-8 flex flex-wrap gap-3">
            <a href="#explore" className="group flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition hover:scale-[1.02]">
              Start exploring <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>
            <a href="#explore" className="rounded-full glass px-6 py-3.5 text-sm font-medium">View the map</a>
          </motion.div>
        </motion.div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground animate-[float_6s_ease-in-out_infinite]">scroll</div>
      </section>

      {/* EXPLORE */}
      <section id="explore" className="mx-auto max-w-7xl px-5 py-12 md:py-20">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Find your next moment</h2>
            <p className="mt-2 text-muted-foreground">Synced inventory across the island.</p>
          </div>
          <div className="flex items-center gap-1 rounded-full glass p-1 self-start">
            {(["map","grid"] as View[]).map(v => (
              <button key={v} onClick={() => setView(v)} className="relative px-4 py-2 text-xs font-medium rounded-full flex items-center gap-1.5">
                {view === v && <motion.span layoutId="view-pill" className="absolute inset-0 rounded-full bg-primary" />}
                <span className={`relative flex items-center gap-1.5 ${view === v ? "text-primary-foreground" : "text-muted-foreground"}`}>
                  {v === "map" ? <MapIcon className="h-3.5 w-3.5" /> : <LayoutGrid className="h-3.5 w-3.5" />}
                  {v === "map" ? "Map" : "Grid"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex items-center gap-2 rounded-full glass px-4 py-2 flex-1 max-w-md">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search villas, tuk-tuks, cities…" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          </div>
          <div className="flex flex-wrap gap-2">
            {([["all","All"],["vehicle","Vehicles"],["stay","Stays"]] as [Filter,string][]).map(([v,l]) => (
              <button key={v} onClick={() => setFilter(v)} className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition ${filter === v ? "bg-primary text-primary-foreground" : "glass text-muted-foreground hover:text-foreground"}`}>
                {v === "vehicle" && <Car className="h-3.5 w-3.5" />}
                {v === "stay" && <Home className="h-3.5 w-3.5" />}
                {l}
              </button>
            ))}
            <select value={city} onChange={e => setCity(e.target.value)} className="rounded-full glass px-4 py-2 text-xs font-medium outline-none">
              <option value="all">All cities</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* View */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            {view === "map" ? (
              <motion.div key="map" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                <MapView listings={filtered} onSelect={setSelected} selectedId={selected?.id} />
                <div className="mt-4 flex gap-3 overflow-x-auto no-scrollbar pb-2">
                  {filtered.map(l => (
                    <button key={l.id} onClick={() => setSelected(l)} className="group flex shrink-0 w-64 items-center gap-3 rounded-2xl glass p-3 text-left transition hover:scale-[1.02]">
                      <img src={l.image} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{l.title}</div>
                        <div className="text-xs text-muted-foreground">${l.pricePerDay}/day · {l.city}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div key="grid" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((l, i) => <ListingCard key={l.id} listing={l} index={i} onClick={() => setSelected(l)} />)}
                {filtered.length === 0 && <div className="col-span-full py-16 text-center text-muted-foreground">No listings match those filters.</div>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <ListingDrawer listing={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
