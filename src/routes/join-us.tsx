import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Handshake, Car, Home as HomeIcon, UserCheck, Mail, Phone, MapPin, Upload, Sparkles, CheckCircle2, ListPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useServerFn } from "@tanstack/react-start";
import { submitPartnerApplication } from "@/lib/luxe.functions";
import { ListingWizard } from "@/components/ListingWizard";

export const Route = createFileRoute("/join-us")({
  head: () => ({
    meta: [
      { title: "Become a Partner — Takaz" },
      { name: "description", content: "List your villa, vehicle, or chauffeur service on Takaz. Reach travellers from around the world with zero upfront cost." },
      { property: "og:title", content: "Become a Partner — Takaz" },
      { property: "og:description", content: "Drivers, AirBnB owners, and vehicle hosts — join Sri Lanka's premium travel marketplace." },
    ],
  }),
  component: JoinUsPage,
});

type Tab = "register" | "login";
type Service = "driver" | "villa_owner" | "vehicle_owner";

function JoinUsPage() {
  const [tab, setTab] = useState<Tab>("register");
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:py-20">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs">
          <Handshake className="h-3.5 w-3.5 text-accent" /> Partner Hub
        </span>
        <h1 className="mt-4 text-4xl md:text-6xl font-semibold tracking-tight">Grow with <span className="text-gradient">Takaz</span></h1>
        <p className="mt-3 text-muted-foreground">Drivers, villa owners and vehicle hosts — list once, reach travellers from 50+ countries. Zero listing fee, transparent commission, fast payouts.</p>
      </motion.div>

      <div className="mt-10 grid gap-10 md:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          {[
            { icon: UserCheck, t: "Vetted, trusted travellers", b: "Every booking is ID-verified, with secure escrow payments." },
            { icon: HomeIcon, t: "Villa & boutique stays", b: "Beach houses, jungle bungalows, restored heritage suites." },
            { icon: Car, t: "Vehicles & tuk-tuks", b: "Self-drive or chauffeured. We handle insurance & support." },
            { icon: Sparkles, t: "Marketing built-in", b: "Featured placement, SEO landing pages, social campaigns." },
          ].map((it, i) => (
            <motion.div key={it.t} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="flex gap-3 rounded-2xl glass p-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary"><it.icon className="h-5 w-5" /></div>
              <div>
                <div className="font-medium">{it.t}</div>
                <div className="text-sm text-muted-foreground mt-1">{it.b}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="rounded-3xl glass-strong p-6 md:p-8">
          <div className="flex items-center gap-1 rounded-full glass p-1 w-fit mb-6">
            {(["register", "login"] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`relative rounded-full px-5 py-2 text-xs font-medium ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                {t === "register" ? "Register" : "Sign in"}
              </button>
            ))}
          </div>
          {tab === "register" ? <RegisterForm /> : <LoginForm />}
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setError(error.message);
    navigate({ to: "/join-us" });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <h2 className="text-xl font-semibold">Welcome back, partner</h2>
      <Field icon={Mail}><input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" className="w-full bg-transparent text-sm outline-none" /></Field>
      <Field><input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full bg-transparent text-sm outline-none" /></Field>
      {error && <div className="rounded-xl bg-destructive/20 px-3 py-2 text-xs">{error}</div>}
      <button disabled={busy} className="w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60">{busy ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}

function RegisterForm() {
  const { user } = useAuth();
  const [step, setStep] = useState<"account" | "details" | "done">(user ? "details" : "account");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceType, setServiceType] = useState<Service>("driver");
  const [locationLabel, setLocationLabel] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [geoMsg, setGeoMsg] = useState<string | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = useServerFn(submitPartnerApplication);

  async function verifyLocation() {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
    if (!key) { setGeoMsg("Maps key not configured."); return; }
    if (!locationLabel.trim()) { setGeoMsg("Type an address first."); return; }
    setGeocoding(true); setGeoMsg(null);
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationLabel + ", Sri Lanka")}&key=${key}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === "OK" && data.results?.[0]) {
        const { lat, lng } = data.results[0].geometry.location;
        setCoords({ lat, lng });
        setLocationLabel(data.results[0].formatted_address);
        setGeoMsg(`Pinned at ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      } else {
        setGeoMsg("Address not found. Try a more specific one.");
      }
    } catch {
      setGeoMsg("Geocoding failed. Check your network or API key.");
    } finally { setGeocoding(false); }
  }


  async function createAccount(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setBusy(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/join-us`, data: { full_name: fullName } },
    });
    setBusy(false);
    if (error) return setError(error.message);
    setStep("details");
  }

  async function submitApp(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setBusy(true);
    try {
      let documentUrl: string | null = null;
      if (docFile) {
        const path = `${(user?.id ?? "anon")}/${Date.now()}-${docFile.name}`;
        const { error: upErr } = await supabase.storage.from("partner-documents").upload(path, docFile);
        if (upErr) throw upErr;
        documentUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/authenticated/partner-documents/${path}`;
      }
      await submit({ data: {
        fullName: fullName || (user?.email ?? "Partner"),
        email: email || user?.email!,
        phone: phone || undefined,
        serviceType,
        locationLabel: locationLabel || undefined,
        locationLat: coords?.lat ?? null,
        locationLng: coords?.lng ?? null,
        documentUrl,
        notes: notes || undefined,
        userId: user?.id ?? null,
      }});
      setStep("done");
    } catch (err: any) {
      setError(err?.message ?? "Could not submit");
    } finally { setBusy(false); }
  }

  if (step === "done") {
    return (
      <div className="grid place-items-center text-center py-10">
        <CheckCircle2 className="h-12 w-12 text-primary" />
        <h3 className="mt-3 text-xl font-semibold">Application received</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">Our team reviews new partners within 48 hours. We'll email <strong>{email}</strong> when you're approved.</p>
      </div>
    );
  }

  if (step === "account") {
    return (
      <form onSubmit={createAccount} className="space-y-3">
        <h2 className="text-xl font-semibold">Create your partner account</h2>
        <Field icon={UserCheck}><input required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full name" className="w-full bg-transparent text-sm outline-none" /></Field>
        <Field icon={Mail}><input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" className="w-full bg-transparent text-sm outline-none" /></Field>
        <Field><input required type="password" minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (min 8 chars)" className="w-full bg-transparent text-sm outline-none" /></Field>
        {error && <div className="rounded-xl bg-destructive/20 px-3 py-2 text-xs">{error}</div>}
        <button disabled={busy} className="w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60">{busy ? "Creating…" : "Continue"}</button>
        <p className="text-xs text-muted-foreground text-center">Already have an account? <Link to="/login" className="text-primary">Sign in</Link></p>
      </form>
    );
  }

  return (
    <form onSubmit={submitApp} className="space-y-3">
      <h2 className="text-xl font-semibold">Tell us about your service</h2>
      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">I am a…</div>
        <div className="grid grid-cols-3 gap-2">
          {([["driver","Driver",UserCheck],["villa_owner","Villa Owner",HomeIcon],["vehicle_owner","Vehicle Owner",Car]] as [Service,string,typeof Car][]).map(([v,l,Icon]) => (
            <button type="button" key={v} onClick={() => setServiceType(v)} className={`rounded-xl p-3 text-xs transition ${serviceType === v ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"}`}>
              <Icon className="h-4 w-4 mx-auto mb-1" />{l}
            </button>
          ))}
        </div>
      </div>
      <Field icon={Phone}><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone (with country code)" className="w-full bg-transparent text-sm outline-none" /></Field>
      <div className="space-y-1.5">
        <div className="flex items-stretch gap-2">
          <Field icon={MapPin}><input value={locationLabel} onChange={e => { setLocationLabel(e.target.value); setCoords(null); }} placeholder="Address (e.g. 12 Beach Road, Unawatuna)" className="w-full bg-transparent text-sm outline-none" /></Field>
          <button type="button" onClick={verifyLocation} disabled={geocoding} className="shrink-0 rounded-xl bg-accent/20 text-accent px-3 text-xs font-medium hover:bg-accent/30 transition disabled:opacity-50">
            {geocoding ? "Verifying…" : coords ? "✓ Pinned" : "Verify on Google Maps"}
          </button>
        </div>
        {geoMsg && <div className={`text-[11px] ${coords ? "text-primary" : "text-muted-foreground"}`}>{geoMsg}</div>}
      </div>
      <label className="flex items-center gap-2 rounded-xl glass px-3 py-2.5 cursor-pointer hover:border-primary/40 transition">
        <Upload className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm flex-1 truncate">{docFile?.name ?? "Upload license / business doc (optional)"}</span>
        <input type="file" onChange={e => setDocFile(e.target.files?.[0] ?? null)} accept="image/*,application/pdf" className="hidden" />
      </label>
      <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anything we should know? Fleet size, languages, specialties…" className="w-full rounded-xl glass px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground resize-none" />
      {error && <div className="rounded-xl bg-destructive/20 px-3 py-2 text-xs">{error}</div>}
      <button disabled={busy} className="w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60">{busy ? "Submitting…" : "Submit application"}</button>
    </form>
  );
}

function Field({ icon: Icon, children }: { icon?: typeof Mail; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-2 rounded-xl glass px-3 py-2.5">
      {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      {children}
    </label>
  );
}
