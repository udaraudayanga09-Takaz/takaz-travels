import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote, Play, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Testimonial = { id: string; name: string; location: string | null; rating: number; text: string; avatar_url: string | null; created_at: string };

const VLOGS = [
  { id: "k79DcY-oTfM", title: "Sri Lanka in 4K — Travel Film", channel: "Cinematic Travels" },
  { id: "PwQTQ8-Lhlc", title: "Ella, Kandy & The Hill Country", channel: "Lost LeBlanc" },
  { id: "0PfTGu0Ag5g", title: "Tuk-Tuk Road Trip Across Sri Lanka", channel: "Yes Theory" },
  { id: "h-15X-9Ek0g", title: "Sigiriya — The 8th Wonder", channel: "Drew Binsky" },
];

export const Route = createFileRoute("/memories")({
  head: () => ({
    meta: [
      { title: "Memories & Moments — Takaz" },
      { name: "description", content: "Real stories from travellers who explored Sri Lanka with Takaz, plus the best Sri Lanka travel films on YouTube." },
      { property: "og:title", content: "Memories & Moments — Takaz" },
      { property: "og:description", content: "Traveller stories and cinematic films of Sri Lanka." },
    ],
  }),
  component: MemoriesPage,
});

function MemoriesPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [active, setActive] = useState(VLOGS[0]);

  useEffect(() => {
    supabase.from("testimonials").select("*").eq("published", true).order("created_at", { ascending: false }).limit(24)
      .then(({ data }) => setItems((data ?? []) as Testimonial[]));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:py-20">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs">
          <Heart className="h-3.5 w-3.5 text-accent" /> Memories & Moments
        </span>
        <h1 className="mt-4 text-4xl md:text-6xl font-semibold tracking-tight">Stories from the <span className="text-gradient">pearl</span> of the ocean</h1>
        <p className="mt-3 text-muted-foreground">Real travellers, real journeys — plus the films that made us fall in love with Sri Lanka.</p>
      </motion.div>

      {/* Testimonials grid */}
      <section className="mt-16">
        <h2 className="text-2xl md:text-3xl font-semibold">What travellers say</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.length === 0 && (
            <div className="col-span-full rounded-2xl glass p-12 text-center text-muted-foreground">No stories yet — be the first.</div>
          )}
          {items.map((t, i) => (
            <motion.article
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.5 }}
              className="rounded-2xl glass p-6 hover:border-primary/40 transition"
            >
              <Quote className="h-6 w-6 text-accent" />
              <p className="mt-3 text-sm leading-relaxed">{t.text}</p>
              <div className="mt-5 flex items-center gap-3">
                {t.avatar_url ? (
                  <img src={t.avatar_url} alt={t.name} className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/20 text-xs font-medium text-primary">{t.name[0]}</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{t.name}</div>
                  {t.location && <div className="text-xs text-muted-foreground">{t.location}</div>}
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, k) => <Star key={k} className="h-3.5 w-3.5 fill-accent text-accent" />)}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* YouTube vlog hub */}
      <section className="mt-24">
        <h2 className="text-2xl md:text-3xl font-semibold">Watch Sri Lanka</h2>
        <p className="mt-2 text-muted-foreground">Hand-picked travel films from creators who captured the island best.</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="overflow-hidden rounded-3xl glass-strong">
            <div className="aspect-video w-full">
              <iframe
                key={active.id}
                src={`https://www.youtube.com/embed/${active.id}?rel=0`}
                title={active.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
            <div className="p-5">
              <div className="text-lg font-semibold">{active.title}</div>
              <div className="text-xs text-muted-foreground">{active.channel}</div>
            </div>
          </div>

          <div className="space-y-3">
            {VLOGS.map(v => (
              <button
                key={v.id}
                onClick={() => setActive(v)}
                className={`flex w-full items-center gap-3 rounded-2xl glass p-3 text-left transition hover:border-primary/40 ${active.id === v.id ? "ring-1 ring-primary" : ""}`}
              >
                <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-xl">
                  <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 grid place-items-center bg-black/30">
                    <Play className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{v.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{v.channel}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
