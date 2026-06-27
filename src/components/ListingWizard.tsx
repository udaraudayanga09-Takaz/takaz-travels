import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Car, UserCheck, Upload, X, ChevronRight, ChevronLeft, CheckCircle2, Landmark, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useServerFn } from "@tanstack/react-start";
import { saveBankAccount } from "@/lib/bank.functions";

type Kind = "stay" | "vehicle" | "driver";

export function ListingWizard({ onDone }: { onDone?: () => void }) {
  const { user } = useAuth();
  const save = useServerFn(saveBankAccount);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [kind, setKind] = useState<Kind>("stay");

  // Common
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");
  const [rate, setRate] = useState<number | "">("");
  const [photos, setPhotos] = useState<File[]>([]);

  // Vehicle
  const [vehicleType, setVehicleType] = useState("Tuk-tuk");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState<number | "">("");
  const [driveMode, setDriveMode] = useState<"self_drive" | "chauffeur">("self_drive");

  // Driver
  const [licenceNumber, setLicenceNumber] = useState("");
  const [languages, setLanguages] = useState("English, Sinhala");
  const [licenceFile, setLicenceFile] = useState<File | null>(null);

  // Bank
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");

  const [busy, setBusy] = useState(false);
  const [listingId, setListingId] = useState<string | null>(null);

  if (!user) {
    return <div className="text-sm text-muted-foreground">Create your partner account first.</div>;
  }

  function addPhotos(files: FileList | null) {
    if (!files) return;
    const next = [...photos, ...Array.from(files)].slice(0, 6);
    setPhotos(next);
  }

  async function uploadAll(folder: string, files: File[]): Promise<string[]> {
    const urls: string[] = [];
    for (const file of files) {
      const path = `${user!.id}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.name}`;
      const { error } = await supabase.storage.from("listing-photos").upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("listing-photos").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return urls;
  }

  async function saveListing() {
    setBusy(true);
    try {
      const folder = `${kind}-${Date.now()}`;
      const photoUrls = photos.length ? await uploadAll(folder, photos) : [];

      let licenceUrl: string | null = null;
      if (kind === "driver" && licenceFile) {
        const [u] = await uploadAll(`${folder}/licence`, [licenceFile]);
        licenceUrl = u;
      }

      const details: Record<string, unknown> =
        kind === "stay"
          ? {}
          : kind === "vehicle"
          ? { vehicle_type: vehicleType, make, model, year: year || null, drive_mode: driveMode }
          : { licence_number: licenceNumber, languages: languages.split(",").map((s) => s.trim()).filter(Boolean), licence_url: licenceUrl };

      const { data, error } = await supabase
        .from("provider_listings")
        .insert({
          owner_id: user!.id,
          kind,
          title: title || (kind === "driver" ? accountHolder || "Driver" : "Untitled"),
          description: description || null,
          city: city || null,
          location_label: location || null,
          daily_rate: typeof rate === "number" ? rate : 0,
          photos: photoUrls,
          details,
          status: "pending_review",
        })
        .select("id")
        .single();
      if (error) throw error;
      setListingId(data.id);
      setStep(3);
    } catch (e: any) {
      toast.error(e?.message ?? "Could not save listing");
    } finally {
      setBusy(false);
    }
  }

  async function saveBank() {
    setBusy(true);
    try {
      await save({ data: { bankName, accountNumber, accountHolder } });
      setStep(4);
      toast.success("Listing submitted for review");
      onDone?.();
    } catch (e: any) {
      toast.error(e?.message ?? "Could not save bank details");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-3xl glass-strong p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Step {step} of 3</div>
          <h2 className="mt-1 text-xl font-semibold">
            {step === 1 ? "What are you listing?" : step === 2 ? "Listing details" : step === 3 ? "Payout details" : "Submitted"}
          </h2>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3].map((n) => (
            <span key={n} className={`h-1.5 w-8 rounded-full transition ${step >= n ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="grid gap-3 md:grid-cols-3">
            {([
              ["stay", "Stay", Home, "Villas, boutique hotels, cabins."],
              ["vehicle", "Vehicle", Car, "Tuk-tuk, scooter, SUV, sedan."],
              ["driver", "Driver", UserCheck, "Chauffeur or guided tours."],
            ] as [Kind, string, typeof Home, string][]).map(([v, l, Icon, hint]) => (
              <button key={v} type="button" onClick={() => setKind(v)} className={`rounded-2xl p-5 text-left transition ${kind === v ? "bg-primary text-primary-foreground" : "glass hover:bg-card"}`}>
                <Icon className="h-6 w-6" />
                <div className="mt-3 font-semibold">{l}</div>
                <div className={`mt-1 text-xs ${kind === v ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{hint}</div>
              </button>
            ))}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-3">
            {kind === "stay" && (
              <>
                <Field label="Property name"><input value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="Cliffside Infinity Villa" /></Field>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="City"><input value={city} onChange={(e) => setCity(e.target.value)} className="input" placeholder="Galle" /></Field>
                  <Field label="Address / location"><input value={location} onChange={(e) => setLocation(e.target.value)} className="input" placeholder="12 Beach Road, Unawatuna" /></Field>
                </div>
                <Field label="Description"><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="input resize-none" placeholder="What makes this property special?" /></Field>
                <Field label={`Nightly price · $${rate || 0}`}><input type="number" min={1} value={rate} onChange={(e) => setRate(e.target.value ? +e.target.value : "")} className="input" placeholder="120" /></Field>
              </>
            )}

            {kind === "vehicle" && (
              <>
                <Field label="Listing title"><input value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="Coastal Tuk-Tuk" /></Field>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Vehicle type">
                    <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="input">
                      {["Tuk-tuk", "Scooter", "Sedan", "SUV", "Luxury SUV", "Van"].map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </Field>
                  <Field label="Year"><input type="number" min={1980} max={2030} value={year} onChange={(e) => setYear(e.target.value ? +e.target.value : "")} className="input" placeholder="2022" /></Field>
                  <Field label="Make"><input value={make} onChange={(e) => setMake(e.target.value)} className="input" placeholder="Bajaj" /></Field>
                  <Field label="Model"><input value={model} onChange={(e) => setModel(e.target.value)} className="input" placeholder="RE" /></Field>
                  <Field label="City"><input value={city} onChange={(e) => setCity(e.target.value)} className="input" placeholder="Colombo" /></Field>
                  <Field label={`Daily rate · $${rate || 0}`}><input type="number" min={1} value={rate} onChange={(e) => setRate(e.target.value ? +e.target.value : "")} className="input" placeholder="35" /></Field>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Drive mode</div>
                  <div className="grid grid-cols-2 gap-2">
                    {(["self_drive", "chauffeur"] as const).map((v) => (
                      <button type="button" key={v} onClick={() => setDriveMode(v)} className={`rounded-xl p-3 text-xs transition ${driveMode === v ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"}`}>
                        {v === "self_drive" ? "Self-drive only" : "Chauffeur only"}
                      </button>
                    ))}
                  </div>
                </div>
                <Field label="Description"><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="input resize-none" placeholder="Condition, features, included gear…" /></Field>
              </>
            )}

            {kind === "driver" && (
              <>
                <Field label="Full name"><input value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="Kasun Perera" /></Field>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Licence number"><input value={licenceNumber} onChange={(e) => setLicenceNumber(e.target.value)} className="input" placeholder="DL-1234567" /></Field>
                  <Field label={`Daily rate · $${rate || 0}`}><input type="number" min={1} value={rate} onChange={(e) => setRate(e.target.value ? +e.target.value : "")} className="input" placeholder="60" /></Field>
                  <Field label="Base city"><input value={city} onChange={(e) => setCity(e.target.value)} className="input" placeholder="Colombo" /></Field>
                  <Field label="Languages spoken"><input value={languages} onChange={(e) => setLanguages(e.target.value)} className="input" placeholder="English, Sinhala, Tamil" /></Field>
                </div>
                <Field label="About">
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="input resize-none" placeholder="Years driving, regions you know best…" />
                </Field>
                <label className="flex items-center gap-2 rounded-xl glass px-3 py-2.5 cursor-pointer hover:border-primary/40 transition">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm flex-1 truncate">{licenceFile?.name ?? "Upload licence photo"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setLicenceFile(e.target.files?.[0] ?? null)} />
                </label>
              </>
            )}

            {kind !== "driver" && (
              <PhotoUploader photos={photos} addPhotos={addPhotos} remove={(i) => setPhotos(photos.filter((_, idx) => idx !== i))} />
            )}
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-3">
            <div className="flex items-center gap-2 rounded-xl bg-primary/10 text-primary px-3 py-2 text-xs">
              <Lock className="h-4 w-4" /> Encrypted end-to-end. Only payout systems can read these values.
            </div>
            <Field label="Bank name"><input value={bankName} onChange={(e) => setBankName(e.target.value)} className="input" placeholder="Commercial Bank of Ceylon" /></Field>
            <Field label="Account holder name"><input value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} className="input" placeholder="As printed on the account" /></Field>
            <Field label="Account number"><input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="input" placeholder="0000000000" /></Field>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid place-items-center text-center py-10">
            <CheckCircle2 className="h-12 w-12 text-primary" />
            <h3 className="mt-3 text-xl font-semibold">Listing submitted</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">It's queued as <span className="text-primary font-medium">pending review</span>. Our team approves new listings within 48 hours.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {step < 4 && (
        <div className="flex items-center justify-between pt-2">
          <button type="button" onClick={() => setStep((step - 1) as 1 | 2 | 3)} disabled={step === 1 || busy} className="inline-flex items-center gap-1 rounded-full glass px-4 py-2 text-sm disabled:opacity-40">
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          {step === 1 && (
            <button type="button" onClick={() => setStep(2)} className="inline-flex items-center gap-1 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
              Continue <ChevronRight className="h-4 w-4" />
            </button>
          )}
          {step === 2 && (
            <button type="button" onClick={saveListing} disabled={busy || !title || rate === ""} className="inline-flex items-center gap-1 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60">
              {busy ? "Uploading…" : "Save & continue"} <ChevronRight className="h-4 w-4" />
            </button>
          )}
          {step === 3 && (
            <button type="button" onClick={saveBank} disabled={busy || !bankName || !accountNumber || !accountHolder} className="inline-flex items-center gap-1 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60">
              <Landmark className="h-4 w-4" /> {busy ? "Securing…" : "Submit for review"}
            </button>
          )}
        </div>
      )}

      <style>{`.input{width:100%;background:var(--input);border-radius:.75rem;padding:.7rem 1rem;font-size:.875rem;outline:none;border:1px solid transparent}.input:focus{border-color:var(--ring)}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">{label}</span>{children}</label>;
}

function PhotoUploader({ photos, addPhotos, remove }: { photos: File[]; addPhotos: (f: FileList | null) => void; remove: (i: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">Photos · up to 6</div>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((f, i) => (
          <div key={i} className="relative aspect-square overflow-hidden rounded-xl">
            <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
            <button type="button" onClick={() => remove(i)} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-background/80"><X className="h-3 w-3" /></button>
          </div>
        ))}
        {photos.length < 6 && (
          <label className="grid aspect-square cursor-pointer place-items-center rounded-xl border-2 border-dashed border-border glass">
            <Upload className="h-5 w-5 text-muted-foreground" />
            <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => addPhotos(e.target.files)} />
          </label>
        )}
      </div>
    </div>
  );
}
