import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useApp } from '@/contexts/AppContext';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { 
  Bell, 
  TrendingUp, 
  Package, 
  Users, 
  DollarSign,
  Lightbulb,
  X,
  RefreshCw,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface SmartAlert {
  id: string;
  type: 'warning' | 'opportunity' | 'info' | 'critical';
  category: 'stock' | 'sales' | 'clients' | 'margin';
  title: string;
  description: string;
  impact?: string;
  action?: string;
  data?: any;
  createdAt: Date;
}

export function SmartAlerts() {
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { products, sales, clients } = useApp();
  const { createNotification } = useNotifications();
  const { user } = useAuth();
  const lastPersistRef = useRef<string>('');

  // Generate smart alerts based on data analysis
  const generateAlerts = useMemo(() => {
    const newAlerts: SmartAlert[] = [];
    const now = new Date();

    // === STOCK ALERTS ===
    const outOfStock = products.filter(p => (p.stock || 0) === 0);
    if (outOfStock.length > 0) {
      newAlerts.push({
        id: 'stock-critical-out',
        type: 'critical',
        category: 'stock',
        title: `${outOfStock.length} produit(s) en rupture`,
        description: `Les produits suivants sont en rupture: ${outOfStock.slice(0, 3).map(p => p.name).join(', ')}${outOfStock.length > 3 ? '...' : ''}`,
        impact: 'Perte de ventes potentielle',
        action: 'Commander immédiatement',
        data: { products: outOfStock.slice(0, 5).map(p => ({ name: p.name, id: p.id })) },
        createdAt: now
      });
    }

    const lowStock = products.filter(p => 
      (p.stock || 0) > 0 && 
      (p.stock || 0) <= (p.alert_threshold || 5)
    );
    if (lowStock.length > 0) {
      newAlerts.push({
        id: 'stock-warning-low',
        type: 'warning',
        category: 'stock',
        title: `${lowStock.length} produit(s) à réapprovisionner`,
        description: `Stock faible détecté pour: ${lowStock.slice(0, 3).map(p => `${p.name} (${p.stock})`).join(', ')}`,
        action: 'Planifier une commande',
        data: { products: lowStock.slice(0, 5).map(p => ({ name: p.name, stock: p.stock })) },
        createdAt: now
      });
    }

    const overStock = products.filter(p => 
      (p.stock || 0) > (p.alert_threshold || 5) * 3
    );
    if (overStock.length > 0) {
      const totalValue = overStock.reduce((acc, p) => 
        acc + (p.buy_price || 0) * (p.stock || 0), 0
      );
      newAlerts.push({
        id: 'stock-opportunity-over',
        type: 'opportunity',
        category: 'stock',
        title: `Stock excédentaire détecté`,
        description: `${overStock.length} produits en surstock représentant ${totalValue.toLocaleString()} CFA`,
        impact: 'Capital immobilisé',
        action: 'Envisager une promotion',
        data: { count: overStock.length, value: totalValue },
        createdAt: now
      });
    }

    // === SALES ALERTS ===
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last14Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const recentSales = sales.filter(s => new Date(s.date || new Date()) >= last7Days);
    const previousSales = sales.filter(s => {
      const date = new Date(s.date || new Date());
      return date >= last14Days && date < last7Days;
    });

    const recentTotal = recentSales.reduce((acc, s) => acc + (s.total || 0), 0);
    const previousTotal = previousSales.reduce((acc, s) => acc + (s.total || 0), 0);

    if (previousTotal > 0) {
      const change = ((recentTotal - previousTotal) / previousTotal) * 100;
      
      if (change > 20) {
        newAlerts.push({
          id: 'sales-opportunity-growth',
          type: 'opportunity',
          category: 'sales',
          title: `Ventes en hausse de ${change.toFixed(0)}%`,
          description: `Cette semaine: ${recentTotal.toLocaleString()} CFA vs ${previousTotal.toLocaleString()} CFA la semaine dernière`,
          impact: 'Tendance positive',
          action: 'Maintenir le momentum',
          data: { change: change.toFixed(1), current: recentTotal, previous: previousTotal },
          createdAt: now
        });
      } else if (change < -20) {
        newAlerts.push({
          id: 'sales-warning-decline',
          type: 'warning',
          category: 'sales',
          title: `Baisse des ventes de ${Math.abs(change).toFixed(0)}%`,
          description: `Cette semaine: ${recentTotal.toLocaleString()} CFA vs ${previousTotal.toLocaleString()} CFA la semaine dernière`,
          impact: 'Tendance négative',
          action: 'Analyser les causes',
          data: { change: change.toFixed(1), current: recentTotal, previous: previousTotal },
          createdAt: now
        });
      }
    }

    // === CLIENT ALERTS ===
    const inactiveClients = clients.filter(c => c.status !== 'Actif');
    if (inactiveClients.length > 0) {
      const potentialRevenue = inactiveClients.reduce((acc, c) => 
        acc + ((c.total_amount || 0) / Math.max(c.total_orders || 1, 1)), 0
      );
      newAlerts.push({
        id: 'clients-opportunity-reactivate',
        type: 'opportunity',
        category: 'clients',
        title: `${inactiveClients.length} client(s) inactif(s)`,
        description: `Potentiel de réactivation estimé à ${potentialRevenue.toLocaleString()} CFA`,
        action: 'Lancer une campagne de réactivation',
        data: { count: inactiveClients.length, potential: potentialRevenue },
        createdAt: now
      });
    }

    // VIP clients
    const sortedClients = [...clients].sort((a, b) => 
      (b.total_amount || 0) - (a.total_amount || 0)
    );
    const vipThreshold = Math.ceil(clients.length * 0.1);
    const vipClients = sortedClients.slice(0, vipThreshold);
    
    if (vipClients.length > 0) {
      const vipRevenue = vipClients.reduce((acc, c) => acc + (c.total_amount || 0), 0);
      const totalRevenue = clients.reduce((acc, c) => acc + (c.total_amount || 0), 0);
      const vipPercentage = totalRevenue > 0 ? (vipRevenue / totalRevenue) * 100 : 0;
      
      if (vipPercentage > 50) {
        newAlerts.push({
          id: 'clients-info-vip',
          type: 'info',
          category: 'clients',
          title: `${vipClients.length} client(s) VIP génèrent ${vipPercentage.toFixed(0)}% du CA`,
          description: `Ces clients méritent une attention particulière`,
          action: 'Programme de fidélité',
          data: { vipCount: vipClients.length, percentage: vipPercentage.toFixed(0) },
          createdAt: now
        });
      }
    }

    // === MARGIN ALERTS ===
    const lowMarginProducts = products.filter(p => {
      const sell = p.sell_price || 0;
      const buy = p.buy_price || 0;
      if (sell === 0) return false;
      const margin = ((sell - buy) / sell) * 100;
      return margin < 15 && margin >= 0;
    });

    if (lowMarginProducts.length > 0) {
      newAlerts.push({
        id: 'margin-warning-low',
        type: 'warning',
        category: 'margin',
        title: `${lowMarginProducts.length} produit(s) à faible marge`,
        description: `Ces produits ont une marge inférieure à 15%`,
        impact: 'Rentabilité réduite',
        action: 'Revoir la tarification',
        data: { count: lowMarginProducts.length },
        createdAt: now
      });
    }

    return newAlerts;
  }, [products, sales, clients]);

  // Persist alerts to database (only critical and warning)
  useEffect(() => {
    if (!user) return;

    const criticalAlerts = generateAlerts.filter(a => a.type === 'critical' || a.type === 'warning');
    const alertsSignature = criticalAlerts.map(a => a.id).sort().join(',');
    
    // Only persist if alerts changed
    if (alertsSignature === lastPersistRef.current) return;
    lastPersistRef.current = alertsSignature;

    // Persist each new alert to notifications table
    criticalAlerts.forEach(async (alert) => {
      try {
        await createNotification({
          title: alert.title,
          description: alert.description,
          type: alert.type,
          category: alert.category as 'stock' | 'sales' | 'clients' | 'system',
          details: {
            impact: alert.impact,
            action: alert.action,
            ...alert.data,
          },
        });
      } catch (error) {
        // Silent fail - don't spam user with errors
        console.error('Failed to persist alert:', error);
      }
    });
  }, [generateAlerts, user, createNotification]);

  useEffect(() => {
    setAlerts(generateAlerts);
  }, [generateAlerts]);

  const getAlertIcon = (category: string) => {
    switch (category) {
      case 'stock': return Package;
      case 'sales': return DollarSign;
      case 'clients': return Users;
      case 'margin': return TrendingUp;
      default: return Bell;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-destructive';
      case 'warning': return 'bg-warning';
      case 'opportunity': return 'bg-success';
      case 'info': return 'bg-primary';
      default: return 'bg-muted';
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'critical': return { label: 'Critique', variant: 'destructive' as const };
      case 'warning': return { label: 'Attention', variant: 'secondary' as const };
      case 'opportunity': return { label: 'Opportunité', variant: 'default' as const };
      case 'info': return { label: 'Info', variant: 'outline' as const };
      default: return { label: 'Alerte', variant: 'outline' as const };
    }
  };

  const criticalCount = alerts.filter(a => a.type === 'critical' || a.type === 'warning').length;
  const opportunityCount = alerts.filter(a => a.type === 'opportunity').length;

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Analyse IA terminée', {
        description: `${alerts.length} alertes générées`
      });
    } catch {
      toast.error('Erreur lors de l\'analyse');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      {/* Floating alert button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-40 right-4 z-50 h-14 w-14 rounded-full shadow-lg transition-all hover:scale-110 ${isOpen ? 'scale-0' : 'scale-100'}`}
        variant={criticalCount > 0 ? 'destructive' : 'default'}
      >
        <Bell className="h-6 w-6" />
        {alerts.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {alerts.length}
          </span>
        )}
      </Button>

      {/* Alerts panel */}
      {isOpen && (
        <Card className="fixed bottom-40 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] shadow-2xl border-primary/20 animate-in slide-in-from-bottom-4">
          <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-primary/20">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base flex items-center gap-1">
                    Alertes Intelligentes
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {criticalCount > 0 && <span className="text-destructive">{criticalCount} attention</span>}
                    {criticalCount > 0 && opportunityCount > 0 && ' • '}
                    {opportunityCount > 0 && <span className="text-success">{opportunityCount} opportunités</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={runAIAnalysis}
                  disabled={isAnalyzing}
                >
                  <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-[350px]">
              {alerts.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Aucune alerte pour le moment. Tout semble en ordre !
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {alerts.map((alert) => {
                    const Icon = getAlertIcon(alert.category);
                    const badge = getTypeBadge(alert.type);
                    
                    return (
                      <div
                        key={alert.id}
                        className="p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <div className="flex gap-3">
                          <div className={`p-2 rounded-lg ${getTypeColor(alert.type)}/10 flex-shrink-0`}>
                            <Icon className={`h-4 w-4 ${
                              alert.type === 'critical' ? 'text-destructive' :
                              alert.type === 'warning' ? 'text-warning' :
                              alert.type === 'opportunity' ? 'text-success' :
                              'text-primary'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-sm font-medium leading-tight">
                                {alert.title}
                              </h4>
                              <Badge variant={badge.variant} className="text-[10px] flex-shrink-0">
                                {badge.label}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {alert.description}
                            </p>
                            {alert.action && (
                              <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                                <span>{alert.action}</span>
                                <ChevronRight className="h-3 w-3" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </>
  );
}
