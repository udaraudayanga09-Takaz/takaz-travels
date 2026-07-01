
-- 1) Restrict passport_url/idp_url column access on profiles
REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT SELECT (id, full_name, avatar_url, verified_tourist, licence_verified, created_at, updated_at)
  ON public.profiles TO authenticated;

-- Owner-only helper to read own verification/document URLs
CREATE OR REPLACE FUNCTION public.get_my_verification()
RETURNS TABLE(verified_tourist boolean, licence_verified boolean, passport_url text, idp_url text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT verified_tourist, licence_verified, passport_url, idp_url
  FROM public.profiles WHERE id = auth.uid();
$$;
REVOKE ALL ON FUNCTION public.get_my_verification() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_verification() TO authenticated;

-- 2) provider_bank_accounts owner write policies (writes still primarily via RPC)
CREATE POLICY "Owners insert own bank row" ON public.provider_bank_accounts
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners update own bank row" ON public.provider_bank_accounts
  FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners delete own bank row" ON public.provider_bank_accounts
  FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- 3) trip_plans owner update/delete
CREATE POLICY "Owners update own trip plan" ON public.trip_plans
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners delete own trip plan" ON public.trip_plans
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 4) Lock down SECURITY DEFINER functions
-- Trigger-only functions: revoke all direct EXECUTE
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_place_likes_count() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_listing_review_stats() FROM PUBLIC, anon, authenticated;

-- Callable helpers: revoke anon; authenticated only
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

REVOKE ALL ON FUNCTION public.upsert_bank_account(text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.upsert_bank_account(text, text, text, text) TO authenticated;

REVOKE ALL ON FUNCTION public.get_unavailable_dates(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_unavailable_dates(text) TO authenticated;
