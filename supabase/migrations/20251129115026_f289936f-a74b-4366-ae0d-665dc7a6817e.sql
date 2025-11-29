-- Create invoice_settings table for customizable invoice templates
CREATE TABLE public.invoice_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Company branding
  company_name TEXT,
  company_logo_url TEXT,
  company_address TEXT,
  company_phone TEXT,
  company_email TEXT,
  company_tax_id TEXT,
  
  -- Color customization (hex colors)
  primary_color TEXT DEFAULT '#1e40af',
  secondary_color TEXT DEFAULT '#3b82f6',
  text_color TEXT DEFAULT '#1f2937',
  
  -- Layout options
  logo_position TEXT DEFAULT 'left', -- left, center, right
  show_header BOOLEAN DEFAULT true,
  show_footer BOOLEAN DEFAULT true,
  footer_text TEXT,
  
  -- Invoice details
  invoice_prefix TEXT DEFAULT 'INV',
  invoice_notes TEXT,
  payment_terms TEXT DEFAULT 'Paiement dû à réception',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.invoice_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage own invoice settings"
  ON public.invoice_settings
  FOR ALL
  USING (auth.uid() = user_id);

-- Create index
CREATE INDEX idx_invoice_settings_user_id ON public.invoice_settings(user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_invoice_settings_updated_at
  BEFORE UPDATE ON public.invoice_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for invoice logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'invoice-logos',
  'invoice-logos',
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]
);

-- Create storage policies for invoice logos
CREATE POLICY "Users can upload their own invoice logos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'invoice-logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own invoice logos"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'invoice-logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own invoice logos"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'invoice-logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own invoice logos"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'invoice-logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Invoice logos are publicly accessible"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'invoice-logos');