import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function admin() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// ---------- BOOKINGS ----------
export const submitBooking = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      listingId: z.string().min(1).max(64),
      listingType: z.enum(["vehicle", "stay"]),
      listingTitle: z.string().min(1).max(200),
      guestName: z.string().min(1).max(200),
      guestEmail: z.string().regex(emailRe).max(255),
      startDate: z.string(),
      endDate: z.string(),
      days: z.number().int().min(1).max(365),
      total: z.number().min(0).max(1_000_000),
      userId: z.string().uuid().nullable().optional(),
    }).parse(input)
  )
  .handler(async ({ data }) => {
    const sb = admin();
    const { data: row, error } = await sb.from("bookings").insert({
      listing_id: data.listingId,
      listing_type: data.listingType,
      listing_title: data.listingTitle,
      guest_name: data.guestName,
      guest_email: data.guestEmail,
      start_date: data.startDate,
      end_date: data.endDate,
      days: data.days,
      total: data.total,
      user_id: data.userId ?? null,
      status: "confirmed",
    }).select().single();
    if (error) throw new Error(error.message);
    return { booking: row };
  });

// ---------- TRIP PLAN ----------
export const submitTripPlan = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      contactName: z.string().min(1).max(200).optional(),
      contactEmail: z.string().regex(emailRe).max(255),
      regions: z.array(z.string().min(1).max(64)).min(1).max(20),
      startDate: z.string().nullable().optional(),
      endDate: z.string().nullable().optional(),
      partySize: z.number().int().min(1).max(50).nullable().optional(),
      notes: z.string().max(2000).optional(),
      userId: z.string().uuid().nullable().optional(),
    }).parse(input)
  )
  .handler(async ({ data }) => {
    const sb = admin();
    const { error } = await sb.from("trip_plans").insert({
      contact_name: data.contactName ?? null,
      contact_email: data.contactEmail,
      regions: data.regions,
      start_date: data.startDate || null,
      end_date: data.endDate || null,
      party_size: data.partySize ?? null,
      notes: data.notes ?? null,
      user_id: data.userId ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- PARTNER APPLICATION ----------
export const submitPartnerApplication = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      fullName: z.string().min(1).max(200),
      email: z.string().regex(emailRe).max(255),
      phone: z.string().min(4).max(40).optional(),
      serviceType: z.enum(["driver", "villa_owner", "vehicle_owner"]),
      locationLat: z.number().min(-90).max(90).nullable().optional(),
      locationLng: z.number().min(-180).max(180).nullable().optional(),
      locationLabel: z.string().max(200).optional(),
      documentUrl: z.string().url().max(500).nullable().optional(),
      notes: z.string().max(2000).optional(),
      userId: z.string().uuid().nullable().optional(),
    }).parse(input)
  )
  .handler(async ({ data }) => {
    const sb = admin();
    const { error } = await sb.from("partner_applications").insert({
      full_name: data.fullName,
      email: data.email,
      phone: data.phone ?? null,
      service_type: data.serviceType,
      location_lat: data.locationLat ?? null,
      location_lng: data.locationLng ?? null,
      location_label: data.locationLabel ?? null,
      document_url: data.documentUrl ?? null,
      notes: data.notes ?? null,
      user_id: data.userId ?? null,
      status: "pending",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- ADMIN ----------
async function ensureAdmin(userId: string) {
  const sb = admin();
  const { data } = await sb.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (!data) throw new Response("Forbidden", { status: 403 });
}

export const adminListAll = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.userId);
    const sb = admin();
    const [bookings, applications, plans] = await Promise.all([
      sb.from("bookings").select("*").order("created_at", { ascending: false }).limit(200),
      sb.from("partner_applications").select("*").order("created_at", { ascending: false }).limit(200),
      sb.from("trip_plans").select("*").order("created_at", { ascending: false }).limit(200),
    ]);
    return {
      bookings: bookings.data ?? [],
      applications: applications.data ?? [],
      plans: plans.data ?? [],
    };
  });

export const adminDecideApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      applicationId: z.string().uuid(),
      decision: z.enum(["approved", "rejected"]),
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.userId);
    const sb = admin();
    const { data: app, error } = await sb
      .from("partner_applications")
      .update({ status: data.decision })
      .eq("id", data.applicationId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    if (data.decision === "approved" && app?.user_id) {
      await sb.from("user_roles").insert({ user_id: app.user_id, role: "partner" }).select();
    }
    return { ok: true };
  });
