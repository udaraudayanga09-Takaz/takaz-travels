
CREATE TABLE public.listing_blocked_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id text NOT NULL,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (listing_id, date)
);
CREATE INDEX listing_blocked_dates_listing_idx ON public.listing_blocked_dates(listing_id);

GRANT SELECT ON public.listing_blocked_dates TO anon, authenticated;
GRANT INSERT, DELETE ON public.listing_blocked_dates TO authenticated;
GRANT ALL ON public.listing_blocked_dates TO service_role;

ALTER TABLE public.listing_blocked_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view blocked dates"
  ON public.listing_blocked_dates FOR SELECT
  USING (true);

CREATE POLICY "Owners insert their own blocks"
  ON public.listing_blocked_dates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners delete their own blocks"
  ON public.listing_blocked_dates FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE OR REPLACE FUNCTION public.get_unavailable_dates(_listing_id text)
RETURNS SETOF date
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT date FROM public.listing_blocked_dates WHERE listing_id = _listing_id
  UNION
  SELECT gs::date
    FROM public.bookings b,
         LATERAL generate_series(b.start_date::date, (b.end_date::date - 1), interval '1 day') gs
   WHERE b.listing_id = _listing_id
     AND b.status IN ('pending','confirmed');
$$;

GRANT EXECUTE ON FUNCTION public.get_unavailable_dates(text) TO anon, authenticated;
