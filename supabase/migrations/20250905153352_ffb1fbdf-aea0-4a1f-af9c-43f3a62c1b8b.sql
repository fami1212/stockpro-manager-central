-- Add account_status column to profiles table to handle user suspension
ALTER TABLE public.profiles ADD COLUMN account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'inactive', 'suspended'));

-- Create an index for better performance on account_status queries
CREATE INDEX idx_profiles_account_status ON public.profiles(account_status);