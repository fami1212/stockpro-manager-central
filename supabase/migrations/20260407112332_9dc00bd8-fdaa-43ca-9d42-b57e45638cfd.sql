
-- 1. Fix notifications INSERT: restrict to own user_id
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "Users can insert own notifications" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 2. Fix audit_logs INSERT: restrict to own user_id
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
CREATE POLICY "Users can insert own audit logs" ON audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3. Fix profiles UPDATE: prevent is_admin self-elevation
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND is_admin IS NOT DISTINCT FROM (SELECT p.is_admin FROM profiles p WHERE p.id = auth.uid())
  );

-- 4. Add SELECT on permissions for authenticated users
CREATE POLICY "Authenticated users can read permissions" ON permissions
  FOR SELECT TO authenticated
  USING (true);

-- 5. Add SELECT on role_permissions for authenticated users
CREATE POLICY "Authenticated users can read role permissions" ON role_permissions
  FOR SELECT TO authenticated
  USING (true);
