-- Create product_returns table
CREATE TABLE IF NOT EXISTS public.product_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  reason TEXT NOT NULL,
  refund_amount NUMERIC NOT NULL DEFAULT 0 CHECK (refund_amount >= 0),
  refund_method TEXT,
  status TEXT NOT NULL DEFAULT 'En attente' CHECK (status IN ('En attente', 'Approuvé', 'Rejeté', 'Remboursé')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID
);

-- Enable RLS
ALTER TABLE public.product_returns ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can manage own product returns"
  ON public.product_returns
  FOR ALL
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_product_returns_user_id ON public.product_returns(user_id);
CREATE INDEX idx_product_returns_sale_id ON public.product_returns(sale_id);
CREATE INDEX idx_product_returns_product_id ON public.product_returns(product_id);
CREATE INDEX idx_product_returns_status ON public.product_returns(status);

-- Add updated_at trigger
CREATE TRIGGER update_product_returns_updated_at
  BEFORE UPDATE ON public.product_returns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();