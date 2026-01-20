import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useApp } from '@/contexts/AppContext';
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

  // Generate smart alerts based on data analysis
  const generateAlerts = useMemo(() => {
    const newAlerts: SmartAlert[] = [];
    const now = new Date();

    // === STOCK ALERTS ===
    // Critical: Products with zero stock
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
        data: outOfStock,
        createdAt: now
      });
    }

    // Warning: Products below alert threshold
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
        data: lowStock,
        createdAt: now
      });
    }

    // Opportunity: Overstocked products (stock > 3x threshold)
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
        data: overStock,
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
          createdAt: now
        });
      }
    }

    // === CLIENT ALERTS ===
    // Inactive clients opportunity
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
        data: inactiveClients,
        createdAt: now
      });
    }

    // VIP clients (top 10% by revenue)
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
          data: vipClients,
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
        data: lowMarginProducts,
        createdAt: now
      });
    }

    return newAlerts;
  }, [products, sales, clients]);

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
      case 'critical': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'opportunity': return 'bg-green-500';
      case 'info': return 'bg-blue-500';
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
      // Simulate AI analysis delay
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
                    {opportunityCount > 0 && <span className="text-green-600">{opportunityCount} opportunités</span>}
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
                              alert.type === 'critical' ? 'text-red-500' :
                              alert.type === 'warning' ? 'text-yellow-600' :
                              alert.type === 'opportunity' ? 'text-green-600' :
                              'text-blue-500'
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
