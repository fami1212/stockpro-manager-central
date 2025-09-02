-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'manager' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1
$$;

-- RLS policies for user_roles
CREATE POLICY "Admins can manage all user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Update profiles table to include role info
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Update handle_new_user function to assign default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, company, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'company',
    NEW.raw_user_meta_data->>'phone'
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Insert default categories for new user
  INSERT INTO public.categories (user_id, name, color) VALUES
    (NEW.id, 'Électronique', 'blue'),
    (NEW.id, 'Alimentaire', 'green'),
    (NEW.id, 'Fournitures', 'purple'),
    (NEW.id, 'Vêtements', 'orange');
  
  -- Insert default units for new user
  INSERT INTO public.units (user_id, name, symbol, type) VALUES
    (NEW.id, 'Pièce', 'pcs', 'Unité'),
    (NEW.id, 'Kilogramme', 'kg', 'Poids'),
    (NEW.id, 'Litre', 'L', 'Volume'),
    (NEW.id, 'Pack', 'pack', 'Groupé');
  
  RETURN NEW;
END;
$$;

-- Create admin stats view
CREATE OR REPLACE VIEW public.admin_stats AS
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_users_this_month,
  COUNT(CASE WHEN last_login >= NOW() - INTERVAL '7 days' THEN 1 END) as active_users_week,
  COUNT(CASE WHEN ur.role = 'admin' THEN 1 END) as admin_count,
  COUNT(CASE WHEN ur.role = 'manager' THEN 1 END) as manager_count,
  COUNT(CASE WHEN ur.role = 'user' THEN 1 END) as user_count
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id;

-- Grant access to admin stats view
CREATE POLICY "Admins can view admin stats"
ON public.admin_stats
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update updated_at trigger for user_roles
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();