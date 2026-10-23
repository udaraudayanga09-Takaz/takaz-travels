import { useEffect, useState } from "react";
import { Upload, Trash2, Loader2, Save, Check } from "lucide-react";
import { PLACES } from "@/data/places";
import { supabase } from "@/integrations/supabase/client";

type Photo = { place_slug: string; spot_name: string; image_url: string };

function NoteField({ slug, spot, initial, placeholder, rows = 2 }: { slug: string; spot: string; initial: string; placeholder: string; rows?: number }) {
  const [val, setVal] = useState(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  useEffect(() => { setVal(initial); setState("idle"); }, [initial, slug, spot]);
  const save = async () => {
    setState("saving");
    const { error } = await supabase.from("place_notes").upsert(
      { place_slug: slug, spot_name: spot, description: val.trim(), updated_at: new Date().toISOString() },
      { onConflict: "place_slug,spot_name" },
    );
    setState(error ? "idle" : "saved");
    if (error) alert(error.message);
  };
  return (
    <div className="mt-2 flex items-start gap-2">
      <textarea value={val} rows={rows} onChange={(e) => { setVal(e.target.value); setState("idle"); }} placeholder={placeholder}
        className="flex-1 rounded-lg bg-secondary/40 px-3 py-2 text-xs outline-none ring-1 ring-border focus:ring-primary" />
      <button onClick={save} disabled={state === "saving"} className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground" aria-label="Save description">
        {state === "saving" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : state === "saved" ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

export function SpotPhotosManager() {
  const places = Object.values(PLACES);
  const [slug, setSlug] = useState(places[0]?.slug ?? "");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const place = PLACES[slug as keyof typeof PLACES];

  const load = async () => {
    const [{ data }, { data: n }] = await Promise.all([
      supabase.from("spot_photos").select("place_slug, spot_name, image_url").eq("place_slug", slug),
      supabase.from("place_notes").select("spot_name, description").eq("place_slug", slug),
    ]);
    setPhotos((data ?? []) as Photo[]);
    setNotes(Object.fromEntries((n ?? []).map((r) => [r.spot_name, r.description])));
  };
  useEffect(() => { load(); }, [slug]);

  const upload = async (spot: string, file: File) => {
    setBusy(spot); setErr(null);
    try {
      const path = `spots/${slug}/${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, "_")}`;
      const up = await supabase.storage.from("blog-covers").upload(path, file);
      if (up.error) throw up.error;
      const url = supabase.storage.from("blog-covers").getPublicUrl(path).data.publicUrl;
      const { error } = await supabase.from("spot_photos").upsert(
        { place_slug: slug, spot_name: spot, image_url: url, updated_at: new Date().toISOString() },
        { onConflict: "place_slug,spot_name" },
      );
      if (error) throw error;
      await load();
    } catch (e: any) { setErr(e.message ?? "Upload failed"); }
    setBusy(null);
  };

  const remove = async (spot: string) => {
    setBusy(spot);
    await supabase.from("spot_photos").delete().eq("place_slug", slug).eq("spot_name", spot);
    await load(); setBusy(null);
  };

  if (!place) return null;
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="text-xs text-muted-foreground">Main location</label>
        <select value={slug} onChange={(e) => setSlug(e.target.value)} className="rounded-xl bg-secondary/40 px-3 py-2 text-sm outline-none">
          {places.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
        </select>
        <span className="text-xs text-muted-foreground">Tiles without a photo show the main location's image.</span>
      </div>
      <div className="mb-5 rounded-2xl glass p-4">
        <div className="text-sm font-semibold">Extra description for {place.name}</div>
        <p className="text-[11px] text-muted-foreground">Shown under the introduction on the {place.name} page.</p>
        <NoteField slug={slug} spot="" initial={notes[""] ?? ""} placeholder={`Add more about ${place.name}…`} rows={3} />
      </div>
      {err && <div className="mb-3 rounded-lg bg-destructive/15 px-3 py-2 text-xs text-destructive">{err}</div>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {place.spots.map((s) => {
          const ph = photos.find((p) => p.spot_name === s.name);
          return (
            <div key={s.name} className="overflow-hidden rounded-2xl glass">
              <div className="relative aspect-[4/3] bg-secondary/40">
                <img src={ph?.image_url ?? place.hero} alt={s.name} className={`h-full w-full object-cover ${ph ? "" : "opacity-40"}`} />
                {!ph && <span className="absolute left-2 top-2 rounded-full bg-background/80 px-2 py-0.5 text-[10px]">Default</span>}
                {busy === s.name && <div className="absolute inset-0 grid place-items-center bg-background/60"><Loader2 className="h-5 w-5 animate-spin" /></div>}
              </div>
              <div className="p-3">
                <div className="text-sm font-semibold">{s.name}</div>
                <div className="mt-2 flex gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
                    <Upload className="h-3.5 w-3.5" /> {ph ? "Change photo" : "Add photo"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(s.name, f); e.target.value = ""; }} />
                  </label>
                  {ph && (
                    <button onClick={() => remove(s.name)} className="inline-flex items-center gap-1 rounded-full glass px-3 py-1.5 text-xs">
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  )}
                </div>
                <NoteField slug={slug} spot={s.name} initial={notes[s.name] ?? ""} placeholder="Add extra description text…" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
