
-- 1. Bookings: require auth, bind to user_id
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
CREATE POLICY "Authenticated users create own bookings" ON public.bookings
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND guest_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(guest_name) BETWEEN 1 AND 200
  );

-- 2. Trip plans: require auth, bind to user_id
DROP POLICY IF EXISTS "Anyone can submit trip plan" ON public.trip_plans;
CREATE POLICY "Authenticated users submit own trip plan" ON public.trip_plans
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND contact_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );

-- 3. partner-documents: restrict upload to authenticated user's own folder
DROP POLICY IF EXISTS "Anyone can upload partner docs" ON storage.objects;
CREATE POLICY "Users upload own partner docs" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'partner-documents'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

-- 4. avatars bucket: owner-folder scoped policies
CREATE POLICY "Avatars readable by authenticated" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'avatars');
CREATE POLICY "Users upload own avatar" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );
CREATE POLICY "Users update own avatar" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );
CREATE POLICY "Users delete own avatar" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

-- 5. blog-covers: remove broad listing policy (direct public URLs still work)
DROP POLICY IF EXISTS "Blog covers are publicly readable" ON storage.objects;

-- 6. Restrict admin/auth-scoped policies to {authenticated} instead of {public}
-- user_roles
DROP POLICY IF EXISTS "Users view own roles" ON public.user_roles;
CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins view all roles" ON public.user_roles;
CREATE POLICY "Admins view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- profiles
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- bookings
DROP POLICY IF EXISTS "Users view own bookings" ON public.bookings;
CREATE POLICY "Users view own bookings" ON public.bookings
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins view all bookings" ON public.bookings;
CREATE POLICY "Admins view all bookings" ON public.bookings
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins update bookings" ON public.bookings;
CREATE POLICY "Admins update bookings" ON public.bookings
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- partner_applications
DROP POLICY IF EXISTS "Users view own application" ON public.partner_applications;
CREATE POLICY "Users view own application" ON public.partner_applications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins view all applications" ON public.partner_applications;
CREATE POLICY "Admins view all applications" ON public.partner_applications
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins update applications" ON public.partner_applications;
CREATE POLICY "Admins update applications" ON public.partner_applications
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- trip_plans
DROP POLICY IF EXISTS "Users view own trip plans" ON public.trip_plans;
CREATE POLICY "Users view own trip plans" ON public.trip_plans
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins view all trip plans" ON public.trip_plans;
CREATE POLICY "Admins view all trip plans" ON public.trip_plans
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- testimonials admin
DROP POLICY IF EXISTS "Admins manage testimonials" ON public.testimonials;
CREATE POLICY "Admins manage testimonials" ON public.testimonials
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- storage partner-docs admin/owner reads
DROP POLICY IF EXISTS "Admins read partner docs" ON storage.objects;
CREATE POLICY "Admins read partner docs" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'partner-documents' AND has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Users read own partner docs" ON storage.objects;
CREATE POLICY "Users read own partner docs" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'partner-documents'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );
