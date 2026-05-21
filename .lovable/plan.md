# Takaz Platform Overhaul Plan

A large, multi-area upgrade. I'll execute it in 6 phases matching your blueprint.

## 1. Rebrand → "Takaz" + Theme Toggle
- Copy uploaded `TT_LOGO.png` to `src/assets/takaz-logo.png`.
- Global find/replace of "LuxeLanka" and "Takaz Travels" → "Takaz" across routes, Nav, footer, meta tags, `__root.tsx` head, README-style strings.
- Replace text/SVG logos in `Nav.tsx`, admin shell, partner pages, footer with the green logo on a black chip (logo's native bg).
- Add light theme tokens in `src/styles.css` (currently only dark). Wrap with `:root` (dark default) + `.light` overrides keeping the glowing-green accent palette.
- Build `ThemeToggle.tsx` (sun/moon icon, framer-motion crossfade). Place top-right of `TopBar`. Persist choice in `localStorage`, toggle `.light` class on `<html>`.

## 2. `/verify-email` Route
- New route `src/routes/verify-email.tsx`: glassmorphic card, animated SVG envelope-with-glow, 6-digit OTP input (shadcn `InputOTP`), 60s countdown "Resend link" button.
- Wired to Supabase `auth.verifyOtp` and `auth.resend`. Linked from signup success.

## 3. Home Page Architecture
- Tabbed marketplace grid: `[AirBNB Stays] | [Vehicles & Rentals]` using shadcn `Tabs`, filtering `LISTINGS` by `type`.
- New `CitySelect.tsx`: scrollable shadcn `Select` with all 130+ Sri Lankan cities sorted A→Z (dedupe duplicates from your list like "Balapitiya", "Seeduwa"). Replaces current 4-city chip filter on home + listings filter.
- Update `Listing.city` type from union to `string`.

## 4. TripAdvisor Ranked Rows
- New `PopularPlaces.tsx`: 2 Airbnb-style horizontal sliders ("Top Stays in Sri Lanka", "Hidden Gems") inserted below Google Map on home.
- Each card has a "Ranked by TripAdvisor" badge.
- Stubbed `fetchTripAdvisorRankings()` function with commented-out fetch to TripAdvisor Content API + cron note. Ranking falls back to a static curated list seeded from booking volume.

## 5. Admin Verification Queue
- Extend `/admin` (rename internally to "Verification Queue") with split-pane layout: list left, full-detail inspector right.
- Inspector shows ALL `partner_applications` fields: legal name, email/phone, NIC document (image preview from `partner-documents` bucket via signed URL), service type, coordinates with mini static map, notes, timestamps.
- Approve → updates `status='approved'` + pushes listing live (sets a `published=true` flag — needs migration to add the column to `partner_applications`).
- Reject → updates `status='rejected'` + records reason; notification dispatch stubbed (Supabase row → frontend toast on partner dashboard).

## 6. Planner Terrain Map
- Replace abstract SVG canvas in `SriLankaMap.tsx` with a real terrain map: generate a high-res topographic illustration of Sri Lanka via image gen, place as background image, keep existing reactive pin coordinates layered on top.

## Technical Details
- **DB migration**: add `published boolean default false` and `reject_reason text` to `partner_applications`.
- **Styles**: introduce `.light` variant tokens, theme-aware glass utilities.
- **Type changes**: `Listing.city: string` (loosen); update all usages.
- **No new packages required** (uses existing shadcn, framer-motion).
- **Auth**: email verification uses existing Supabase auth — no auto-confirm change needed.

## Out of scope / assumptions
- TripAdvisor API requires partner credentials — left as a documented stub with sample data. Ask if you'd like me to wire a real key now.
- Notification dispatch on reject = in-app only (no email). Confirm if you want SendGrid/Resend.
- Light-mode color refinement may need a follow-up pass once you see it live.

Approve and I'll ship phases 1→6 in order.
