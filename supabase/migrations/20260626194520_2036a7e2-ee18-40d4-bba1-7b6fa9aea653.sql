
-- Profile verification fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS verified_tourist boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS licence_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS passport_url text,
  ADD COLUMN IF NOT EXISTS idp_url text;

-- Allow bookings to be created with status 'pending'
-- (policy already permits inserts with auth.uid() = user_id; no change needed for status)

-- Identity docs storage policies — owner folder access
CREATE POLICY "identity-docs owner read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'identity-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "identity-docs owner insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'identity-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "identity-docs owner update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'identity-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "identity-docs owner delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'identity-docs' AND auth.uid()::text = (storage.foldername(name))[1]);
