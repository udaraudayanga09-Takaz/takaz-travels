import { supabase } from "@/integrations/supabase/client";
import { eachDayOfInterval, format, parseISO } from "date-fns";

/** Fetch all unavailable dates (host-blocked + pending/confirmed bookings) for a listing. */
export async function fetchUnavailableDates(listingId: string): Promise<Date[]> {
  const { data, error } = await supabase.rpc("get_unavailable_dates", { _listing_id: listingId });
  if (error) throw error;
  return (data ?? []).map((d: string) => parseISO(d));
}

/** Just the host-blocked dates the current host owns for this listing (used by the dashboard). */
export async function fetchHostBlocks(listingId: string, ownerId: string): Promise<Date[]> {
  const { data, error } = await supabase
    .from("listing_blocked_dates")
    .select("date")
    .eq("listing_id", listingId)
    .eq("owner_id", ownerId);
  if (error) throw error;
  return (data ?? []).map((r) => parseISO(r.date as string));
}

export async function blockDate(listingId: string, ownerId: string, date: Date) {
  const { error } = await supabase
    .from("listing_blocked_dates")
    .insert({ listing_id: listingId, owner_id: ownerId, date: format(date, "yyyy-MM-dd") });
  if (error && !error.message.includes("duplicate")) throw error;
}

export async function unblockDate(listingId: string, ownerId: string, date: Date) {
  const { error } = await supabase
    .from("listing_blocked_dates")
    .delete()
    .eq("listing_id", listingId)
    .eq("owner_id", ownerId)
    .eq("date", format(date, "yyyy-MM-dd"));
  if (error) throw error;
}

/** True if any date in [from, to) is in `unavailable`. */
export function rangeHasUnavailable(from: Date, to: Date, unavailable: Date[]): boolean {
  if (unavailable.length === 0) return false;
  const set = new Set(unavailable.map((d) => format(d, "yyyy-MM-dd")));
  const days = eachDayOfInterval({ start: from, end: new Date(to.getTime() - 86400000) });
  return days.some((d) => set.has(format(d, "yyyy-MM-dd")));
}
