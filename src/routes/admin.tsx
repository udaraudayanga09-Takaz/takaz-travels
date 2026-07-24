import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Fragment, useEffect, useState } from "react";
import {
  Shield, LayoutDashboard, CalendarCheck, Map as MapIcon, Users, BadgeCheck,
  BookOpen, MapPin, Pin, MessageSquare, Settings, ExternalLink, LogOut, Loader2,
  CheckCircle2, XCircle, Trash2, Plus, Search, Star, Save, ChevronDown, ChevronRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { PlacesManagement } from "@/components/admin/PlacesManagement";
import { SriLankaMap } from "@/components/SriLankaMap";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Takaz" }] }),
  component: AdminShell,
});

type TabKey =
  | "dashboard" | "bookings" | "trip_plans" | "applications" | "verifications"
  | "blogs" | "places" | "map_pins" | "testimonials" | "settings";

const NAV: { section: string; items: { key: TabKey; label: string; icon: any }[] }[] = [
  { section: "Overview", items: [{ key: "dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  {
    section: "Manage",
    items: [
      { key: "bookings", label: "Bookings", icon: CalendarCheck },
      { key: "trip_plans", label: "Trip Plans", icon: MapIcon },
      { key: "applications", label: "Partner Applications", icon: Users },
      { key: "verifications", label: "Verifications", icon: BadgeCheck },
      { key: "blogs", label: "Blog Moderation", icon: BookOpen },
    ],
  },
  {
    section: "Content",
    items: [
      { key: "places", label: "Places Management", icon: MapPin },
      { key: "map_pins", label: "Map Pins", icon: Pin },
      { key: "testimonials", label: "Testimonials", icon: MessageSquare },
      { key: "settings", label: "Platform Settings", icon: Settings },
    ],
  },
];

function AdminShell() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const [tab, setTab] = useState<TabKey>("dashboard");
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { setAllowed(false); setChecking(false); return; }
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      setAllowed(!!data || isAdmin);
      setChecking(false);
    });
  }, [user, isAdmin, loading]);

  if (loading || checking) {
    return (
      <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-50 text-slate-600">
        <div className="flex items-center gap-3"><Loader2 className="h-5 w-5 animate-spin" /> Checking access…</div>
      </div>
    );
  }
  if (!allowed) return <AdminLogin hasUser={!!user} userEmail={user?.email ?? null} onSignOut={signOut} onSuccess={() => { setChecking(true); }} />;


  return (
    <div className="fixed inset-0 z-[60] flex bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 bg-[#0f172a] text-slate-100">
        <div className="px-5 py-5 border-b border-white/10">
          <Logo size={32} />
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {NAV.map(group => (
            <div key={group.section} className="px-3 mb-4">
              <div className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">{group.section}</div>
              {group.items.map(item => {
                const Active = tab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setTab(item.key)}
                    className={`w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                      Active ? "bg-teal-500/15 text-teal-300 border-l-2 border-teal-400 pl-[10px]" : "text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
          <div className="px-3 mb-4">
            <div className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">External</div>
            <a href="https://takaz-travels.lovable.app" target="_blank" rel="noreferrer" className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-white/5">
              <ExternalLink className="h-4 w-4" /> View live site
            </a>
            <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-white/5">
              <ExternalLink className="h-4 w-4" /> Backend dashboard
            </a>
          </div>
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold">
              {(user?.email?.[0] ?? "A").toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{user?.email ?? "Admin"}</div>
              <div className="text-[10px] text-slate-400">Administrator</div>
            </div>
          </div>
          <button onClick={() => signOut().then(() => navigate({ to: "/" }))} className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-md bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-10 bg-[#0f172a] text-slate-100 flex items-center gap-2 overflow-x-auto px-3 py-2 border-b border-white/10">
        <Logo size={26} withWordmark={false} />
        {NAV.flatMap(g => g.items).map(item => (
          <button key={item.key} onClick={() => setTab(item.key)} className={`shrink-0 rounded-md px-3 py-1.5 text-xs ${tab===item.key?"bg-teal-500/20 text-teal-300":"text-slate-300"}`}>
            {item.label}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        <div className="p-5 md:p-8 max-w-[1400px]">
          <TabRenderer tab={tab} />
        </div>
      </main>
    </div>
  );
}

function TabRenderer({ tab }: { tab: TabKey }) {
  switch (tab) {
    case "dashboard": return <DashboardTab />;
    case "bookings": return <BookingsTab />;
    case "trip_plans": return <TripPlansTab />;
    case "applications": return <ApplicationsTab />;
    case "verifications": return <VerificationsTab />;
    case "blogs": return <BlogsTab />;
    case "places": return <SectionCard title="Places Management" subtitle="Top destinations and additional places shown on the site."><PlacesManagement /></SectionCard>;
    case "map_pins": return <MapPinsTab />;
    case "testimonials": return <TestimonialsTab />;
    case "settings": return <SettingsTab />;
  }
}

/* ---------------- Shared UI ---------------- */

function SectionCard({ title, subtitle, children, actions }: { title: string; subtitle?: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {actions}
      </div>
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">{children}</div>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    confirmed: "bg-green-100 text-green-800 border-green-200",
    approved: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    completed: "bg-blue-100 text-blue-800 border-blue-200",
    published: "bg-green-100 text-green-800 border-green-200",
  };
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${map[status] ?? "bg-slate-100 text-slate-700 border-slate-200"}`}>{status}</span>;
}

function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
      {hint && <div className="mt-1 text-[11px] text-slate-400">{hint}</div>}
    </div>
  );
}

/* ---------------- Dashboard ---------------- */

function DashboardTab() {
  const [stats, setStats] = useState({
    bookings: 0, revenue: 0, fees: 0, pendingTrips: 0, pendingApps: 0, pendingVerifs: 0,
  });
  const [feed, setFeed] = useState<Array<{ kind: string; label: string; at: string }>>([]);

  useEffect(() => {
    (async () => {
      const [b, r, tp, pa, verif, settings, bookingsRec, tripsRec, appsRec] = await Promise.all([
        supabase.from("bookings").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("total").eq("status", "confirmed"),
        supabase.from("trip_plans").select("id", { count: "exact", head: true }).eq("handled", false),
        supabase.from("partner_applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("profile_identity_docs").select("user_id", { count: "exact", head: true }).eq("verified_tourist", false).not("passport_url", "is", null),
        supabase.from("platform_settings").select("key,value").eq("key", "commission_rate").maybeSingle(),
        supabase.from("bookings").select("id, guest_name, listing_title, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("trip_plans").select("id, contact_name, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("partner_applications").select("id, full_name, created_at").order("created_at", { ascending: false }).limit(5),
      ]);
      const revenue = (r.data ?? []).reduce((s, x: any) => s + Number(x.total || 0), 0);
      const rate = Number(settings.data?.value ?? "0.10");
      setStats({
        bookings: b.count ?? 0,
        revenue,
        fees: Math.round(revenue * rate * 100) / 100,
        pendingTrips: tp.count ?? 0,
        pendingApps: pa.count ?? 0,
        pendingVerifs: verif.count ?? 0,
      });
      const merged = [
        ...(bookingsRec.data ?? []).map((x: any) => ({ kind: "Booking", label: `${x.guest_name} · ${x.listing_title}`, at: x.created_at })),
        ...(tripsRec.data ?? []).map((x: any) => ({ kind: "Trip plan", label: x.contact_name, at: x.created_at })),
        ...(appsRec.data ?? []).map((x: any) => ({ kind: "Application", label: x.full_name, at: x.created_at })),
      ].sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 10);
      setFeed(merged);
    })();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-5">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total bookings" value={stats.bookings} />
        <StatCard label="Total revenue" value={`$${stats.revenue.toFixed(2)}`} hint="confirmed bookings" />
        <StatCard label="Platform fees" value={`$${stats.fees.toFixed(2)}`} hint="applied commission rate" />
        <StatCard label="Pending trip plans" value={stats.pendingTrips} />
        <StatCard label="Pending applications" value={stats.pendingApps} />
        <StatCard label="Pending verifications" value={stats.pendingVerifs} />
      </div>
      <div className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="px-5 py-3 border-b border-slate-200 text-sm font-semibold">Recent activity</div>
        <ul className="divide-y divide-slate-100">
          {feed.length === 0 && <li className="px-5 py-6 text-sm text-slate-500">No recent activity.</li>}
          {feed.map((f, i) => (
            <li key={i} className="flex items-center gap-3 px-5 py-3 text-sm">
              <div className="w-24 shrink-0 text-[10px] font-semibold uppercase tracking-widest text-teal-600">{f.kind}</div>
              <div className="flex-1 min-w-0 truncate">{f.label}</div>
              <div className="text-xs text-slate-400">{new Date(f.at).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------------- Bookings ---------------- */

function BookingsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
    setRows(data ?? []);
  }
  useEffect(() => {
    load();
    const ch = supabase.channel("admin-bookings").on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  async function updateStatus(id: string, s: string) {
    await supabase.from("bookings").update({ status: s }).eq("id", id);
  }

  const filtered = rows.filter(r => {
    if (status !== "all" && r.status !== status) return false;
    if (search && !(`${r.guest_name} ${r.listing_title}`.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  return (
    <SectionCard title="Bookings" subtitle="All bookings across the platform. Updates arrive live.">
      <div className="flex flex-wrap gap-3 p-4 border-b border-slate-200">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search guest or listing…" className="w-full rounded-md border border-slate-200 pl-9 pr-3 py-2 text-sm" />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)} className="rounded-md border border-slate-200 px-3 py-2 text-sm">
          {["all", "pending", "confirmed", "cancelled", "completed"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2"></th>
              <th className="text-left px-4 py-2">Guest</th>
              <th className="text-left px-4 py-2">Email</th>
              <th className="text-left px-4 py-2">Listing</th>
              <th className="text-left px-4 py-2">Type</th>
              <th className="text-left px-4 py-2">Dates</th>
              <th className="text-right px-4 py-2">Days</th>
              <th className="text-right px-4 py-2">Total</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && <tr><td colSpan={10} className="text-center px-4 py-8 text-slate-500">No bookings.</td></tr>}
            {filtered.map(b => (
              <Fragment key={b.id}>
                <tr className="hover:bg-slate-50 cursor-pointer" onClick={() => setExpanded(expanded === b.id ? null : b.id)}>
                  <td className="px-4 py-2 text-slate-400">{expanded === b.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</td>
                  <td className="px-4 py-2 font-medium">{b.guest_name}</td>
                  <td className="px-4 py-2 text-slate-600">{b.guest_email}</td>
                  <td className="px-4 py-2">{b.listing_title}</td>
                  <td className="px-4 py-2 capitalize">{b.listing_type}</td>
                  <td className="px-4 py-2 text-xs">{b.start_date} → {b.end_date}</td>
                  <td className="px-4 py-2 text-right">{b.days}</td>
                  <td className="px-4 py-2 text-right font-medium">${Number(b.total).toFixed(2)}</td>
                  <td className="px-4 py-2" onClick={e => e.stopPropagation()}>
                    <select value={b.status} onChange={e => updateStatus(b.id, e.target.value)} className="rounded border border-slate-200 px-2 py-1 text-xs bg-white">
                      {["pending", "confirmed", "cancelled", "completed"].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-2 text-xs text-slate-500">{new Date(b.created_at).toLocaleDateString()}</td>
                </tr>
                {expanded === b.id && (
                  <tr className="bg-slate-50">
                    <td colSpan={10} className="px-4 py-3 text-xs text-slate-600">
                      <div className="grid gap-1 sm:grid-cols-3">
                        <div><strong>Listing ID:</strong> {b.listing_id}</div>
                        <div><strong>User ID:</strong> {b.user_id ?? "—"}</div>
                        <div><strong>Payment intent:</strong> {b.payment_intent_id ?? "—"}</div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

/* ---------------- Trip Plans ---------------- */

function TripPlansTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  async function load() {
    const { data } = await supabase.from("trip_plans").select("*").order("created_at", { ascending: false });
    setRows(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function toggleHandled(id: string, v: boolean) {
    await supabase.from("trip_plans").update({ handled: v }).eq("id", id);
    load();
  }

  const filtered = rows.filter(r => !search || `${r.contact_name} ${r.contact_email}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <SectionCard title="Trip plans" subtitle="Custom itinerary requests from travellers.">
      <div className="p-4 border-b border-slate-200">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email…" className="w-full rounded-md border border-slate-200 pl-9 pr-3 py-2 text-sm" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2">Contact</th>
              <th className="text-left px-4 py-2">Email</th>
              <th className="text-left px-4 py-2">Regions</th>
              <th className="text-left px-4 py-2">Dates</th>
              <th className="text-right px-4 py-2">Party</th>
              <th className="text-left px-4 py-2">Notes</th>
              <th className="text-left px-4 py-2">Created</th>
              <th className="text-left px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-slate-500">No trip plans.</td></tr>}
            {filtered.map(t => {
              const regions = Array.isArray(t.regions) ? t.regions.join(", ") : "";
              const msg = encodeURIComponent(`Hi ${t.contact_name}, thank you for your trip plan request…`);
              return (
                <tr key={t.id} className={t.handled ? "opacity-50" : ""}>
                  <td className="px-4 py-2 font-medium">{t.contact_name}</td>
                  <td className="px-4 py-2 text-slate-600">{t.contact_email}</td>
                  <td className="px-4 py-2 text-xs">{regions}</td>
                  <td className="px-4 py-2 text-xs">{t.start_date} → {t.end_date}</td>
                  <td className="px-4 py-2 text-right">{t.party_size}</td>
                  <td className="px-4 py-2 text-xs max-w-xs truncate">{t.notes}</td>
                  <td className="px-4 py-2 text-xs text-slate-500">{new Date(t.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <a href={`https://wa.me/94712724435?text=${msg}`} target="_blank" rel="noreferrer" className="text-xs text-teal-600 hover:underline">WhatsApp</a>
                      <label className="flex items-center gap-1 text-xs text-slate-500">
                        <input type="checkbox" checked={t.handled} onChange={e => toggleHandled(t.id, e.target.checked)} /> handled
                      </label>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

/* ---------------- Partner Applications ---------------- */

function ApplicationsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [status, setStatus] = useState("all");
  const [service, setService] = useState("all");
  const [rejectFor, setRejectFor] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  async function load() {
    const { data } = await supabase.from("partner_applications").select("*").order("created_at", { ascending: false });
    setRows(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function approve(id: string) {
    await supabase.from("partner_applications").update({ status: "approved", published: true, reject_reason: null }).eq("id", id);
    load();
  }
  async function reject(id: string) {
    await supabase.from("partner_applications").update({ status: "rejected", published: false, reject_reason: reason || "Did not meet criteria" }).eq("id", id);
    setRejectFor(null); setReason(""); load();
  }

  const filtered = rows.filter(r => (status === "all" || r.status === status) && (service === "all" || r.service_type === service));
  const services = Array.from(new Set(rows.map(r => r.service_type)));

  return (
    <SectionCard title="Partner applications" subtitle="Review and approve partner sign-ups.">
      <div className="flex gap-3 p-4 border-b border-slate-200">
        <select value={status} onChange={e => setStatus(e.target.value)} className="rounded-md border border-slate-200 px-3 py-2 text-sm">
          {["all", "pending", "approved", "rejected"].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={service} onChange={e => setService(e.target.value)} className="rounded-md border border-slate-200 px-3 py-2 text-sm">
          <option value="all">all services</option>
          {services.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2">Full name</th>
              <th className="text-left px-4 py-2">Email</th>
              <th className="text-left px-4 py-2">Phone</th>
              <th className="text-left px-4 py-2">Service</th>
              <th className="text-left px-4 py-2">Location</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Submitted</th>
              <th className="text-left px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-slate-500">No applications.</td></tr>}
            {filtered.map(a => (
              <Fragment key={a.id}>
                <tr>
                  <td className="px-4 py-2 font-medium">{a.full_name}</td>
                  <td className="px-4 py-2 text-slate-600">{a.email}</td>
                  <td className="px-4 py-2 text-xs">{a.phone ?? "—"}</td>
                  <td className="px-4 py-2 capitalize">{a.service_type?.replace("_", " ")}</td>
                  <td className="px-4 py-2 text-xs">{a.location_label ?? "—"}</td>
                  <td className="px-4 py-2"><Badge status={a.status} /></td>
                  <td className="px-4 py-2 text-xs text-slate-500">{new Date(a.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2 text-xs">
                      {a.document_url && <a href={a.document_url} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline">Doc</a>}
                      {a.status !== "approved" && <button onClick={() => approve(a.id)} className="text-green-600 hover:underline">Approve</button>}
                      {a.status !== "rejected" && <button onClick={() => { setRejectFor(a.id); setReason(""); }} className="text-red-600 hover:underline">Reject</button>}
                    </div>
                  </td>
                </tr>
                {rejectFor === a.id && (
                  <tr className="bg-red-50">
                    <td colSpan={8} className="px-4 py-3">
                      <div className="flex gap-2">
                        <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Rejection reason…" className="flex-1 rounded border border-red-200 px-3 py-1.5 text-sm bg-white" />
                        <button onClick={() => reject(a.id)} className="rounded bg-red-600 text-white px-3 py-1.5 text-xs">Confirm reject</button>
                        <button onClick={() => setRejectFor(null)} className="text-xs px-2">Cancel</button>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

/* ---------------- Verifications ---------------- */

function VerificationsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase.from("profile_identity_docs").select("*, profiles:user_id(full_name)");
    // fallback join
    if (!data) return setRows([]);
    const userIds = data.map((d: any) => d.user_id);
    const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", userIds);
    const byId = new Map((profs ?? []).map((p: any) => [p.id, p]));
    setRows(data.map((d: any) => ({ ...d, full_name: byId.get(d.user_id)?.full_name ?? "—" })));
  }
  useEffect(() => { load(); }, []);

  async function signed(bucket: string, url: string | null) {
    if (!url) return null;
    const m = url.match(new RegExp(`${bucket}/(.+)$`));
    if (!m) return url;
    const { data } = await supabase.storage.from(bucket).createSignedUrl(m[1], 600);
    return data?.signedUrl ?? null;
  }

  async function openDoc(bucket: string, url: string | null) {
    const s = await signed(bucket, url);
    if (s) setLightbox(s);
  }

  async function setFlags(userId: string, patch: Partial<{ verified_tourist: boolean; licence_verified: boolean }>) {
    await supabase.from("profile_identity_docs").update(patch).eq("user_id", userId);
    load();
  }

  return (
    <SectionCard title="Tourist verifications" subtitle="Review passport and IDP uploads.">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2">User</th>
              <th className="text-left px-4 py-2">Passport</th>
              <th className="text-left px-4 py-2">IDP</th>
              <th className="text-left px-4 py-2">Tourist verified</th>
              <th className="text-left px-4 py-2">Licence verified</th>
              <th className="text-left px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-slate-500">No verification records.</td></tr>}
            {rows.map(r => (
              <tr key={r.user_id}>
                <td className="px-4 py-2 font-medium">{r.full_name}</td>
                <td className="px-4 py-2">{r.passport_url ? <button onClick={() => openDoc("identity-docs", r.passport_url)} className="text-teal-600 text-xs hover:underline">View</button> : <span className="text-xs text-slate-400">—</span>}</td>
                <td className="px-4 py-2">{r.idp_url ? <button onClick={() => openDoc("identity-docs", r.idp_url)} className="text-teal-600 text-xs hover:underline">View</button> : <span className="text-xs text-slate-400">—</span>}</td>
                <td className="px-4 py-2">{r.verified_tourist ? <Badge status="approved" /> : <Badge status="pending" />}</td>
                <td className="px-4 py-2">{r.licence_verified ? <Badge status="approved" /> : <Badge status="pending" />}</td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap gap-2 text-xs">
                    <button onClick={() => setFlags(r.user_id, { verified_tourist: true })} className="text-green-600 hover:underline">Approve identity</button>
                    <button onClick={() => setFlags(r.user_id, { licence_verified: true })} className="text-green-600 hover:underline">Approve licence</button>
                    <button onClick={() => { if (confirm("Revoke both?")) setFlags(r.user_id, { verified_tourist: false, licence_verified: false }); }} className="text-red-600 hover:underline">Revoke</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {lightbox && (
        <div className="fixed inset-0 z-[70] bg-black/80 grid place-items-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} className="max-h-[90vh] max-w-full object-contain" alt="Document" />
        </div>
      )}
    </SectionCard>
  );
}

/* ---------------- Blog Moderation ---------------- */

function BlogsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [filter, setFilter] = useState<"pending" | "published" | "all">("pending");
  const [preview, setPreview] = useState<any | null>(null);

  async function load() {
    let q = supabase.from("travel_blogs").select("*").order("created_at", { ascending: false });
    if (filter === "pending") q = q.eq("published", false);
    if (filter === "published") q = q.eq("published", true);
    const { data } = await q;
    setRows(data ?? []);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter]);

  async function publish(id: string) {
    await supabase.from("travel_blogs").update({ published: true }).eq("id", id);
    load();
  }
  async function del(id: string) {
    if (!confirm("Delete this blog?")) return;
    await supabase.from("travel_blogs").delete().eq("id", id);
    load();
  }

  return (
    <SectionCard title="Blog moderation" subtitle="Approve or remove community submissions.">
      <div className="flex gap-2 p-4 border-b border-slate-200">
        {(["pending", "published", "all"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-md px-3 py-1.5 text-xs capitalize ${filter === f ? "bg-teal-500 text-white" : "bg-slate-100 text-slate-600"}`}>{f}</button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2">Cover</th>
              <th className="text-left px-4 py-2">Title</th>
              <th className="text-left px-4 py-2">Author</th>
              <th className="text-left px-4 py-2">Place</th>
              <th className="text-left px-4 py-2">Submitted</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-slate-500">No blogs.</td></tr>}
            {rows.map(b => (
              <tr key={b.id}>
                <td className="px-4 py-2">{b.cover_url ? <img src={b.cover_url} alt="" className="h-10 w-14 rounded object-cover" /> : <div className="h-10 w-14 rounded bg-slate-100" />}</td>
                <td className="px-4 py-2 font-medium max-w-xs truncate">{b.title}</td>
                <td className="px-4 py-2 text-xs">{b.author_name}</td>
                <td className="px-4 py-2 text-xs text-slate-500">{b.place_slug ?? "—"}</td>
                <td className="px-4 py-2 text-xs text-slate-500">{new Date(b.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-2"><Badge status={b.published ? "published" : "pending"} /></td>
                <td className="px-4 py-2">
                  <div className="flex gap-2 text-xs">
                    <button onClick={() => setPreview(b)} className="text-slate-600 hover:underline">Preview</button>
                    {!b.published && <button onClick={() => publish(b.id)} className="text-green-600 hover:underline">Publish</button>}
                    <button onClick={() => del(b.id)} className="text-red-600 hover:underline">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {preview && (
        <div className="fixed inset-0 z-[70] bg-black/60 grid place-items-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-semibold">{preview.title}</h2>
            <div className="text-xs text-slate-500 mt-1">{preview.author_name}</div>
            {preview.cover_url && <img src={preview.cover_url} className="mt-4 w-full rounded-lg object-cover max-h-64" alt="" />}
            <div className="mt-4 text-sm whitespace-pre-wrap">{preview.body}</div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

/* ---------------- Map Pins ---------------- */

function MapPinsTab() {
  const [pins, setPins] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", cx: 50, cy: 50, blurb: "", image_url: "" });

  async function load() {
    const { data } = await supabase.from("map_pins").select("*").order("created_at", { ascending: false });
    setPins(data ?? []);
  }
  useEffect(() => { load(); }, []);

  function reset() { setEditing(null); setForm({ name: "", slug: "", cx: 50, cy: 50, blurb: "", image_url: "" }); }

  async function save() {
    const payload = { ...form, cx: Number(form.cx), cy: Number(form.cy), slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") };
    if (editing) await supabase.from("map_pins").update(payload).eq("id", editing.id);
    else await supabase.from("map_pins").insert(payload);
    reset(); load();
  }

  async function del(id: string) {
    if (!confirm("Delete pin?")) return;
    await supabase.from("map_pins").delete().eq("id", id);
    load();
  }

  function edit(p: any) {
    setEditing(p);
    setForm({ name: p.name, slug: p.slug, cx: p.cx, cy: p.cy, blurb: p.blurb ?? "", image_url: p.image_url ?? "" });
  }

  return (
    <SectionCard title="Map pins" subtitle="Locations shown on the trip planner map.">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px] p-5">
        <div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                <tr>
                  <th className="text-left px-3 py-2">Image</th>
                  <th className="text-left px-3 py-2">Name</th>
                  <th className="text-left px-3 py-2">Slug</th>
                  <th className="text-right px-3 py-2">cx%</th>
                  <th className="text-right px-3 py-2">cy%</th>
                  <th className="text-left px-3 py-2">Blurb</th>
                  <th className="text-left px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pins.map(p => (
                  <tr key={p.id}>
                    <td className="px-3 py-2">{p.image_url ? <img src={p.image_url} className="h-8 w-10 rounded object-cover" alt="" /> : <div className="h-8 w-10 rounded bg-slate-100" />}</td>
                    <td className="px-3 py-2 font-medium">{p.name}</td>
                    <td className="px-3 py-2 text-xs text-slate-500">{p.slug}</td>
                    <td className="px-3 py-2 text-right">{p.cx}</td>
                    <td className="px-3 py-2 text-right">{p.cy}</td>
                    <td className="px-3 py-2 text-xs max-w-xs truncate">{p.blurb}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2 text-xs">
                        <button onClick={() => edit(p)} className="text-teal-600 hover:underline">Edit</button>
                        <button onClick={() => del(p.id)} className="text-red-600 hover:underline">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Plus className="h-4 w-4" />{editing ? "Edit pin" : "New pin"}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
              <input placeholder="Slug" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
              <input type="number" min="0" max="100" step="0.1" placeholder="cx %" value={form.cx} onChange={e => setForm({ ...form, cx: Number(e.target.value) })} className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
              <input type="number" min="0" max="100" step="0.1" placeholder="cy %" value={form.cy} onChange={e => setForm({ ...form, cy: Number(e.target.value) })} className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
              <input placeholder="Image URL" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} className="rounded-md border border-slate-200 px-3 py-2 text-sm sm:col-span-2" />
              <textarea placeholder="Blurb" value={form.blurb} onChange={e => setForm({ ...form, blurb: e.target.value })} rows={2} className="rounded-md border border-slate-200 px-3 py-2 text-sm sm:col-span-2" />
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={save} className="rounded-md bg-teal-600 text-white px-4 py-2 text-sm hover:bg-teal-700">{editing ? "Save changes" : "Add pin"}</button>
              {editing && <button onClick={reset} className="text-xs text-slate-500">Cancel</button>}
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Live preview</div>
          <div className="relative rounded-lg border border-slate-200 bg-slate-50 aspect-[3/4] overflow-hidden">
            <svg viewBox="0 0 100 133" className="absolute inset-0 h-full w-full">
              <path d="M50 5 C70 15, 80 40, 78 70 C76 100, 60 128, 50 128 C40 128, 24 100, 22 70 C20 40, 30 15, 50 5 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" />
            </svg>
            {pins.map(p => (
              <div key={p.id} title={p.name} className="absolute -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-teal-500 ring-2 ring-white" style={{ left: `${p.cx}%`, top: `${p.cy * 100 / 133}%` }} />
            ))}
            {form.name && (
              <div className="absolute -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white animate-pulse" style={{ left: `${form.cx}%`, top: `${form.cy * 100 / 133}%` }} />
            )}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

/* ---------------- Testimonials ---------------- */

function TestimonialsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ name: "", location: "", rating: 5, text: "", avatar_url: "", published: true });

  async function load() {
    const { data } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
    setRows(data ?? []);
  }
  useEffect(() => { load(); }, []);

  function reset() { setEditing(null); setForm({ name: "", location: "", rating: 5, text: "", avatar_url: "", published: true }); }

  async function save() {
    const payload = { ...form, avatar_url: form.avatar_url || null };
    if (editing) await supabase.from("testimonials").update(payload).eq("id", editing.id);
    else await supabase.from("testimonials").insert(payload);
    reset(); load();
  }

  async function togglePublished(id: string, v: boolean) {
    await supabase.from("testimonials").update({ published: v }).eq("id", id);
    load();
  }
  async function del(id: string) {
    if (!confirm("Delete testimonial?")) return;
    await supabase.from("testimonials").delete().eq("id", id);
    load();
  }
  function edit(t: any) {
    setEditing(t);
    setForm({ name: t.name, location: t.location ?? "", rating: t.rating, text: t.text, avatar_url: t.avatar_url ?? "", published: t.published });
  }

  return (
    <SectionCard title="Testimonials" subtitle="Curated quotes shown on the marketing site.">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2">Name</th>
              <th className="text-left px-4 py-2">Location</th>
              <th className="text-left px-4 py-2">Rating</th>
              <th className="text-left px-4 py-2">Text</th>
              <th className="text-left px-4 py-2">Published</th>
              <th className="text-left px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-slate-500">No testimonials.</td></tr>}
            {rows.map(t => (
              <tr key={t.id}>
                <td className="px-4 py-2 font-medium flex items-center gap-2">
                  {t.avatar_url ? <img src={t.avatar_url} className="h-7 w-7 rounded-full object-cover" alt="" /> : <div className="h-7 w-7 rounded-full bg-teal-100 text-teal-700 grid place-items-center text-xs font-semibold">{t.name?.[0]}</div>}
                  {t.name}
                </td>
                <td className="px-4 py-2 text-xs">{t.location}</td>
                <td className="px-4 py-2 text-amber-500">{"★".repeat(t.rating)}</td>
                <td className="px-4 py-2 text-xs max-w-xs truncate">{t.text}</td>
                <td className="px-4 py-2"><input type="checkbox" checked={t.published} onChange={e => togglePublished(t.id, e.target.checked)} /></td>
                <td className="px-4 py-2">
                  <div className="flex gap-2 text-xs">
                    <button onClick={() => edit(t)} className="text-teal-600 hover:underline">Edit</button>
                    <button onClick={() => del(t.id)} className="text-red-600 hover:underline">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-slate-200 p-5">
        <h3 className="text-sm font-semibold mb-3">{editing ? "Edit testimonial" : "Add testimonial"}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
          <input placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
          <select value={form.rating} onChange={e => setForm({ ...form, rating: Number(e.target.value) })} className="rounded-md border border-slate-200 px-3 py-2 text-sm">
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{"★".repeat(n)}</option>)}
          </select>
          <input placeholder="Avatar URL (optional)" value={form.avatar_url} onChange={e => setForm({ ...form, avatar_url: e.target.value })} className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
          <textarea placeholder="Testimonial text" value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} rows={3} className="rounded-md border border-slate-200 px-3 py-2 text-sm sm:col-span-2" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} /> Published</label>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={save} className="rounded-md bg-teal-600 text-white px-4 py-2 text-sm hover:bg-teal-700">{editing ? "Save" : "Add"}</button>
          {editing && <button onClick={reset} className="text-xs text-slate-500">Cancel</button>}
        </div>
      </div>
    </SectionCard>
  );
}

/* ---------------- Platform Settings ---------------- */

function SettingsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await supabase.from("platform_settings").select("*").order("key");
    setRows(data ?? []);
    const map: Record<string, string> = {};
    (data ?? []).forEach((r: any) => { map[r.key] = r.value; });
    setValues(map);
  }
  useEffect(() => { load(); }, []);

  async function saveAll() {
    setSaving(true);
    for (const r of rows) {
      const v = values[r.key];
      if (v !== r.value) {
        await supabase.from("platform_settings").update({ value: v, updated_at: new Date().toISOString() }).eq("key", r.key);
      }
    }
    setSaving(false);
    load();
  }

  return (
    <SectionCard title="Platform settings" subtitle="Global configuration for the marketplace." actions={
      <button onClick={saveAll} disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-teal-600 text-white px-4 py-2 text-sm hover:bg-teal-700 disabled:opacity-50">
        <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save all"}
      </button>
    }>
      <div className="divide-y divide-slate-100">
        {rows.map(r => (
          <div key={r.key} className="grid gap-3 sm:grid-cols-[280px_1fr_180px] items-center p-4">
            <div>
              <div className="text-sm font-medium">{r.label}</div>
              <div className="text-[11px] text-slate-400 font-mono">{r.key}</div>
            </div>
            <input
              value={values[r.key] ?? ""}
              onChange={e => setValues(v => ({ ...v, [r.key]: e.target.value }))}
              type={r.kind === "number" || r.kind === "decimal" ? "number" : "text"}
              step={r.kind === "decimal" ? "0.01" : "1"}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm w-full"
            />
            <div className="text-xs text-slate-400">Updated {new Date(r.updated_at).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
