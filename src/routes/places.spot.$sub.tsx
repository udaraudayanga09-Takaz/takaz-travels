import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, MapPin, Sparkles, Images, Compass } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isVideo, parentLink, resolveParent, type ParentRef, type SubPlace } from "@/lib/subplaces";

type LoaderData = {
  sub: SubPlace;
  parent: ParentRef;
  siblings: SubPlace[];
};

export const Route = createFileRoute("/places/spot/$sub")({
  loader: async ({ params }): Promise<LoaderData> => {
    const { data: sub } = await supabase
      .from("sub_places")
      .select("*")
      .eq("slug", params.sub)
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!sub) throw notFound();
    const [parent, sibRes] = await Promise.all([
      resolveParent(sub.parent_slug),
      supabase
        .from("sub_places")
        .select("*")
        .eq("parent_slug", sub.parent_slug)
        .eq("published", true)
        .neq("id", sub.id)
        .order("sort_order", { ascending: true })
        .limit(8),
    ]);
    return { sub: sub as SubPlace, parent, siblings: (sibRes.data ?? []) as SubPlace[] };
  },
  head: ({ loaderData }) => {
    const s = loaderData?.sub;
    const parentName = loaderData?.parent.name ?? "Sri Lanka";
    return {
      meta: [
        { title: s ? `${s.name} — near ${parentName} | Takaz` : "Place — Takaz" },
        { name: "description", content: s ? (s.tagline ?? s.description ?? `${s.name} near ${parentName}, Sri Lanka.`).slice(0, 155) : "Explore Sri Lanka with Takaz." },
        { property: "og:title", content: s ? `${s.name} — near ${parentName} | Takaz` : "Takaz" },
        { property: "og:description", content: s?.tagline ?? s?.description ?? "" },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(s?.image_url?.startsWith("https://")
          ? [
              { property: "og:image", content: s.image_url } as const,
              { name: "twitter:image", content: s.image_url } as const,
            ]
          : []),
      ],
    };
  },
  component: SubPlacePage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-5 py-32 text-center">
      <h1 className="text-2xl font-semibold">Place not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">This spot may have been removed or is not published yet.</p>
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

function SubPlacePage() {
  const { sub, parent, siblings } = Route.useLoaderData() as LoaderData;
  const pLink = parentLink(parent);
  const media = (sub.media_urls ?? []).filter(Boolean);

  return (
    <div>
      {/* HERO */}
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
        {sub.image_url ? (
          <img src={sub.image_url} alt={sub.name} className="absolute inset-0 h-full w-full object-cover" />
        ) : parent.hero ? (
          <img src={parent.hero} alt={parent.name} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-secondary/40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/10" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-14">
          {/* Breadcrumb */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-white/80">
            <Link to="/places" className="inline-flex items-center gap-1 hover:text-white transition">
              <ArrowLeft className="h-3 w-3" /> Destinations
            </Link>
            <span className="opacity-50">/</span>
            <Link to={pLink.to as any} params={pLink.params as any} className="hover:text-white transition underline underline-offset-2">
              {parent.name}
            </Link>
            <span className="opacity-50">/</span>
            <span className="text-white">{sub.name}</span>
          </div>
          <motion.span initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-4 inline-flex w-fit items-center gap-2 rounded-full glass px-3 py-1.5 text-xs">
            <MapPin className="h-3.5 w-3.5 text-accent" /> Near {parent.name}
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-3 max-w-3xl text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] text-white">
            {sub.name}
          </motion.h1>
          {sub.tagline && <p className="mt-3 max-w-xl text-sm md:text-base text-white/80">{sub.tagline}</p>}
        </div>
      </section>

      {/* DESCRIPTION + PARENT CTA */}
      <section className="mx-auto max-w-5xl px-5 py-14">
        {sub.description && (
          <p className="text-lg md:text-xl leading-relaxed text-muted-foreground whitespace-pre-wrap">{sub.description}</p>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to={pLink.to as any}
            params={pLink.params as any}
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition hover:scale-[1.02]"
          >
            Explore {parent.name} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
          <Link to="/places" className="inline-flex items-center gap-2 rounded-full glass px-6 py-3 text-sm font-medium">
            All destinations
          </Link>
        </div>
      </section>

      {/* MEDIA GALLERY */}
      {media.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-16">
          <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs">
            <Images className="h-3.5 w-3.5 text-accent" /> Photos & videos
          </span>
          <h2 className="mt-3 text-2xl md:text-4xl font-semibold tracking-tight">Moments from {sub.name}</h2>
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
                  <img src={url} alt={`${sub.name} photo ${i + 1}`} loading="lazy" className="aspect-[4/5] w-full object-cover transition duration-700 hover:scale-105" />
                )}
              </motion.figure>
            ))}
          </div>
        </section>
      )}

      {/* SIBLINGS — more places near the parent */}
      {siblings.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-20">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs">
                <Compass className="h-3.5 w-3.5 text-accent" /> Keep exploring
              </span>
              <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight">More places around {parent.name}</h2>
            </div>
            <Link to={pLink.to as any} params={pLink.params as any} className="inline-flex items-center gap-1.5 rounded-full glass px-4 py-2 text-xs font-medium hover:bg-secondary/40 transition">
              Back to {parent.name} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-6 grid gap-4 grid-cols-2 md:grid-cols-4">
            {siblings.map((s) => (
              <Link
                key={s.id}
                to="/places/spot/$sub"
                params={{ sub: s.slug }}
                className="group relative overflow-hidden rounded-2xl glass"
              >
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
            ))}
          </div>
        </section>
      )}

      {/* PLAN CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="overflow-hidden rounded-3xl glass-strong relative">
          {parent.hero && (
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <img src={parent.hero} alt="" className="h-full w-full object-cover" />
            </div>
          )}
          <div className="relative p-8 md:p-12 flex flex-col md:flex-row md:items-center gap-6 justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 text-primary px-3 py-1.5 text-xs font-medium">
                <Sparkles className="h-3.5 w-3.5" /> Trip planner
              </span>
              <h3 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight">Add {sub.name} to your {parent.name} trip</h3>
              <p className="mt-2 max-w-xl text-sm md:text-base text-muted-foreground">Pick dates, add a stay and a vehicle for the region, and book it all in one checkout.</p>
            </div>
            <Link to="/plan" search={{ regions: parent.slug }} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition hover:scale-[1.02] shrink-0">
              Plan my trip <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
