import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Shield, 
  RefreshCw, 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Truck, 
  UserCheck, 
  FileText, 
  Settings,
  Tag,
  PackageX,
  Download,
  Receipt,
  Save
} from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ModulePermission {
  id: string;
  role: 'manager' | 'user';
  module: string;
  is_enabled: boolean;
}

const MODULES = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, description: 'Accès au dashboard principal' },
  { id: 'sales', label: 'Ventes', icon: ShoppingCart, description: 'Créer et gérer les ventes' },
  { id: 'stock', label: 'Stock', icon: Package, description: 'Gérer l\'inventaire des produits' },
  { id: 'clients', label: 'Clients', icon: UserCheck, description: 'Gérer la base clients' },
  { id: 'purchases', label: 'Achats', icon: Truck, description: 'Commandes fournisseurs' },
  { id: 'suppliers', label: 'Fournisseurs', icon: Users, description: 'Gérer les fournisseurs' },
  { id: 'promotions', label: 'Promotions', icon: Tag, description: 'Créer des promotions' },
  { id: 'returns', label: 'Retours', icon: PackageX, description: 'Gérer les retours produits' },
  { id: 'invoices', label: 'Factures', icon: Receipt, description: 'Suivi des factures' },
  { id: 'export', label: 'Export', icon: Download, description: 'Exporter les données' },
  { id: 'reports', label: 'Rapports', icon: FileText, description: 'Accès aux rapports' },
  { id: 'settings', label: 'Paramètres', icon: Settings, description: 'Modifier les paramètres' },
];

export function ModulePermissionsManagement() {
  const [permissions, setPermissions] = useState<ModulePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'manager' | 'user'>('manager');
  const [hasChanges, setHasChanges] = useState(false);

  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('module_permissions')
        .select('*')
        .order('module');

      if (error) throw error;
      setPermissions(data || []);
      setHasChanges(false);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des permissions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const isModuleEnabled = (role: string, module: string) => {
    const perm = permissions.find(p => p.role === role && p.module === module);
    return perm?.is_enabled ?? false;
  };

  const toggleModule = async (role: 'manager' | 'user', module: string) => {
    const currentPerm = permissions.find(p => p.role === role && p.module === module);
    const newValue = !currentPerm?.is_enabled;

    // Optimistic update
    setPermissions(prev => 
      prev.map(p => 
        p.role === role && p.module === module 
          ? { ...p, is_enabled: newValue }
          : p
      )
    );
    setHasChanges(true);

    try {
      const { error } = await supabase
        .from('module_permissions')
        .update({ is_enabled: newValue })
        .eq('role', role)
        .eq('module', module);

      if (error) throw error;
      
      toast.success(`Module "${MODULES.find(m => m.id === module)?.label}" ${newValue ? 'activé' : 'désactivé'}`);
    } catch (error: any) {
      // Rollback on error
      setPermissions(prev => 
        prev.map(p => 
          p.role === role && p.module === module 
            ? { ...p, is_enabled: !newValue }
            : p
        )
      );
      toast.error('Erreur lors de la mise à jour');
      console.error(error);
    }
  };

  const enableAll = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('module_permissions')
        .update({ is_enabled: true })
        .eq('role', selectedRole);

      if (error) throw error;

      setPermissions(prev => 
        prev.map(p => p.role === selectedRole ? { ...p, is_enabled: true } : p)
      );
      toast.success('Tous les modules activés');
    } catch (error) {
      toast.error('Erreur lors de l\'activation');
    } finally {
      setSaving(false);
    }
  };

  const disableAll = async () => {
    setSaving(true);
    try {
      // Keep dashboard and settings always enabled
      const { error } = await supabase
        .from('module_permissions')
        .update({ is_enabled: false })
        .eq('role', selectedRole)
        .not('module', 'in', '("dashboard","settings")');

      if (error) throw error;

      setPermissions(prev => 
        prev.map(p => {
          if (p.role === selectedRole && p.module !== 'dashboard' && p.module !== 'settings') {
            return { ...p, is_enabled: false };
          }
          return p;
        })
      );
      toast.success('Modules désactivés (sauf Dashboard et Paramètres)');
    } catch (error) {
      toast.error('Erreur lors de la désactivation');
    } finally {
      setSaving(false);
    }
  };

  const getEnabledCount = (role: string) => {
    return permissions.filter(p => p.role === role && p.is_enabled).length;
  };

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
                Permissions des Modules
              </CardTitle>
              <CardDescription>
                Configurez l'accès aux modules pour chaque rôle
              </CardDescription>
            </div>
            <Button onClick={fetchPermissions} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedRole} onValueChange={(v) => setSelectedRole(v as 'manager' | 'user')}>
            <div className="flex items-center justify-between mb-6">
              <TabsList className="grid w-[300px] grid-cols-2">
                <TabsTrigger value="manager" className="relative">
                  Manager
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {getEnabledCount('manager')}/{MODULES.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="user" className="relative">
                  Utilisateur
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {getEnabledCount('user')}/{MODULES.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={enableAll} disabled={saving}>
                  Tout activer
                </Button>
                <Button variant="outline" size="sm" onClick={disableAll} disabled={saving}>
                  Tout désactiver
                </Button>
              </div>
            </div>

            <TabsContent value={selectedRole}>
              <div className="grid gap-3">
                {MODULES.map((module) => {
                  const isEnabled = isModuleEnabled(selectedRole, module.id);
                  const isCore = module.id === 'dashboard';
                  const Icon = module.icon;

                  return (
                    <div 
                      key={module.id}
                      className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                        isEnabled ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${isEnabled ? 'bg-primary/10' : 'bg-muted'}`}>
                          <Icon className={`h-5 w-5 ${isEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{module.label}</span>
                            {isCore && (
                              <Badge variant="outline" className="text-xs">Requis</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{module.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge variant={isEnabled ? 'default' : 'secondary'}>
                          {isEnabled ? 'Activé' : 'Désactivé'}
                        </Badge>
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={() => toggleModule(selectedRole, module.id)}
                          disabled={isCore || saving}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">Note sur les permissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            • Les <strong>administrateurs</strong> ont automatiquement accès à tous les modules.
          </p>
          <p className="text-sm text-muted-foreground">
            • Le module <strong>Tableau de bord</strong> est toujours accessible pour tous les rôles.
          </p>
          <p className="text-sm text-muted-foreground">
            • Les modifications sont appliquées immédiatement à tous les utilisateurs du rôle concerné.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
