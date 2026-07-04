
-- 1) New table for identity docs
CREATE TABLE public.profile_identity_docs (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  passport_url text,
  idp_url text,
  verified_tourist boolean NOT NULL DEFAULT false,
  licence_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_identity_docs TO authenticated;
GRANT ALL ON public.profile_identity_docs TO service_role;

ALTER TABLE public.profile_identity_docs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner reads own identity docs"
  ON public.profile_identity_docs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins read all identity docs"
  ON public.profile_identity_docs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owner inserts own identity docs"
  ON public.profile_identity_docs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner updates own identity docs"
  ON public.profile_identity_docs FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_profile_identity_docs_updated_at
  BEFORE UPDATE ON public.profile_identity_docs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Migrate existing identity data out of profiles
INSERT INTO public.profile_identity_docs (user_id, passport_url, idp_url, verified_tourist, licence_verified)
SELECT id, passport_url, idp_url, verified_tourist, licence_verified
FROM public.profiles
WHERE passport_url IS NOT NULL
   OR idp_url IS NOT NULL
   OR verified_tourist = true
   OR licence_verified = true
ON CONFLICT (user_id) DO NOTHING;

-- 3) Drop the exposed columns from profiles
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS passport_url,
  DROP COLUMN IF EXISTS idp_url,
  DROP COLUMN IF EXISTS verified_tourist,
  DROP COLUMN IF EXISTS licence_verified;

-- 4) Replace get_my_verification: SECURITY INVOKER, reads new table via RLS
CREATE OR REPLACE FUNCTION public.get_my_verification()
RETURNS TABLE(verified_tourist boolean, licence_verified boolean, passport_url text, idp_url text)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
  SELECT verified_tourist, licence_verified, passport_url, idp_url
  FROM public.profile_identity_docs WHERE user_id = auth.uid();
$function$;

-- 5) Storage: public read for blog-covers
CREATE POLICY "blog-covers public read"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'blog-covers');

-- 6) Storage: admin read for identity-docs
CREATE POLICY "Admins read identity-docs"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'identity-docs' AND public.has_role(auth.uid(), 'admin'::app_role));
