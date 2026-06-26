import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Sparkles, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Takaz" }] }),
  component: LoginPage,
});

const ONBOARDING_KEY = "takaz_onboarding_v1";

type Onboarding = {
  interests: string[];
  visited: string[];
  exploreNew: string;
  motivation: string[];
  travelWith: string;
  transport: string;
};

const INTERESTS = ["Beaches", "Wildlife & Safari", "Hiking & Nature", "Culture & Heritage", "Food & Cuisine", "Surfing", "Tea Country", "Ayurveda & Wellness"];
const PLACES = ["Colombo", "Kandy", "Galle", "Ella", "Sigiriya", "Nuwara Eliya", "Mirissa", "Arugam Bay", "Jaffna", "Trincomalee", "Anuradhapura", "Yala"];
const MOTIVATIONS = ["Stunning landscapes", "Rich culture & history", "Affordable luxury", "Adventure & surfing", "Wildlife", "Food", "Recommended by a friend", "Social media"];

function LoginPage() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Onboarding>({
    interests: [],
    visited: [],
    exploreNew: "",
    motivation: [],
    travelWith: "",
    transport: "",
  });

  useEffect(() => {
    try {
      const done = localStorage.getItem(ONBOARDING_KEY);
      if (!done) setShowOnboarding(true);
    } catch {
      setShowOnboarding(true);
    }
  }, []);

  function toggle(field: "interests" | "visited" | "motivation", value: string) {
    setData(d => {
      const arr = d[field];
      return { ...d, [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
  }

  function finishOnboarding() {
    try { localStorage.setItem(ONBOARDING_KEY, JSON.stringify({ ...data, completedAt: Date.now() })); } catch {}
    setShowOnboarding(false);
  }

  const steps = [
    {
      title: "What are your interests?",
      subtitle: "Pick as many as you like — we'll tailor suggestions.",
      content: (
        <ChipGroup options={INTERESTS} selected={data.interests} onToggle={v => toggle("interests", v)} />
      ),
      canNext: data.interests.length > 0,
    },
    {
      title: "Which places have you visited before?",
      subtitle: "Select any you've already been to in Sri Lanka.",
      content: (
        <ChipGroup options={PLACES} selected={data.visited} onToggle={v => toggle("visited", v)} />
      ),
      canNext: true,
    },
    {
      title: "Would you like to explore new places around Sri Lanka?",
      subtitle: "We can suggest hidden gems off the usual route.",
      content: (
        <RadioGroup options={["Yes, surprise me", "Yes, but keep it close to popular spots", "No, I have a plan"]} value={data.exploreNew} onChange={v => setData(d => ({ ...d, exploreNew: v }))} />
      ),
      canNext: !!data.exploreNew,
    },
    {
      title: "What made you interested in visiting Sri Lanka?",
      subtitle: "Pick everything that resonates.",
      content: (
        <ChipGroup options={MOTIVATIONS} selected={data.motivation} onToggle={v => toggle("motivation", v)} />
      ),
      canNext: data.motivation.length > 0,
    },
    {
      title: "Are you planning to travel alone or with others?",
      subtitle: "Helps us recommend the right stays & experiences.",
      content: (
        <RadioGroup options={["Solo", "With a partner", "With friends", "With family"]} value={data.travelWith} onChange={v => setData(d => ({ ...d, travelWith: v }))} />
      ),
      canNext: !!data.travelWith,
    },
    {
      title: "How would you like to get around Sri Lanka?",
      subtitle: "Pick your preferred form of transport.",
      content: (
        <RadioGroup options={["TukTuk", "Private Driver", "Self-drive Rental", "Mix of options"]} value={data.transport} onChange={v => setData(d => ({ ...d, transport: v }))} />
      ),
      canNext: !!data.transport,
    },
  ];

  if (showOnboarding) {
    const s = steps[step];
    const isLast = step === steps.length - 1;
    return (
      <div className="grid min-h-[calc(100vh-80px)] place-items-center px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl rounded-3xl glass-strong p-8">
          <div className="flex items-center gap-2 text-sm text-accent mb-2"><Sparkles className="h-4 w-4" /> A few quick questions</div>
          <div className="mb-6 flex items-center gap-1.5">
            {steps.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition ${i <= step ? "bg-primary" : "bg-border"}`} />
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <h1 className="text-2xl font-semibold text-foreground">{s.title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{s.subtitle}</p>
              <div className="mt-6">{s.content}</div>
            </motion.div>
          </AnimatePresence>
          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              onClick={() => step === 0 ? setShowOnboarding(false) : setStep(step - 1)}
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> {step === 0 ? "Skip" : "Back"}
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={finishOnboarding}
                className="rounded-full px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition"
              >
                Skip for now
              </button>
              <button
                disabled={!s.canNext}
                onClick={() => isLast ? finishOnboarding() : setStep(step + 1)}
                className="flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {isLast ? (<>Continue to sign in <Check className="h-4 w-4" /></>) : (<>Next <ArrowRight className="h-4 w-4" /></>)}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return <SignInForm />;
}

function ChipGroup({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => {
        const on = selected.includes(o);
        return (
          <button
            key={o}
            type="button"
            onClick={() => onToggle(o)}
            className={`rounded-full px-4 py-2 text-sm transition border ${on ? "bg-primary text-primary-foreground border-primary" : "glass text-foreground border-border hover:bg-secondary/40"}`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

function RadioGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid gap-2">
      {options.map(o => {
        const on = value === o;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm text-left transition border ${on ? "bg-primary/10 border-primary text-foreground" : "glass border-border text-foreground hover:bg-secondary/40"}`}
          >
            <span>{o}</span>
            <span className={`grid h-5 w-5 place-items-center rounded-full border ${on ? "bg-primary border-primary" : "border-border"}`}>
              {on && <Check className="h-3 w-3 text-primary-foreground" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function SignInForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const nav = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setInfo(null); setBusy(true);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return setError(error.message);
      nav({ to: "/" });
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/`, data: { full_name: name } },
      });
      setBusy(false);
      if (error) return setError(error.message);
      nav({ to: "/verify-email", search: { email } });
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-80px)] place-items-center px-5 py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-3xl glass-strong p-8">
        <div className="flex items-center gap-2 text-sm text-accent mb-2"><Sparkles className="h-4 w-4" /> Welcome to Takaz</div>
        <h1 className="text-3xl font-semibold">{mode === "signin" ? "Sign in" : "Create account"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Track bookings, save trips, manage your partner profile.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          {mode === "signup" && (
            <label className="flex items-center gap-2 rounded-xl glass px-3 py-2.5">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" className="w-full bg-transparent text-sm outline-none" />
            </label>
          )}
          <label className="flex items-center gap-2 rounded-xl glass px-3 py-2.5">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" className="w-full bg-transparent text-sm outline-none" />
          </label>
          <label className="flex items-center gap-2 rounded-xl glass px-3 py-2.5">
            <input required type="password" minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full bg-transparent text-sm outline-none" />
          </label>
          {error && <div className="rounded-xl bg-destructive/20 px-3 py-2 text-xs">{error}</div>}
          {info && <div className="rounded-xl bg-primary/20 px-3 py-2 text-xs">{info}</div>}
          <button disabled={busy} className="w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60">
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          {mode === "signin" ? (
            <>New here? <button onClick={() => { setMode("signup"); setError(null); setInfo(null); }} className="text-primary">Create an account</button></>
          ) : (
            <>Already have one? <button onClick={() => { setMode("signin"); setError(null); setInfo(null); }} className="text-primary">Sign in</button></>
          )}
        </div>
        <div className="mt-2 text-center text-xs text-muted-foreground">
          Are you a host or driver? <Link to="/join-us" className="text-primary">Apply as a partner</Link>
        </div>
      </motion.div>
    </div>
  );
}
