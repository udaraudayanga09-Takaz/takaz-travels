
# LuxeLanka Expansion Plan

This is a large multi-feature build. I'll execute it in phases, with the database/auth foundation first so the new pages can persist data.

## Phase 1 — Backend Foundation (Supabase)

Create database schema + auth + RLS:

- **`profiles`** — id, full_name, avatar_url (auto-created on signup via trigger).
- **`user_roles`** — user_id, role enum (`tourist`, `partner`, `admin`) — separate table to prevent privilege escalation. `has_role()` security-definer function.
- **`bookings`** — listing_id, listing_type, user_id (nullable for guests), guest_name, guest_email, start_date, end_date, days, total, status.
- **`partner_applications`** — full_name, email, phone, service_type (driver/villa_owner/vehicle_owner), location_lat, location_lng, location_label, document_url, status (pending/approved/rejected), notes, user_id.
- **`trip_plans`** — user_id (nullable), regions (jsonb), notes, contact_email.
- **`testimonials`** — name, avatar_url, rating, text, location, published.
- **Storage bucket `partner-documents`** (private) for NIC/vehicle papers; bucket `avatars` (public).
- **RLS:** users see/edit their own bookings/applications; admins (via `has_role`) see all; testimonials are public-read.

Auth: enable email/password + Google OAuth. Add `/login` and `/signup` routes (only used for partner + admin login). Public flows (booking, trip plan, partner apply) work as guest too.

## Phase 2 — Home Page Overhaul (`/`)

Add below existing hero+explore sections:

- **Why LuxeLanka** trust section: 24/7 on-ground support, local expertise, transparent pricing, verified hosts (4 glass cards w/ icons).
- **SEO content blocks**: 3 alternating image/text rows — "Self-drive Tuk-tuk Rentals", "Luxury Villas in Sri Lanka", "Professional Chauffeur Services". Each ~150 words, keyword-rich, with internal links to `/plan`.
- **Destination Deep-Dive**: Sigiriya, Ella, Galle, Kandy cards with "Best time to visit" and "Must-see highlights" bullets. Click → `/plan?region=<slug>`.
- Update `<head>` meta for SEO.

## Phase 3 — Interactive Trip Planner (`/plan`)

- Centered enhanced SVG of Sri Lanka with 6 region paths (Colombo, Kandy, Galle, Ella, Sigiriya, Jaffna).
- Hover: animated arrow + floating glass "Quick Info" tooltip (region name, listing count, price-from).
- Click: smooth-scroll to `#location-detail` showing filtered listings (vehicles + stays) for that region in a grid.
- "Build my trip" form below: select multiple regions, dates, party size, notes → saves to `trip_plans` (works as guest). Toast confirmation.

## Phase 4 — Memories & Moments (`/memories`)

- Hero: "Real journeys, real moments".
- Testimonials grid pulled from `testimonials` table (seeded with 6 entries), avatar + 5-star, masonry-ish layout, framer-motion stagger.
- Video hub: cinematic horizontal slider of YouTube embeds (Sri Lanka travel vlogs — use real public video IDs). Snap-scroll, glass controls, autoplay-on-hover thumbnails.

## Phase 5 — Partner Hub (`/join-us`)

- Hero with value props for Drivers / Villa Owners / Vehicle Owners.
- Tabbed card: **Login** | **Register**.
- Register form: Full Name, Email, Phone, Service Type (dropdown), Document Upload → Supabase Storage (`partner-documents`), Location Pin (mini interactive SVG map — click to set lat/lng + label), Password.
- Submit → creates auth user + inserts `partner_applications` row with `status='pending'`.
- Login → `supabase.auth.signInWithPassword` then redirect to a partner dashboard stub showing application status.
- Zod validation on all fields.

## Phase 6 — Internal Admin (`/internal-admin`)

Hidden, login-gated, requires `admin` role (checked via `has_role`).

- Tabs: **Bookings** | **Partner Applications** | **Trip Plans** | **Listings**.
- Real-time updates via Supabase Realtime channel on each table.
- Approve/Reject partner applications (sets status, grants `partner` role on approve).
- Verify/unverify listings.
- Stats header: totals, pending count, revenue.
- Routes seeded so first admin can be made via SQL note in chat.

## Phase 7 — Navigation Cleanup

- Remove **Admin** and **Host** role-switcher from `TopBar` and remove from `MobileTabBar`.
- New nav: **Explore**, **Trip Planner**, **Memories**, **Partner Hub**, **Sign in** (when logged out) / avatar menu (when logged in).
- Mobile thumb-bar: Explore, Plan, Memories, Trips/Account.
- Keep existing `/bookings` for trip history (now reads from Supabase when logged in, falls back to local store for guests).
- Old `/admin`, `/provider`, `/provider/new` routes: redirect to new equivalents (`/internal-admin`, `/join-us`).

## Phase 8 — Visual Polish

- Update color tokens in `src/styles.css`: Deep Teal (`oklch(0.35 0.08 195)`), Sandy Gold (`oklch(0.78 0.13 80)`), Tropical Green (`oklch(0.55 0.16 150)`). Refresh gradients & shadows.
- Framer-motion: scroll-triggered fade-up on all new sections, hover-lift on cards, layout animations on tab switches.
- Replace existing `MapView` stylized SVG with the same enhanced one used in `/plan` (consistency). **Note**: a real Google Maps integration was discussed previously but is not part of this request — sticking with the premium stylized SVG to avoid an API-key dependency. I'll leave the existing MapView as-is on `/` and ship the upgraded interactive map on `/plan`.

---

## Technical Details

**Stack additions:** none new — uses existing `@supabase/supabase-js`, `framer-motion`, `lucide-react`, `zod`, `react-hook-form`.

**Server functions** (`createServerFn` in `src/lib/*.functions.ts`):
- `submitBooking`, `submitPartnerApplication`, `submitTripPlan` — public (no auth middleware), use `supabaseAdmin` with strict Zod validation.
- `getMyBookings`, `getMyApplication` — `requireSupabaseAuth`.
- `adminListAll`, `adminApprovePartner`, `adminVerifyListing` — `requireSupabaseAuth` + role check.

**Realtime:** `ALTER PUBLICATION supabase_realtime ADD TABLE …` for bookings, partner_applications, trip_plans.

**Routing:** TanStack file-based; new files `routes/plan.tsx`, `routes/memories.tsx`, `routes/join-us.tsx`, `routes/internal-admin.tsx`, `routes/login.tsx`, `routes/signup.tsx`. Old routes converted to redirects.

**SEO:** every new route gets unique `head()` with title, description, og:title, og:description.

---

## What I'd like to confirm before building

This is roughly 12–15 new/modified files plus a multi-table migration. I'll proceed top-to-bottom (Phase 1 → 8). If you'd rather I split it across messages, say so; otherwise approve and I'll start with the migration.
