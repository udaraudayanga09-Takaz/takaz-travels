
-- 1. Avatars: scope read to owner folder
DROP POLICY IF EXISTS "Avatars readable by authenticated" ON storage.objects;
CREATE POLICY "Users read own avatar"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- 2. place_likes: restrict SELECT to authenticated
DROP POLICY IF EXISTS "Likes are public" ON public.place_likes;
CREATE POLICY "Likes visible to signed-in users"
ON public.place_likes FOR SELECT TO authenticated
USING (true);

-- 3. blog-covers: drop broad public SELECT policy (public bucket serves via CDN without RLS)
DROP POLICY IF EXISTS "blog-covers public read" ON storage.objects;

-- 4. Revoke EXECUTE from authenticated on internal trigger functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated, anon, public;
REVOKE EXECUTE ON FUNCTION public.sync_place_likes_count() FROM authenticated, anon, public;
REVOKE EXECUTE ON FUNCTION public.sync_listing_review_stats() FROM authenticated, anon, public;
