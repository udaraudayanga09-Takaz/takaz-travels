import { motion, AnimatePresence } from "framer-motion";
import { Car, Home as HomeIcon } from "lucide-react";
import { useEffect, useState } from "react";
import satellite from "@/assets/sri-lanka-satellite.jpg";
import { supabase } from "@/integrations/supabase/client";

export type Region = {
  id: string;
  name: string;
  cx: number; // % of canvas (calibrated to satellite image)
  cy: number;
  blurb: string;
  bestTime: string;
  highlights: string[];
  image?: string;
};

// Calibrated to src/assets/sri-lanka-satellite.jpg (9:15)
export const REGIONS: Region[] = [
  { id: "jaffna",   name: "Jaffna",       cx: 36, cy: 8,  blurb: "Tamil cultural heart of the north — palmyra palms, vivid Hindu kovils, and untouched islands.",         bestTime: "Feb – Sep",            highlights: ["Nallur Kandaswamy Temple", "Casuarina Beach", "Delft Island day-trip"] },
  { id: "kalpitiya",name: "Kalpitiya",    cx: 19, cy: 40, blurb: "Kitesurfing capital — flat lagoon, steady wind, dolphin pods and wild beaches.",                       bestTime: "May – Oct & Dec – Mar", highlights: ["Kalpitiya Lagoon kite zone", "Dolphin watching", "Bar Reef snorkel"] },
  { id: "trinco",   name: "Trincomalee",  cx: 60, cy: 36, blurb: "Deep natural harbour — white-sand beaches, dive sites and a clifftop temple.",                          bestTime: "May – Sep",            highlights: ["Pigeon Island reef", "Koneswaram Temple", "Nilaveli Beach"] },
  { id: "sigiriya", name: "Sigiriya",     cx: 49, cy: 35, blurb: "5th-century Lion Rock fortress rising from the jungle — UNESCO heritage and ancient frescoes.",         bestTime: "Jan – Mar (cool mornings)", highlights: ["Sigiriya Rock summit", "Pidurangala viewpoint", "Minneriya elephant safari"] },
  { id: "meemure",  name: "Meemure",      cx: 52, cy: 46, blurb: "Hidden Knuckles-range village — sacred Lakegala, rice paddies and zero phone signal.",                  bestTime: "Jan – Apr",            highlights: ["Lakegala climb", "Knuckles Range trails", "Village homestays"] },
  { id: "kandy",    name: "Kandy",        cx: 46, cy: 50, blurb: "Sacred hill capital — misty lake, the Temple of the Tooth, and tea hills above.",                       bestTime: "Jan – Apr & Jul – Sep", highlights: ["Temple of the Tooth", "Royal Botanical Gardens", "Esala Perahera"] },
  { id: "colombo",  name: "Colombo",      cx: 23, cy: 56, blurb: "Coastal capital — colonial cafés, art galleries, and rooftop bars over the Indian Ocean.",              bestTime: "Dec – Mar (dry, warm)", highlights: ["Galle Face Green at sunset", "Pettah markets", "Lotus Tower skyline"] },
  { id: "nuwara",   name: "Nuwara Eliya", cx: 47, cy: 58, blurb: "Sri Lanka's highest town — cool air, colonial bungalows, rose gardens and endless tea.",                bestTime: "Feb – Apr",            highlights: ["Pedro Tea Estate", "World's End at sunrise", "Gregory Lake"] },
  { id: "haputale", name: "Haputale",     cx: 50, cy: 64, blurb: "Wind-blown hill town on the southern ridge — Lipton tea estates and stars.",                            bestTime: "Jan – Apr",            highlights: ["Lipton's Seat", "Dambatenne Tea Factory", "Idalgashinna walk"] },
  { id: "ella",     name: "Ella",         cx: 54, cy: 62, blurb: "Cloud-forest village — Nine Arches Bridge, Little Adam's Peak, endless tea fields.",                    bestTime: "Jan – Mar",            highlights: ["Nine Arches Bridge train", "Little Adam's Peak", "Ella Rock sunrise"] },
  { id: "arugam",   name: "Arugam Bay",   cx: 64, cy: 68, blurb: "Sri Lanka's surf capital — a laid-back bay with consistent right-hand point breaks.",                   bestTime: "May – Sep",            highlights: ["Main Point", "Whiskey Point", "Pottuvil Lagoon safari"] },
  { id: "galle",    name: "Galle",        cx: 31, cy: 84, blurb: "17th-century Dutch fort by the sea — boutique stays, surf points, and stone ramparts.",                 bestTime: "Nov – Apr",            highlights: ["Galle Fort walk", "Jungle Beach", "Stilt fishermen of Koggala"] },
  { id: "mirissa",  name: "Mirissa",      cx: 38, cy: 87, blurb: "Palm-fringed crescent beach and Sri Lanka's launchpad for blue-whale watching.",                        bestTime: "Nov – Apr",            highlights: ["Blue-whale watching", "Coconut Tree Hill", "Secret Beach"] },
];

type Pin = { id: string; name: string; cx: number; cy: number; image?: string; blurb?: string; slug?: string };

