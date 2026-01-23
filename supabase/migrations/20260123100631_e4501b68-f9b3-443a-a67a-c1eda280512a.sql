-- Create module permissions table for dynamic role-based access control
CREATE TABLE public.module_permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    role text NOT NULL CHECK (role IN ('manager', 'user')),
    module text NOT NULL,
    is_enabled boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(role, module)
);

-- Enable RLS
ALTER TABLE public.module_permissions ENABLE ROW LEVEL SECURITY;

-- Only admins can manage module permissions
CREATE POLICY "Admins can manage module permissions"
ON public.module_permissions FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- All authenticated users can read module permissions
CREATE POLICY "Authenticated users can read module permissions"
ON public.module_permissions FOR SELECT
TO authenticated
USING (true);

-- Insert default module permissions
INSERT INTO public.module_permissions (role, module, is_enabled) VALUES
    ('manager', 'dashboard', true),
    ('manager', 'sales', true),
    ('manager', 'stock', true),
    ('manager', 'clients', true),
    ('manager', 'purchases', true),
    ('manager', 'suppliers', true),
    ('manager', 'promotions', true),
    ('manager', 'returns', true),
    ('manager', 'invoices', true),
    ('manager', 'export', true),
    ('manager', 'reports', true),
    ('manager', 'settings', true),
    ('user', 'dashboard', true),
    ('user', 'sales', true),
    ('user', 'stock', true),
    ('user', 'clients', true),
    ('user', 'purchases', false),
    ('user', 'suppliers', false),
    ('user', 'promotions', false),
    ('user', 'returns', false),
    ('user', 'invoices', false),
    ('user', 'export', false),
    ('user', 'reports', false),
    ('user', 'settings', true);

-- Create trigger to update updated_at
CREATE TRIGGER update_module_permissions_updated_at
BEFORE UPDATE ON public.module_permissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();