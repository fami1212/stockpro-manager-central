import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, Save, RefreshCw } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface RolePermission {
  role: 'admin' | 'manager' | 'user';
  permission_id: string;
}

export function PermissionsManagement() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'manager' | 'user'>('manager');
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [permsRes, rolePermsRes] = await Promise.all([
        supabase.from('permissions').select('*').order('category, name'),
        supabase.from('role_permissions').select('*')
      ]);

      if (permsRes.error) throw permsRes.error;
      if (rolePermsRes.error) throw rolePermsRes.error;

      setPermissions(permsRes.data || []);
      setRolePermissions(rolePermsRes.data || []);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const hasPermission = (role: string, permissionId: string) => {
    return rolePermissions.some(
      rp => rp.role === role && rp.permission_id === permissionId
    );
  };

  const togglePermission = async (role: 'manager' | 'user', permissionId: string) => {
    const currentlyHas = hasPermission(role, permissionId);
    
    try {
      if (currentlyHas) {
        const { error } = await supabase
          .from('role_permissions')
          .delete()
          .eq('role', role)
          .eq('permission_id', permissionId);

        if (error) throw error;

        setRolePermissions(prev => 
          prev.filter(rp => !(rp.role === role && rp.permission_id === permissionId))
        );
      } else {
        const { error } = await supabase
          .from('role_permissions')
          .insert({ role, permission_id: permissionId });

        if (error) throw error;

        setRolePermissions(prev => [...prev, { role, permission_id: permissionId }]);
      }

      toast({
        title: 'Succès',
        description: 'Permission mise à jour',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Gestion des Permissions
              </CardTitle>
              <CardDescription>
                Définissez les accès granulaires pour chaque rôle
              </CardDescription>
            </div>
            <Button onClick={fetchData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedRole} onValueChange={(v) => setSelectedRole(v as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manager">Manager</TabsTrigger>
              <TabsTrigger value="user">Utilisateur</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedRole} className="space-y-6 mt-6">
              {Object.entries(groupedPermissions).map(([category, perms]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="text-lg">{category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {perms.map((perm) => (
                        <div key={perm.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={hasPermission(selectedRole, perm.id)}
                              onCheckedChange={() => togglePermission(selectedRole, perm.id)}
                            />
                            <div>
                              <div className="font-medium">{perm.description}</div>
                              <div className="text-sm text-muted-foreground">{perm.name}</div>
                            </div>
                          </div>
                          <Badge variant={hasPermission(selectedRole, perm.id) ? 'default' : 'secondary'}>
                            {hasPermission(selectedRole, perm.id) ? 'Activé' : 'Désactivé'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">Note sur les permissions Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Les administrateurs ont automatiquement accès à toutes les permissions du système.
            Cette page permet uniquement de gérer les permissions des rôles Manager et Utilisateur.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}