
-- Créer la table purchase_orders pour les commandes d'achat
CREATE TABLE public.purchase_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reference TEXT NOT NULL,
  supplier_id UUID REFERENCES public.suppliers(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_date DATE,
  status TEXT NOT NULL DEFAULT 'En cours',
  total NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table purchase_order_items pour les articles des commandes d'achat
CREATE TABLE public.purchase_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur purchase_orders
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

-- Politique RLS pour purchase_orders
CREATE POLICY "Users can manage own purchase orders" 
  ON public.purchase_orders 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Activer RLS sur purchase_order_items
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

-- Politique RLS pour purchase_order_items
CREATE POLICY "Users can manage own purchase order items" 
  ON public.purchase_order_items 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM purchase_orders 
    WHERE purchase_orders.id = purchase_order_items.purchase_order_id 
    AND purchase_orders.user_id = auth.uid()
  ));

-- Trigger pour updated_at sur purchase_orders
CREATE TRIGGER update_purchase_orders_updated_at
  BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
