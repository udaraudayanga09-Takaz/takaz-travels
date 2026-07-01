import { motion } from "framer-motion";
import { useRef, useEffect } from "react";
import { Star, TrendingUp, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PLACES } from "@/data/places";

type Card = { id: string; name: string; image: string; tripRank: number; bookings: number; category: string; slug: string; city: string };

const TOP_STAYS: Card[] = [
  { id: "ella",     name: "Ella",         image: PLACES.ella.hero,     tripRank: 1, bookings: 482, category: "Cloud-forest hills",   slug: "ella",     city: "Ella" },
  { id: "galle",    name: "Galle Fort",   image: PLACES.galle.hero,    tripRank: 2, bookings: 418, category: "Heritage coast",       slug: "galle",    city: "Galle" },
  { id: "sigiriya", name: "Sigiriya",     image: PLACES.sigiriya.hero, tripRank: 3, bookings: 376, category: "UNESCO wonder",        slug: "sigiriya", city: "Sigiriya" },
  { id: "kandy",    name: "Kandy",        image: PLACES.kandy.hero,    tripRank: 4, bookings: 312, category: "Sacred hill capital",  slug: "kandy",    city: "Kandy" },
  { id: "mirissa",  name: "Mirissa",      image: PLACES.mirissa.hero,  tripRank: 5, bookings: 289, category: "Whale-watching cove",  slug: "mirissa",  city: "Mirissa" },
  { id: "nuwara",   name: "Nuwara Eliya", image: PLACES.nuwara.hero,   tripRank: 6, bookings: 244, category: "Little England",       slug: "nuwara",   city: "Nuwara Eliya" },
];

const HIDDEN_GEMS: Card[] = [
  { id: "arugam",    name: "Arugam Bay",  image: PLACES.arugam.hero,    tripRank: 7,  bookings: 198, category: "Surf paradise",      slug: "arugam",    city: "Arugam Bay" },
  { id: "jaffna",    name: "Jaffna",      image: PLACES.jaffna.hero,    tripRank: 9,  bookings: 142, category: "Tamil heartland",    slug: "jaffna",    city: "Jaffna" },
  { id: "trinco",    name: "Trincomalee", image: PLACES.trinco.hero,    tripRank: 10, bookings: 187, category: "East-coast beaches", slug: "trinco",    city: "Trincomalee" },
  { id: "haputale",  name: "Haputale",    image: PLACES.haputale.hero,  tripRank: 12, bookings: 121, category: "Misty ridgeline",    slug: "haputale",  city: "Haputale" },
  { id: "kalpitiya", name: "Kalpitiya",   image: PLACES.kalpitiya.hero, tripRank: 14, bookings: 95,  category: "Kitesurfing lagoon", slug: "kalpitiya", city: "Kalpitiya" },
  { id: "meemure",   name: "Meemure",     image: PLACES.meemure.hero,   tripRank: 18, bookings: 71,  category: "Hidden village",     slug: "meemure",   city: "Meemure" },
];

function useHorizontalWheel() {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      // Ignore pure horizontal trackpad gestures — let native handle them.
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      // Only hijack when there's actually room to scroll horizontally.
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;
      const atStart = el.scrollLeft <= 0 && e.deltaY < 0;
      const atEnd = el.scrollLeft >= maxScroll && e.deltaY > 0;
      if (atStart || atEnd) return; // let page scroll take over at the edges
      e.preventDefault();
      e.stopPropagation();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);
  return ref;
}

function Row({ title, subtitle, items }: { title: string; subtitle: string; items: Card[] }) {
  return (
    <div className="mt-12">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-[11px]">
            <TrendingUp className="h-3 w-3 text-primary" /> {subtitle}
          </span>
          <h3 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">{title}</h3>
        </div>
        <Link to="/places" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition">
          See all <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <div
        ref={useHorizontalWheel()}
        className="mt-5 flex gap-4 overflow-x-auto overflow-y-hidden no-scrollbar pb-3 -mx-5 px-5 snap-x snap-mandatory"
      >
        {items.map((p, i) => (
          <motion.article
            key={p.id}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            className="snap-start shrink-0 w-[260px] md:w-[300px] group"
          >
            <Link to="/places/$slug" params={{ slug: p.slug }} className="block">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-black/75 backdrop-blur px-2.5 py-1 text-[10px] font-semibold text-primary border border-primary/40">
                  <Star className="h-2.5 w-2.5 fill-primary" /> Ranked by TripAdvisor
                </span>
                <span className="absolute top-3 right-3 grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  #{p.tripRank}
                </span>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="text-lg font-semibold leading-tight">{p.name}</div>
                  <div className="text-[11px] opacity-80">{p.category}</div>
                </div>
              </div>
            </Link>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{p.bookings} bookings this month</span>
              <Link
                to="/"
                search={{ filter: "stay", city: p.city }}
                hash="explore"
                className="text-primary font-medium hover:underline"
              >
                View stays →
              </Link>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

export function PopularPlaces() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-10">
      <Row title="Top-ranked stays in Sri Lanka" subtitle="Most-booked this month" items={TOP_STAYS} />
      <Row title="Hidden gems trending now" subtitle="Locals' favourites" items={HIDDEN_GEMS} />
    </section>
  );
}
