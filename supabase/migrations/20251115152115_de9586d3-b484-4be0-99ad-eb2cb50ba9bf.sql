-- Create permissions table for granular access control
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role, permission_id)
);

-- Create audit_logs table for tracking critical actions
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_email TEXT,
  action_type TEXT NOT NULL,
  action_category TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for permissions (admins only)
CREATE POLICY "Admins can manage permissions"
ON public.permissions
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS Policies for role_permissions (admins only)
CREATE POLICY "Admins can manage role permissions"
ON public.role_permissions
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS Policies for audit_logs
CREATE POLICY "Admins can view all audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Insert default permissions
INSERT INTO public.permissions (name, description, category) VALUES
  ('products.view', 'Voir les produits', 'Produits'),
  ('products.create', 'Créer des produits', 'Produits'),
  ('products.edit', 'Modifier des produits', 'Produits'),
  ('products.delete', 'Supprimer des produits', 'Produits'),
  ('sales.view', 'Voir les ventes', 'Ventes'),
  ('sales.create', 'Créer des ventes', 'Ventes'),
  ('sales.edit', 'Modifier des ventes', 'Ventes'),
  ('sales.delete', 'Supprimer des ventes', 'Ventes'),
  ('clients.view', 'Voir les clients', 'Clients'),
  ('clients.create', 'Créer des clients', 'Clients'),
  ('clients.edit', 'Modifier des clients', 'Clients'),
  ('clients.delete', 'Supprimer des clients', 'Clients'),
  ('suppliers.view', 'Voir les fournisseurs', 'Fournisseurs'),
  ('suppliers.create', 'Créer des fournisseurs', 'Fournisseurs'),
  ('suppliers.edit', 'Modifier des fournisseurs', 'Fournisseurs'),
  ('suppliers.delete', 'Supprimer des fournisseurs', 'Fournisseurs'),
  ('purchases.view', 'Voir les achats', 'Achats'),
  ('purchases.create', 'Créer des achats', 'Achats'),
  ('purchases.edit', 'Modifier des achats', 'Achats'),
  ('purchases.delete', 'Supprimer des achats', 'Achats'),
  ('returns.view', 'Voir les retours', 'Retours'),
  ('returns.create', 'Créer des retours', 'Retours'),
  ('returns.edit', 'Modifier des retours', 'Retours'),
  ('returns.delete', 'Supprimer des retours', 'Retours'),
  ('promotions.view', 'Voir les promotions', 'Promotions'),
  ('promotions.create', 'Créer des promotions', 'Promotions'),
  ('promotions.edit', 'Modifier des promotions', 'Promotions'),
  ('promotions.delete', 'Supprimer des promotions', 'Promotions'),
  ('reports.view', 'Voir les rapports', 'Rapports'),
  ('reports.export', 'Exporter les rapports', 'Rapports'),
  ('settings.view', 'Voir les paramètres', 'Paramètres'),
  ('settings.edit', 'Modifier les paramètres', 'Paramètres')
ON CONFLICT (name) DO NOTHING;

-- Assign all permissions to admin role
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin', id FROM public.permissions
ON CONFLICT (role, permission_id) DO NOTHING;

-- Assign manager permissions (everything except settings)
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'manager', id FROM public.permissions
WHERE name NOT LIKE 'settings.%'
ON CONFLICT (role, permission_id) DO NOTHING;

-- Assign basic user permissions (view only for most things)
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'user', id FROM public.permissions
WHERE name LIKE '%.view' OR name LIKE '%.create'
ON CONFLICT (role, permission_id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action_type ON public.audit_logs(action_type);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_role_permissions_role ON public.role_permissions(role);

-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role = rp.role
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = _user_id
      AND p.name = _permission
  )
$$;

-- Function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  _user_id uuid,
  _user_email text,
  _action_type text,
  _action_category text,
  _resource_type text DEFAULT NULL,
  _resource_id uuid DEFAULT NULL,
  _details jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    user_email,
    action_type,
    action_category,
    resource_type,
    resource_id,
    details
  ) VALUES (
    _user_id,
    _user_email,
    _action_type,
    _action_category,
    _resource_type,
    _resource_id,
    _details
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;