
-- user_places: community-submitted places
CREATE TABLE public.user_places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  region text,
  summary text,
  body text,
  cover_url text,
  cx numeric,
  cy numeric,
  status text NOT NULL DEFAULT 'pending',
  likes_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_places TO authenticated;
GRANT SELECT ON public.user_places TO anon;
GRANT ALL ON public.user_places TO service_role;

ALTER TABLE public.user_places ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved places are public"
  ON public.user_places FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Authors view own places"
  ON public.user_places FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Admins view all places"
  ON public.user_places FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated submit places"
  ON public.user_places FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins update places"
  ON public.user_places FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete places"
  ON public.user_places FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_user_places_updated_at
  BEFORE UPDATE ON public.user_places
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- place_likes
CREATE TABLE public.place_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_slug text NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (place_slug, user_id)
);
CREATE INDEX place_likes_slug_idx ON public.place_likes(place_slug);

GRANT SELECT, INSERT, DELETE ON public.place_likes TO authenticated;
GRANT SELECT ON public.place_likes TO anon;
GRANT ALL ON public.place_likes TO service_role;

ALTER TABLE public.place_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes are public" ON public.place_likes FOR SELECT USING (true);
CREATE POLICY "Users add own like" ON public.place_likes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users remove own like" ON public.place_likes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Likes-count trigger for user_places
CREATE OR REPLACE FUNCTION public.sync_place_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.user_places SET likes_count = likes_count + 1 WHERE slug = NEW.place_slug;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.user_places SET likes_count = GREATEST(likes_count - 1, 0) WHERE slug = OLD.place_slug;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER place_likes_count_ins
  AFTER INSERT ON public.place_likes
  FOR EACH ROW EXECUTE FUNCTION public.sync_place_likes_count();

CREATE TRIGGER place_likes_count_del
  AFTER DELETE ON public.place_likes
  FOR EACH ROW EXECUTE FUNCTION public.sync_place_likes_count();

-- map_pins: admin-managed
CREATE TABLE public.map_pins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  blurb text,
  image_url text,
  cx numeric NOT NULL,
  cy numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.map_pins TO anon, authenticated;
GRANT ALL ON public.map_pins TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.map_pins TO authenticated;

ALTER TABLE public.map_pins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pins are public" ON public.map_pins FOR SELECT USING (true);
CREATE POLICY "Admins insert pins" ON public.map_pins FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update pins" ON public.map_pins FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete pins" ON public.map_pins FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
