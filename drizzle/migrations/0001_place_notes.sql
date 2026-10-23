CREATE TABLE public.place_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_slug text NOT NULL,
  spot_name text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (place_slug, spot_name)
);
GRANT SELECT ON public.place_notes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.place_notes TO authenticated;
GRANT ALL ON public.place_notes TO service_role;
ALTER TABLE public.place_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view place notes" ON public.place_notes FOR SELECT USING (true);
CREATE POLICY "Admins insert place notes" ON public.place_notes FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update place notes" ON public.place_notes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete place notes" ON public.place_notes FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));