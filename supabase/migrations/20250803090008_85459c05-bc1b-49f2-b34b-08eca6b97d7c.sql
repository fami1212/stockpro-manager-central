-- Fix the generate_product_reference function to avoid ambiguous reference
CREATE OR REPLACE FUNCTION public.generate_product_reference(category_name text)
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
  prefix TEXT;
  counter INTEGER;
  ref_code TEXT;
BEGIN
  -- Generate prefix from category name (first 3 letters, uppercase)
  prefix := UPPER(LEFT(REGEXP_REPLACE(category_name, '[^A-Za-z]', '', 'g'), 3));
  
  -- Get next counter for this prefix
  SELECT COALESCE(MAX(CAST(SUBSTRING(reference FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO counter
  FROM products 
  WHERE reference LIKE prefix || '%' AND reference ~ (prefix || '[0-9]+$');
  
  -- Format reference with leading zeros
  ref_code := prefix || LPAD(counter::TEXT, 4, '0');
  
  RETURN ref_code;
END;
$function$;