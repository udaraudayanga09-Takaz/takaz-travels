import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, Play, Heart, PenLine, Upload, Instagram, Twitter, Youtube, Globe, Trash2, LogIn, Loader2, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PLACE_LIST } from "@/data/places";

type Testimonial = { id: string; name: string; location: string | null; rating: number; text: string; avatar_url: string | null; created_at: string };

type Blog = {
  id: string;
  user_id: string;
  author_name: string;
  title: string;
  body: string;
  cover_url: string | null;
  place_slug: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  youtube_url: string | null;
  website_url: string | null;
  published: boolean;
  created_at: string;
};

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
  const { user } = useAuth();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [active, setActive] = useState(VLOGS[0]);
  const [blogs, setBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    supabase.from("testimonials").select("*").eq("published", true).order("created_at", { ascending: false }).limit(24)
      .then(({ data }) => setItems((data ?? []) as Testimonial[]));
    loadBlogs();
  }, []);

  async function loadBlogs() {
    const { data } = await supabase
      .from("travel_blogs")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(50);
    setBlogs((data ?? []) as Blog[]);
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:py-20">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs">
          <Heart className="h-3.5 w-3.5 text-accent" /> Memories & Moments
        </span>
        <h1 className="mt-4 text-4xl md:text-6xl font-semibold tracking-tight text-foreground">
          Stories from the <span className="text-gradient">pearl</span> of the ocean
        </h1>
        <p className="mt-3 text-muted-foreground">Real travellers, real journeys — plus the films that made us fall in love with Sri Lanka.</p>
      </motion.div>

      {/* Traveller Blogs */}
      <section className="mt-20">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs">
              <PenLine className="h-3.5 w-3.5 text-accent" /> Traveller blogs
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-foreground">Share your Sri Lanka journey</h2>
            <p className="mt-2 text-muted-foreground max-w-xl">Sign in, publish a blog with photos, and share where to find you online.</p>
          </div>
        </div>

        <div className="mt-8">
          {user ? <BlogComposer onPosted={loadBlogs} /> : <SignInCta />}
        </div>

        {blogs.length === 0 ? (
          <div className="mt-10 rounded-2xl glass p-12 text-center text-muted-foreground text-sm">
            No published blogs yet — {user ? "share your story above and it will appear here once approved." : "sign in above and share the first story."}
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {blogs.map((b, i) => (
                <BlogCard key={b.id} blog={b} index={i} isOwner={user?.id === b.user_id} onDeleted={loadBlogs} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Testimonials */}
      <section className="mt-24">
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground">What travellers say</h2>
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
              <p className="mt-3 text-sm leading-relaxed text-foreground">{t.text}</p>
              <div className="mt-5 flex items-center gap-3">
                {t.avatar_url ? (
                  <img src={t.avatar_url} alt={t.name} className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/20 text-xs font-medium text-primary">{t.name[0]}</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate text-foreground">{t.name}</div>
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
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground">Watch Sri Lanka</h2>
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
              <div className="text-lg font-semibold text-foreground">{active.title}</div>
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
                  <div className="text-sm font-medium truncate text-foreground">{v.title}</div>
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

function SignInCta() {
  return (
    <div className="rounded-3xl glass-strong p-8 md:p-10 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/15 text-primary">
        <LogIn className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-xl font-semibold text-foreground">Sign in to publish a blog</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
        Create a free account to share trip stories with photos and link to your Instagram, YouTube and other socials.
      </p>
      <Link
        to="/login"
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:scale-[1.02]"
      >
        <LogIn className="h-4 w-4" /> Sign in or create account
      </Link>
    </div>
  );
}

function BlogComposer({ onPosted }: { onPosted: () => void }) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [authorName, setAuthorName] = useState(user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "");
  const [placeSlug, setPlaceSlug] = useState<string>("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [youtube, setYoutube] = useState("");
  const [website, setWebsite] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function onPickCover(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setError("Photo must be under 5 MB"); return; }
    setCoverFile(f);
    setCoverPreview(URL.createObjectURL(f));
    setError(null);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!authorName.trim() || !title.trim() || !body.trim()) {
      setError("Name, title and story are required");
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      let cover_url: string | null = null;
      if (coverFile) {
        const ext = coverFile.name.split(".").pop() || "jpg";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("blog-covers").upload(path, coverFile, { upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("blog-covers").getPublicUrl(path);
        cover_url = pub.publicUrl;
      }

      const { error: insErr } = await supabase.from("travel_blogs").insert({
        user_id: user.id,
        author_name: authorName.trim(),
        title: title.trim(),
        body: body.trim(),
        cover_url,
        place_slug: placeSlug || null,
        instagram_url: instagram.trim() || null,
        twitter_url: twitter.trim() || null,
        youtube_url: youtube.trim() || null,
        website_url: website.trim() || null,
        published: false,
      });
      if (insErr) throw insErr;

      setTitle(""); setBody(""); setCoverFile(null); setCoverPreview(null); setPlaceSlug("");
      setInstagram(""); setTwitter(""); setYoutube(""); setWebsite("");
      setSuccess("Thanks! Your blog is in the moderation queue — an admin will approve it shortly.");
      onPosted();
    } catch (err: any) {
      setError(err?.message ?? "Could not publish your blog");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl glass-strong p-6 space-y-4"
    >
      <div className="grid gap-3 md:grid-cols-2">
        <input value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="Your name"
          className="rounded-xl bg-secondary/40 text-foreground placeholder:text-muted-foreground px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary" required />
        <select value={placeSlug} onChange={e => setPlaceSlug(e.target.value)}
          className="rounded-xl bg-secondary/40 text-foreground px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary">
          <option value="">Tag a place (optional)</option>
          {PLACE_LIST.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}
        </select>
      </div>

      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Blog title — e.g. 14 days surfing Arugam Bay"
        className="w-full rounded-xl bg-secondary/40 text-foreground placeholder:text-muted-foreground px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary" required />

      <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Share your story, tips and itinerary…" rows={6}
        className="w-full resize-none rounded-xl bg-secondary/40 text-foreground placeholder:text-muted-foreground px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary" required />

      <div className="grid gap-3 md:grid-cols-[1fr_auto] items-start">
        <div className="grid gap-3 sm:grid-cols-2">
          <SocialInput icon={<Instagram className="h-4 w-4" />} value={instagram} onChange={setInstagram} placeholder="Instagram URL" />
          <SocialInput icon={<Twitter className="h-4 w-4" />} value={twitter} onChange={setTwitter} placeholder="Twitter / X URL" />
          <SocialInput icon={<Youtube className="h-4 w-4" />} value={youtube} onChange={setYoutube} placeholder="YouTube URL" />
          <SocialInput icon={<Globe className="h-4 w-4" />} value={website} onChange={setWebsite} placeholder="Website / blog URL" />
        </div>

        <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-secondary/30 px-6 py-6 cursor-pointer hover:border-primary/40 transition w-full md:w-44 text-center">
          {coverPreview ? (
            <img src={coverPreview} alt="Preview" className="h-20 w-full object-cover rounded-lg" />
          ) : (
            <>
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Cover photo<br />(max 5 MB)</span>
            </>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={onPickCover} />
        </label>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-primary">{success}</p>}
      <p className="text-xs text-muted-foreground">New submissions are reviewed by an admin before appearing publicly.</p>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenLine className="h-4 w-4" />}
        {submitting ? "Submitting…" : "Submit for review"}
      </button>
    </motion.form>
  );
}

function SocialInput({ icon, value, onChange, placeholder }: { icon: React.ReactNode; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-secondary/40 px-3 py-2.5">
      <span className="text-muted-foreground">{icon}</span>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm outline-none" />
    </div>
  );
}

function BlogCard({ blog, index, isOwner, onDeleted }: { blog: Blog; index: number; isOwner: boolean; onDeleted: () => void }) {
  const [busy, setBusy] = useState(false);
  const place = PLACE_LIST.find(p => p.slug === blog.place_slug);

  async function del() {
    if (!confirm("Delete this blog?")) return;
    setBusy(true);
    await supabase.from("travel_blogs").delete().eq("id", blog.id);
    onDeleted();
  }

  const socials = [
    { url: blog.instagram_url, icon: <Instagram className="h-3.5 w-3.5" />, label: "Instagram" },
    { url: blog.twitter_url, icon: <Twitter className="h-3.5 w-3.5" />, label: "Twitter" },
    { url: blog.youtube_url, icon: <Youtube className="h-3.5 w-3.5" />, label: "YouTube" },
    { url: blog.website_url, icon: <Globe className="h-3.5 w-3.5" />, label: "Website" },
  ].filter(s => s.url);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: Math.min(index, 6) * 0.04 }}
      className="group flex flex-col rounded-2xl glass overflow-hidden hover:border-primary/40 transition"
    >
      {blog.cover_url && (
        <div className="aspect-[16/10] overflow-hidden">
          <img src={blog.cover_url} alt={blog.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        </div>
      )}
      <div className="p-5 flex-1 flex flex-col">
        {place && (
          <Link to="/places/$slug" params={{ slug: place.slug }} className="inline-flex w-fit items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
            <MapPin className="h-2.5 w-2.5" /> {place.name}
          </Link>
        )}
        <h3 className="mt-2 text-lg font-semibold text-foreground line-clamp-2">{blog.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">{blog.body}</p>

        <div className="mt-auto pt-4 flex items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground">
            <span className="text-foreground font-medium">{blog.author_name}</span> · {new Date(blog.created_at).toLocaleDateString()}
          </div>
          {isOwner && (
            <button onClick={del} disabled={busy} className="text-muted-foreground hover:text-destructive transition" aria-label="Delete blog">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {socials.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border/60 pt-3">
            {socials.map(s => (
              <a
                key={s.label}
                href={s.url!}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-1 rounded-full bg-secondary/60 px-2 py-1 text-[10px] text-foreground hover:bg-primary/20 hover:text-primary transition"
              >
                {s.icon} {s.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
}
