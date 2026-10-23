CREATE TABLE public.spot_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_slug text NOT NULL,
  spot_name text NOT NULL,
  image_url text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (place_slug, spot_name)
);
GRANT SELECT ON public.spot_photos TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.spot_photos TO authenticated;
GRANT ALL ON public.spot_photos TO service_role;
ALTER TABLE public.spot_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view spot photos" ON public.spot_photos FOR SELECT USING (true);
CREATE POLICY "Admins insert spot photos" ON public.spot_photos FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update spot photos" ON public.spot_photos FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete spot photos" ON public.spot_photos FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));