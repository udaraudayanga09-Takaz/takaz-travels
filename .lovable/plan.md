## Goal

Add a community "submit a place" flow with likes, show user memories under each place, link to nearby/popular places, swap the trip planner map background to the uploaded satellite image of Sri Lanka with precisely positioned pins, and let admins add new pinned locations from the admin page.

## 1. Database (single migration)

New tables:

- `user_places` — community submissions
  - `id uuid pk`, `created_by uuid` (auth.users), `name text`, `slug text unique`, `region text`, `summary text`, `body text`, `cover_url text`, `lat numeric`, `lng numeric`, `cx numeric`, `cy numeric` (map %), `status text default 'pending'` (`pending`/`approved`/`rejected`), `likes_count int default 0`, `created_at`, `updated_at`
- `place_likes` — one row per user per place
  - `id`, `place_slug text` (covers both built-in and user_places), `user_id uuid`, unique(`place_slug`, `user_id`), `created_at`
- `map_pins` — admin-managed pins shown on the Sri Lanka map
  - `id`, `name`, `slug`, `cx numeric`, `cy numeric`, `blurb text`, `image_url text`, `created_at`

RLS:
- `user_places`: anyone can `SELECT` where `status='approved'`; creator can SELECT own; authenticated can INSERT own; admins can UPDATE/DELETE.
- `place_likes`: authenticated can INSERT/DELETE own; anyone can SELECT counts.
- `map_pins`: anyone SELECT; only admins INSERT/UPDATE/DELETE.

Trigger: maintain `user_places.likes_count` from `place_likes` insert/delete.

Storage bucket: reuse `blog-covers` for cover images.

## 2. New routes

- `/places/submit` — authenticated form: name, region, summary, body, cover upload, click-on-map to set `cx/cy`. POSTs to `user_places` (status=pending).
- `/places/community` — public list of approved community places sorted by `likes_count desc`, with like button.
- Extend `/places/$slug` to:
  - Show "Travellers' memories" section: blogs from `travel_blogs` where `place_slug = slug`.
  - Show "Nearby & popular" section: 3 closest built-in places (by cx/cy distance) + top-liked community places.
  - Add like button (writes to `place_likes`).

## 3. Admin

In `/admin`, add a "Map pins" tab:
- List existing `map_pins` + built-in `REGIONS`.
- Form to add a pin: name, slug, blurb, image upload, click on the same Sri Lanka map to set `cx/cy`.
- Approve/reject queue for `user_places`.

## 4. Sri Lanka map upgrade

- Save the uploaded satellite image to `src/assets/sri-lanka-satellite.jpg`.
- Update `SriLankaMap.tsx`:
  - Swap background to the new image.
  - Recalibrate existing `REGIONS` `cx/cy` to match real coordinates on the new image (Colombo ~24/68, Kandy ~38/55, Galle ~30/86, Ella ~46/68, Sigiriya ~40/40, Jaffna ~32/8, plus new pins from `map_pins` fetched live).
  - On hover: scale-up the pin, zoom the map slightly toward the hovered point (CSS transform-origin), show enlarged popup with the place's image + name + blurb.
  - On click: navigate to `/places/$slug`.

## 5. Wire-up

- `PopularPlaces` cards already deep-link — add a small "♥ count" badge from `place_likes`.
- Home + plan page consume same `SriLankaMap` so the new background + admin pins appear everywhere.

## Technical notes

- Likes use optimistic UI; unauth users get redirected to `/login`.
- Distance calculation uses simple Euclidean on `cx/cy` percentages — good enough for "nearby".
- All new tables get `auth.uid()`-based RLS; admin checks use existing `has_role(auth.uid(),'admin')`.
- The new map image is large; downscale to ~1200px wide JPG to keep load fast.

Approve to proceed?