import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { UploadCloud, Image as ImageIcon, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { CITIES } from "@/data/listings";

export const Route = createFileRoute("/provider/new")({
  head: () => ({ meta: [{ title: "List something new — LuxeLanka" }] }),
  component: NewListing,
});

function NewListing() {
  const { addListing } = useStore();
  const nav = useNavigate();
  const [type, setType] = useState<"vehicle" | "stay">("vehicle");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Tuk-tuk");
  const [city, setCity] = useState<typeof CITIES[number]>("Colombo");
  const [price, setPrice] = useState(50);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string>("");
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => setImage(String(e.target?.result || ""));
    reader.readAsDataURL(file);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    addListing({
      type, title, category, city, pricePerDay: price, description,
      image: image || "https://images.unsplash.com/photo-1544025162-d76694265947?w=800",
      host: "You",
      lat: 50 + Math.random() * 30,
      lng: 20 + Math.random() * 50,
      geoLat: CITY_COORDS[city].lat + (Math.random() - 0.5) * 0.04,
      geoLng: CITY_COORDS[city].lng + (Math.random() - 0.5) * 0.04,
    });
    nav({ to: "/provider" });
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Create a new listing</h1>
      <p className="mt-2 text-muted-foreground">It'll go live for review by our team.</p>

      <form onSubmit={submit} className="mt-8 space-y-6">
        <div className="grid grid-cols-2 gap-2 rounded-2xl glass p-1.5">
          {(["vehicle","stay"] as const).map(t => (
            <button type="button" key={t} onClick={() => { setType(t); setCategory(t === "vehicle" ? "Tuk-tuk" : "Private Villa"); }} className="relative rounded-xl py-3 text-sm font-medium">
              {type === t && <motion.span layoutId="type-pill" className="absolute inset-0 rounded-xl bg-primary" />}
              <span className={`relative ${type === t ? "text-primary-foreground" : "text-muted-foreground"}`}>{t === "vehicle" ? "Vehicle" : "Stay"}</span>
            </button>
          ))}
        </div>

        {/* Drag-drop */}
        <div
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
          onClick={() => inputRef.current?.click()}
          className={`relative grid h-56 cursor-pointer place-items-center overflow-hidden rounded-2xl border-2 border-dashed transition ${drag ? "border-primary bg-primary/5" : "border-border glass"}`}
        >
          {image ? (
            <>
              <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <button type="button" onClick={e => { e.stopPropagation(); setImage(""); }} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-background/80"><X className="h-4 w-4" /></button>
            </>
          ) : (
            <div className="text-center">
              <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm">Drag & drop a photo, or click to browse</p>
              <p className="text-xs text-muted-foreground">JPG, PNG up to 10MB</p>
            </div>
          )}
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title"><input required value={title} onChange={e => setTitle(e.target.value)} className="input" placeholder="Coastal Tuk-Tuk" /></Field>
          <Field label="Category">
            <select value={category} onChange={e => setCategory(e.target.value)} className="input">
              {(type === "vehicle" ? ["Tuk-tuk","Luxury SUV","Scooter","Sedan"] : ["Private Villa","Boutique Hotel","Mountain Retreat","Apartment"]).map(o => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="City">
            <select value={city} onChange={e => setCity(e.target.value as typeof CITIES[number])} className="input">{CITIES.map(c => <option key={c}>{c}</option>)}</select>
          </Field>
          <Field label={`Price per day · $${price}`}>
            <input type="range" min={10} max={500} value={price} onChange={e => setPrice(+e.target.value)} className="w-full accent-[var(--primary)]" />
          </Field>
        </div>

        <Field label="Description">
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="input resize-none" placeholder="What makes this special?" />
        </Field>

        <div className="flex gap-3">
          <button type="submit" className="flex-1 rounded-full bg-primary py-3.5 font-medium text-primary-foreground shadow-[var(--shadow-glow)]">Publish listing</button>
        </div>
      </form>

      <style>{`.input{width:100%;background:var(--input);border-radius:.75rem;padding:.7rem 1rem;font-size:.875rem;outline:none}.input:focus{box-shadow:0 0 0 2px var(--ring)}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">{label}</span>{children}</label>;
}
