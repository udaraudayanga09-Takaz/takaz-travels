import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { LISTINGS, type Listing } from "@/data/listings";

export type Role = "tourist" | "provider" | "admin";

export type Booking = {
  id: string;
  listingId: string;
  guestName: string;
  guestEmail: string;
  startDate: string; // ISO
  endDate: string;
  days: number;
  total: number;
  status: "confirmed" | "completed" | "cancelled";
  rating?: number;
  review?: string;
};

type Store = {
  role: Role;
  setRole: (r: Role) => void;
  listings: Listing[];
  addListing: (l: Omit<Listing, "id" | "rating" | "reviews" | "verified">) => void;
  verifyListing: (id: string) => void;
  bookings: Booking[];
  addBooking: (b: Omit<Booking, "id" | "status">) => Booking;
  rateBooking: (id: string, rating: number, review: string) => void;
};

const StoreCtx = createContext<Store | null>(null);

const seedBookings = (): Booking[] => {
  const past = new Date(); past.setDate(past.getDate() - 5);
  const pastStart = new Date(); pastStart.setDate(pastStart.getDate() - 9);
  const future = new Date(); future.setDate(future.getDate() + 10);
  const futureStart = new Date(); futureStart.setDate(futureStart.getDate() + 7);
  return [
    { id: "b1", listingId: "v1", guestName: "Demo Tourist", guestEmail: "demo@takaz.lk", startDate: pastStart.toISOString(), endDate: past.toISOString(), days: 4, total: 100, status: "completed" },
    { id: "b2", listingId: "s3", guestName: "Demo Tourist", guestEmail: "demo@takaz.lk", startDate: futureStart.toISOString(), endDate: future.toISOString(), days: 3, total: 495, status: "confirmed" },
  ];
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("tourist");
  const [listings, setListings] = useState<Listing[]>(LISTINGS);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("luxe-state-v1");
      if (raw) {
        const p = JSON.parse(raw);
        if (p.listings) setListings(p.listings);
        if (p.bookings) setBookings(p.bookings);
        if (p.role) setRole(p.role);
      } else {
        setBookings(seedBookings());
      }
    } catch {
      setBookings(seedBookings());
    }
  }, []);

  useEffect(() => {
    try { localStorage.setItem("luxe-state-v1", JSON.stringify({ listings, bookings, role })); } catch {}
  }, [listings, bookings, role]);

  const value = useMemo<Store>(() => ({
    role, setRole,
    listings,
    addListing: (l) => setListings((prev) => [
      { ...l, id: `u${Date.now()}`, rating: 0, reviews: 0, verified: false },
      ...prev,
    ]),
    verifyListing: (id) => setListings((prev) => prev.map(x => x.id === id ? { ...x, verified: true } : x)),
    bookings,
    addBooking: (b) => {
      const booking: Booking = { ...b, id: `b${Date.now()}`, status: "confirmed" };
      setBookings(prev => [booking, ...prev]);
      return booking;
    },
    rateBooking: (id, rating, review) => setBookings(prev => prev.map(b => b.id === id ? { ...b, rating, review } : b)),
  }), [role, listings, bookings]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be inside StoreProvider");
  return ctx;
}

export function isReviewable(b: Booking) {
  return new Date(b.endDate).getTime() < Date.now() && !b.rating;
}
