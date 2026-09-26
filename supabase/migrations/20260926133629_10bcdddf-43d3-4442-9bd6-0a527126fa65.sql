GRANT SELECT ON public.subscription_plans TO anon;
CREATE POLICY "Public can view active plans" ON public.subscription_plans FOR SELECT TO anon USING (is_active = true);