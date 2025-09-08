-- Allow admins to view all sales so admin dashboards can compute stats
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'sales' AND policyname = 'Admins can view all sales'
  ) THEN
    CREATE POLICY "Admins can view all sales"
    ON public.sales
    FOR SELECT
    USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END$$;