-- Fix the auto_generate_product_codes trigger to avoid ambiguous reference
DROP TRIGGER IF EXISTS auto_generate_product_codes_trigger ON products;

CREATE OR REPLACE FUNCTION public.auto_generate_product_codes()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
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
$function$;

-- Recreate the trigger
CREATE TRIGGER auto_generate_product_codes_trigger
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_product_codes();