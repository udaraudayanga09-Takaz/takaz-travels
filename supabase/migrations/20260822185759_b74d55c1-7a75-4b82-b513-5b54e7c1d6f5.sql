CREATE TABLE public.sub_places (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_slug text NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  tagline text,
  description text,
  image_url text,
  media_urls text[] NOT NULL DEFAULT '{}',
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (parent_slug, slug)
);
GRANT SELECT ON public.sub_places TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sub_places TO authenticated;
GRANT ALL ON public.sub_places TO service_role;
ALTER TABLE public.sub_places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published sub places" ON public.sub_places FOR SELECT TO anon, authenticated USING (published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert sub places" ON public.sub_places FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update sub places" ON public.sub_places FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete sub places" ON public.sub_places FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_sub_places_updated_at BEFORE UPDATE ON public.sub_places FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.additional_places ADD COLUMN IF NOT EXISTS media_urls text[] NOT NULL DEFAULT '{}';