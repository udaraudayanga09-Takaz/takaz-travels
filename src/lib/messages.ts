import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (s: string | undefined | null) => !!s && UUID_RE.test(s);

/** Resolve the auth.users id of the owner for a given listing id (UUID from provider_listings). */
export async function getListingOwnerId(listingId: string): Promise<string | null> {
  if (!isUuid(listingId)) return null;
  const { data } = await supabase
    .from("provider_listings")
    .select("owner_id")
    .eq("id", listingId)
    .maybeSingle();
  return (data?.owner_id as string | undefined) ?? null;
}

export async function sendMessage(opts: {
  receiverId: string;
  listingId?: string | null;
  body: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const body = opts.body.trim();
  if (!body) throw new Error("Message is empty");
  const { error } = await supabase.from("messages").insert({
    sender_id: user.id,
    receiver_id: opts.receiverId,
    listing_id: opts.listingId ?? null,
    body,
  });
  if (error) throw error;
}

export function useUnreadCount() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) { setCount(0); return; }
    let cancelled = false;

    const load = async () => {
      const { count: c } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("receiver_id", user.id)
        .is("read_at", null);
      if (!cancelled) setCount(c ?? 0);
    };
    load();

    const ch = supabase
      .channel(`messages-unread-${user.id}-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` },
        load,
      )
      .subscribe();


    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, [user]);

  return count;
}
