
-- ROLES
CREATE TYPE public.app_role AS ENUM ('tourist', 'partner', 'admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + tourist role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'tourist');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- BOOKINGS
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  listing_id TEXT NOT NULL,
  listing_type TEXT NOT NULL,
  listing_title TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INTEGER NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Users view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all bookings" ON public.bookings FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update bookings" ON public.bookings FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- PARTNER APPLICATIONS
CREATE TABLE public.partner_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service_type TEXT NOT NULL,
  location_lat NUMERIC,
  location_lng NUMERIC,
  location_label TEXT,
  document_url TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_partner_applications_updated_at BEFORE UPDATE ON public.partner_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Anyone can submit application" ON public.partner_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users view own application" ON public.partner_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all applications" ON public.partner_applications FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update applications" ON public.partner_applications FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- TRIP PLANS
CREATE TABLE public.trip_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  contact_email TEXT NOT NULL,
  contact_name TEXT,
  regions JSONB NOT NULL DEFAULT '[]'::jsonb,
  start_date DATE,
  end_date DATE,
  party_size INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.trip_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit trip plan" ON public.trip_plans FOR INSERT WITH CHECK (true);
CREATE POLICY "Users view own trip plans" ON public.trip_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all trip plans" ON public.trip_plans FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- TESTIMONIALS
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar_url TEXT,
  rating INTEGER NOT NULL DEFAULT 5,
  text TEXT NOT NULL,
  location TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published testimonials are public" ON public.testimonials FOR SELECT USING (published = true);
CREATE POLICY "Admins manage testimonials" ON public.testimonials FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed testimonials
INSERT INTO public.testimonials (name, rating, text, location, avatar_url) VALUES
  ('Emma Larsson', 5, 'The tuk-tuk was immaculate and the team met us at Colombo airport. Drove the south coast in three days — best decision of our trip.', 'Stockholm, SE', 'https://i.pravatar.cc/150?img=47'),
  ('Marcus Chen', 5, 'Booked a luxury SUV with chauffeur for a week. Punctual, multilingual, knew every shortcut through the hill country.', 'Singapore', 'https://i.pravatar.cc/150?img=12'),
  ('Sofia Romano', 5, 'The cliffside villa in Galle was unreal. Sunrise yoga over the Indian Ocean. The host left us king coconuts every morning.', 'Milan, IT', 'https://i.pravatar.cc/150?img=45'),
  ('James O''Brien', 5, 'Their 24/7 support saved us when our scooter had a flat in Ella. A new one was delivered within an hour.', 'Dublin, IE', 'https://i.pravatar.cc/150?img=14'),
  ('Aisha Rahman', 5, 'Transparent pricing, no hidden fees, and our villa host felt like a friend by day two. Already planning a return trip.', 'Dubai, UAE', 'https://i.pravatar.cc/150?img=49'),
  ('Liam Bouchard', 5, 'Used the Trip Planner to map Sigiriya → Kandy → Ella. The whole itinerary synced — vehicle, stays, everything.', 'Montreal, CA', 'https://i.pravatar.cc/150?img=15');

-- STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('partner-documents', 'partner-documents', false);

CREATE POLICY "Avatars are public" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users upload own avatar" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can upload partner docs" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'partner-documents');
CREATE POLICY "Admins read partner docs" ON storage.objects FOR SELECT
  USING (bucket_id = 'partner-documents' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users read own partner docs" ON storage.objects FOR SELECT
  USING (bucket_id = 'partner-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.partner_applications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_plans;
