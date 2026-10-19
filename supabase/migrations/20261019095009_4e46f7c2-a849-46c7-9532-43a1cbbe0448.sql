CREATE TABLE public.whatsapp_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  client_id uuid,
  client_name text NOT NULL,
  phone text NOT NULL,
  template_name text NOT NULL,
  status text NOT NULL,
  error_message text,
  wa_message_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.whatsapp_sends TO authenticated;
GRANT ALL ON public.whatsapp_sends TO service_role;
ALTER TABLE public.whatsapp_sends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own or admin can read sends" ON public.whatsapp_sends FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE INDEX whatsapp_sends_created_idx ON public.whatsapp_sends (created_at DESC);