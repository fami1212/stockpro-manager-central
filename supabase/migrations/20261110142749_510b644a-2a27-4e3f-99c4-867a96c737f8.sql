ALTER TABLE public.products ADD COLUMN IF NOT EXISTS total_buy_price numeric NOT NULL DEFAULT 0;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view permitted own notifications"
ON public.notifications FOR SELECT TO authenticated
USING (
  auth.uid() = user_id
  AND (
    category IS DISTINCT FROM 'subscription'
    OR title IS DISTINCT FROM 'Essai expiré'
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update permitted own notifications"
ON public.notifications FOR UPDATE TO authenticated
USING (
  auth.uid() = user_id
  AND (
    category IS DISTINCT FROM 'subscription'
    OR title IS DISTINCT FROM 'Essai expiré'
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
)
WITH CHECK (
  auth.uid() = user_id
  AND (
    category IS DISTINCT FROM 'subscription'
    OR title IS DISTINCT FROM 'Essai expiré'
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
CREATE POLICY "Users can delete permitted own notifications"
ON public.notifications FOR DELETE TO authenticated
USING (
  auth.uid() = user_id
  AND (
    category IS DISTINCT FROM 'subscription'
    OR title IS DISTINCT FROM 'Essai expiré'
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);