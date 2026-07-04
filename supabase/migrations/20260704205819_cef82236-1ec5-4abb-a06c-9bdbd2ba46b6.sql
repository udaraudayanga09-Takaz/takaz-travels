
CREATE TABLE IF NOT EXISTS public.platform_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'text',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.platform_settings TO anon, authenticated;
GRANT ALL ON public.platform_settings TO service_role;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read settings" ON public.platform_settings;
CREATE POLICY "Public can read settings" ON public.platform_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can update settings" ON public.platform_settings;
CREATE POLICY "Admins can update settings" ON public.platform_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Admins can insert settings" ON public.platform_settings;
CREATE POLICY "Admins can insert settings" ON public.platform_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.platform_settings(key, value, label, kind) VALUES
  ('commission_rate','0.10','Commission rate','decimal'),
  ('whatsapp_number','94712724435','WhatsApp number','text'),
  ('support_email','hello@takaz.travel','Support email','text'),
  ('min_booking_days','1','Minimum booking days','number'),
  ('cancellation_window_days','7','Cancellation window (days)','number'),
  ('payout_delay_days','3','Payout delay (days)','number')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.trip_plans ADD COLUMN IF NOT EXISTS handled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;

-- Admin write policies for testimonials
DROP POLICY IF EXISTS "Admins manage testimonials" ON public.testimonials;
CREATE POLICY "Admins manage testimonials" ON public.testimonials FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Admin update on trip_plans (handled)
DROP POLICY IF EXISTS "Admins update trip plans" ON public.trip_plans;
CREATE POLICY "Admins update trip plans" ON public.trip_plans FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Admin update on bookings
DROP POLICY IF EXISTS "Admins update bookings" ON public.bookings;
CREATE POLICY "Admins update bookings" ON public.bookings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Admin read on profile_identity_docs already exists via previous migration; ensure it
DROP POLICY IF EXISTS "Admins update identity docs" ON public.profile_identity_docs;
CREATE POLICY "Admins update identity docs" ON public.profile_identity_docs FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
