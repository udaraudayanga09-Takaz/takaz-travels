
-- top_destinations
CREATE TABLE public.top_destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  category text NOT NULL CHECK (category IN ('top_ranked','hidden_gem')),
  tagline text,
  description text,
  image_url text,
  trip_rank int,
  bookings_count int NOT NULL DEFAULT 0,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.top_destinations TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.top_destinations TO authenticated;
GRANT ALL ON public.top_destinations TO service_role;
ALTER TABLE public.top_destinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "top_destinations public read" ON public.top_destinations FOR SELECT USING (true);
CREATE POLICY "top_destinations admin insert" ON public.top_destinations FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "top_destinations admin update" ON public.top_destinations FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "top_destinations admin delete" ON public.top_destinations FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_top_destinations_updated BEFORE UPDATE ON public.top_destinations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- additional_places
CREATE TABLE public.additional_places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  tagline text,
  description text,
  image_url text,
  published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.additional_places TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.additional_places TO authenticated;
GRANT ALL ON public.additional_places TO service_role;
ALTER TABLE public.additional_places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "additional_places public read published" ON public.additional_places FOR SELECT USING (published = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "additional_places admin insert" ON public.additional_places FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "additional_places admin update" ON public.additional_places FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "additional_places admin delete" ON public.additional_places FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_additional_places_updated BEFORE UPDATE ON public.additional_places FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
