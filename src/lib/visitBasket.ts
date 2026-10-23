import { useEffect, useState } from "react";

/** A place the traveller wants to visit, saved across pages until booked. */
export type VisitItem = {
  key: string; // unique: parentSlug + name
  name: string;
  parentSlug: string;
  parentName: string;
  image?: string | null;
  description?: string | null;
};

const KEY = "takaz-visit-basket-v1";
const EVT = "takaz-visit-basket";

export function readBasket(): VisitItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}

function write(items: VisitItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVT));
}

export const visitKey = (parentSlug: string, name: string) => `${parentSlug}::${name}`;

export function toggleVisit(item: VisitItem) {
  const cur = readBasket();
  write(cur.some((i) => i.key === item.key) ? cur.filter((i) => i.key !== item.key) : [...cur, item]);
}

export function removeVisit(key: string) {
  write(readBasket().filter((i) => i.key !== key));
}

export function useVisitBasket() {
  const [items, setItems] = useState<VisitItem[]>([]);
  useEffect(() => {
    const sync = () => setItems(readBasket());
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(EVT, sync); window.removeEventListener("storage", sync); };
  }, []);
  return items;
}
