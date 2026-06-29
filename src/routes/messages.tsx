import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Send, ArrowLeft, LogIn } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/messages")({
  component: MessagesPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl p-10 text-center text-sm text-muted-foreground">{error.message}</div>
  ),
  notFoundComponent: () => <div className="p-10 text-center">Not found</div>,
});

type Msg = {
  id: string;
  sender_id: string;
  receiver_id: string;
  listing_id: string | null;
  body: string;
  read_at: string | null;
  created_at: string;
};

type Thread = {
  key: string;            // `${otherId}|${listingId ?? ''}`
  otherId: string;
  listingId: string | null;
  listingTitle: string | null;
  otherName: string;
  lastMessage: Msg;
  unread: number;
};

function MessagesPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [listingTitles, setListingTitles] = useState<Record<string, string>>({});
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const load = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: true });
      if (error) { toast.error(error.message); return; }
      if (cancelled) return;
      const msgs = (data ?? []) as Msg[];
      setMessages(msgs);

      const otherIds = Array.from(new Set(msgs.map(m => m.sender_id === user.id ? m.receiver_id : m.sender_id)));
      if (otherIds.length) {
        const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", otherIds);
        if (!cancelled) {
          const map: Record<string, string> = {};
          (profs ?? []).forEach((p: any) => { map[p.id] = p.full_name || "Host"; });
          setProfiles(map);
        }
      }
      const listingIds = Array.from(new Set(msgs.map(m => m.listing_id).filter(Boolean) as string[]));
      if (listingIds.length) {
        const { data: ls } = await supabase.from("provider_listings").select("id, title").in("id", listingIds);
        if (!cancelled) {
          const map: Record<string, string> = {};
          (ls ?? []).forEach((l: any) => { map[l.id] = l.title; });
          setListingTitles(map);
        }
      }
    };
    load();

    const ch = supabase
      .channel(`messages-page-${user.id}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` },
        load)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `sender_id=eq.${user.id}` },
        load)
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, [user]);

  const threads: Thread[] = useMemo(() => {
    if (!user) return [];
    const groups = new Map<string, Msg[]>();
    for (const m of messages) {
      const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
      const key = `${otherId}|${m.listing_id ?? ""}`;
      const arr = groups.get(key) ?? [];
      arr.push(m);
      groups.set(key, arr);
    }
    return Array.from(groups.entries())
      .map(([key, list]) => {
        const last = list[list.length - 1];
        const otherId = last.sender_id === user.id ? last.receiver_id : last.sender_id;
        const unread = list.filter(m => m.receiver_id === user.id && !m.read_at).length;
        return {
          key,
          otherId,
          listingId: last.listing_id,
          listingTitle: last.listing_id ? (listingTitles[last.listing_id] ?? null) : null,
          otherName: profiles[otherId] ?? "Host",
          lastMessage: last,
          unread,
        };
      })
      .sort((a, b) => b.lastMessage.created_at.localeCompare(a.lastMessage.created_at));
  }, [messages, profiles, listingTitles, user]);

  const activeThread = threads.find(t => t.key === activeKey) ?? null;
  const activeMessages = useMemo(() => {
    if (!activeThread || !user) return [];
    return messages.filter(m => {
      const other = m.sender_id === user.id ? m.receiver_id : m.sender_id;
      return other === activeThread.otherId && (m.listing_id ?? "") === (activeThread.listingId ?? "");
    });
  }, [messages, activeThread, user]);

  // mark as read when viewing a thread
  useEffect(() => {
    if (!user || !activeThread) return;
    const unreadIds = activeMessages.filter(m => m.receiver_id === user.id && !m.read_at).map(m => m.id);
    if (!unreadIds.length) return;
    supabase.from("messages").update({ read_at: new Date().toISOString() }).in("id", unreadIds).then(() => {
      setMessages(prev => prev.map(m => unreadIds.includes(m.id) ? { ...m, read_at: new Date().toISOString() } : m));
    });
  }, [activeKey, activeThread, activeMessages, user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [activeMessages.length]);

  async function send() {
    if (!user || !activeThread || !draft.trim()) return;
    setSending(true);
    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        receiver_id: activeThread.otherId,
        listing_id: activeThread.listingId,
        body: draft.trim(),
      });
      if (error) throw error;
      setDraft("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  if (loading) return <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>;
  if (!user) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 p-10 text-center">
        <LogIn className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-semibold">Sign in to view your messages</h1>
        <Link to="/login" className="rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-semibold md:text-3xl">
        <MessageCircle className="h-6 w-6 text-primary" /> Messages
      </h1>

      <div className="grid gap-4 md:grid-cols-[320px_1fr]">
        {/* Thread list */}
        <aside className={`${activeKey ? "hidden md:block" : ""} rounded-2xl glass p-2 max-h-[70vh] overflow-y-auto`}>
          {threads.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">No conversations yet. Open any listing and tap "Message host" to start.</p>
          ) : threads.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveKey(t.key)}
              className={`flex w-full flex-col gap-1 rounded-xl p-3 text-left transition hover:bg-secondary/40 ${activeKey === t.key ? "bg-secondary/60" : ""}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-medium">{t.otherName}</span>
                {t.unread > 0 && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">{t.unread}</span>
                )}
              </div>
              {t.listingTitle && <span className="truncate text-xs text-muted-foreground">{t.listingTitle}</span>}
              <span className="truncate text-xs text-muted-foreground">
                {t.lastMessage.sender_id === user.id ? "You: " : ""}{t.lastMessage.body}
              </span>
              <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(t.lastMessage.created_at), { addSuffix: true })}</span>
            </button>
          ))}
        </aside>

        {/* Conversation pane */}
        <section className={`${!activeKey ? "hidden md:flex" : "flex"} flex-col rounded-2xl glass min-h-[60vh] max-h-[75vh]`}>
          {!activeThread ? (
            <div className="m-auto p-6 text-center text-sm text-muted-foreground">Select a conversation to start chatting.</div>
          ) : (
            <>
              <header className="flex items-center gap-3 border-b border-border/40 p-4">
                <button onClick={() => setActiveKey(null)} className="md:hidden grid h-8 w-8 place-items-center rounded-full bg-secondary">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="min-w-0">
                  <div className="truncate font-semibold">{activeThread.otherName}</div>
                  {activeThread.listingTitle && (
                    <div className="truncate text-xs text-muted-foreground">About: {activeThread.listingTitle}</div>
                  )}
                </div>
              </header>

              <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 p-4">
                {activeMessages.map(m => {
                  const mine = m.sender_id === user.id;
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex ${mine ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-snug ${mine ? "bg-primary text-primary-foreground" : "glass"}`}>
                        <div className="whitespace-pre-wrap">{m.body}</div>
                        <div className={`mt-1 text-[10px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="border-t border-border/40 p-3 flex items-end gap-2">
                <Textarea
                  rows={1}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="Type a message…"
                  className="min-h-[40px] resize-none"
                  maxLength={2000}
                />
                <button
                  onClick={send}
                  disabled={sending || !draft.trim()}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
                  aria-label="Send"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
