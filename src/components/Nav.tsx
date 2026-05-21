import { Link, useRouterState } from "@tanstack/react-router";
import { Map, Compass, Sparkles, Heart, Handshake } from "lucide-react";
import { motion } from "framer-motion";

const NAV = [
  { to: "/", label: "Explore", icon: Map },
  { to: "/plan", label: "Trip Planner", icon: Compass },
  { to: "/memories", label: "Memories", icon: Heart },
  { to: "/join-us", label: "Partners", icon: Handshake },
] as const;

export function MobileTabBar() {
  const path = useRouterState({ select: s => s.location.pathname });
  return (
    <nav className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2 md:hidden">
      <div className="flex items-center gap-1 rounded-full glass-strong px-2 py-2 shadow-2xl">
        {NAV.map(it => {
          const active = path === it.to;
          return (
            <Link key={it.to} to={it.to} className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-medium transition ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
              <it.icon className="h-4 w-4" /> {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function TopBar() {
  const path = useRouterState({ select: s => s.location.pathname });
  return (
    <header className="sticky top-0 z-30 border-b border-border/40 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-[oklch(0.65_0.18_200)] text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <span>Takaz</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map(it => {
            const active = path === it.to;
            return (
              <Link key={it.to} to={it.to} className="relative rounded-full px-4 py-2 text-sm transition">
                {active && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-secondary" transition={{ type: "spring", damping: 25, stiffness: 280 }} />}
                <span className={`relative ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{it.label}</span>
              </Link>
            );
          })}
        </nav>
        <Link to="/login" className="rounded-full glass px-4 py-2 text-xs font-medium hover:bg-secondary/40 transition">Sign in</Link>
      </div>
    </header>
  );
}
