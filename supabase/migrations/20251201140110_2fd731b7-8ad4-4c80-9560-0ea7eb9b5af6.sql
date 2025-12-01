-- Add unique constraint on user_id for invoice_settings
ALTER TABLE public.invoice_settings
ADD CONSTRAINT invoice_settings_user_id_unique UNIQUE (user_id);