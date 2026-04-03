import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Zap, Crown, Save, Package, ShoppingCart, Users, Truck, FileText, BarChart3, Bot, TrendingUp, RotateCcw, Tag, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const ALL_MODULES = [
  { id: 'stock', label: 'Stock', icon: Package, description: 'Gestion des produits et inventaire' },
  { id: 'sales', label: 'Ventes', icon: ShoppingCart, description: 'Gestion des ventes et transactions' },
  { id: 'clients', label: 'Clients', icon: Users, description: 'Gestion de la clientèle' },
  { id: 'purchases', label: 'Achats', icon: Truck, description: 'Bons de commande fournisseurs' },
  { id: 'suppliers', label: 'Fournisseurs', icon: Truck, description: 'Gestion des fournisseurs' },
  { id: 'invoices', label: 'Factures', icon: FileText, description: 'Facturation et paiements' },
  { id: 'reports', label: 'Rapports', icon: BarChart3, description: 'Rapports et statistiques' },
  { id: 'returns', label: 'Retours', icon: RotateCcw, description: 'Gestion des retours produits' },
  { id: 'promotions', label: 'Promotions', icon: Tag, description: 'Promotions et réductions' },
  { id: 'ai', label: 'IA Basique', icon: Bot, description: 'Assistant IA et analyses' },
  { id: 'intelligent-reports', label: 'Rapports IA', icon: TrendingUp, description: 'Rapports intelligents avancés' },
  { id: 'cash-register', label: 'Caisse', icon: DollarSign, description: 'Gestion de caisse enregistreuse' },
];

interface PlanData {
  id: string;
  name: string;
  display_name: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  allowed_modules: string[];
  has_ai_access: boolean;
  has_full_ai: boolean;
  max_products: number | null;
  max_sales: number | null;
  features: string[];
}

export function PlanModulesManagement() {
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans' as any)
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;

      setPlans((data || []).map((p: any) => ({
        ...p,
        allowed_modules: Array.isArray(p.allowed_modules) ? p.allowed_modules : [],
        features: Array.isArray(p.features) ? p.features : [],
      })));
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Erreur', description: 'Impossible de charger les plans', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (planId: string, moduleId: string) => {
    setPlans(prev => prev.map(plan => {
      if (plan.id !== planId) return plan;
      const modules = plan.allowed_modules.includes(moduleId)
        ? plan.allowed_modules.filter(m => m !== moduleId)
        : [...plan.allowed_modules, moduleId];
      return { ...plan, allowed_modules: modules };
    }));
  };

  const updatePlanField = (planId: string, field: string, value: any) => {
    setPlans(prev => prev.map(plan =>
      plan.id === planId ? { ...plan, [field]: value } : plan
    ));
  };

  const savePlan = async (plan: PlanData) => {
    try {
      setSaving(plan.id);
      const { error } = await supabase
        .from('subscription_plans' as any)
        .update({
          allowed_modules: plan.allowed_modules,
          has_ai_access: plan.has_ai_access,
          has_full_ai: plan.has_full_ai,
          max_products: plan.max_products,
          max_sales: plan.max_sales,
          price_monthly: plan.price_monthly,
          price_yearly: plan.price_yearly,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', plan.id);

      if (error) throw error;
      toast({ title: 'Plan sauvegardé', description: `${plan.display_name} mis à jour avec succès` });
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Erreur', description: 'Impossible de sauvegarder', variant: 'destructive' });
    } finally {
      setSaving(null);
    }
  };

  const getPlanIcon = (name: string) => {
    const icons: Record<string, any> = { trial: Clock, basique: Zap, pro: Zap, premium: Crown };
    const Icon = icons[name] || Zap;
    return <Icon className="h-5 w-5" />;
  };

  const getPlanColor = (name: string) => {
    const colors: Record<string, string> = {
      trial: 'border-yellow-500/30 bg-yellow-500/5',
      basique: 'border-green-500/30 bg-green-500/5',
      pro: 'border-blue-500/30 bg-blue-500/5',
      premium: 'border-amber-500/30 bg-amber-500/5',
    };
    return colors[name] || '';
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Chargement des plans...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Modules par Plan</CardTitle>
          <CardDescription>
            Configurez les modules accessibles pour chaque plan d'abonnement. Les changements s'appliquent immédiatement aux utilisateurs.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue={plans[0]?.id} className="space-y-4">
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${plans.length}, 1fr)` }}>
          {plans.map(plan => (
            <TabsTrigger key={plan.id} value={plan.id} className="flex items-center gap-2">
              {getPlanIcon(plan.name)}
              {plan.display_name}
            </TabsTrigger>
          ))}
        </TabsList>

        {plans.map(plan => (
          <TabsContent key={plan.id} value={plan.id} className="space-y-4">
            {/* Pricing */}
            <Card className={getPlanColor(plan.name)}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getPlanIcon(plan.name)} {plan.display_name}
                </CardTitle>
                <CardDescription>Configuration du plan {plan.display_name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Prix mensuel ({plan.currency})</Label>
                    <Input
                      type="number"
                      value={plan.price_monthly}
                      onChange={(e) => updatePlanField(plan.id, 'price_monthly', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Prix annuel ({plan.currency})</Label>
                    <Input
                      type="number"
                      value={plan.price_yearly}
                      onChange={(e) => updatePlanField(plan.id, 'price_yearly', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Max Produits</Label>
                    <Input
                      type="number"
                      value={plan.max_products ?? ''}
                      placeholder="Illimité"
                      onChange={(e) => updatePlanField(plan.id, 'max_products', e.target.value ? Number(e.target.value) : null)}
                    />
                  </div>
                  <div>
                    <Label>Max Ventes</Label>
                    <Input
                      type="number"
                      value={plan.max_sales ?? ''}
                      placeholder="Illimité"
                      onChange={(e) => updatePlanField(plan.id, 'max_sales', e.target.value ? Number(e.target.value) : null)}
                    />
                  </div>
                </div>

                {/* AI toggles */}
                <div className="flex flex-wrap gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={plan.has_ai_access}
                      onCheckedChange={(v) => updatePlanField(plan.id, 'has_ai_access', v)}
                    />
                    <Label>Accès IA basique</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={plan.has_full_ai}
                      onCheckedChange={(v) => updatePlanField(plan.id, 'has_full_ai', v)}
                    />
                    <Label>IA complète</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Modules Grid */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Modules autorisés</CardTitle>
                <CardDescription>
                  {plan.allowed_modules.length} / {ALL_MODULES.length} modules activés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ALL_MODULES.map(mod => {
                    const enabled = plan.allowed_modules.includes(mod.id);
                    const Icon = mod.icon;
                    return (
                      <div
                        key={mod.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                          enabled ? 'border-primary/50 bg-primary/5' : 'border-border bg-muted/30 opacity-60'
                        }`}
                        onClick={() => toggleModule(plan.id, mod.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`h-4 w-4 ${enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                          <div>
                            <p className="text-sm font-medium">{mod.label}</p>
                            <p className="text-xs text-muted-foreground">{mod.description}</p>
                          </div>
                        </div>
                        <Switch checked={enabled} onCheckedChange={() => toggleModule(plan.id, mod.id)} />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => savePlan(plan)} disabled={saving === plan.id}>
                <Save className="h-4 w-4 mr-2" />
                {saving === plan.id ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
              </Button>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
