-- Fix search_path on functions
ALTER FUNCTION public.log_stock_movement() SET search_path = public;
ALTER FUNCTION public.generate_product_reference(text) SET search_path = public;
ALTER FUNCTION public.auto_generate_product_codes() SET search_path = public;
ALTER FUNCTION public.generate_barcode() SET search_path = public;
ALTER FUNCTION public.generate_invoice_number(uuid) SET search_path = public;
ALTER FUNCTION public.generate_credit_note_number(uuid) SET search_path = public;
ALTER FUNCTION public.auto_generate_invoice_number() SET search_path = public;
ALTER FUNCTION public.auto_generate_credit_note_number() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- Revoke anon EXECUTE on SECURITY DEFINER helpers
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_permission(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.log_audit_event(uuid, text, text, text, text, uuid, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.adjust_product_stock(uuid, integer) FROM anon;

-- Secure invoice-logos bucket: restrict access to authenticated users
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public read invoice-logos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view invoice logos" ON storage.objects;

CREATE POLICY "Authenticated users can read invoice-logos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'invoice-logos');

CREATE POLICY "Users can upload their own invoice-logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'invoice-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own invoice-logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'invoice-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own invoice-logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'invoice-logos' AND auth.uid()::text = (storage.foldername(name))[1]);