import { motion } from "framer-motion";
import { Car, Home as HomeIcon } from "lucide-react";

export type Region = {
  id: string;
  name: string;
  // % coords on the SVG viewport (0-100)
  cx: number;
  cy: number;
  blurb: string;
  bestTime: string;
  highlights: string[];
};

export const REGIONS: Region[] = [
  { id: "colombo", name: "Colombo", cx: 22, cy: 56, blurb: "Coastal capital — colonial cafés, art galleries, and rooftop bars over the Indian Ocean.", bestTime: "Dec – Mar (dry, warm)", highlights: ["Galle Face Green at sunset", "Pettah markets", "Lotus Tower skyline"] },
  { id: "kandy", name: "Kandy", cx: 50, cy: 47, blurb: "Sacred hill capital — misty lake, the Temple of the Tooth, and emerald tea hills above.", bestTime: "Jan – Apr & Jul – Sep", highlights: ["Temple of the Tooth", "Royal Botanical Gardens", "Kandy Esala Perahera"] },
  { id: "galle", name: "Galle", cx: 28, cy: 82, blurb: "17th-century Dutch fort by the sea — boutique stays, surf points, and stone ramparts.", bestTime: "Nov – Apr", highlights: ["Galle Fort walk", "Jungle Beach", "Stilt fishermen of Koggala"] },
  { id: "ella", name: "Ella", cx: 67, cy: 60, blurb: "Cloud-forest mountain village — Nine Arches Bridge, Little Adam's Peak, endless tea fields.", bestTime: "Jan – Mar", highlights: ["Nine Arches Bridge train", "Little Adam's Peak hike", "Ella Rock sunrise"] },
  { id: "sigiriya", name: "Sigiriya", cx: 52, cy: 32, blurb: "The 5th-century Lion Rock fortress rising from the jungle — UNESCO heritage and ancient frescoes.", bestTime: "Jan – Mar (cool mornings)", highlights: ["Sigiriya Rock summit", "Pidurangala viewpoint", "Minneriya elephant safari"] },
  { id: "jaffna", name: "Jaffna", cx: 42, cy: 8, blurb: "Tamil cultural heart of the north — palmyra palms, vibrant Hindu kovils, and untouched islands.", bestTime: "Feb – Sep", highlights: ["Nallur Kandaswamy Temple", "Casuarina Beach", "Delft Island day-trip"] },
];

type Props = {
  selected?: string | null;
  onHover?: (id: string | null) => void;
  onSelect?: (id: string) => void;
  // Counts of (vehicles, stays) per region for tooltip badges
  counts?: Record<string, { vehicles: number; stays: number; from: number }>;
  hovered?: string | null;
  className?: string;
};

export function SriLankaMap({ selected, onHover, onSelect, counts, hovered, className }: Props) {
  return (
    <div className={`relative aspect-[3/4] w-full max-w-[460px] mx-auto ${className ?? ""}`}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="island-fill" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.42 0.12 165)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="oklch(0.28 0.08 200)" stopOpacity="0.5" />
          </linearGradient>
          <radialGradient id="ocean-glow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="oklch(0.32 0.08 200 / 0.4)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        <rect width="100" height="100" fill="url(#ocean-glow)" />

        <path
          d="M 42 4 C 50 5 56 10 58 18 C 60 22 64 24 68 28 C 74 34 76 44 74 54 C 72 64 70 72 68 78 C 64 86 56 92 46 94 C 38 96 30 92 26 84 C 22 76 22 66 24 56 C 26 46 30 36 32 26 C 34 16 36 8 42 4 Z"
          fill="url(#island-fill)"
          stroke="oklch(0.74 0.16 165 / 0.55)"
          strokeWidth="0.4"
        />

        {/* dotted travel routes between regions */}
        <g stroke="oklch(0.74 0.16 165 / 0.25)" strokeDasharray="0.8 1.2" strokeWidth="0.3" fill="none">
          <path d="M22,56 L50,47 L52,32 L67,60 L28,82 Z" />
        </g>
      </svg>

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
            className="absolute -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${r.cx}%`, top: `${r.cy}%` }}
            aria-label={r.name}
          >
            <span className={`relative flex h-3 w-3 items-center justify-center`}>
              {(isHover || isSelected) && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
              )}
              <span className={`relative inline-flex h-3 w-3 rounded-full border-2 border-background ${isSelected ? "bg-accent" : "bg-primary"}`} />
            </span>
            <span className="pointer-events-none mt-1 block text-[9px] uppercase tracking-widest text-foreground/80 whitespace-nowrap">
              {r.name}
            </span>
          </button>
        );
      })}

      {/* Hover tooltip */}
      {hovered && (() => {
        const r = REGIONS.find((x) => x.id === hovered)!;
        const c = counts?.[r.id];
        // place tooltip on the "open" side (right if region is on the left half)
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
            {/* arrow */}
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
