import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Pencil, Trash2, X, Upload, Image as ImageIcon, Eye, EyeOff, Film } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PLACE_LIST } from "@/data/places";
import { isVideo } from "@/lib/subplaces";

type TopRow = {
  id: string;
  name: string;
  slug: string;
  category: "top_ranked" | "hidden_gem";
  tagline: string | null;
  description: string | null;
  image_url: string | null;
  trip_rank: number | null;
  bookings_count: number;
  sort_order: number;
};

type AdditionalRow = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  image_url: string | null;
  media_urls: string[] | null;
  published: boolean;
  sort_order: number;
};

type SubRow = {
  id: string;
  parent_slug: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  image_url: string | null;
  media_urls: string[] | null;
  published: boolean;
  sort_order: number;
};

export function PlacesManagement() {
  const [sub, setSub] = useState<"top" | "additional" | "sub">("top");
  return (
    <div>
      <div className="flex gap-2 mb-6">
        {([["top", "Top destinations"], ["additional", "Additional destinations"], ["sub", "Sub-locations"]] as const).map(([v, l]) => (
          <button
            key={v}
            onClick={() => setSub(v)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${sub === v ? "bg-primary text-primary-foreground" : "glass text-muted-foreground hover:text-foreground"}`}
          >
            {l}
          </button>
        ))}
      </div>
      {sub === "top" ? <TopDestinationsTable /> : sub === "additional" ? <AdditionalPlacesTable /> : <SubPlacesTable />}
    </div>
  );
}

/* -------------------- helpers -------------------- */

async function uploadImage(file: File): Promise<string> {
  const path = `places/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
  const up = await supabase.storage.from("blog-covers").upload(path, file, { upsert: false });
  if (up.error) throw up.error;
  return supabase.storage.from("blog-covers").getPublicUrl(path).data.publicUrl;
}

async function uploadMedia(file: File): Promise<string> {
  const path = `places/media/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
  const up = await supabase.storage.from("blog-covers").upload(path, file, { upsert: false });
  if (up.error) throw up.error;
  return supabase.storage.from("blog-covers").getPublicUrl(path).data.publicUrl;
}

function slugify(v: string) {
  return v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}

/* -------------------- TOP DESTINATIONS -------------------- */

function TopDestinationsTable() {
  const [rows, setRows] = useState<TopRow[]>([]);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<TopRow | "new" | null>(null);

  async function load() {
    const { data } = await supabase
      .from("top_destinations")
      .select("*")
      .order("category")
      .order("sort_order")
      .order("trip_rank", { nullsFirst: false });
    setRows((data ?? []) as TopRow[]);
  }
  useEffect(() => { load(); }, []);

  async function remove(r: TopRow) {
    if (!confirm(`Delete "${r.name}"? It will be removed from the home page immediately.`)) return;
    await supabase.from("top_destinations").delete().eq("id", r.id);
    load();
  }

  const filtered = rows.filter(r => r.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search by place name…"
            className="w-full rounded-full glass pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button
          onClick={() => setEditing("new")}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-[var(--shadow-glow)] hover:scale-[1.02] transition"
        >
          <Plus className="h-3.5 w-3.5" /> Add new place
        </button>
      </div>

      <div className="rounded-3xl glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/30 text-[10px] uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="text-left px-3 py-3">Image</th>
                <th className="text-left px-3 py-3">Name</th>
                <th className="text-left px-3 py-3">Category</th>
                <th className="text-left px-3 py-3">Tagline</th>
                <th className="text-left px-3 py-3">Rank</th>
                <th className="text-left px-3 py-3">Bookings</th>
                <th className="text-right px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center text-muted-foreground py-10">No places match “{q}”.</td></tr>
              )}
              {filtered.map(r => (
                <tr key={r.id} className="border-t border-border/40 hover:bg-secondary/20">
                  <td className="px-3 py-2.5">
                    {r.image_url ? (
                      <img src={r.image_url} alt={r.name} className="h-12 w-16 rounded-md object-cover" />
                    ) : (
                      <div className="h-12 w-16 rounded-md bg-secondary/50 grid place-items-center"><ImageIcon className="h-4 w-4 text-muted-foreground" /></div>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="font-medium">{r.name}</div>
                    <div className="text-[10px] text-muted-foreground">/{r.slug}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <CategoryPicker
                      value={r.category}
                      onChange={async (v) => {
                        await supabase.from("top_destinations").update({ category: v }).eq("id", r.id);
                        load();
                      }}
                    />
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground max-w-xs truncate">{r.tagline}</td>
                  <td className="px-3 py-2.5">{r.trip_rank ?? "—"}</td>
                  <td className="px-3 py-2.5">{r.bookings_count}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => setEditing(r)} className="p-1.5 rounded-md hover:bg-secondary/60" title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => remove(r)} className="p-1.5 rounded-md hover:bg-destructive/20 text-destructive" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {editing && (
          <TopFormModal
            initial={editing === "new" ? null : editing}
            onClose={() => setEditing(null)}
            onSaved={() => { setEditing(null); load(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CategoryPicker({ value, onChange }: { value: "top_ranked" | "hidden_gem"; onChange: (v: "top_ranked" | "hidden_gem") => void }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value as any)}
      className="rounded-full glass px-2.5 py-1 text-[11px] outline-none focus:ring-1 focus:ring-primary"
    >
      <option value="top_ranked">Top ranked</option>
      <option value="hidden_gem">Hidden gem</option>
    </select>
  );
}

function TopFormModal({ initial, onClose, onSaved }: { initial: TopRow | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [category, setCategory] = useState<"top_ranked" | "hidden_gem">(initial?.category ?? "top_ranked");
  const [tagline, setTagline] = useState(initial?.tagline ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [tripRank, setTripRank] = useState<string>(initial?.trip_rank?.toString() ?? "");
  const [bookings, setBookings] = useState<string>(initial?.bookings_count?.toString() ?? "0");
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.image_url ?? null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      let img = imageUrl;
      if (file) img = await uploadImage(file);
      const payload = {
        name: name.trim(),
        slug: (slug.trim() || slugify(name)),
        category,
        tagline: tagline || null,
        description: description || null,
        image_url: img,
        trip_rank: tripRank ? parseInt(tripRank, 10) : null,
        bookings_count: bookings ? parseInt(bookings, 10) : 0,
      };
      if (!payload.name || !payload.slug) throw new Error("Name and slug are required.");
      const q = initial
        ? supabase.from("top_destinations").update(payload).eq("id", initial.id)
        : supabase.from("top_destinations").insert(payload);
      const { error } = await q;
      if (error) throw error;
      onSaved();
    } catch (e: any) {
      setErr(e.message ?? "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <FormShell title={initial ? `Edit ${initial.name}` : "Add new place"} onClose={onClose} onSubmit={save} busy={busy} err={err}>
      <TextField label="Place name *" value={name} onChange={v => { setName(v); if (!initial && !slug) setSlug(slugify(v)); }} />
      <TextField label="Slug (URL path, e.g. ella)" value={slug} onChange={setSlug} />
      <div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Category</div>
        <select value={category} onChange={e => setCategory(e.target.value as any)} className="w-full rounded-xl bg-secondary/40 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary">
          <option value="top_ranked">Top ranked</option>
          <option value="hidden_gem">Hidden gem</option>
        </select>
      </div>
      <TextField label="Short tagline (e.g. Cloud-forest hills)" value={tagline} onChange={setTagline} />
      <TextArea label="Full description" value={description} onChange={setDescription} />
      <div className="grid grid-cols-2 gap-3">
        <TextField label="TripAdvisor rank #" value={tripRank} onChange={setTripRank} type="number" />
        <TextField label="Bookings count" value={bookings} onChange={setBookings} type="number" />
      </div>
      <ImageUpload current={imageUrl} file={file} onFile={setFile} />
    </FormShell>
  );
}

/* -------------------- ADDITIONAL PLACES -------------------- */

function AdditionalPlacesTable() {
  const [rows, setRows] = useState<AdditionalRow[]>([]);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<AdditionalRow | "new" | null>(null);

  async function load() {
    const { data } = await supabase
      .from("additional_places")
      .select("*")
      .order("sort_order")
      .order("created_at", { ascending: false });
    setRows((data ?? []) as AdditionalRow[]);
  }
  useEffect(() => { load(); }, []);

  async function remove(r: AdditionalRow) {
    if (!confirm(`Delete "${r.name}"? This cannot be undone.`)) return;
    await supabase.from("additional_places").delete().eq("id", r.id);
    load();
  }
  async function togglePublished(r: AdditionalRow) {
    await supabase.from("additional_places").update({ published: !r.published }).eq("id", r.id);
    load();
  }

  const filtered = rows.filter(r => r.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search by place name…"
            className="w-full rounded-full glass pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button
          onClick={() => setEditing("new")}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-[var(--shadow-glow)] hover:scale-[1.02] transition"
        >
          <Plus className="h-3.5 w-3.5" /> Add new place
        </button>
      </div>

      <div className="rounded-3xl glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/30 text-[10px] uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="text-left px-3 py-3">Image</th>
                <th className="text-left px-3 py-3">Name</th>
                <th className="text-left px-3 py-3">Tagline</th>
                <th className="text-left px-3 py-3">Description</th>
                <th className="text-left px-3 py-3">Published</th>
                <th className="text-right px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center text-muted-foreground py-10">No places match “{q}”.</td></tr>
              )}
              {filtered.map(r => (
                <tr key={r.id} className="border-t border-border/40 hover:bg-secondary/20">
                  <td className="px-3 py-2.5">
                    {r.image_url ? (
                      <img src={r.image_url} alt={r.name} className="h-12 w-16 rounded-md object-cover" />
                    ) : (
                      <div className="h-12 w-16 rounded-md bg-secondary/50 grid place-items-center"><ImageIcon className="h-4 w-4 text-muted-foreground" /></div>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="font-medium">{r.name}</div>
                    <div className="text-[10px] text-muted-foreground">/{r.slug}</div>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground max-w-[160px] truncate">{r.tagline}</td>
                  <td className="px-3 py-2.5 text-muted-foreground max-w-xs truncate">{r.description}</td>
                  <td className="px-3 py-2.5">
                    <button
                      onClick={() => togglePublished(r)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] transition ${r.published ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}
                    >
                      {r.published ? <><Eye className="h-3 w-3" /> Published</> : <><EyeOff className="h-3 w-3" /> Draft</>}
                    </button>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => setEditing(r)} className="p-1.5 rounded-md hover:bg-secondary/60"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => remove(r)} className="p-1.5 rounded-md hover:bg-destructive/20 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {editing && (
          <AdditionalFormModal
            initial={editing === "new" ? null : editing}
            onClose={() => setEditing(null)}
            onSaved={() => { setEditing(null); load(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function AdditionalFormModal({ initial, onClose, onSaved }: { initial: AdditionalRow | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [tagline, setTagline] = useState(initial?.tagline ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.image_url ?? null);
  const [published, setPublished] = useState<boolean>(initial?.published ?? true);
  const [file, setFile] = useState<File | null>(null);
  const [media, setMedia] = useState<string[]>(initial?.media_urls ?? []);
  const [newMedia, setNewMedia] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      let img = imageUrl;
      if (file) img = await uploadImage(file);
      const uploaded = await Promise.all(newMedia.map(uploadMedia));
      const payload = {
        name: name.trim(),
        slug: (slug.trim() || slugify(name)),
        tagline: tagline || null,
        description: description || null,
        image_url: img,
        media_urls: [...media, ...uploaded],
        published,
      };
      if (!payload.name || !payload.slug) throw new Error("Name and slug are required.");
      const q = initial
        ? supabase.from("additional_places").update(payload).eq("id", initial.id)
        : supabase.from("additional_places").insert(payload);
      const { error } = await q;
      if (error) throw error;
      onSaved();
    } catch (e: any) {
      setErr(e.message ?? "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <FormShell title={initial ? `Edit ${initial.name}` : "Add new place"} onClose={onClose} onSubmit={save} busy={busy} err={err}>
      <TextField label="Place name *" value={name} onChange={v => { setName(v); if (!initial && !slug) setSlug(slugify(v)); }} />
      <TextField label="Slug (URL path)" value={slug} onChange={setSlug} />
      <TextField label="Short tagline" value={tagline} onChange={setTagline} />
      <TextArea label="Description" value={description} onChange={setDescription} />
      <ImageUpload current={imageUrl} file={file} onFile={setFile} />
      <MediaGallery urls={media} files={newMedia} onUrls={setMedia} onFiles={setNewMedia} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} className="h-4 w-4 accent-primary" />
        Published (visible on /places)
      </label>
    </FormShell>
  );
}

/* -------------------- shared form UI -------------------- */

function FormShell({ title, onClose, onSubmit, busy, err, children }: { title: string; onClose: () => void; onSubmit: (e: React.FormEvent) => void; busy: boolean; err: string | null; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4"
      onClick={onClose}
    >
      <motion.form
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
        onSubmit={onSubmit}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl glass-strong p-6 space-y-3 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-md hover:bg-secondary/60"><X className="h-4 w-4" /></button>
        </div>
        {children}
        {err && <div className="rounded-xl bg-destructive/20 px-3 py-2 text-xs text-destructive-foreground">{err}</div>}
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-full glass px-4 py-2.5 text-sm">Cancel</button>
          <button disabled={busy} className="flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60">
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}

function TextField({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{label}</div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl bg-secondary/40 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{label}</div>
      <textarea
        value={value}
        rows={3}
        onChange={e => onChange(e.target.value)}
        className="w-full resize-none rounded-xl bg-secondary/40 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}

function ImageUpload({ current, file, onFile }: { current: string | null; file: File | null; onFile: (f: File | null) => void }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Image</div>
      <div className="flex items-center gap-3">
        {(file || current) && (
          <img
            src={file ? URL.createObjectURL(file) : current!}
            alt=""
            className="h-16 w-20 rounded-lg object-cover"
          />
        )}
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full glass px-4 py-2 text-xs">
          <Upload className="h-3.5 w-3.5" /> {file ? file.name : (current ? "Replace image" : "Upload image")}
          <input type="file" accept="image/*" hidden onChange={e => onFile(e.target.files?.[0] ?? null)} />
        </label>
      </div>
    </div>
  );
}

/* -------------------- SUB LOCATIONS -------------------- */

function useParentOptions() {
  const [extras, setExtras] = useState<{ slug: string; name: string }[]>([]);
  useEffect(() => {
    supabase.from("additional_places").select("slug, name").order("name")
      .then(({ data }) => setExtras((data ?? []) as { slug: string; name: string }[]));
  }, []);
  return [
    ...PLACE_LIST.map(p => ({ slug: p.slug, name: p.name })),
    ...extras.filter(e => !PLACE_LIST.some(p => p.slug === e.slug)),
  ];
}

function SubPlacesTable() {
  const [rows, setRows] = useState<SubRow[]>([]);
  const [q, setQ] = useState("");
  const [parentFilter, setParentFilter] = useState("");
  const [editing, setEditing] = useState<SubRow | "new" | null>(null);
  const parents = useParentOptions();
  const parentName = (slug: string) => parents.find(p => p.slug === slug)?.name ?? slug;

  async function load() {
    const { data } = await supabase
      .from("sub_places")
      .select("*")
      .order("parent_slug")
      .order("sort_order");
    setRows((data ?? []) as SubRow[]);
  }
  useEffect(() => { load(); }, []);

  async function remove(r: SubRow) {
    if (!confirm(`Delete "${r.name}"? This cannot be undone.`)) return;
    await supabase.from("sub_places").delete().eq("id", r.id);
    load();
  }
  async function togglePublished(r: SubRow) {
    await supabase.from("sub_places").update({ published: !r.published }).eq("id", r.id);
    load();
  }

  const filtered = rows.filter(r =>
    (r.name.toLowerCase().includes(q.toLowerCase()) || parentName(r.parent_slug).toLowerCase().includes(q.toLowerCase())) &&
    (!parentFilter || r.parent_slug === parentFilter)
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search sub-locations or parent…"
            className="w-full rounded-full glass pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={parentFilter}
          onChange={e => setParentFilter(e.target.value)}
          className="rounded-full glass px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All parent locations</option>
          {parents.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}
        </select>
        <button
          onClick={() => setEditing("new")}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-[var(--shadow-glow)] hover:scale-[1.02] transition"
        >
          <Plus className="h-3.5 w-3.5" /> Add sub-location
        </button>
      </div>

      <div className="rounded-3xl glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/30 text-[10px] uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="text-left px-3 py-3">Cover</th>
                <th className="text-left px-3 py-3">Name</th>
                <th className="text-left px-3 py-3">Parent location</th>
                <th className="text-left px-3 py-3">Media</th>
                <th className="text-left px-3 py-3">Published</th>
                <th className="text-right px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center text-muted-foreground py-10">No sub-locations yet.</td></tr>
              )}
              {filtered.map(r => (
                <tr key={r.id} className="border-t border-border/40 hover:bg-secondary/20">
                  <td className="px-3 py-2.5">
                    {r.image_url ? (
                      <img src={r.image_url} alt={r.name} className="h-12 w-16 rounded-md object-cover" />
                    ) : (
                      <div className="h-12 w-16 rounded-md bg-secondary/50 grid place-items-center"><ImageIcon className="h-4 w-4 text-muted-foreground" /></div>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="font-medium">{r.name}</div>
                    <div className="text-[10px] text-muted-foreground">/places/spot/{r.slug}</div>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{parentName(r.parent_slug)}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">
                    <span className="inline-flex items-center gap-1 text-xs"><Film className="h-3 w-3" /> {(r.media_urls ?? []).length}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      onClick={() => togglePublished(r)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] transition ${r.published ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}
                    >
                      {r.published ? <><Eye className="h-3 w-3" /> Published</> : <><EyeOff className="h-3 w-3" /> Draft</>}
                    </button>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => setEditing(r)} className="p-1.5 rounded-md hover:bg-secondary/60"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => remove(r)} className="p-1.5 rounded-md hover:bg-destructive/20 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {editing && (
          <SubFormModal
            initial={editing === "new" ? null : editing}
            parents={parents}
            onClose={() => setEditing(null)}
            onSaved={() => { setEditing(null); load(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SubFormModal({ initial, parents, onClose, onSaved }: { initial: SubRow | null; parents: { slug: string; name: string }[]; onClose: () => void; onSaved: () => void }) {
  const [parentSlug, setParentSlug] = useState(initial?.parent_slug ?? (parents[0]?.slug ?? ""));
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [tagline, setTagline] = useState(initial?.tagline ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.image_url ?? null);
  const [file, setFile] = useState<File | null>(null);
  const [media, setMedia] = useState<string[]>(initial?.media_urls ?? []);
  const [newMedia, setNewMedia] = useState<File[]>([]);
  const [sortOrder, setSortOrder] = useState(String(initial?.sort_order ?? 0));
  const [published, setPublished] = useState<boolean>(initial?.published ?? true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      let img = imageUrl;
      if (file) img = await uploadImage(file);
      const uploaded = await Promise.all(newMedia.map(uploadMedia));
      const payload = {
        parent_slug: parentSlug,
        name: name.trim(),
        slug: (slug.trim() || slugify(name)),
        tagline: tagline || null,
        description: description || null,
        image_url: img,
        media_urls: [...media, ...uploaded],
        sort_order: parseInt(sortOrder, 10) || 0,
        published,
      };
      if (!payload.parent_slug) throw new Error("Pick a parent location.");
      if (!payload.name || !payload.slug) throw new Error("Name and slug are required.");
      const q = initial
        ? supabase.from("sub_places").update(payload).eq("id", initial.id)
        : supabase.from("sub_places").insert(payload);
      const { error } = await q;
      if (error) throw error;
      onSaved();
    } catch (e: any) {
      setErr(e.message ?? "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <FormShell title={initial ? `Edit ${initial.name}` : "Add sub-location"} onClose={onClose} onSubmit={save} busy={busy} err={err}>
      <div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Parent location *</div>
        <select value={parentSlug} onChange={e => setParentSlug(e.target.value)} className="w-full rounded-xl bg-secondary/40 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary">
          {parents.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}
        </select>
      </div>
      <TextField label="Sub-location name *" value={name} onChange={v => { setName(v); if (!initial && !slug) setSlug(slugify(v)); }} />
      <TextField label="Slug (URL path)" value={slug} onChange={setSlug} />
      <TextField label="Short tagline" value={tagline} onChange={setTagline} />
      <TextArea label="Description (shown on the public page)" value={description} onChange={setDescription} />
      <ImageUpload current={imageUrl} file={file} onFile={setFile} />
      <MediaGallery urls={media} files={newMedia} onUrls={setMedia} onFiles={setNewMedia} />
      <TextField label="Sort order" value={sortOrder} onChange={setSortOrder} type="number" />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} className="h-4 w-4 accent-primary" />
        Published (visible on the public site)
      </label>
    </FormShell>
  );
}

/* -------------------- media gallery field -------------------- */

function MediaGallery({ urls, files, onUrls, onFiles }: { urls: string[]; files: File[]; onUrls: (v: string[]) => void; onFiles: (v: File[]) => void }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Photo & video gallery</div>
      {(urls.length > 0 || files.length > 0) && (
        <div className="mb-2 flex flex-wrap gap-2">
          {urls.map(u => (
            <div key={u} className="relative">
              {isVideo(u)
                ? <video src={u} className="h-16 w-20 rounded-lg object-cover bg-black" />
                : <img src={u} alt="" className="h-16 w-20 rounded-lg object-cover" />}
              <button type="button" onClick={() => onUrls(urls.filter(x => x !== u))} className="absolute -right-1.5 -top-1.5 rounded-full bg-destructive p-0.5 text-destructive-foreground">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {files.map((f, i) => (
            <div key={f.name + i} className="relative">
              <div className="h-16 w-20 rounded-lg bg-secondary/60 grid place-items-center text-[9px] px-1 text-center text-muted-foreground">{f.name.slice(0, 22)}</div>
              <button type="button" onClick={() => onFiles(files.filter((_, x) => x !== i))} className="absolute -right-1.5 -top-1.5 rounded-full bg-destructive p-0.5 text-destructive-foreground">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-full glass px-4 py-2 text-xs">
        <Upload className="h-3.5 w-3.5" /> Add photos or videos
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
          onChange={e => { onFiles([...files, ...Array.from(e.target.files ?? [])]); e.target.value = ""; }}
        />
      </label>
    </div>
  );
}
