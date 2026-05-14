
DROP POLICY IF EXISTS "Avatars are public" ON storage.objects;
DROP POLICY IF EXISTS "Users upload own avatar" ON storage.objects;
UPDATE storage.buckets SET public = false WHERE id = 'avatars';