type Props = {
  selected?: string | null;
  onHover?: (id: string | null) => void;
  onSelect?: (id: string) => void;
  counts?: Record<string, { vehicles: number; stays: number; from: number }>;
  hovered?: string | null;
  className?: string;
  /** extra admin / community pins to merge in */
  extraPins?: Pin[];
  /** disable supabase fetch */
  disableAdminPins?: boolean;
  /** disable the whole-map zoom on hover; scale only the pin icon */
  disableHoverZoom?: boolean;
  /** when provided, REPLACES the default REGIONS + admin pins with this list */
  pins?: Pin[];
};

export function SriLankaMap({ selected, onHover, onSelect, counts, hovered, className, extraPins = [], disableAdminPins, disableHoverZoom, pins }: Props) {
  const [adminPins, setAdminPins] = useState<Pin[]>([]);

  useEffect(() => {
    if (disableAdminPins || pins) return;
    let active = true;
    (async () => {
      const { data } = await supabase.from("map_pins").select("id, name, slug, blurb, image_url, cx, cy");
      if (active && data) {
        setAdminPins(
          data.map((d: any) => ({ id: `pin-${d.id}`, name: d.name, slug: d.slug, blurb: d.blurb, image: d.image_url, cx: Number(d.cx), cy: Number(d.cy) }))
        );
      }
    })();
    return () => { active = false; };
  }, [disableAdminPins, pins]);

  const allPins: Array<Region | Pin> = pins ?? [...REGIONS, ...extraPins, ...adminPins];

  const hoveredPin = hovered ? allPins.find((p) => p.id === hovered) : null;

  // Subtle expansion — transform-origin at the hovered pin keeps its coordinate fixed
  const zoom = 1.08;
  const originX = hoveredPin ? hoveredPin.cx : 50;
  const originY = hoveredPin ? hoveredPin.cy : 50;
  const mapAnimate = { scale: hoveredPin ? zoom : 1 };

  return (
    <div className={`relative aspect-[9/15] w-full max-w-[480px] mx-auto ${className ?? ""}`}>
      {/* Satellite map background — expands from the hovered pin so the pin's coordinate stays fixed */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden ring-1 ring-primary/20 shadow-[0_30px_80px_-30px_var(--emerald)]">
        <motion.img
          src={satellite}
          alt="Satellite map of Sri Lanka"
          className="h-full w-full object-cover"
          style={{ transformOrigin: `${originX}% ${originY}%` }}
          animate={mapAnimate}
          transition={{ type: "spring", stiffness: 160, damping: 22 }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/30 pointer-events-none" />
      </div>

      {/* Pins layer — same transform + origin so pins move with the map and the hovered pin stays put */}
      <motion.div
        className="absolute inset-0"
        style={{ transformOrigin: `${originX}% ${originY}%` }}
        animate={mapAnimate}
        transition={{ type: "spring", stiffness: 160, damping: 22 }}
      >
        {allPins.map((r) => {
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
              <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                {(isHover || isSelected) && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70" />
                )}
                <span
                  style={{
                    transformOrigin: "center",
                    transform: isHover ? "scale(1.15)" : "scale(1)",
                    transition: "transform 150ms ease",
                  }}
                  className={`relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-background shadow-[0_0_12px_var(--emerald)] ${isSelected ? "bg-accent" : "bg-primary"}`}
                />
              </span>

              <span className="pointer-events-none mt-1 block text-[9px] uppercase tracking-widest text-white whitespace-nowrap font-semibold drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                {r.name}
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* Hover popup card — anchored right next to the hovered pin */}
      <AnimatePresence>
        {hoveredPin && (() => {
          const r: any = hoveredPin;
          const c = counts?.[r.id];
          const onLeftHalf = r.cx < 50;
          const onTopHalf = r.cy < 50;
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, scale: 0.92, x: onLeftHalf ? -6 : 6 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="pointer-events-none absolute z-20 w-56 rounded-2xl glass-strong p-3 shadow-2xl"
              style={{
                left: `${r.cx}%`,
                top: `${r.cy}%`,
                transform: `translate(${onLeftHalf ? "14px" : "calc(-100% - 14px)"}, ${onTopHalf ? "0" : "-100%"})`,
              }}
            >
              {(r.image || r.hero) && (
                <div className="-mx-3 -mt-3 mb-2 aspect-[16/9] overflow-hidden rounded-t-2xl">
                  <img src={r.image || r.hero} alt={r.name} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="text-xs uppercase tracking-widest text-primary">{r.name}</div>
              {(r.blurb) && <div className="mt-1 text-[11px] leading-snug text-muted-foreground">{r.blurb}</div>}
              {c && (
                <div className="mt-2 flex items-center gap-2 text-[10px]">
                  <span className="flex items-center gap-1 rounded-full bg-secondary/60 px-2 py-0.5"><Car className="h-3 w-3" />{c.vehicles}</span>
                  <span className="flex items-center gap-1 rounded-full bg-secondary/60 px-2 py-0.5"><HomeIcon className="h-3 w-3" />{c.stays}</span>
                  {c.from > 0 && <span className="ml-auto font-medium text-accent">from ${c.from}</span>}
                </div>
              )}
              <div className="mt-2 text-[10px] text-muted-foreground/80">Click for full details</div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
