import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MapPin, ArrowRight, Sparkles, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { PLACE_LIST } from "@/data/places";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/places/")({
  head: () => ({
    meta: [
      { title: "All places to visit in Sri Lanka — Takaz" },
      { name: "description", content: "Every destination in our Sri Lanka guide — coast, hill country, cultural triangle and hidden gems. Pick one to explore stays, rides and traveller blogs." },
      { property: "og:title", content: "All places to visit in Sri Lanka — Takaz" },
      { property: "og:description", content: "Browse every Sri Lankan destination Takaz covers with traveller summaries and stays." },
    ],
  }),
  component: AllPlaces,
});

type AdditionalPlace = { id: string; name: string; slug: string; tagline: string | null; description: string | null; image_url: string | null };

function AllPlaces() {
  const [extras, setExtras] = useState<AdditionalPlace[]>([]);
  useEffect(() => {
    supabase
      .from("additional_places")
      .select("id, name, slug, tagline, description, image_url")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .then(({ data }) => setExtras((data ?? []) as AdditionalPlace[]));
  }, []);
  return (
    <div className="mx-auto max-w-7xl px-5 py-16 md:py-24">

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl"
      >
        <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs">
          <Sparkles className="h-3.5 w-3.5 text-accent" /> Destinations directory
        </span>
        <h1 className="mt-3 text-4xl md:text-6xl font-semibold tracking-tight text-foreground">
          Every place we love in <span className="text-gradient">Sri Lanka</span>
        </h1>
        <p className="mt-4 text-muted-foreground text-base md:text-lg">
          Coast, cloud-forest, ancient wonder and quiet hideaway — tap any destination to see things to do, where to stay and stories from other travellers.
        </p>
      </motion.div>

      <div className="mt-12 grid gap-5 md:gap-6">
        {PLACE_LIST.map((p, i) => (
          <motion.article
            key={p.slug}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.04, duration: 0.5 }}
            className="group grid gap-5 md:grid-cols-[280px_1fr] md:gap-7 rounded-3xl glass p-4 md:p-5 hover:border-primary/40 transition"
          >
            <Link to="/places/$slug" params={{ slug: p.slug }} className="relative block aspect-[4/3] md:aspect-square overflow-hidden rounded-2xl">
              <img
                src={p.hero}
                alt={p.caption}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3 rounded-full bg-black/70 backdrop-blur px-2.5 py-1 text-[10px] uppercase tracking-widest text-white">
                #{i + 1}
              </span>
            </Link>

            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-accent" /> {p.region}
              </div>
              <h2 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight text-foreground">{p.name}</h2>
              <p className="mt-2 text-sm md:text-base text-muted-foreground leading-relaxed">{p.summary}</p>

              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" /> Best time: <span className="text-foreground">{p.bestTime}</span>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Link
                  to="/places/$slug"
                  params={{ slug: p.slug }}
                  className="group/btn inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:scale-[1.02]"
                >
                  Explore {p.name}
                  <ArrowRight className="h-4 w-4 transition group-hover/btn:translate-x-0.5" />
                </Link>
                <Link
                  to="/"
                  search={{ filter: "stay", city: p.searchCity }}
                  hash="explore"
                  className="inline-flex items-center gap-2 rounded-full glass px-5 py-2.5 text-sm font-medium text-foreground"
                >
                  View stays
                </Link>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      {extras.length > 0 && (
        <section className="mt-20">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-accent" /> More to explore
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">Additional destinations</h2>
            <p className="mt-2 text-muted-foreground">Curated spots our team is adding to the guide.</p>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {extras.map((p) => (
              <article key={p.id} className="rounded-3xl glass overflow-hidden group hover:border-primary/40 transition">
                <div className="aspect-[4/3] overflow-hidden bg-secondary/40">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="grid h-full place-items-center text-muted-foreground"><MapPin className="h-8 w-8" /></div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  {p.tagline && <div className="text-xs text-accent mt-0.5">{p.tagline}</div>}
                  {p.description && <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{p.description}</p>}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

