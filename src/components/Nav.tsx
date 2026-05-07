import { Link, useRouterState } from "@tanstack/react-router";
import { Compass, LayoutDashboard, ShieldCheck, Map, BookMarked, Plus, Building2 } from "lucide-react";
import { useStore, type Role } from "@/lib/store";
import { motion } from "framer-motion";

const NAV: Record<Role, { to: string; label: string; icon: typeof Compass }[]> = {
  tourist: [
    { to: "/", label: "Explore", icon: Map },
    { to: "/bookings", label: "Trips", icon: BookMarked },
  ],
  provider: [
    { to: "/provider", label: "Dashboard", icon: LayoutDashboard },
    { to: "/provider/new", label: "List", icon: Plus },
  ],
  admin: [
    { to: "/admin", label: "Control", icon: ShieldCheck },
  ],
};

export function RoleSwitcher() {
  const { role, setRole } = useStore();
  const items: { value: Role; label: string; icon: typeof Compass }[] = [
    { value: "tourist", label: "Tourist", icon: Compass },
    { value: "provider", label: "Host", icon: Building2 },
    { value: "admin", label: "Admin", icon: ShieldCheck },
  ];
  return (
    <div className="flex items-center gap-1 rounded-full glass p-1">
      {items.map(it => {
        const active = role === it.value;
        return (
          <button
            key={it.value}
            onClick={() => setRole(it.value)}
            className="relative px-3 py-1.5 text-xs font-medium rounded-full transition flex items-center gap-1.5"
          >
            {active && (
              <motion.span layoutId="role-pill" className="absolute inset-0 rounded-full bg-primary" transition={{ type: "spring", damping: 25, stiffness: 280 }} />
            )}
            <span className={`relative flex items-center gap-1.5 ${active ? "text-primary-foreground" : "text-muted-foreground"}`}>
              <it.icon className="h-3.5 w-3.5" />
              {it.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function MobileTabBar() {
  const { role } = useStore();
  const path = useRouterState({ select: s => s.location.pathname });
  const items = NAV[role];
  return (
    <nav className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2 md:hidden">
      <div className="flex items-center gap-1 rounded-full glass-strong px-2 py-2 shadow-2xl">
        {items.map(it => {
          const active = path === it.to;
          return (
            <Link key={it.to} to={it.to} className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
              <it.icon className="h-4 w-4" /> {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function TopBar() {
  const { role } = useStore();
  const items = NAV[role];
  const path = useRouterState({ select: s => s.location.pathname });
  return (
    <header className="sticky top-0 z-30 border-b border-border/40 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-[oklch(0.65_0.18_200)] text-primary-foreground">L</div>
          <span>LuxeLanka</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {items.map(it => {
            const active = path === it.to;
            return (
              <Link key={it.to} to={it.to} className={`rounded-full px-4 py-2 text-sm transition ${active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {it.label}
              </Link>
            );
          })}
        </nav>
        <RoleSwitcher />
      </div>
    </header>
  );
}
