-- Create email templates table for customizable email templates
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  template_type TEXT NOT NULL DEFAULT 'invoice',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add template_style column to invoice_settings for predefined templates
ALTER TABLE public.invoice_settings
ADD COLUMN template_style TEXT DEFAULT 'modern';

-- Create sent_invoices table to track sent invoices
CREATE TABLE public.sent_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  sent_to TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  email_template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  error_message TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_sent_invoices_invoice_id ON public.sent_invoices(invoice_id);
CREATE INDEX idx_sent_invoices_user_id ON public.sent_invoices(user_id);
CREATE INDEX idx_email_templates_user_id ON public.email_templates(user_id);