import { motion } from "framer-motion";
import { Car, Home as HomeIcon } from "lucide-react";
import terrain from "@/assets/sri-lanka-terrain.jpg";

export type Region = {
  id: string;
  name: string;
  cx: number; // % of canvas
  cy: number;
  blurb: string;
  bestTime: string;
  highlights: string[];
};

export const REGIONS: Region[] = [
  { id: "colombo", name: "Colombo", cx: 38, cy: 64, blurb: "Coastal capital — colonial cafés, art galleries, and rooftop bars over the Indian Ocean.", bestTime: "Dec – Mar (dry, warm)", highlights: ["Galle Face Green at sunset", "Pettah markets", "Lotus Tower skyline"] },
  { id: "kandy", name: "Kandy", cx: 52, cy: 52, blurb: "Sacred hill capital — misty lake, the Temple of the Tooth, and emerald tea hills above.", bestTime: "Jan – Apr & Jul – Sep", highlights: ["Temple of the Tooth", "Royal Botanical Gardens", "Kandy Esala Perahera"] },
  { id: "galle", name: "Galle", cx: 44, cy: 84, blurb: "17th-century Dutch fort by the sea — boutique stays, surf points, and stone ramparts.", bestTime: "Nov – Apr", highlights: ["Galle Fort walk", "Jungle Beach", "Stilt fishermen of Koggala"] },
  { id: "ella", name: "Ella", cx: 60, cy: 64, blurb: "Cloud-forest mountain village — Nine Arches Bridge, Little Adam's Peak, endless tea fields.", bestTime: "Jan – Mar", highlights: ["Nine Arches Bridge train", "Little Adam's Peak hike", "Ella Rock sunrise"] },
  { id: "sigiriya", name: "Sigiriya", cx: 54, cy: 38, blurb: "The 5th-century Lion Rock fortress rising from the jungle — UNESCO heritage and ancient frescoes.", bestTime: "Jan – Mar (cool mornings)", highlights: ["Sigiriya Rock summit", "Pidurangala viewpoint", "Minneriya elephant safari"] },
  { id: "jaffna", name: "Jaffna", cx: 48, cy: 14, blurb: "Tamil cultural heart of the north — palmyra palms, vibrant Hindu kovils, and untouched islands.", bestTime: "Feb – Sep", highlights: ["Nallur Kandaswamy Temple", "Casuarina Beach", "Delft Island day-trip"] },
];

type Props = {
  selected?: string | null;
  onHover?: (id: string | null) => void;
  onSelect?: (id: string) => void;
  counts?: Record<string, { vehicles: number; stays: number; from: number }>;
  hovered?: string | null;
  className?: string;
};

export function SriLankaMap({ selected, onHover, onSelect, counts, hovered, className }: Props) {
  return (
    <div className={`relative aspect-[3/4] w-full max-w-[480px] mx-auto ${className ?? ""}`}>
      {/* Terrain background */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden ring-1 ring-primary/20 shadow-[0_30px_80px_-30px_var(--emerald)]">
        <img
          src={terrain}
          alt="Topographic map of Sri Lanka"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/40" />
      </div>

      {/* Region pins */}
      {REGIONS.map((r) => {
        const isSelected = selected === r.id;
        const isHover = hovered === r.id;
        return (
          <button
            key={r.id}
            type="button"
            onMouseEnter={() => onHover?.(r.id)}
            onMouseLeave={() => onHover?.(null)}
            onFocus={() => onHover?.(r.id)}
            onBlur={() => onHover?.(null)}
            onClick={() => onSelect?.(r.id)}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${r.cx}%`, top: `${r.cy}%` }}
            aria-label={r.name}
          >
            <span className="relative flex h-3.5 w-3.5 items-center justify-center">
              {(isHover || isSelected) && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70" />
              )}
              <span className={`relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-background shadow-[0_0_12px_var(--emerald)] ${isSelected ? "bg-accent" : "bg-primary"}`} />
            </span>
            <span className="pointer-events-none mt-1 block text-[9px] uppercase tracking-widest text-foreground whitespace-nowrap font-semibold drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              {r.name}
            </span>
          </button>
        );
      })}

      {/* Hover tooltip */}
      {hovered && (() => {
        const r = REGIONS.find((x) => x.id === hovered)!;
        const c = counts?.[r.id];
        const onLeftHalf = r.cx < 50;
        return (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, scale: 0.9, x: onLeftHalf ? -10 : 10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute z-20 w-56 rounded-2xl glass-strong p-3 shadow-2xl"
            style={{
              left: `${onLeftHalf ? r.cx + 8 : r.cx - 8}%`,
              top: `${r.cy}%`,
              transform: `translate(${onLeftHalf ? "0" : "-100%"}, -50%)`,
            }}
          >
            <svg className={`absolute top-1/2 -translate-y-1/2 ${onLeftHalf ? "-left-3" : "-right-3"} h-3 w-3 text-primary`}
                 viewBox="0 0 12 12" fill="currentColor">
              {onLeftHalf
                ? <polygon points="12,0 0,6 12,12" />
                : <polygon points="0,0 12,6 0,12" />}
            </svg>
            <div className="text-xs uppercase tracking-widest text-primary">{r.name}</div>
            <div className="mt-1 text-[11px] leading-snug text-muted-foreground">{r.blurb}</div>
            {c && (
              <div className="mt-2 flex items-center gap-2 text-[10px]">
                <span className="flex items-center gap-1 rounded-full bg-secondary/60 px-2 py-0.5"><Car className="h-3 w-3" />{c.vehicles}</span>
                <span className="flex items-center gap-1 rounded-full bg-secondary/60 px-2 py-0.5"><HomeIcon className="h-3 w-3" />{c.stays}</span>
                {c.from > 0 && <span className="ml-auto font-medium text-accent">from ${c.from}</span>}
              </div>
            )}
          </motion.div>
        );
      })()}
    </div>
  );
}
