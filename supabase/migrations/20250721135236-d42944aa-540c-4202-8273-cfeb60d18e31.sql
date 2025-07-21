
-- Create stock_movements table to track all stock changes
CREATE TABLE public.stock_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('in', 'out', 'adjustment', 'return', 'sale', 'purchase')),
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable RLS
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can manage own stock movements" 
  ON public.stock_movements 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Add foreign key constraints
ALTER TABLE public.stock_movements 
  ADD CONSTRAINT fk_stock_movements_product 
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_stock_movements_product_id ON public.stock_movements(product_id);
CREATE INDEX idx_stock_movements_user_id ON public.stock_movements(user_id);
CREATE INDEX idx_stock_movements_type ON public.stock_movements(type);
CREATE INDEX idx_stock_movements_created_at ON public.stock_movements(created_at DESC);

-- Create function to automatically generate product reference
CREATE OR REPLACE FUNCTION generate_product_reference(category_name TEXT)
RETURNS TEXT AS $$
DECLARE
  prefix TEXT;
  counter INTEGER;
  reference TEXT;
BEGIN
  -- Generate prefix from category name (first 3 letters, uppercase)
  prefix := UPPER(LEFT(REGEXP_REPLACE(category_name, '[^A-Za-z]', '', 'g'), 3));
  
  -- Get next counter for this prefix
  SELECT COALESCE(MAX(CAST(SUBSTRING(reference FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO counter
  FROM products 
  WHERE reference LIKE prefix || '%' AND reference ~ (prefix || '[0-9]+$');
  
  -- Format reference with leading zeros
  reference := prefix || LPAD(counter::TEXT, 4, '0');
  
  RETURN reference;
END;
$$ LANGUAGE plpgsql;

-- Create function to automatically generate barcode
CREATE OR REPLACE FUNCTION generate_barcode()
RETURNS TEXT AS $$
DECLARE
  barcode TEXT;
  exists_check INTEGER;
BEGIN
  LOOP
    -- Generate 13-digit EAN barcode starting with 200 (internal use)
    barcode := '200' || LPAD(FLOOR(RANDOM() * 10000000000)::TEXT, 10, '0');
    
    -- Check if barcode already exists
    SELECT COUNT(*) INTO exists_check 
    FROM products 
    WHERE barcode = generate_barcode.barcode;
    
    -- Exit loop if unique
    EXIT WHEN exists_check = 0;
  END LOOP;
  
  RETURN barcode;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to auto-generate reference and barcode
CREATE OR REPLACE FUNCTION auto_generate_product_codes()
RETURNS TRIGGER AS $$
DECLARE
  category_name TEXT;
BEGIN
  -- Get category name
  SELECT name INTO category_name 
  FROM categories 
  WHERE id = NEW.category_id;
  
  -- Generate reference if not provided or empty
  IF NEW.reference IS NULL OR NEW.reference = '' THEN
    NEW.reference := generate_product_reference(COALESCE(category_name, 'GEN'));
  END IF;
  
  -- Generate barcode if not provided or empty
  IF NEW.barcode IS NULL OR NEW.barcode = '' THEN
    NEW.barcode := generate_barcode();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating codes
CREATE TRIGGER trigger_auto_generate_product_codes
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_product_codes();

-- Create function to log stock movements
CREATE OR REPLACE FUNCTION log_stock_movement()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if stock actually changed
  IF TG_OP = 'UPDATE' AND OLD.stock = NEW.stock THEN
    RETURN NEW;
  END IF;
  
  -- Insert stock movement record
  INSERT INTO stock_movements (
    user_id,
    product_id,
    type,
    quantity,
    previous_stock,
    new_stock,
    reason,
    created_by
  ) VALUES (
    NEW.user_id,
    NEW.id,
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'adjustment'
      WHEN NEW.stock > OLD.stock THEN 'in'
      ELSE 'out'
    END,
    CASE 
      WHEN TG_OP = 'INSERT' THEN NEW.stock
      ELSE ABS(NEW.stock - OLD.stock)
    END,
    CASE 
      WHEN TG_OP = 'INSERT' THEN 0
      ELSE OLD.stock
    END,
    NEW.stock,
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'Stock initial'
      WHEN NEW.stock > OLD.stock THEN 'Entrée de stock'
      ELSE 'Sortie de stock'
    END,
    NEW.user_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for logging stock movements
CREATE TRIGGER trigger_log_stock_movement
  AFTER INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION log_stock_movement();
