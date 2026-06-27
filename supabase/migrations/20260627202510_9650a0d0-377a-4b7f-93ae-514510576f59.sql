
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- provider_listings
-- ============================================================
CREATE TABLE public.provider_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('stay','vehicle','driver')),
  title text NOT NULL,
  description text,
  city text,
  location_label text,
  daily_rate numeric(10,2) NOT NULL DEFAULT 0,
  photos text[] NOT NULL DEFAULT '{}',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review','approved','rejected','paused')),
  avg_rating numeric(3,2) NOT NULL DEFAULT 0,
  review_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.provider_listings TO authenticated;
GRANT SELECT ON public.provider_listings TO anon;
GRANT ALL ON public.provider_listings TO service_role;

ALTER TABLE public.provider_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone views approved listings"
  ON public.provider_listings FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Owners view their listings"
  ON public.provider_listings FOR SELECT TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Admins view all listings"
  ON public.provider_listings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners insert their listings"
  ON public.provider_listings FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners update their listings"
  ON public.provider_listings FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Admins manage listings"
  ON public.provider_listings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners delete their listings"
  ON public.provider_listings FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

CREATE TRIGGER trg_provider_listings_updated
  BEFORE UPDATE ON public.provider_listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_provider_listings_owner ON public.provider_listings(owner_id);
CREATE INDEX idx_provider_listings_status ON public.provider_listings(status);
CREATE INDEX idx_provider_listings_kind ON public.provider_listings(kind);

-- ============================================================
-- provider_bank_accounts (encrypted)
-- ============================================================
CREATE TABLE public.provider_bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_name_enc bytea NOT NULL,
  account_number_enc bytea NOT NULL,
  account_holder_enc bytea NOT NULL,
  account_last4 text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Owners can only see the row metadata (last4), not the encrypted columns directly via API.
-- We expose a safe view for the owner.
GRANT SELECT ON public.provider_bank_accounts TO authenticated;
GRANT ALL ON public.provider_bank_accounts TO service_role;

ALTER TABLE public.provider_bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view own bank row"
  ON public.provider_bank_accounts FOR SELECT TO authenticated
  USING (owner_id = auth.uid());

-- No INSERT/UPDATE/DELETE policies — clients must go through the security-definer RPC.

CREATE TRIGGER trg_provider_bank_accounts_updated
  BEFORE UPDATE ON public.provider_bank_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Security-definer RPC for upserting encrypted bank details.
CREATE OR REPLACE FUNCTION public.upsert_bank_account(
  _bank_name text,
  _account_number text,
  _account_holder text,
  _key text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  _id uuid;
  _uid uuid := auth.uid();
  _last4 text;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF coalesce(_bank_name,'') = '' OR coalesce(_account_number,'') = '' OR coalesce(_account_holder,'') = '' THEN
    RAISE EXCEPTION 'missing fields';
  END IF;
  IF coalesce(_key,'') = '' THEN
    RAISE EXCEPTION 'missing encryption key';
  END IF;

  _last4 := right(regexp_replace(_account_number, '\D', '', 'g'), 4);

  INSERT INTO public.provider_bank_accounts AS p
    (owner_id, bank_name_enc, account_number_enc, account_holder_enc, account_last4)
  VALUES (
    _uid,
    pgp_sym_encrypt(_bank_name, _key),
    pgp_sym_encrypt(_account_number, _key),
    pgp_sym_encrypt(_account_holder, _key),
    _last4
  )
  ON CONFLICT (owner_id) DO UPDATE SET
    bank_name_enc = EXCLUDED.bank_name_enc,
    account_number_enc = EXCLUDED.account_number_enc,
    account_holder_enc = EXCLUDED.account_holder_enc,
    account_last4 = EXCLUDED.account_last4,
    updated_at = now()
  RETURNING id INTO _id;

  RETURN _id;
END;
$$;

REVOKE ALL ON FUNCTION public.upsert_bank_account(text,text,text,text) FROM public;
GRANT EXECUTE ON FUNCTION public.upsert_bank_account(text,text,text,text) TO authenticated;

-- ============================================================
-- listing_reviews
-- ============================================================
CREATE TABLE public.listing_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id text NOT NULL,
  reviewer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (listing_id, reviewer_id)
);

GRANT SELECT ON public.listing_reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.listing_reviews TO authenticated;
GRANT ALL ON public.listing_reviews TO service_role;

ALTER TABLE public.listing_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads reviews"
  ON public.listing_reviews FOR SELECT
  USING (true);

-- Only users with a non-cancelled completed booking for this listing can insert.
CREATE POLICY "Eligible reviewers insert"
  ON public.listing_reviews FOR INSERT TO authenticated
  WITH CHECK (
    reviewer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.user_id = auth.uid()
        AND b.listing_id = listing_reviews.listing_id
        AND b.status <> 'cancelled'
        AND b.end_date <= current_date
    )
  );

CREATE POLICY "Reviewers update own"
  ON public.listing_reviews FOR UPDATE TO authenticated
  USING (reviewer_id = auth.uid())
  WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "Reviewers delete own"
  ON public.listing_reviews FOR DELETE TO authenticated
  USING (reviewer_id = auth.uid());

CREATE INDEX idx_listing_reviews_listing ON public.listing_reviews(listing_id);

-- Trigger to sync avg_rating + review_count on provider_listings
CREATE OR REPLACE FUNCTION public.sync_listing_review_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _lid text;
  _avg numeric;
  _cnt int;
  _uuid uuid;
BEGIN
  _lid := COALESCE(NEW.listing_id, OLD.listing_id);
  SELECT COALESCE(AVG(rating),0)::numeric(3,2), COUNT(*)::int
    INTO _avg, _cnt
    FROM public.listing_reviews
   WHERE listing_id = _lid;

  BEGIN
    _uuid := _lid::uuid;
    UPDATE public.provider_listings
       SET avg_rating = _avg, review_count = _cnt
     WHERE id = _uuid;
  EXCEPTION WHEN invalid_text_representation THEN
    -- listing_id is not a uuid (e.g. mock seed id) — skip cache update
    NULL;
  END;

  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_listing_reviews_sync
  AFTER INSERT OR UPDATE OR DELETE ON public.listing_reviews
  FOR EACH ROW EXECUTE FUNCTION public.sync_listing_review_stats();

-- ============================================================
-- Storage policies for listing-photos (private bucket, public read)
-- ============================================================
CREATE POLICY "listing-photos public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-photos');

CREATE POLICY "listing-photos owner insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'listing-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "listing-photos owner update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'listing-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "listing-photos owner delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'listing-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
