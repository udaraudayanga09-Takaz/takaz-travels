import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type Search = { email?: string };

export const Route = createFileRoute("/verify-email")({
  head: () => ({ meta: [{ title: "Verify your email — Takaz" }] }),
  validateSearch: (s: Record<string, unknown>): Search => ({ email: typeof s.email === "string" ? s.email : undefined }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { email = "" } = useSearch({ from: "/verify-email" });
  const nav = useNavigate();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function verify(c: string) {
    if (!email) { setError("Email missing — open the link from your inbox or sign up again."); return; }
    setBusy(true); setError(null);
    const { error } = await supabase.auth.verifyOtp({ email, token: c, type: "email" });
    setBusy(false);
    if (error) return setError(error.message);
    setInfo("Email verified! Redirecting…");
    setTimeout(() => nav({ to: "/" }), 1200);
  }

  async function resend() {
    if (!email) { setError("Email missing."); return; }
    setBusy(true); setError(null);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setBusy(false);
    if (error) return setError(error.message);
    setInfo("New link sent. Check your inbox.");
    setCooldown(60);
  }

  return (
    <div className="grid min-h-[calc(100vh-80px)] place-items-center px-5 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-3xl glass-strong p-8 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-accent mb-3"><Sparkles className="h-3.5 w-3.5" /> One more step</div>

        {/* Animated envelope illustration */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 14 }}
          className="relative mx-auto h-24 w-24"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="absolute inset-0 grid place-items-center rounded-3xl bg-primary/10 ring-1 ring-primary/40 shadow-[0_0_40px_-8px_var(--emerald)]"
          >
            <Mail className="h-10 w-10 text-primary" />
          </motion.div>
          <motion.span
            animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ repeat: Infinity, duration: 2.4 }}
            className="absolute inset-0 rounded-3xl ring-2 ring-primary/40"
          />
        </motion.div>

        <h1 className="mt-6 text-2xl md:text-3xl font-semibold">Verification link sent</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a secure link to <strong className="text-foreground">{email || "your inbox"}</strong>. Click it to verify — or enter the 6-digit code below.
        </p>

        <div className="mt-6 flex justify-center">
          <InputOTP maxLength={6} value={code} onChange={(v) => { setCode(v); if (v.length === 6) verify(v); }}>
            <InputOTPGroup>
              {[0,1,2,3,4,5].map(i => <InputOTPSlot key={i} index={i} className="h-12 w-10 text-lg" />)}
            </InputOTPGroup>
          </InputOTP>
        </div>

        {error && <div className="mt-4 rounded-xl bg-destructive/20 px-3 py-2 text-xs">{error}</div>}
        {info && <div className="mt-4 rounded-xl bg-primary/20 px-3 py-2 text-xs inline-flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5" />{info}</div>}

        <button
          onClick={resend}
          disabled={busy || cooldown > 0}
          className="mt-6 rounded-full glass px-5 py-2.5 text-xs font-medium disabled:opacity-50 hover:border-primary/50 transition"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : busy ? "Sending…" : "Resend verification link"}
        </button>

        <div className="mt-6 text-xs text-muted-foreground">
          Wrong email? <Link to="/login" className="text-primary">Sign in again</Link>
        </div>
      </motion.div>
    </div>
  );
}
