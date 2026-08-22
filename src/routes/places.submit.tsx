import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Upload, Sparkles, ArrowLeft } from "lucide-react";
import { SriLankaMap } from "@/components/SriLankaMap";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/places/submit")({
  head: () => ({
    meta: [
      { title: "Add a new place — Takaz" },
      { name: "description", content: "Share a hidden corner of Sri Lanka with our community. Submit a place, photo and short story." },
    ],
  }),
  component: SubmitPage,
});

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}

function SubmitPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [coords, setCoords] = useState<{ cx: number; cy: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-5 py-32 text-center">
        <h1 className="text-3xl font-semibold">Sign in to add a place</h1>
        <p className="mt-3 text-muted-foreground">Create a free account to share your Sri Lanka discoveries.</p>
        <Link to="/login" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground">Sign in</Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-5 py-32 text-center">
        <Sparkles className="mx-auto h-10 w-10 text-accent" />
        <h1 className="mt-4 text-3xl font-semibold">Submitted!</h1>
        <p className="mt-3 text-muted-foreground">Our team will review your place. Once approved it appears on the map and in the community list.</p>
        <Link to="/places/community" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground">See community places</Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name || !summary || !coords) {
      setError("Please add a name, short summary and tap the map to set a location.");
      return;
    }
    setBusy(true);
    try {
      let cover_url: string | null = null;
      if (file) {
        const path = `community/${user!.id}/${Date.now()}-${file.name}`;
        const up = await supabase.storage.from("blog-covers").upload(path, file, { upsert: false });
        if (up.error) throw up.error;
        cover_url = supabase.storage.from("blog-covers").getPublicUrl(path).data.publicUrl;
      }
      const slug = slugify(name) + "-" + Math.random().toString(36).slice(2, 6);
      const { error: insErr } = await supabase.from("user_places").insert({
        created_by: user!.id,
        name, slug, region, summary, body, cover_url,
        cx: coords.cx, cy: coords.cy,
        status: "pending",
      });
      if (insErr) throw insErr;
      setDone(true);
    } catch (err: any) {
      setError(err.message ?? "Could not submit");
    } finally {
      setBusy(false);
    }
  }

  function onMapClick(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const cx = ((e.clientX - r.left) / r.width) * 100;
    const cy = ((e.clientY - r.top) / r.height) * 100;
    setCoords({ cx: Math.round(cx * 10) / 10, cy: Math.round(cy * 10) / 10 });
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
      <Link to="/places" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> All destinations
      </Link>
      <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">
        Add a <span className="text-gradient">new place</span>
      </motion.h1>
      <p className="mt-3 text-muted-foreground max-w-2xl">Share a place you love. Approved submissions appear on the map, the community list and can be liked by other travellers.</p>

      <form onSubmit={onSubmit} className="mt-10 grid gap-10 md:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Field label="Place name *">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Kithulgala river valley" className="input" />
          </Field>
          <Field label="Region">
            <input value={region} onChange={e => setRegion(e.target.value)} placeholder="e.g. Sabaragamuwa · Hill Country" className="input" />
          </Field>
          <Field label="Short summary *">
            <input value={summary} maxLength={140} onChange={e => setSummary(e.target.value)} placeholder="One-line teaser for cards." className="input" />
          </Field>
          <Field label="Full description">
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={6} placeholder="Why should travellers visit? What's special?" className="input resize-none" />
          </Field>
          <Field label="Cover photo">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full glass px-4 py-2.5 text-sm">
              <Upload className="h-4 w-4" /> {file ? file.name : "Upload an image"}
              <input type="file" accept="image/*" hidden onChange={e => setFile(e.target.files?.[0] ?? null)} />
            </label>
          </Field>

          {error && <div className="rounded-xl bg-destructive/20 px-4 py-2.5 text-xs text-destructive-foreground">{error}</div>}

          <button disabled={busy} className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60 transition hover:scale-[1.02]">
            {busy ? "Submitting…" : "Submit for review"}
          </button>
        </div>

        <div>
          <div className="text-xs uppercase tracking-widest text-accent mb-2 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> Tap the map to mark the location
          </div>
          <div className="relative cursor-crosshair" onClick={onMapClick}>
            <SriLankaMap disableAdminPins extraPins={coords ? [{ id: "new", name: "Your pin", cx: coords.cx, cy: coords.cy }] : []} />
          </div>
          {coords && <div className="mt-2 text-xs text-muted-foreground">Marked at {coords.cx.toFixed(1)} %, {coords.cy.toFixed(1)} %</div>}
        </div>
      </form>

      <style>{`.input{width:100%;border-radius:0.75rem;background:hsl(var(--secondary)/0.4);padding:0.75rem 1rem;font-size:0.875rem;outline:none}.input:focus{box-shadow:0 0 0 1px hsl(var(--primary))}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">{label}</span>
      {children}
    </label>
  );
}
