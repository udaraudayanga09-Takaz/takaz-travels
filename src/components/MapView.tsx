import { motion } from "framer-motion";
import { MapPin, Car, Home } from "lucide-react";
import type { Listing } from "@/data/listings";

export function MapView({ listings, onSelect, selectedId }: { listings: Listing[]; onSelect: (l: Listing) => void; selectedId?: string }) {
  return (
    <div className="relative h-[560px] w-full overflow-hidden rounded-3xl glass">
      {/* stylized map background */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at 60% 40%, oklch(0.32 0.08 165 / 0.5), transparent 60%), radial-gradient(ellipse at 30% 70%, oklch(0.32 0.08 220 / 0.45), transparent 55%), linear-gradient(180deg, oklch(0.20 0.04 220), oklch(0.16 0.02 220))",
      }} />
      {/* island silhouette */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="island" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.45 0.12 165)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="oklch(0.30 0.08 200)" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <path
          d="M 52 8 C 64 10 72 22 74 38 C 78 52 76 68 70 80 C 64 90 54 94 46 92 C 36 90 28 82 26 70 C 22 56 24 38 32 24 C 38 14 44 8 52 8 Z"
          fill="url(#island)"
          stroke="oklch(0.74 0.16 165 / 0.4)"
          strokeWidth="0.3"
        />
      </svg>

      {/* grid */}
      <div className="absolute inset-0 opacity-[0.06]" style={{
        backgroundImage: "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      {/* markers */}
      {listings.map((l, i) => (
        <motion.button
          key={l.id}
          onClick={() => onSelect(l)}
          initial={{ opacity: 0, scale: 0, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: i * 0.06, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.1, zIndex: 30 }}
          className="absolute -translate-x-1/2 -translate-y-full"
          style={{ left: `${l.lng}%`, top: `${l.lat}%` }}
        >
          <div className={`group relative ${selectedId === l.id ? "z-20" : ""}`}>
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-lg transition ${
              selectedId === l.id
                ? "bg-accent text-accent-foreground scale-110"
                : "bg-background text-foreground hover:bg-primary hover:text-primary-foreground"
            }`}>
              {l.type === "vehicle" ? <Car className="h-3 w-3" /> : <Home className="h-3 w-3" />}
              ${l.pricePerDay}
            </div>
            <div className={`mx-auto h-2 w-2 -mt-px rotate-45 ${selectedId === l.id ? "bg-accent" : "bg-background"}`} />
          </div>
        </motion.button>
      ))}

      {/* city labels */}
      {[
        { name: "Colombo", lat: 55, lng: 18 },
        { name: "Kandy", lat: 46, lng: 50 },
        { name: "Galle", lat: 82, lng: 26 },
        { name: "Ella", lat: 60, lng: 67 },
      ].map(c => (
        <div key={c.name} className="pointer-events-none absolute -translate-x-1/2 text-[10px] uppercase tracking-widest text-muted-foreground/70" style={{ left: `${c.lng}%`, top: `${c.lat + 3}%` }}>
          <MapPin className="mx-auto mb-0.5 h-3 w-3" /> {c.name}
        </div>
      ))}

      <div className="absolute bottom-4 left-4 rounded-full glass px-3 py-1.5 text-xs text-muted-foreground">
        {listings.length} listings · Sri Lanka
      </div>
    </div>
  );
}
