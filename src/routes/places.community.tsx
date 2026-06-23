import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, MapPin, Plus, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/places/community")({
  head: () => ({
    meta: [
      { title: "Community places — Takaz" },
      { name: "description", content: "Hidden gems submitted and voted on by the Takaz traveller community. Like your favourites to push them to the top." },
    ],
  }),
  component: CommunityPlacesPage,
});

type UPlace = {
  id: string;
  slug: string;
  name: string;
  region: string | null;
  summary: string | null;
  cover_url: string | null;
  likes_count: number;
  cx: number | null;
  cy: number | null;
};

function CommunityPlacesPage() {
  const { user } = useAuth();
  const [places, setPlaces] = useState<UPlace[]>([]);
  const [liked, setLiked] = useState<Set<string>>(new Set());

  async function load() {
    const { data } = await supabase
      .from("user_places")
      .select("id, slug, name, region, summary, cover_url, likes_count, cx, cy")
      .eq("status", "approved")
      .order("likes_count", { ascending: false })
      .order("created_at", { ascending: false });
    setPlaces((data ?? []) as UPlace[]);
    if (user) {
      const { data: mine } = await supabase.from("place_likes").select("place_slug").eq("user_id", user.id);
      setLiked(new Set((mine ?? []).map((r: any) => r.place_slug)));
    } else {
      setLiked(new Set());
    }
  }

  useEffect(() => { load(); }, [user?.id]);

  async function toggleLike(slug: string) {
    if (!user) { window.location.href = "/login"; return; }
    const has = liked.has(slug);
    // optimistic
    setLiked(prev => {
      const next = new Set(prev);
      has ? next.delete(slug) : next.add(slug);
      return next;
    });
    setPlaces(prev => prev.map(p => p.slug === slug ? { ...p, likes_count: p.likes_count + (has ? -1 : 1) } : p));
    if (has) {
      await supabase.from("place_likes").delete().eq("user_id", user.id).eq("place_slug", slug);
    } else {
      await supabase.from("place_likes").insert({ user_id: user.id, place_slug: slug });
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs">
            <Sparkles className="h-3.5 w-3.5 text-accent" /> Community discoveries
          </span>
          <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">Most-loved <span className="text-gradient">hidden places</span></h1>
          <p className="mt-2 text-muted-foreground">Travellers add their favourite Sri Lankan spots. Hit ♥ to bump the best ones up.</p>
        </div>
        <Link to="/places/submit" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:scale-[1.02]">
          <Plus className="h-4 w-4" /> Add a place
        </Link>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {places.length === 0 && (
          <div className="col-span-full rounded-3xl glass p-12 text-center text-sm text-muted-foreground">
            No community places yet. Be the first to add one!
          </div>
        )}
        {places.map((p, i) => {
          const isLiked = liked.has(p.slug);
          return (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="group flex flex-col overflow-hidden rounded-3xl glass hover:border-primary/40 transition"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-secondary/40">
                {p.cover_url ? (
                  <img src={p.cover_url} alt={p.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                ) : (
                  <div className="grid h-full place-items-center text-muted-foreground"><MapPin className="h-8 w-8" /></div>
                )}
                <button
                  onClick={() => toggleLike(p.slug)}
                  className={`absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur transition ${isLiked ? "bg-rose-500/90 text-white" : "bg-black/50 text-white hover:bg-rose-500/80"}`}
                  aria-label={isLiked ? "Unlike" : "Like"}
                >
                  <Heart className={`h-3.5 w-3.5 ${isLiked ? "fill-current" : ""}`} />
                  {p.likes_count}
                </button>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                {p.region && <div className="text-[10px] uppercase tracking-widest text-accent">{p.region}</div>}
                <h2 className="mt-1 text-lg font-semibold">{p.name}</h2>
                {p.summary && <p className="mt-2 text-sm text-muted-foreground flex-1">{p.summary}</p>}
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
