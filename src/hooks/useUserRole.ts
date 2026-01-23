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

const ALL_PERMISSIONS: ModulePermissions = {
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
};

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole>('user');
  const [permissions, setPermissions] = useState<ModulePermissions>({ ...ALL_PERMISSIONS, admin: false });
  const [loading, setLoading] = useState(true);

  const fetchRoleAndPermissions = useCallback(async () => {
    if (!user) {
      setRole('user');
      setPermissions({ ...ALL_PERMISSIONS, admin: false });
      setLoading(false);
      return;
    }

    try {
      // Fetch user role
      const { data: roleData, error: roleError } = await supabase.rpc('get_user_role', { _user_id: user.id });
      
      if (roleError) throw roleError;
      
      const userRole = (roleData as AppRole) || 'user';
      setRole(userRole);

      // Admin has all permissions
      if (userRole === 'admin') {
        setPermissions(ALL_PERMISSIONS);
      } else {
        // Fetch dynamic module permissions for the role
        const { data: modulePerms, error: permsError } = await supabase
          .from('module_permissions')
          .select('module, is_enabled')
          .eq('role', userRole);

        if (permsError) throw permsError;

        // Build permissions object from database
        const permsObj: ModulePermissions = {
          dashboard: true, // Always enabled
          stock: false,
          sales: false,
          clients: false,
          purchases: false,
          suppliers: false,
          promotions: false,
          returns: false,
          export: false,
          invoices: false,
          reports: false,
          settings: true, // Always enabled
          admin: false, // Non-admin roles never have admin access
        };

        modulePerms?.forEach((perm) => {
          if (perm.module in permsObj) {
            permsObj[perm.module as keyof ModulePermissions] = perm.is_enabled;
          }
        });

        setPermissions(permsObj);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setRole('user');
      setPermissions({ ...ALL_PERMISSIONS, admin: false });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRoleAndPermissions();
  }, [fetchRoleAndPermissions]);

  // Subscribe to permission changes
  useEffect(() => {
    if (!user || role === 'admin') return;

    const channel = supabase
      .channel('module-permissions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'module_permissions',
          filter: `role=eq.${role}`,
        },
        () => {
          // Refetch permissions when they change
          fetchRoleAndPermissions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, role, fetchRoleAndPermissions]);

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
    refetch: fetchRoleAndPermissions,
  };
}
