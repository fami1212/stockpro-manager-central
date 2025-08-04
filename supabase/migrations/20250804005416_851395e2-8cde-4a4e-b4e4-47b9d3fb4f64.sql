-- Fix the ambiguous barcode reference in the trigger function
CREATE OR REPLACE FUNCTION public.auto_generate_product_codes()
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

-- Fix the generate_barcode function to avoid ambiguous references
CREATE OR REPLACE FUNCTION public.generate_barcode()
RETURNS TEXT AS $$
DECLARE
  new_barcode TEXT;
  exists_check INTEGER;
BEGIN
  LOOP
    -- Generate 13-digit EAN barcode starting with 200 (internal use)
    new_barcode := '200' || LPAD(FLOOR(RANDOM() * 10000000000)::TEXT, 10, '0');
    
    -- Check if barcode already exists
    SELECT COUNT(*) INTO exists_check 
    FROM products 
    WHERE products.barcode = new_barcode;
    
    -- Exit loop if unique
    EXIT WHEN exists_check = 0;
  END LOOP;
  
  RETURN new_barcode;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger for auto-generating product codes
DROP TRIGGER IF EXISTS auto_generate_product_codes_trigger ON products;
CREATE TRIGGER auto_generate_product_codes_trigger
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_product_codes();