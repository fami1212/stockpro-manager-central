import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

type AppRole = 'admin' | 'manager' | 'user';

interface ModulePermissions {
  dashboard: boolean;
  stock: boolean;
  sales: boolean;
  clients: boolean;
  purchases: boolean;
  suppliers: boolean;
  promotions: boolean;
  returns: boolean;
  export: boolean;
  invoices: boolean;
  reports: boolean;
  settings: boolean;
  admin: boolean;
}

const DEFAULT_PERMISSIONS: Record<AppRole, ModulePermissions> = {
  admin: {
    dashboard: true,
    stock: true,
    sales: true,
    clients: true,
    purchases: true,
    suppliers: true,
    promotions: true,
    returns: true,
    export: true,
    invoices: true,
    reports: true,
    settings: true,
    admin: true,
  },
  manager: {
    dashboard: true,
    stock: true,
    sales: true,
    clients: true,
    purchases: true,
    suppliers: true,
    promotions: true,
    returns: true,
    export: true,
    invoices: true,
    reports: true,
    settings: true,
    admin: false,
  },
  user: {
    dashboard: true,
    stock: true,
    sales: true,
    clients: true,
    purchases: false,
    suppliers: false,
    promotions: false,
    returns: false,
    export: false,
    invoices: false,
    reports: false,
    settings: true,
    admin: false,
  },
};

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole>('user');
  const [permissions, setPermissions] = useState<ModulePermissions>(DEFAULT_PERMISSIONS.user);
  const [loading, setLoading] = useState(true);

  const fetchRole = useCallback(async () => {
    if (!user) {
      setRole('user');
      setPermissions(DEFAULT_PERMISSIONS.user);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('get_user_role', { _user_id: user.id });
      
      if (error) throw error;
      
      const userRole = (data as AppRole) || 'user';
      setRole(userRole);
      setPermissions(DEFAULT_PERMISSIONS[userRole]);
    } catch (error) {
      console.error('Error fetching user role:', error);
      setRole('user');
      setPermissions(DEFAULT_PERMISSIONS.user);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  const hasPermission = useCallback((module: keyof ModulePermissions): boolean => {
    return permissions[module];
  }, [permissions]);

  const canAccess = useCallback((module: string): boolean => {
    return hasPermission(module as keyof ModulePermissions);
  }, [hasPermission]);

  return {
    role,
    permissions,
    loading,
    hasPermission,
    canAccess,
    isAdmin: role === 'admin',
    isManager: role === 'manager',
    isUser: role === 'user',
    refetch: fetchRole,
  };
}
