import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ShieldCheck, Upload, CheckCircle2, IdCard, BookOpenCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/verify")({
  head: () => ({
    meta: [
      { title: "Verify your identity — Takaz" },
      { name: "description", content: "Upload your passport and international driving permit to unlock bookings on Takaz." },
    ],
  }),
  component: VerifyPage,
});

type ProfileVerification = {
  verified_tourist: boolean;
  licence_verified: boolean;
  passport_url: string | null;
  idp_url: string | null;
};

function VerifyPage() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<ProfileVerification | null>(null);
  const [uploading, setUploading] = useState<"passport" | "idp" | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("verified_tourist, licence_verified, passport_url, idp_url")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => data && setProfile(data));
  }, [user]);

  async function upload(kind: "passport" | "idp", file: File) {
    if (!user) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("File must be under 10 MB"); return; }
    setUploading(kind);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${kind}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("identity-docs").upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const patch: Partial<ProfileVerification> = kind === "passport"
        ? { passport_url: path, verified_tourist: true }
        : { idp_url: path, licence_verified: true };
      const { error: upErr } = await supabase.from("profiles").update(patch).eq("id", user.id);
      if (upErr) throw upErr;
      setProfile((p) => ({ ...(p ?? { verified_tourist: false, licence_verified: false, passport_url: null, idp_url: null }), ...patch }) as ProfileVerification);
      toast.success(kind === "passport" ? "Passport uploaded — identity verified" : "IDP uploaded — licence verified");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  }

  if (loading) return <div className="grid min-h-[60vh] place-items-center text-muted-foreground">Loading…</div>;

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-4 text-2xl font-semibold">Sign in to verify your identity</h1>
        <p className="mt-2 text-sm text-muted-foreground">You need an account to upload identity documents.</p>
        <Link to="/login" className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs">
          <ShieldCheck className="h-3.5 w-3.5 text-accent" /> Identity verification
        </span>
        <h1 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight">Verify your identity</h1>
        <p className="mt-3 text-muted-foreground max-w-xl">
          Upload a clear photo of your passport. If you want to self-drive a tuk-tuk, scooter or SUV, also upload your International Driving Permit (IDP). Documents are stored privately and only reviewed by Takaz.
        </p>
      </motion.div>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <UploadCard
          icon={<IdCard className="h-5 w-5" />}
          title="Passport photo"
          subtitle="Required for all bookings"
          done={Boolean(profile?.verified_tourist)}
          uploading={uploading === "passport"}
          onFile={(f) => upload("passport", f)}
        />
        <UploadCard
          icon={<BookOpenCheck className="h-5 w-5" />}
          title="International Driving Permit"
          subtitle="Required to self-drive vehicles"
          done={Boolean(profile?.licence_verified)}
          uploading={uploading === "idp"}
          onFile={(f) => upload("idp", f)}
        />
      </div>

      <div className="mt-10 rounded-2xl glass p-5 text-sm text-muted-foreground">
        <p>
          <span className="text-foreground font-medium">What happens next?</span> Self-drive vehicle bookings unlock immediately once your IDP is uploaded. Our team double-checks documents within 24 hours and will contact you if anything looks off.
        </p>
      </div>
    </div>
  );
}

function UploadCard({ icon, title, subtitle, done, uploading, onFile }: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  done: boolean;
  uploading: boolean;
  onFile: (file: File) => void;
}) {
  return (
    <label className="group block cursor-pointer rounded-2xl glass p-6 transition hover:border-primary/40">
      <div className="flex items-start justify-between">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary">{icon}</div>
        {done && (
          <span className="flex items-center gap-1 rounded-full bg-primary/20 px-3 py-1 text-xs text-primary">
            <CheckCircle2 className="h-3 w-3" /> Verified
          </span>
        )}
      </div>
      <div className="mt-4 font-semibold">{title}</div>
      <div className="text-xs text-muted-foreground">{subtitle}</div>
      <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-secondary/30 py-6 text-sm text-muted-foreground group-hover:border-primary/40 transition">
        {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</> : <><Upload className="h-4 w-4" /> {done ? "Replace photo" : "Choose photo"}</>}
      </div>
      <input
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.currentTarget.value = ""; }}
      />
    </label>
  );
}
