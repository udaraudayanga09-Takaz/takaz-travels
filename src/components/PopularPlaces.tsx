import { motion } from "framer-motion";
import { Star, TrendingUp, ChevronRight } from "lucide-react";
import sigiriya from "@/assets/hero-srilanka.jpg";

/**
 * Ranking source: combination of internal booking volume + TripAdvisor "Top Things To Do".
 *
 * TODO — wire real-time TripAdvisor rankings:
 *   const fetchTripAdvisorRankings = async () => {
 *     const res = await fetch(
 *       `https://api.content.tripadvisor.com/api/v1/location/search?searchQuery=Sri+Lanka&category=geos&key=${TRIPADVISOR_KEY}`
 *     );
 *     return (await res.json()).data;
 *   };
 *   // Schedule via pg_cron daily; cache in `popular_places` table keyed by location_id.
 */
type Place = { id: string; name: string; image: string; tripRank: number; bookings: number; category: string };

const TOP_STAYS: Place[] = [
  { id: "ella",       name: "Ella",         image: sigiriya, tripRank: 1,  bookings: 482, category: "Cloud-forest hills" },
  { id: "galle",      name: "Galle Fort",   image: sigiriya, tripRank: 2,  bookings: 418, category: "Heritage coast" },
  { id: "sigiriya",   name: "Sigiriya",     image: sigiriya, tripRank: 3,  bookings: 376, category: "UNESCO wonder" },
  { id: "kandy",      name: "Kandy",        image: sigiriya, tripRank: 4,  bookings: 312, category: "Sacred hill capital" },
  { id: "mirissa",    name: "Mirissa",      image: sigiriya, tripRank: 5,  bookings: 289, category: "Whale-watching cove" },
  { id: "nuwara",     name: "Nuwara Eliya", image: sigiriya, tripRank: 6,  bookings: 244, category: "Little England" },
];

const HIDDEN_GEMS: Place[] = [
  { id: "arugam",     name: "Arugam Bay",   image: sigiriya, tripRank: 7,  bookings: 198, category: "Surf paradise" },
  { id: "jaffna",     name: "Jaffna",       image: sigiriya, tripRank: 9,  bookings: 142, category: "Tamil heartland" },
  { id: "trinco",     name: "Trincomalee",  image: sigiriya, tripRank: 10, bookings: 187, category: "East-coast beaches" },
  { id: "haputale",   name: "Haputale",     image: sigiriya, tripRank: 12, bookings: 121, category: "Misty ridgeline" },
  { id: "kalpitiya",  name: "Kalpitiya",    image: sigiriya, tripRank: 14, bookings: 95,  category: "Kitesurfing lagoon" },
  { id: "meemure",    name: "Meemure",      image: sigiriya, tripRank: 18, bookings: 71,  category: "Hidden village" },
];

function Row({ title, subtitle, items }: { title: string; subtitle: string; items: Place[] }) {
  return (
    <div className="mt-12">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-[11px]">
            <TrendingUp className="h-3 w-3 text-primary" /> {subtitle}
          </span>
          <h3 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">{title}</h3>
        </div>
        <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition">
          See all <ChevronRight className="h-3 w-3" />
        </button>
      </div>
      <div className="mt-5 flex gap-4 overflow-x-auto no-scrollbar pb-3 -mx-5 px-5 snap-x snap-mandatory">
        {items.map((p, i) => (
          <motion.article
            key={p.id}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            className="snap-start shrink-0 w-[260px] md:w-[300px] group cursor-pointer"
          >
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
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{p.bookings} bookings this month</span>
              <span className="text-primary font-medium">View stays →</span>
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
