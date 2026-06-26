import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Map as MapIcon, LayoutGrid, Search, Sparkles, ArrowRight, Car, Home, ShieldCheck, Headphones, BadgeDollarSign, Users, Compass, Heart, Star, Quote, Mountain, Waves, Trees, Building2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { ListingCard } from "@/components/ListingCard";
import { GoogleMapView } from "@/components/GoogleMapView";
import { BookingModal } from "@/components/BookingModal";
import type { Listing } from "@/data/listings";
import { CitySelect } from "@/components/CitySelect";
import { PopularPlaces } from "@/components/PopularPlaces";
import { PLACES } from "@/data/places";
import hero from "@/assets/hero-srilanka.jpg";

type IndexSearch = { filter?: "stay" | "vehicle"; city?: string };

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): IndexSearch => ({
    filter: search.filter === "vehicle" || search.filter === "stay" ? search.filter : undefined,
    city: typeof search.city === "string" ? search.city : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Explore Sri Lanka — Takaz" },
      { name: "description", content: "Discover vehicles and stays across Colombo, Kandy, Galle and Ella." },
    ],
  }),
  component: ExplorePage,
});


type View = "map" | "grid";
type Filter = "stay" | "vehicle";

function ExplorePage() {
  const { listings } = useStore();
  const search = Route.useSearch();
  const [view, setView] = useState<View>("map");
  const [filter, setFilter] = useState<Filter>(search.filter ?? "stay");
  const [city, setCity] = useState<string>(search.city ?? "all");
  const [query, setQuery] = useState(search.city ?? "");
  const [selected, setSelected] = useState<Listing | null>(null);

  // React to incoming search params (e.g. arriving from a place page or "View stays")
  useEffect(() => {
    if (search.filter) setFilter(search.filter);
    if (search.city) {
      setCity(search.city);
      setQuery(search.city);
      setView("grid");
    }
  }, [search.filter, search.city]);


  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  const filtered = useMemo(() => listings.filter(l => {
    if (l.type !== filter) return false;
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

        {/* Category tabs */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-full glass p-1">
            {([["stay","AirBNB Stays",Home],["vehicle","Vehicles & Rentals",Car]] as [Filter,string,typeof Car][]).map(([v,l,Icon]) => (
              <button
                key={v}
                onClick={() => setFilter(v)}
                className={`relative flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition ${filter === v ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {filter === v && <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full bg-primary shadow-[var(--shadow-glow)]" transition={{ type: "spring", damping: 24, stiffness: 260 }} />}
                <span className="relative flex items-center gap-2"><Icon className="h-4 w-4" /> {l}</span>
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
          <CitySelect value={city} onChange={setCity} className="md:w-64" />
        </div>

        {/* View */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            {view === "map" ? (
              <motion.div key="map" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                <GoogleMapView listings={filtered} onSelect={setSelected} selectedId={selected?.id} />
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

      {/* POPULAR PLACES — TripAdvisor ranked */}
      <PopularPlaces />

      {/* WHY TAKAZ — TRUST */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs"><ShieldCheck className="h-3.5 w-3.5 text-accent" /> Why Takaz</span>
          <h2 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight">Sri Lanka, the way locals do it.</h2>
          <p className="mt-3 text-muted-foreground">Born in Colombo. Built for travellers. We're the on-the-ground team that keeps your trip moving — not a faceless OTA.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Headphones, t: "24/7 on-ground support", b: "WhatsApp a real human in Colombo any hour. Breakdowns, route changes, last-minute villa swaps — handled." },
            { icon: BadgeDollarSign, t: "Transparent pricing", b: "No hidden fees, no surge, no fuel surprises. The price you see is the price you pay — locked at booking." },
            { icon: Users, t: "Local expertise", b: "Every itinerary is reviewed by a Sri Lankan trip designer who's actually driven those roads and slept in those villas." },
            { icon: ShieldCheck, t: "Vetted partners only", b: "Every host, driver and vehicle is ID-verified and insured. We reject 60% of partner applications." },
          ].map((it, i) => (
            <motion.div key={it.t} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="rounded-2xl glass p-6 hover:border-primary/40 transition">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary"><it.icon className="h-5 w-5" /></div>
              <div className="mt-4 font-semibold">{it.t}</div>
              <div className="mt-2 text-sm text-muted-foreground leading-relaxed">{it.b}</div>
            </motion.div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 fill-accent text-accent" /> 4.94 / 5 across 2,400+ trips</span>
          <span>•</span>
          <span>Featured by Lonely Planet & Condé Nast</span>
          <span>•</span>
          <span>Tourism-board-licensed (#SLTDA-2841)</span>
        </div>
      </section>

      {/* SEO CONTENT BLOCKS */}
      <section className="mx-auto max-w-7xl px-5 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Car, h: "Self-drive tuk-tuk rentals in Sri Lanka",
              p: "Rent a tuk-tuk in Colombo, Galle, Kandy or Ella from $18 / day with full insurance, an international driving permit, and unlimited kilometres. Our fleet is mechanically inspected every 30 days and includes 24/7 roadside recovery anywhere on the island. Whether you want to weave through Galle Fort's lanes or chase waterfalls down to Mirissa, our self-drive tuk-tuks give you total freedom — without the rental-counter games."
            },
            {
              icon: Home, h: "Boutique villas & private stays",
              p: "From cliffside infinity-pool villas in Unawatuna to misty tea bungalows above Ella, every stay on Takaz is hand-visited by our team. We curate independently-owned boutique hotels, restored colonial mansions, jungle eco-lodges, and beachfront villas — never generic chains. All listings include verified photos, transparent total pricing, and free cancellation up to 14 days before check-in."
            },
            {
              icon: Users, h: "Chauffeurs & personal drivers",
              p: "Hire an English-speaking, government-licensed chauffeur from $55 / day, with a modern AC vehicle, fuel and toll-free pricing included. Our drivers double as cultural guides — they'll know which spice garden actually grows its own cinnamon and which hill-country railway carriage has the open doorway for the perfect Nine-Arches-Bridge shot. Multi-day, airport transfer, and city-loop packages available."
            },
          ].map((it, i) => (
            <motion.article key={it.h} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="rounded-2xl glass p-6">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent/15 text-accent"><it.icon className="h-5 w-5" /></div>
              <h3 className="mt-4 text-lg font-semibold">{it.h}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{it.p}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* DESTINATIONS DEEP DIVE */}
      <section className="mx-auto max-w-7xl px-5 pb-20">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs"><Compass className="h-3.5 w-3.5 text-accent" /> Best places to visit</span>
            <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight">Sri Lanka's <span className="text-gradient">unmissable</span> destinations</h2>
          </div>
          <Link to="/plan" className="group flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition hover:scale-[1.02]">
            Plan your next trip <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {[
            { icon: Mountain, slug: "sigiriya", name: "Sigiriya — The Lion Rock", img: PLACES.sigiriya.hero, best: "January – March", note: "5th-century palace fortress rising 200m from the jungle floor. UNESCO heritage. Climb at sunrise to beat the heat and the crowds; pair with the Pidurangala viewpoint just across the plain.", tags: ["UNESCO", "Sunrise hike", "Wildlife"] },
            { icon: Trees, slug: "ella", name: "Ella — Cloud-forest hill country", img: PLACES.ella.hero, best: "January – March", note: "Misty mountain village famous for the Nine Arches Bridge, the Little Adam's Peak hike, and endless blue-green tea plantations. Take the Kandy → Ella train — one of the most scenic rides on Earth.", tags: ["Tea country", "Train journey", "Hiking"] },
            { icon: Waves, slug: "galle", name: "Galle — 17th-century Dutch fort", img: PLACES.galle.hero, best: "November – April", note: "A walled coastal town of cobbled lanes, boutique cafés, art galleries and stilt fishermen. The southern beaches (Unawatuna, Mirissa, Weligama) are a 30-minute tuk-tuk away — perfect for surfing and whale-watching.", tags: ["Beaches", "Surfing", "History"] },
            { icon: Building2, slug: "kandy", name: "Kandy — Sacred hill capital", img: PLACES.kandy.hero, best: "January – April & July – September", note: "Home to the Temple of the Tooth Relic and gateway to the central highlands. Catch the Esala Perahera if you're lucky enough to visit in August — one of Asia's grandest cultural processions.", tags: ["Temples", "Culture", "Botanical gardens"] },
          ].map((d, i) => (

            <motion.article key={d.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="group overflow-hidden rounded-3xl glass">
              <Link to="/places/$slug" params={{ slug: d.slug }} className="block">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img src={d.img} alt={d.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
                    <div className="grid h-9 w-9 place-items-center rounded-lg glass-strong text-primary"><d.icon className="h-4 w-4" /></div>
                    <h3 className="text-xl font-semibold">{d.name}</h3>
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-xs uppercase tracking-widest text-accent">Best time to visit</div>
                  <div className="text-sm font-medium">{d.best}</div>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{d.note}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {d.tags.map(t => <span key={t} className="rounded-full bg-secondary/40 px-2.5 py-1 text-[10px] uppercase tracking-wide">{t}</span>)}
                  </div>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                    Explore {d.name.split(" — ")[0]} <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            </motion.article>

          ))}
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="mx-auto max-w-7xl px-5 pb-24">
        <div className="rounded-3xl glass-strong p-10 md:p-16 text-center">
          <Heart className="mx-auto h-8 w-8 text-accent" />
          <h2 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight">Ready to make memories?</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">Tell our local trip designers where you want to go — they'll come back with a free, fully-priced itinerary in 24 hours.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/plan" className="group flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition hover:scale-[1.02]">
              Plan my trip <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link to="/memories" className="rounded-full glass px-6 py-3.5 text-sm font-medium">Read traveller stories</Link>
          </div>
        </div>
      </section>

      <BookingModal listing={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

