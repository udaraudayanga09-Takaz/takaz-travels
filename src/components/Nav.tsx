import { Link, useRouterState } from "@tanstack/react-router";
import { Map, Compass, Heart, Handshake, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/lib/auth";
import { useUnreadCount } from "@/lib/messages";

const NAV = [
  { to: "/", label: "Explore", icon: Map },
  { to: "/plan", label: "Trip Planner", icon: Compass },
  { to: "/memories", label: "Memories", icon: Heart },
  { to: "/join-us", label: "Partners", icon: Handshake },
] as const;

function UnreadBadge({ count, className = "" }: { count: number; className?: string }) {
  if (count <= 0) return null;
  return (
    <span className={`min-w-[18px] h-[18px] inline-flex items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground ${className}`}>
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function MobileTabBar() {
  const path = useRouterState({ select: s => s.location.pathname });
  const { user } = useAuth();
  const unread = useUnreadCount();
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
        {user && (
          <Link
            to="/messages"
            className={`relative flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-medium transition ${path === "/messages" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            <MessageCircle className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground inline-flex items-center justify-center border border-background">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
        )}
      </div>
    </nav>
  );
}

export function TopBar() {
  const path = useRouterState({ select: s => s.location.pathname });
  const { user } = useAuth();
  const unread = useUnreadCount();
  return (
    <header className="sticky top-0 z-30 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3">
        <Logo />
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
        <div className="flex items-center gap-2">
          {user && (
            <Link to="/messages" className="relative rounded-full glass p-2 hover:bg-secondary/40 transition" aria-label="Messages">
              <MessageCircle className="h-4 w-4" />
              <UnreadBadge count={unread} className="absolute -top-1 -right-1 border border-background" />
            </Link>
          )}
          <ThemeToggle />
          <Link to="/login" className="rounded-full glass px-4 py-2 text-xs font-medium hover:bg-secondary/40 transition">Sign in</Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 bg-background/70 mt-20">
      <div className="mx-auto max-w-7xl px-5 py-10 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="text-foreground font-medium">Takaz Travels</span>
          <span>Sri Lanka's premium travel ecosystem</span>
          <span className="text-xs mt-1">SLTDA Licensed · #SLTDA-2841</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <a
            href="https://wa.me/94712724435"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-foreground transition"
          >
            <svg viewBox="0 0 32 32" className="w-4 h-4 fill-[#25D366]" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 .5C7.44.5.5 7.44.5 16c0 2.75.72 5.37 2.07 7.67L.5 31.5l8.07-2.04A15.45 15.45 0 0016 31.5C24.56 31.5 31.5 24.56 31.5 16S24.56.5 16 .5zm0 28.3a13.2 13.2 0 01-6.73-1.84l-.48-.29-4.79 1.21 1.25-4.66-.31-.5A13.24 13.24 0 1116 28.8zm7.27-9.88c-.4-.2-2.35-1.16-2.72-1.29-.36-.13-.63-.2-.89.2s-1.02 1.29-1.25 1.56c-.23.26-.46.3-.86.1-.4-.2-1.68-.62-3.2-1.98-1.18-1.05-1.98-2.35-2.21-2.75-.23-.4-.02-.61.17-.81.18-.18.4-.46.6-.69.2-.23.26-.4.4-.66.13-.26.06-.5-.03-.69-.1-.2-.9-2.16-1.23-2.96-.32-.78-.65-.67-.89-.68h-.76c-.26 0-.69.1-1.05.5-.36.4-1.38 1.35-1.38 3.29s1.41 3.82 1.61 4.08c.2.27 2.78 4.25 6.74 5.96.94.4 1.68.65 2.25.83.95.3 1.81.26 2.49.16.76-.11 2.35-.96 2.68-1.89.33-.93.33-1.72.23-1.89-.1-.17-.36-.26-.76-.46z"/>
            </svg>
            +94 71 272 4435
          </a>
          <a
            href="mailto:takaz20034@gmail.com"
            className="flex items-center gap-2 hover:text-foreground transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/>
            </svg>
            takaz20034@gmail.com
          </a>
        </div>
        <div className="text-xs text-center md:text-right">
          <p>© {new Date().getFullYear()} Takaz. All rights reserved.</p>
          <p className="mt-1">4.94 / 5 across 2,400+ trips</p>
        </div>
      </div>
    </footer>
  );
}
