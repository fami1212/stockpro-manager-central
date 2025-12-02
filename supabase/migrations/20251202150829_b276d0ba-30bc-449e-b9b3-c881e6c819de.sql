-- Enable RLS on email_templates
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Create policy for email_templates
CREATE POLICY "Users can manage own email templates"
ON public.email_templates
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Enable RLS on sent_invoices
ALTER TABLE public.sent_invoices ENABLE ROW LEVEL SECURITY;

-- Create policy for sent_invoices
CREATE POLICY "Users can manage own sent invoices"
ON public.sent_invoices
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at on email_templates
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();