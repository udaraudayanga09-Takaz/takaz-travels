import { useEffect, useState } from "react";
import { CalendarDays, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import {
  blockDate,
  fetchHostBlocks,
  fetchUnavailableDates,
  unblockDate,
} from "@/lib/availability";

export function AvailabilityManager() {
  const { user } = useAuth();
  const { listings } = useStore();
  const myListings = listings.slice(0, 6);
  const [selectedId, setSelectedId] = useState<string>(myListings[0]?.id ?? "");
  const [myBlocks, setMyBlocks] = useState<Date[]>([]);
  const [allUnavailable, setAllUnavailable] = useState<Date[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    if (!selectedId || !user) return;
    setLoading(true);
    try {
      const [mine, all] = await Promise.all([
        fetchHostBlocks(selectedId, user.id),
        fetchUnavailableDates(selectedId),
      ]);
      setMyBlocks(mine);
      setAllUnavailable(all);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); /* eslint-disable-next-line */ }, [selectedId, user?.id]);

  async function toggle(date: Date) {
    if (!user || !selectedId || saving) return;
    const key = format(date, "yyyy-MM-dd");
    const isMine = myBlocks.some((d) => format(d, "yyyy-MM-dd") === key);
    setSaving(true);
    try {
      if (isMine) {
        await unblockDate(selectedId, user.id, date);
        toast.success(`Unblocked ${key}`);
      } else {
        await blockDate(selectedId, user.id, date);
        toast.success(`Blocked ${key}`);
      }
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update");
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return <p className="text-sm text-muted-foreground">Sign in as a host to manage availability.</p>;
  }

  // Booked-by-tourists dates = all unavailable minus my host blocks
  const myKeys = new Set(myBlocks.map((d) => format(d, "yyyy-MM-dd")));
  const bookedDates = allUnavailable.filter((d) => !myKeys.has(format(d, "yyyy-MM-dd")));

  return (
    <div className="rounded-2xl glass p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Availability</h2>
        </div>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="rounded-full bg-secondary px-4 py-2 text-sm"
        >
          {myListings.map((l) => (
            <option key={l.id} value={l.id}>{l.title}</option>
          ))}
        </select>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        Tap any date to block or unblock it. Tourists won't be able to book days you've blocked or that are already booked.
      </p>

      <div className="mt-4 flex flex-col gap-5 md:flex-row">
        <div className="rounded-2xl bg-background/40 p-2">
          {loading ? (
            <div className="flex h-72 w-72 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>
          ) : (
            <Calendar
              mode="single"
              onDayClick={toggle}
              disabled={{ before: new Date() }}
              modifiers={{ blocked: myBlocks, booked: bookedDates }}
              modifiersClassNames={{
                blocked: "bg-destructive/30 text-destructive-foreground rounded-md",
                booked: "bg-accent/30 text-accent-foreground line-through rounded-md",
              }}
              className="p-3 pointer-events-auto"
            />
          )}
        </div>
        <div className="flex-1 space-y-3 text-sm">
          <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-destructive/40" /> Blocked by you ({myBlocks.length})</div>
          <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-accent/40" /> Booked by tourists ({bookedDates.length})</div>
          {saving && <div className="text-xs text-muted-foreground">Saving…</div>}
        </div>
      </div>
    </div>
  );
}
