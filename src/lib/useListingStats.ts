import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ListingStat = { avg: number; count: number };
type StatMap = Record<string, ListingStat>;

let cache: StatMap | null = null;
let inflight: Promise<StatMap> | null = null;
const listeners = new Set<(m: StatMap) => void>();

async function load(): Promise<StatMap> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = (async () => {
    const { data } = await supabase.from("listing_reviews").select("listing_id,rating");
    const map: StatMap = {};
    for (const row of data ?? []) {
      const id = row.listing_id as string;
      const r = row.rating as number;
      const s = map[id] ?? { avg: 0, count: 0 };
      s.avg = (s.avg * s.count + r) / (s.count + 1);
      s.count += 1;
      map[id] = s;
    }
    cache = map;
    listeners.forEach((l) => l(map));
    return map;
  })();
  return inflight;
}

export function refreshStats() {
  cache = null;
  inflight = null;
  return load();
}

export function useListingStats() {
  const [stats, setStats] = useState<StatMap>(cache ?? {});
  useEffect(() => {
    listeners.add(setStats);
    load().then(setStats);
    return () => { listeners.delete(setStats); };
  }, []);
  return stats;
}

export function statFor(stats: StatMap, id: string, fallbackAvg: number, fallbackCount: number): ListingStat {
  const s = stats[id];
  if (!s || s.count === 0) return { avg: fallbackAvg, count: fallbackCount };
  return s;
}
