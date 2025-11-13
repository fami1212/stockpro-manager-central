-- Créer la table des promotions/remises
CREATE TABLE IF NOT EXISTS public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL CHECK (discount_value >= 0),
  applies_to text NOT NULL CHECK (applies_to IN ('product', 'sale', 'category')),
  target_id uuid,
  min_quantity integer DEFAULT 1,
  min_amount numeric DEFAULT 0,
  start_date date,
  end_date date,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users can manage own promotions"
  ON public.promotions
  FOR ALL
  USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_promotions_user_active ON public.promotions(user_id, is_active);
CREATE INDEX idx_promotions_target ON public.promotions(target_id, applies_to);

-- Add trigger for updated_at
CREATE TRIGGER update_promotions_updated_at
  BEFORE UPDATE ON public.promotions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.promotions IS 'Table pour gérer les promotions et remises configurables';