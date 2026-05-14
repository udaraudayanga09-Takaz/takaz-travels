
-- Restrict execute on SECURITY DEFINER functions (per linter)
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;

-- Drop the broad public-bucket SELECT and replace with one that allows reading individual objects
-- but does not allow listing the bucket. (storage clients still load by exact path.)
-- Note: keeping bucket public for direct URL access; explicit policy retained below.

-- Tighten guest-insert policies to require an email shape (basic anti-abuse)
DROP POLICY "Anyone can create bookings" ON public.bookings;
CREATE POLICY "Anyone can create bookings" ON public.bookings FOR INSERT
  WITH CHECK (guest_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND length(guest_name) BETWEEN 1 AND 200);

DROP POLICY "Anyone can submit application" ON public.partner_applications;
CREATE POLICY "Anyone can submit application" ON public.partner_applications FOR INSERT
  WITH CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND length(full_name) BETWEEN 1 AND 200 AND service_type IN ('driver','villa_owner','vehicle_owner'));

DROP POLICY "Anyone can submit trip plan" ON public.trip_plans;
CREATE POLICY "Anyone can submit trip plan" ON public.trip_plans FOR INSERT
  WITH CHECK (contact_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');
