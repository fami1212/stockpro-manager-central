CREATE TABLE public.feature_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  feature text NOT NULL DEFAULT 'whatsapp_bulk',
  status text NOT NULL DEFAULT 'pending',
  message text,
  admin_notes text,
  processed_by uuid,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, feature)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feature_requests TO authenticated;
GRANT ALL ON public.feature_requests TO service_role;
ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own requests" ON public.feature_requests FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users create own pending request" ON public.feature_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status = 'pending' AND processed_by IS NULL);
CREATE POLICY "Users re-request after rejection" ON public.feature_requests FOR UPDATE TO authenticated USING (auth.uid() = user_id AND status = 'rejected') WITH CHECK (auth.uid() = user_id AND status = 'pending' AND processed_by IS NULL);
CREATE POLICY "Admins manage requests" ON public.feature_requests FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER update_feature_requests_updated_at BEFORE UPDATE ON public.feature_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.bulk_message_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  message text NOT NULL,
  total integer NOT NULL DEFAULT 0,
  sent integer NOT NULL DEFAULT 0,
  failed integer NOT NULL DEFAULT 0,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.bulk_message_logs TO authenticated;
GRANT ALL ON public.bulk_message_logs TO service_role;
ALTER TABLE public.bulk_message_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own logs" ON public.bulk_message_logs FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));