import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Shield, CheckCircle2, Users, TrendingUp, MapPin, Building2 } from "lucide-react";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — LuxeLanka" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { listings, bookings, verifyListing } = useStore();
  const pending = listings.filter(l => !l.verified);
  const stats = [
    { label: "Total listings", value: listings.length, icon: Building2 },
    { label: "Pending verification", value: pending.length, icon: Shield },
    { label: "Bookings (30d)", value: bookings.length, icon: TrendingUp },
    { label: "Active hosts", value: new Set(listings.map(l => l.host)).size, icon: Users },
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/20 text-accent"><Shield className="h-5 w-5" /></div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Control center</h1>
          <p className="text-muted-foreground">Platform-wide health and verification queue.</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-2xl glass p-5">
            <s.icon className="h-5 w-5 text-accent" />
            <div className="mt-3 text-2xl font-semibold">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <h2 className="mt-12 mb-4 text-xl font-semibold">Verification queue</h2>
      {pending.length === 0 ? (
        <div className="rounded-2xl glass p-12 text-center text-muted-foreground">
          <CheckCircle2 className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-2">All caught up. Nothing pending.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {pending.map(l => (
            <motion.div key={l.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex gap-3 rounded-2xl glass p-3">
              <img src={l.image} alt="" className="h-24 w-24 shrink-0 rounded-xl object-cover" />
              <div className="flex flex-1 flex-col">
                <div className="font-medium">{l.title}</div>
                <div className="text-xs text-muted-foreground">{l.category} · ${l.pricePerDay}/day</div>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{l.city} · by {l.host}</p>
                <div className="mt-auto flex gap-2 pt-2">
                  <button onClick={() => verifyListing(l.id)} className="flex-1 rounded-full bg-primary py-1.5 text-xs font-medium text-primary-foreground">Approve</button>
                  <button className="rounded-full bg-secondary px-4 py-1.5 text-xs font-medium text-muted-foreground">Reject</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
