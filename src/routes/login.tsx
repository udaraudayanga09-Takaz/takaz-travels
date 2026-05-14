import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — LuxeLanka" }] }),
  component: LoginPage,
});

function LoginPage() {
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
      setInfo("Check your inbox to confirm your email.");
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-80px)] place-items-center px-5 py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-3xl glass-strong p-8">
        <div className="flex items-center gap-2 text-sm text-accent mb-2"><Sparkles className="h-4 w-4" /> Welcome to LuxeLanka</div>
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
