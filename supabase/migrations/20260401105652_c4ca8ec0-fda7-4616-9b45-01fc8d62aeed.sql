
-- Create subscription_plans table
CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  price_monthly numeric NOT NULL DEFAULT 0,
  price_yearly numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'XOF',
  features jsonb DEFAULT '[]'::jsonb,
  allowed_modules jsonb DEFAULT '[]'::jsonb,
  has_ai_access boolean DEFAULT false,
  has_full_ai boolean DEFAULT false,
  max_products integer DEFAULT NULL,
  max_sales integer DEFAULT NULL,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_subscriptions table
CREATE TABLE public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.subscription_plans(id),
  status text NOT NULL DEFAULT 'trial',
  trial_start timestamptz DEFAULT now(),
  trial_end timestamptz DEFAULT (now() + interval '4 days'),
  subscription_start timestamptz,
  subscription_end timestamptz,
  payment_method text DEFAULT 'manual',
  stripe_subscription_id text,
  stripe_customer_id text,
  activated_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS for subscription_plans - everyone can read, admins can manage
CREATE POLICY "Anyone can read active plans" ON public.subscription_plans
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage plans" ON public.subscription_plans
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS for user_subscriptions
CREATE POLICY "Users can view own subscription" ON public.user_subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscriptions" ON public.user_subscriptions
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert subscriptions" ON public.user_subscriptions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Insert default plans
INSERT INTO public.subscription_plans (name, display_name, description, price_monthly, price_yearly, features, allowed_modules, has_ai_access, has_full_ai, sort_order) VALUES
('trial', 'Essai Gratuit', 'Accès complet pendant 4 jours', 0, 0, 
 '["Accès complet 4 jours", "Tous les modules", "IA limitée"]'::jsonb,
 '["dashboard","stock","sales","clients","purchases","suppliers","promotions","returns","export","invoices","reports","settings"]'::jsonb,
 true, false, 0),
('pro', 'Pro', 'Pour les professionnels', 0, 0,
 '["Tous les modules", "Support prioritaire", "IA basique", "Export illimité"]'::jsonb,
 '["dashboard","stock","sales","clients","purchases","suppliers","promotions","returns","export","invoices","reports","settings"]'::jsonb,
 true, false, 1),
('premium', 'Premium', 'Accès illimité à toutes les fonctionnalités', 0, 0,
 '["Tous les modules", "IA complète", "Analytics avancés", "Support VIP", "Export illimité", "Rapports intelligents"]'::jsonb,
 '["dashboard","stock","sales","clients","purchases","suppliers","promotions","returns","export","invoices","reports","settings"]'::jsonb,
 true, true, 2);

-- Function to auto-create trial subscription on user signup
CREATE OR REPLACE FUNCTION public.create_trial_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  trial_plan_id uuid;
BEGIN
  SELECT id INTO trial_plan_id FROM subscription_plans WHERE name = 'trial' LIMIT 1;
  
  INSERT INTO user_subscriptions (user_id, plan_id, status, trial_start, trial_end)
  VALUES (NEW.id, trial_plan_id, 'trial', now(), now() + interval '4 days')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger to create trial on new user
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_trial_subscription();
