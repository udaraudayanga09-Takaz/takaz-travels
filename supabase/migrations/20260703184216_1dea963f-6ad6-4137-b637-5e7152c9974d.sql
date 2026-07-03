
ALTER TABLE public.travel_blogs ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS travel_blogs_published_created_idx ON public.travel_blogs (published, created_at DESC);

-- Replace overly-permissive public SELECT with a moderated one
DROP POLICY IF EXISTS "Anyone can read travel blogs" ON public.travel_blogs;

CREATE POLICY "Anyone can read published blogs"
  ON public.travel_blogs FOR SELECT
  USING (published = true);

CREATE POLICY "Authors can read their own blogs"
  ON public.travel_blogs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all blogs"
  ON public.travel_blogs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update any blog"
  ON public.travel_blogs FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete any blog"
  ON public.travel_blogs FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Prevent authors from self-publishing (only admin can flip published=true)
DROP POLICY IF EXISTS "Authors can update their own blogs" ON public.travel_blogs;
CREATE POLICY "Authors can update their own drafts"
  ON public.travel_blogs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND published = false);
