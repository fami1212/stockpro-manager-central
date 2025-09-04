-- 1) Add email column to profiles if missing
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email TEXT;

-- 2) Allow admins to view all profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'profiles' 
      AND policyname = 'Admins can view all profiles'
  ) THEN
    CREATE POLICY "Admins can view all profiles"
    ON public.profiles
    FOR SELECT
    USING (has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- 3) Update handle_new_user function to include email in profiles insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, company, phone, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'company',
    NEW.raw_user_meta_data->>'phone',
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    company = EXCLUDED.company,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email;
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
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
