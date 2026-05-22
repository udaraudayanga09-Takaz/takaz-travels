import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, ArrowLeft, ArrowRight, Sparkles, Upload, Image as ImageIcon, PenLine, Heart, Trash2 } from "lucide-react";
import { PLACES, type Place } from "@/data/places";


type Blog = { id: string; author: string; title: string; body: string; created_at: number };
type Memory = { id: string; author: string; caption: string; data_url: string; created_at: number };

const BLOG_KEY = (slug: string) => `takaz-blogs-${slug}`;
const MEM_KEY  = (slug: string) => `takaz-memories-${slug}`;

export const Route = createFileRoute("/places/$slug")({
  loader: ({ params }) => {
    const place = PLACES[params.slug as keyof typeof PLACES];
    if (!place) throw notFound();
    return { place };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.place;
    return {
      meta: [
        { title: p ? `${p.name} — Places to visit | Takaz` : "Place — Takaz" },
        { name: "description", content: p ? `${p.intro.slice(0, 150)}` : "Explore Sri Lanka with Takaz." },
        { property: "og:title", content: p ? `${p.name} — Takaz` : "Takaz" },
        { property: "og:description", content: p?.intro ?? "" },
        { property: "og:image", content: p?.hero ?? "" },
      ],
    };
  },
  component: PlacePage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-5 py-32 text-center">
      <h1 className="text-2xl font-semibold">Place not found</h1>
      <Link to="/" className="mt-4 inline-block text-primary">← Back home</Link>
    </div>
  ),
});

function loadJSON<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) ?? "[]") as T[]; } catch { return []; }
}

