import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, CheckCircle2, XCircle, MapPin, Mail, Phone, FileText, Calendar, User, Briefcase, Image as ImageIcon, Pin, Plus, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SriLankaMap } from "@/components/SriLankaMap";
import { PlacesManagement } from "@/components/admin/PlacesManagement";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Takaz" }] }),
  component: AdminPage,
});

type Application = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  service_type: string;
  location_label: string | null;
  location_lat: number | null;
  location_lng: number | null;
  document_url: string | null;
  notes: string | null;
  status: string;
  published: boolean;
  reject_reason: string | null;
  created_at: string;
  updated_at: string;
  user_id: string | null;
};

type Pin = { id: string; name: string; slug: string; blurb: string | null; image_url: string | null; cx: number; cy: number };
type UserPlace = { id: string; slug: string; name: string; region: string | null; summary: string | null; body: string | null; cover_url: string | null; status: string; likes_count: number; created_at: string };

function AdminPage() {
  const [tab, setTab] = useState<"apps" | "pins" | "places" | "destinations" | "blogs">("apps");
  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/20 text-accent"><Shield className="h-5 w-5" /></div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Admin console</h1>
          <p className="text-muted-foreground">Review applications, manage map pins and curate community submissions.</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {([["apps", "Applications"], ["destinations", "Places management"], ["pins", "Map pins"], ["places", "Community places"], ["blogs", "Blog moderation"]] as const).map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)} className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${tab === v ? "bg-primary text-primary-foreground" : "glass text-muted-foreground hover:text-foreground"}`}>{l}</button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "apps" && <ApplicationsTab />}
        {tab === "destinations" && <PlacesManagement />}
        {tab === "pins" && <MapPinsTab />}
        {tab === "places" && <CommunityTab />}
        {tab === "blogs" && <BlogsTab />}
      </div>
    </div>
  );
}

/* -------------------- APPLICATIONS -------------------- */

function ApplicationsTab() {
  const [apps, setApps] = useState<Application[]>([]);
  const [active, setActive] = useState<Application | null>(null);
  const [signedDoc, setSignedDoc] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");

  async function load() {
    const { data } = await supabase.from("partner_applications").select("*").order("created_at", { ascending: false });
    setApps((data ?? []) as Application[]);
  }
  useEffect(() => { load(); }, []);

  useEffect(() => {
    setSignedDoc(null);
    if (!active?.document_url) return;
    const m = active.document_url.match(/partner-documents\/(.+)$/);
    if (!m) return;
    supabase.storage.from("partner-documents").createSignedUrl(m[1], 600).then(({ data }) => {
      if (data?.signedUrl) setSignedDoc(data.signedUrl);
    });
  }, [active]);

  async function approve() {
    if (!active) return;
    setBusy(true);
    await supabase.from("partner_applications").update({ status: "approved", published: true, reject_reason: null }).eq("id", active.id);
    setBusy(false); await load(); setActive(null);
  }
  async function reject() {
    if (!active) return;
    setBusy(true);
    await supabase.from("partner_applications").update({ status: "rejected", published: false, reject_reason: rejectReason || "Did not meet verification criteria." }).eq("id", active.id);
    setBusy(false); setRejectReason(""); await load(); setActive(null);
  }

  const filtered = filter === "all" ? apps : apps.filter(a => a.status === filter);
  const stats = { pending: apps.filter(a => a.status === "pending").length, approved: apps.filter(a => a.status === "approved").length, rejected: apps.filter(a => a.status === "rejected").length };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {([["pending", `Pending (${stats.pending})`], ["approved", `Approved (${stats.approved})`], ["rejected", `Rejected (${stats.rejected})`], ["all", "All"]] as const).map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${filter === v ? "bg-primary text-primary-foreground" : "glass text-muted-foreground hover:text-foreground"}`}>{l}</button>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[360px_1fr]">
        <div className="space-y-2 max-h-[75vh] overflow-y-auto pr-1">
          {filtered.length === 0 && <div className="rounded-2xl glass p-8 text-center text-sm text-muted-foreground">Nothing to review.</div>}
          {filtered.map(a => (
            <button key={a.id} onClick={() => setActive(a)} className={`w-full rounded-2xl glass p-4 text-left transition hover:border-primary/40 ${active?.id === a.id ? "ring-2 ring-primary" : ""}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium truncate">{a.full_name}</div>
                <StatusBadge status={a.status} />
              </div>
              <div className="text-xs text-muted-foreground mt-1 truncate">{a.email}</div>
              <div className="text-[10px] uppercase tracking-widest text-accent mt-2">{a.service_type.replace("_", " ")}</div>
            </button>
          ))}
        </div>

        <div className="rounded-3xl glass-strong p-6 md:p-8 min-h-[60vh]">
          <AnimatePresence mode="wait">
            {active ? (
              <motion.div key={active.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-primary">{active.service_type.replace("_", " ")}</div>
                    <h2 className="mt-1 text-2xl font-semibold">{active.full_name}</h2>
                    <StatusBadge status={active.status} large />
                  </div>
                  {active.status === "pending" && (
                    <div className="flex gap-2">
                      <button disabled={busy} onClick={approve} className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-[var(--shadow-glow)] hover:scale-[1.02] transition disabled:opacity-50">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button disabled={busy} onClick={reject} className="flex items-center gap-1.5 rounded-full bg-destructive/80 px-4 py-2 text-xs font-medium text-destructive-foreground hover:bg-destructive transition disabled:opacity-50">
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <Section title="Personal data" icon={User}>
                    <Row icon={User} label="Legal name" value={active.full_name} />
                    <Row icon={Mail} label="Email" value={active.email} />
                    <Row icon={Phone} label="Phone" value={active.phone ?? "—"} />
                    <Row icon={Calendar} label="Submitted" value={new Date(active.created_at).toLocaleString()} />
                  </Section>
                  <Section title="Listing attributes" icon={MapPin}>
                    <Row icon={MapPin} label="Address" value={active.location_label ?? "—"} />
                    <Row icon={MapPin} label="Coordinates" value={active.location_lat != null ? `${active.location_lat}, ${active.location_lng}` : "—"} />
                    <Row icon={Briefcase} label="Service type" value={active.service_type} />
                    <Row icon={FileText} label="Published" value={active.published ? "Yes" : "No"} />
                    {active.reject_reason && <Row icon={XCircle} label="Reject reason" value={active.reject_reason} />}
                  </Section>
                  <Section title="ID / NIC document" icon={FileText} className="md:col-span-2">
                    {active.document_url ? (signedDoc ? (
                      <div className="rounded-xl overflow-hidden bg-black/40 grid place-items-center max-h-80">
                        {signedDoc.match(/\.pdf/i)
                          ? <a href={signedDoc} target="_blank" rel="noreferrer" className="p-8 text-sm text-primary underline">Open PDF document</a>
                          : <img src={signedDoc} alt="ID document" className="max-h-80 w-auto object-contain" />}
                      </div>
                    ) : <div className="text-xs text-muted-foreground p-6 text-center">Loading signed URL…</div>
                    ) : <div className="rounded-xl glass p-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2"><ImageIcon className="h-4 w-4" />No document uploaded</div>}
                  </Section>
                  {active.notes && (
                    <Section title="Notes from applicant" icon={FileText} className="md:col-span-2">
                      <p className="text-sm text-muted-foreground leading-relaxed">{active.notes}</p>
                    </Section>
                  )}
                  {active.status === "pending" && (
                    <div className="md:col-span-2 rounded-2xl bg-destructive/10 border border-destructive/30 p-4">
                      <label className="text-xs uppercase tracking-widest text-destructive">Reject reason (sent to applicant)</label>
                      <input value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="e.g. ID document unclear, please re-upload." className="mt-2 w-full bg-transparent text-sm outline-none border-b border-destructive/40 pb-1" />
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="grid h-full place-items-center text-center text-sm text-muted-foreground py-20">
                <div>
                  <Shield className="mx-auto h-8 w-8 text-primary" />
                  <p className="mt-3">Select an application to inspect every detail before approving.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* -------------------- MAP PINS -------------------- */

function MapPinsTab() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [blurb, setBlurb] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [coords, setCoords] = useState<{ cx: number; cy: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase.from("map_pins").select("*").order("created_at", { ascending: false });
    setPins((data ?? []) as Pin[]);
  }
  useEffect(() => { load(); }, []);

  async function addPin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name || !coords) { setError("Add a name and tap the map for coordinates."); return; }
    setBusy(true);
    try {
      let image_url: string | null = null;
      if (file) {
        const path = `pins/${Date.now()}-${file.name}`;
        const up = await supabase.storage.from("blog-covers").upload(path, file);
        if (up.error) throw up.error;
        image_url = supabase.storage.from("blog-covers").getPublicUrl(path).data.publicUrl;
      }
      const finalSlug = (slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")).slice(0, 60);
      const { error: insErr } = await supabase.from("map_pins").insert({ name, slug: finalSlug + "-" + Math.random().toString(36).slice(2, 5), blurb, image_url, cx: coords.cx, cy: coords.cy });
      if (insErr) throw insErr;
      setName(""); setSlug(""); setBlurb(""); setFile(null); setCoords(null);
      load();
    } catch (err: any) {
      setError(err.message ?? "Could not add pin");
    } finally { setBusy(false); }
  }

  async function removePin(id: string) {
    await supabase.from("map_pins").delete().eq("id", id);
    load();
  }

  function onMapClick(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const cx = ((e.clientX - r.left) / r.width) * 100;
    const cy = ((e.clientY - r.top) / r.height) * 100;
    setCoords({ cx: Math.round(cx * 10) / 10, cy: Math.round(cy * 10) / 10 });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      <div>
        <div className="text-xs uppercase tracking-widest text-accent mb-2 flex items-center gap-1.5">
          <Pin className="h-3.5 w-3.5" /> Live map · click to drop a pin
        </div>
        <div className="cursor-crosshair" onClick={coords ? undefined : onMapClick}>
          <SriLankaMap extraPins={coords ? [{ id: "new", name: name || "New pin", cx: coords.cx, cy: coords.cy }] : []} />
        </div>
        {coords && (
          <div className="mt-3 text-xs text-muted-foreground">
            Pin at {coords.cx}%, {coords.cy}% — <button onClick={() => setCoords(null)} className="text-primary underline">reset</button>
          </div>
        )}

        <div className="mt-8">
          <h3 className="text-sm font-semibold mb-3">All pins ({pins.length})</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {pins.map(p => (
              <div key={p.id} className="flex items-center gap-3 rounded-2xl glass p-3">
                {p.image_url
                  ? <img src={p.image_url} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />
                  : <div className="grid h-12 w-12 place-items-center rounded-lg bg-secondary/40"><MapPin className="h-5 w-5 text-muted-foreground" /></div>}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate text-sm">{p.name}</div>
                  <div className="text-[10px] text-muted-foreground">{p.cx}%, {p.cy}%</div>
                </div>
                <button onClick={() => removePin(p.id)} className="opacity-50 hover:opacity-100 transition"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
            {pins.length === 0 && <div className="col-span-full rounded-2xl glass p-6 text-center text-xs text-muted-foreground">No pins yet.</div>}
          </div>
        </div>
      </div>

      <form onSubmit={addPin} className="rounded-3xl glass-strong p-6 space-y-3 h-fit">
        <h3 className="text-lg font-semibold flex items-center gap-2"><Plus className="h-4 w-4" /> New pin</h3>
        <input required value={name} onChange={e => setName(e.target.value)} placeholder="Place name *" className="w-full rounded-xl bg-secondary/40 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary" />
        <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="Slug (optional)" className="w-full rounded-xl bg-secondary/40 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary" />
        <textarea value={blurb} onChange={e => setBlurb(e.target.value)} rows={3} placeholder="Short description for hover popup" className="w-full resize-none rounded-xl bg-secondary/40 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary" />
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full glass px-4 py-2 text-xs">
          <Upload className="h-3.5 w-3.5" /> {file ? file.name : "Upload image"}
          <input type="file" accept="image/*" hidden onChange={e => setFile(e.target.files?.[0] ?? null)} />
        </label>
        {error && <div className="rounded-xl bg-destructive/20 px-3 py-2 text-xs text-destructive-foreground">{error}</div>}
        <button disabled={busy} className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60 transition hover:scale-[1.01]">
          {busy ? "Adding…" : "Add to map"}
        </button>
        <p className="text-[10px] text-muted-foreground">Tip: click the map on the left to set coordinates first.</p>
      </form>
    </div>
  );
}

/* -------------------- COMMUNITY PLACES -------------------- */

function CommunityTab() {
  const [places, setPlaces] = useState<UserPlace[]>([]);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");

  async function load() {
    const { data } = await supabase.from("user_places").select("id, slug, name, region, summary, body, cover_url, status, likes_count, created_at").order("created_at", { ascending: false });
    setPlaces((data ?? []) as UserPlace[]);
  }
  useEffect(() => { load(); }, []);

  async function setStatus(id: string, status: string) {
    await supabase.from("user_places").update({ status }).eq("id", id);
    load();
  }
  async function remove(id: string) {
    await supabase.from("user_places").delete().eq("id", id);
    load();
  }

  const filtered = filter === "all" ? places : places.filter(p => p.status === filter);

  return (
    <div>
      <div className="flex gap-2">
        {(["pending", "approved", "rejected", "all"] as const).map(v => (
          <button key={v} onClick={() => setFilter(v)} className={`rounded-full px-4 py-1.5 text-xs font-medium transition capitalize ${filter === v ? "bg-primary text-primary-foreground" : "glass text-muted-foreground hover:text-foreground"}`}>
            {v} ({v === "all" ? places.length : places.filter(p => p.status === v).length})
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 && <div className="col-span-full rounded-2xl glass p-12 text-center text-sm text-muted-foreground">Nothing here.</div>}
        {filtered.map(p => (
          <div key={p.id} className="rounded-3xl glass overflow-hidden">
            <div className="aspect-[16/10] bg-secondary/40 overflow-hidden">
              {p.cover_url
                ? <img src={p.cover_url} alt={p.name} className="h-full w-full object-cover" />
                : <div className="grid h-full place-items-center text-muted-foreground"><ImageIcon className="h-8 w-8" /></div>}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold truncate">{p.name}</h3>
                  {p.region && <div className="text-[10px] uppercase tracking-widest text-accent">{p.region}</div>}
                </div>
                <StatusBadge status={p.status} />
              </div>
              {p.summary && <p className="mt-2 text-xs text-muted-foreground line-clamp-3">{p.summary}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                {p.status !== "approved" && (
                  <button onClick={() => setStatus(p.id, "approved")} className="rounded-full bg-primary px-3 py-1.5 text-[11px] font-medium text-primary-foreground inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Approve
                  </button>
                )}
                {p.status !== "rejected" && (
                  <button onClick={() => setStatus(p.id, "rejected")} className="rounded-full bg-destructive/80 px-3 py-1.5 text-[11px] font-medium text-destructive-foreground inline-flex items-center gap-1">
                    <XCircle className="h-3 w-3" /> Reject
                  </button>
                )}
                <button onClick={() => remove(p.id)} className="ml-auto opacity-50 hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------- shared bits -------------------- */

function StatusBadge({ status, large }: { status: string; large?: boolean }) {
  const map: Record<string, string> = {
    pending: "bg-accent/20 text-accent",
    approved: "bg-primary/20 text-primary",
    rejected: "bg-destructive/20 text-destructive-foreground",
  };
  return <span className={`inline-block rounded-full ${large ? "mt-2 px-3 py-1 text-xs" : "px-2 py-0.5 text-[10px]"} font-medium uppercase tracking-widest ${map[status] ?? "bg-secondary"}`}>{status}</span>;
}

function Section({ title, icon: Icon, children, className }: { title: string; icon: typeof User; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl glass p-4 ${className ?? ""}`}>
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-accent mb-3"><Icon className="h-3.5 w-3.5" />{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="h-3.5 w-3.5 text-muted-foreground mt-1 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="text-sm break-all">{value}</div>
      </div>
    </div>
  );
}
