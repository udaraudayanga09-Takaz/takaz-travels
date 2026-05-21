import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus, TrendingUp, Calendar, DollarSign, Star, Shield } from "lucide-react";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/provider")({
  head: () => ({ meta: [{ title: "Host dashboard — Takaz" }, { name: "description", content: "Manage your listings and bookings." }] }),
  component: ProviderDashboard,
});

function ProviderDashboard() {
  const { listings, bookings } = useStore();
  const myListings = listings.slice(0, 6); // demo
  const revenue = bookings.reduce((s, b) => s + b.total, 0);

  const stats = [
    { label: "Active listings", value: myListings.length, icon: TrendingUp },
    { label: "Bookings", value: bookings.length, icon: Calendar },
    { label: "Revenue", value: `$${revenue.toLocaleString()}`, icon: DollarSign },
    { label: "Avg rating", value: "4.86", icon: Star },
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Welcome back, Host</h1>
          <p className="mt-2 text-muted-foreground">Your inventory, perfectly synced.</p>
        </div>
        <Link to="/provider/new" className="flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)]">
          <Plus className="h-4 w-4" /> New listing
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="rounded-2xl glass p-5">
            <s.icon className="h-5 w-5 text-primary" />
            <div className="mt-3 text-2xl font-semibold tracking-tight">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <h2 className="mt-12 mb-4 text-xl font-semibold">Your listings</h2>
      <div className="overflow-hidden rounded-2xl glass">
        <table className="w-full text-sm">
          <thead className="border-b border-border/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Listing</th>
              <th className="hidden px-4 py-3 text-left md:table-cell">City</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {myListings.map(l => (
              <tr key={l.id} className="border-b border-border/30 last:border-0 transition hover:bg-secondary/30">
                <td className="flex items-center gap-3 px-4 py-3">
                  <img src={l.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  <div>
                    <div className="font-medium">{l.title}</div>
                    <div className="text-xs text-muted-foreground">{l.category}</div>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{l.city}</td>
                <td className="px-4 py-3 text-right tabular-nums">${l.pricePerDay}/d</td>
                <td className="px-4 py-3 text-right">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${l.verified ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"}`}>
                    <Shield className="h-3 w-3" /> {l.verified ? "Verified" : "Pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
