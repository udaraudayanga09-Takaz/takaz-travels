import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, MapPin, Sparkles, Images } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isVideo, type SubPlace } from "@/lib/subplaces";

type ExtraPlace = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  image_url: string | null;
  media_urls: string[];
};

type LoaderData = {
  place: ExtraPlace;
  subs: SubPlace[];
};

export const Route = createFileRoute("/places/extra/$slug")({
  loader: async ({ params }): Promise<LoaderData> => {
    const { data: place } = await supabase
      .from("additional_places")
      .select("id, name, slug, tagline, description, image_url, media_urls")
      .eq("slug", params.slug)
      .eq("published", true)
      .maybeSingle();
    if (!place) throw notFound();
    const { data: subs } = await supabase
      .from("sub_places")
      .select("*")
      .eq("parent_slug", place.slug)
      .eq("published", true)
      .order("sort_order", { ascending: true });
    return { place: place as ExtraPlace, subs: (subs ?? []) as SubPlace[] };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.place;
    return {
      meta: [
        { title: p ? `${p.name} — Places to visit | Takaz` : "Place — Takaz" },
        { name: "description", content: p ? (p.tagline ?? p.description ?? `${p.name}, Sri Lanka.`).slice(0, 155) : "Explore Sri Lanka with Takaz." },
        { property: "og:title", content: p ? `${p.name} — Takaz` : "Takaz" },
        { property: "og:description", content: p?.tagline ?? p?.description ?? "" },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(p?.image_url?.startsWith("https://")
          ? [
              { property: "og:image", content: p.image_url } as const,
              { name: "twitter:image", content: p.image_url } as const,
            ]
          : []),
      ],
    };
  },
  component: ExtraPlacePage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-5 py-32 text-center">
      <h1 className="text-2xl font-semibold">Place not found</h1>
      <Link to="/places" className="mt-4 inline-block text-primary">← All destinations</Link>
    </div>
  ),
  errorComponent: () => (
    <div className="mx-auto max-w-xl px-5 py-32 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <Link to="/places" className="mt-4 inline-block text-primary">← All destinations</Link>
    </div>
  ),
});

function ExtraPlacePage() {
  const { place, subs } = Route.useLoaderData() as LoaderData;
  const media = (place.media_urls ?? []).filter(Boolean);

  return (
    <div>
      {/* HERO */}
      <section className="relative h-[65vh] min-h-[420px] overflow-hidden">
        {place.image_url ? (
          <img src={place.image_url} alt={place.name} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-secondary/40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/10" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-14">
          <Link to="/places" className="inline-flex w-fit items-center gap-1.5 text-xs text-white/80 hover:text-white transition">
            <ArrowLeft className="h-3.5 w-3.5" /> All destinations
          </Link>
          <motion.span initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-4 inline-flex w-fit items-center gap-2 rounded-full glass px-3 py-1.5 text-xs">
            <MapPin className="h-3.5 w-3.5 text-accent" /> Sri Lanka
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-3 max-w-3xl text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05] text-white">
            {place.name}
          </motion.h1>
          {place.tagline && <p className="mt-3 max-w-xl text-sm md:text-base text-white/80">{place.tagline}</p>}
        </div>
      </section>

      {/* DESCRIPTION */}
      <section className="mx-auto max-w-5xl px-5 py-14">
        {place.description && (
          <p className="text-lg md:text-xl leading-relaxed text-muted-foreground whitespace-pre-wrap">{place.description}</p>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/"
            search={{ filter: "stay", city: place.name }}
            hash="explore"
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition hover:scale-[1.02]"
          >
            Find stays near {place.name} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
          <Link to="/plan" search={{ regions: undefined }} className="inline-flex items-center gap-2 rounded-full glass px-6 py-3 text-sm font-medium">
            Plan a trip
          </Link>
        </div>
      </section>

      {/* SUB-PLACES */}
      {subs.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-16">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-accent" /> Places to visit
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">Around {place.name}</h2>
          </div>
          <div className="mt-8 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {subs.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(i * 0.04, 0.3) }}>
                <Link to="/places/spot/$sub" params={{ sub: s.slug }} className="group relative block overflow-hidden rounded-2xl glass">
                  <div className="aspect-[4/5] overflow-hidden bg-secondary/40">
                    {s.image_url ? (
                      <img src={s.image_url} alt={s.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="grid h-full place-items-center text-muted-foreground"><MapPin className="h-6 w-6" /></div>
                    )}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white">
                    <div className="text-sm font-semibold">{s.name}</div>
                    {s.tagline && <div className="text-[10px] opacity-80 line-clamp-1">{s.tagline}</div>}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* MEDIA GALLERY */}
      {media.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-24">
          <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs">
            <Images className="h-3.5 w-3.5 text-accent" /> Photos & videos
          </span>
          <h2 className="mt-3 text-2xl md:text-4xl font-semibold tracking-tight">Moments from {place.name}</h2>
          <div className="mt-8 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {media.map((url, i) => (
              <motion.figure
                key={url + i}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
                className="overflow-hidden rounded-2xl glass"
              >
                {isVideo(url) ? (
                  <video src={url} controls playsInline preload="metadata" className="aspect-[4/5] w-full object-cover bg-black" />
                ) : (
                  <img src={url} alt={`${place.name} photo ${i + 1}`} loading="lazy" className="aspect-[4/5] w-full object-cover transition duration-700 hover:scale-105" />
                )}
              </motion.figure>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