function PlacePage() {
  const { place } = Route.useLoaderData();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);

  useEffect(() => {
    setBlogs(loadJSON<Blog>(BLOG_KEY(place.slug)));
    setMemories(loadJSON<Memory>(MEM_KEY(place.slug)));
  }, [place.slug]);

  // Blog form
  const [bAuthor, setBAuthor] = useState("");
  const [bTitle, setBTitle] = useState("");
  const [bBody, setBBody] = useState("");

  const submitBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bAuthor.trim() || !bTitle.trim() || !bBody.trim()) return;
    const next: Blog = { id: crypto.randomUUID(), author: bAuthor.trim(), title: bTitle.trim(), body: bBody.trim(), created_at: Date.now() };
    const list = [next, ...blogs];
    setBlogs(list);
    localStorage.setItem(BLOG_KEY(place.slug), JSON.stringify(list));
    setBTitle(""); setBBody("");
  };

  const deleteBlog = (id: string) => {
    const list = blogs.filter(b => b.id !== id);
    setBlogs(list);
    localStorage.setItem(BLOG_KEY(place.slug), JSON.stringify(list));
  };

  // Memory upload
  const [mAuthor, setMAuthor] = useState("");
  const [mCaption, setMCaption] = useState("");

  const onPickFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!mAuthor.trim()) { alert("Please add your name first"); return; }
    if (file.size > 4 * 1024 * 1024) { alert("Please keep photos under 4 MB"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const next: Memory = {
        id: crypto.randomUUID(),
        author: mAuthor.trim(),
        caption: mCaption.trim() || place.name,
        data_url: String(reader.result),
        created_at: Date.now(),
      };
      const list = [next, ...memories];
      setMemories(list);
      try { localStorage.setItem(MEM_KEY(place.slug), JSON.stringify(list)); }
      catch { alert("Browser storage is full — please remove an older memory."); return; }
      setMCaption("");
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const deleteMemory = (id: string) => {
    const list = memories.filter(m => m.id !== id);
    setMemories(list);
    localStorage.setItem(MEM_KEY(place.slug), JSON.stringify(list));
  };

  const otherPlaces = useMemo(() => Object.values(PLACES).filter(p => p.slug !== place.slug), [place.slug]);

  return (
    <div>
      {/* HERO */}
      <section className="relative h-[70vh] min-h-[440px] overflow-hidden">
        <img src={place.hero} alt={place.caption} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/10" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-16">
          <Link to="/" className="inline-flex w-fit items-center gap-1.5 text-xs text-white/80 hover:text-white transition">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </Link>
          <motion.span initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-4 inline-flex w-fit items-center gap-2 rounded-full glass px-3 py-1.5 text-xs">
            <MapPin className="h-3.5 w-3.5 text-accent" /> {place.region}
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-3 max-w-3xl text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05] text-white">
            {place.caption}
          </motion.h1>
          <p className="mt-4 max-w-xl text-sm md:text-base text-white/80 flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Best time to visit: <span className="text-white">{place.bestTime}</span>
          </p>
        </div>
      </section>

      {/* INTRO + ACTIONS */}
      <section className="mx-auto max-w-5xl px-5 py-16">
        <p className="text-lg md:text-xl leading-relaxed text-muted-foreground">{place.intro}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/"
            search={{ filter: "stay", city: place.searchCity }}
            hash="explore"
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition hover:scale-[1.02]"
          >
            View stays in {place.name} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/"
            search={{ filter: "vehicle", city: place.searchCity }}
            hash="explore"
            className="inline-flex items-center gap-2 rounded-full glass px-6 py-3 text-sm font-medium"
          >
            Find a ride
          </Link>
        </div>
      </section>

      {/* PLACES TO VISIT */}
      <section className="mx-auto max-w-7xl px-5 pb-20">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs">
            <Sparkles className="h-3.5 w-3.5 text-accent" /> Places to visit
          </span>
          <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight">Unmissable in {place.name}</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {place.spots.map((s, i) => (
            <motion.article
              key={s.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl glass p-6 hover:border-primary/40 transition"
            >
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary text-sm font-semibold">{i + 1}</div>
              <h3 className="mt-4 text-lg font-semibold">{s.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.description}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* TRAVELLER BLOGS */}
      <section className="mx-auto max-w-5xl px-5 pb-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs">
            <PenLine className="h-3.5 w-3.5 text-accent" /> Traveller blogs
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">Stories from {place.name}</h2>
          <p className="mt-2 text-muted-foreground">Add your own tips, itineraries and hidden-gem finds.</p>
        </div>

        <form onSubmit={submitBlog} className="mt-8 rounded-3xl glass-strong p-6 space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <input value={bAuthor} onChange={e => setBAuthor(e.target.value)} placeholder="Your name" required className="rounded-xl bg-secondary/40 px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary" />
            <input value={bTitle} onChange={e => setBTitle(e.target.value)} placeholder="Blog title" required className="rounded-xl bg-secondary/40 px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <textarea value={bBody} onChange={e => setBBody(e.target.value)} placeholder={`Share your experience in ${place.name}…`} required rows={5} className="w-full resize-none rounded-xl bg-secondary/40 px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary" />
          <button type="submit" className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:scale-[1.02]">Publish blog</button>
        </form>

        <div className="mt-8 space-y-4">
          {blogs.length === 0 && <div className="rounded-2xl glass p-8 text-center text-muted-foreground text-sm">No blogs yet — be the first to share your story.</div>}
          {blogs.map(b => (
            <motion.article key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl glass p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{b.title}</h3>
                  <div className="mt-1 text-xs text-muted-foreground">by {b.author} · {new Date(b.created_at).toLocaleDateString()}</div>
                </div>
                <button onClick={() => deleteBlog(b.id)} className="opacity-50 hover:opacity-100 transition" aria-label="Remove blog">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 text-sm whitespace-pre-wrap leading-relaxed">{b.body}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* HAPPY MEMORIES — photo wall */}
      <section className="mx-auto max-w-7xl px-5 pb-24">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs">
            <Heart className="h-3.5 w-3.5 text-accent" /> Our happy memories
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">Photos from travellers in {place.name}</h2>
          <p className="mt-2 text-muted-foreground">Upload a photo from your trip — it'll show below for everyone to enjoy.</p>
        </div>

        <div className="mt-8 rounded-3xl glass-strong p-6">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] items-center">
            <input value={mAuthor} onChange={e => setMAuthor(e.target.value)} placeholder="Your name" className="rounded-xl bg-secondary/40 px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary" />
            <input value={mCaption} onChange={e => setMCaption(e.target.value)} placeholder="Caption (optional)" className="rounded-xl bg-secondary/40 px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary" />
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:scale-[1.02]">
              <Upload className="h-4 w-4" /> Upload photo
              <input type="file" accept="image/*" className="hidden" onChange={onPickFile} />
            </label>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Max 4 MB · JPG, PNG, WebP.</p>
        </div>

        <div className="mt-8 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {memories.length === 0 && (
            <div className="col-span-full rounded-2xl glass p-12 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
              <ImageIcon className="h-6 w-6" /> No memories yet — be the first to share one.
            </div>
          )}
          {memories.map(m => (
            <motion.figure key={m.id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="group relative overflow-hidden rounded-2xl glass">
              <img src={m.data_url} alt={m.caption} className="aspect-[4/5] w-full object-cover transition group-hover:scale-105" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-xs text-white">
                <div className="font-medium truncate">{m.caption}</div>
                <div className="opacity-70">{m.author}</div>
              </figcaption>
              <button onClick={() => deleteMemory(m.id)} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100" aria-label="Remove">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </motion.figure>
          ))}
        </div>
      </section>

      {/* OTHER PLACES */}
      <section className="mx-auto max-w-7xl px-5 pb-24">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">More places to explore</h2>
        <div className="mt-6 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {otherPlaces.map(p => (
            <Link key={p.slug} to="/places/$slug" params={{ slug: p.slug }} className="group relative aspect-[4/5] overflow-hidden rounded-2xl">
              <img src={p.hero} alt={p.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <div className="text-sm font-semibold">{p.name}</div>
                <div className="text-[10px] opacity-80">{p.region}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
