
-- Travel blogs table
CREATE TABLE public.travel_blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  cover_url TEXT,
  place_slug TEXT,
  instagram_url TEXT,
  twitter_url TEXT,
  youtube_url TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_travel_blogs_created ON public.travel_blogs (created_at DESC);
CREATE INDEX idx_travel_blogs_user ON public.travel_blogs (user_id);

ALTER TABLE public.travel_blogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read travel blogs"
  ON public.travel_blogs FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create their own blogs"
  ON public.travel_blogs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors can update their own blogs"
  ON public.travel_blogs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors can delete their own blogs"
  ON public.travel_blogs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER travel_blogs_updated_at
  BEFORE UPDATE ON public.travel_blogs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for blog covers
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-covers', 'blog-covers', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Blog covers are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-covers');

CREATE POLICY "Users upload their own blog covers"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'blog-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update their own blog covers"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'blog-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete their own blog covers"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'blog-covers' AND auth.uid()::text = (storage.foldername(name))[1]);
