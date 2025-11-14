-- Create function to adjust product stock
CREATE OR REPLACE FUNCTION adjust_product_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE products
  SET stock = stock + p_quantity,
      updated_at = NOW()
  WHERE id = p_product_id;
END;
$$;