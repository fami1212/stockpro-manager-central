import { useState, useEffect, useCallback } from 'react';
import { Brain, TrendingUp, TrendingDown, Target, BarChart3, PieChart, Activity, Sparkles, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';

interface SmartMetric {
  id: string;
  title: string;
  value: string;
  trend: number;
  prediction: string;
  confidence: number;
  insight: string;
  icon: 'revenue' | 'stock' | 'clients' | 'margin';
}

export const SmartDashboard = () => {
  const { products, sales, clients, loading } = useApp();
  const [smartMetrics, setSmartMetrics] = useState<SmartMetric[]>([]);
  const [performanceScore, setPerformanceScore] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateSmartMetrics = useCallback(() => {
    if (loading) return;
    setIsCalculating(true);

    // Calculs de base
    const totalRevenue = sales.reduce((acc, sale) => acc + sale.total, 0);
    const totalProducts = products.length;
    const activeClients = clients.filter(c => c.status === 'Actif').length;
    
    // Analyse de croissance basée sur les vraies données
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const sixtyDaysAgo = now - 60 * 24 * 60 * 60 * 1000;
    
    const recentSales = sales.filter(s => new Date(s.date).getTime() > thirtyDaysAgo);
    const olderSales = sales.filter(s => {
      const date = new Date(s.date).getTime();
      return date > sixtyDaysAgo && date <= thirtyDaysAgo;
    });
    
    const recentRevenue = recentSales.reduce((acc, s) => acc + s.total, 0);
    const olderRevenue = olderSales.reduce((acc, s) => acc + s.total, 0);
    const salesGrowth = olderRevenue > 0 ? ((recentRevenue - olderRevenue) / olderRevenue) : 0;
    
    // Prédiction basée sur la tendance
    const predictedRevenue = recentRevenue * (1 + Math.max(Math.min(salesGrowth, 0.3), -0.3));
    
    // Santé du stock (algorithme amélioré)
    const stockMetrics = products.reduce((acc, p) => {
      acc.total += p.stock;
      acc.healthy += p.stock > p.alertThreshold ? 1 : 0;
      acc.critical += p.stock <= p.alertThreshold && p.stock > 0 ? 1 : 0;
      acc.outOfStock += p.stock === 0 ? 1 : 0;
      return acc;
    }, { total: 0, healthy: 0, critical: 0, outOfStock: 0 });
    
    const stockHealth = totalProducts > 0 
      ? (stockMetrics.healthy / totalProducts) * 100
      : 0;
    
    // Rétention client (algorithme amélioré)
    const clientMetrics = clients.reduce((acc, c) => {
      acc.total++;
      if (c.status === 'Actif') acc.active++;
      if (c.lastOrder) {
        const daysSinceOrder = (now - new Date(c.lastOrder).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceOrder < 30) acc.recentlyActive++;
        else if (daysSinceOrder < 90) acc.atRisk++;
        else acc.dormant++;
      }
      return acc;
    }, { total: 0, active: 0, recentlyActive: 0, atRisk: 0, dormant: 0 });
    
    const clientRetention = clientMetrics.total > 0 
      ? (clientMetrics.active / clientMetrics.total) * 100
      : 0;
    
    // Analyse des marges (algorithme amélioré)
    const marginData = products
      .filter(p => p.sellPrice > 0 && p.buyPrice > 0)
      .map(p => ((p.sellPrice - p.buyPrice) / p.sellPrice) * 100);
    
    const avgMargin = marginData.length > 0 
      ? marginData.reduce((a, m) => a + m, 0) / marginData.length
      : 0;
    
    const marginHealth = avgMargin > 30 ? 'excellent' : avgMargin > 20 ? 'good' : avgMargin > 10 ? 'fair' : 'poor';
    
    // Score de performance global (pondéré)
    const stockScore = stockHealth;
    const clientScore = clientRetention;
    const marginScore = Math.min(avgMargin * 2, 100);
    const growthScore = 50 + (salesGrowth * 100);
    
    const overallScore = Math.round(
      (stockScore * 0.25) + 
      (clientScore * 0.30) + 
      (marginScore * 0.25) + 
      (Math.min(Math.max(growthScore, 0), 100) * 0.20)
    );
    
    setPerformanceScore(Math.min(Math.max(overallScore, 0), 100));

    const metrics: SmartMetric[] = [
      {
        id: 'revenue-prediction',
        title: 'CA Prévu (30j)',
        value: `${Math.round(predictedRevenue).toLocaleString()} CFA`,
        trend: salesGrowth * 100,
        prediction: salesGrowth > 0 
          ? `+${Math.round(salesGrowth * 100)}% de croissance attendue`
          : salesGrowth < 0 
            ? `${Math.round(salesGrowth * 100)}% baisse prévue`
            : 'Stable',
        confidence: Math.min(0.5 + (sales.length * 0.02), 0.95),
        insight: sales.length > 0 
          ? `Basé sur ${recentSales.length} ventes récentes` 
          : 'Ajoutez des ventes',
        icon: 'revenue'
      },
      {
        id: 'stock-optimization',
        title: 'Santé Stock',
        value: `${Math.round(stockHealth)}%`,
        trend: stockHealth > 80 ? 5 : stockHealth > 60 ? 0 : -5,
        prediction: stockHealth > 80 ? 'Stock optimal' : stockHealth > 60 ? 'Attention requise' : 'Action urgente',
        confidence: 0.95,
        insight: totalProducts > 0 
          ? `${stockMetrics.critical} critiques, ${stockMetrics.outOfStock} ruptures`
          : 'Aucun produit',
        icon: 'stock'
      },
      {
        id: 'client-retention',
        title: 'Clients Actifs',
        value: `${Math.round(clientRetention)}%`,
        trend: clientRetention > 70 ? 8 : clientRetention > 50 ? 2 : -5,
        prediction: clientRetention > 70 ? 'Excellent taux' : clientRetention > 50 ? 'À améliorer' : 'Action requise',
        confidence: 0.88,
        insight: clients.length > 0 
          ? `${clientMetrics.active} actifs, ${clientMetrics.atRisk} à risque`
          : 'Aucun client',
        icon: 'clients'
      },
      {
        id: 'margin-analysis',
        title: 'Marge Moyenne',
        value: `${Math.round(avgMargin)}%`,
        trend: avgMargin > 25 ? 4 : avgMargin > 15 ? 0 : -3,
        prediction: marginHealth === 'excellent' ? 'Marges excellentes' : marginHealth === 'good' ? 'Marges saines' : 'Optimisation possible',
        confidence: 0.92,
        insight: marginData.length > 0 
          ? `Sur ${marginData.length} produits analysés`
          : 'Ajoutez les prix',
        icon: 'margin'
      }
    ];

    setSmartMetrics(metrics);
    setIsCalculating(false);
  }, [products, sales, clients, loading]);

  useEffect(() => {
    calculateSmartMetrics();
  }, [calculateSmartMetrics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  const getScoreColor = () => {
    if (performanceScore >= 80) return 'text-success';
    if (performanceScore >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreLabel = () => {
    if (performanceScore >= 80) return 'Excellent';
    if (performanceScore >= 60) return 'Bon';
    if (performanceScore >= 40) return 'À améliorer';
    return 'Critique';
  };

  const getScoreGradient = () => {
    if (performanceScore >= 80) return 'from-success/20 to-success/5';
    if (performanceScore >= 60) return 'from-warning/20 to-warning/5';
    return 'from-destructive/20 to-destructive/5';
  };

  const getMetricIcon = (icon: string) => {
    switch (icon) {
      case 'revenue': return <BarChart3 className="w-4 h-4" />;
      case 'stock': return <PieChart className="w-4 h-4" />;
      case 'clients': return <Activity className="w-4 h-4" />;
      case 'margin': return <Target className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Score de Performance Global */}
      <Card className="overflow-hidden border-primary/20">
        <div className={`bg-gradient-to-br ${getScoreGradient()} p-4 lg:p-6`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl backdrop-blur-sm">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Score de Performance IA</h3>
                <p className="text-sm text-muted-foreground">Analyse en temps réel</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`text-4xl font-bold ${getScoreColor()}`}>
                {performanceScore}
                <span className="text-lg font-normal text-muted-foreground">/100</span>
              </div>
              <Badge className={`${performanceScore >= 80 ? 'bg-success' : performanceScore >= 60 ? 'bg-warning' : 'bg-destructive'} text-white border-0`}>
                {getScoreLabel()}
              </Badge>
            </div>
          </div>
          
          <div className="mt-4">
            <Progress 
              value={performanceScore} 
              className="h-3 bg-background/50" 
            />
          </div>
          
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-background/50 backdrop-blur-sm">
              <div className="text-xs text-muted-foreground mb-1">Produits</div>
              <div className="text-lg font-bold">{products.length}</div>
            </div>
            <div className="p-3 rounded-xl bg-background/50 backdrop-blur-sm">
              <div className="text-xs text-muted-foreground mb-1">Clients</div>
              <div className="text-lg font-bold">{clients.length}</div>
            </div>
            <div className="p-3 rounded-xl bg-background/50 backdrop-blur-sm">
              <div className="text-xs text-muted-foreground mb-1">Ventes</div>
              <div className="text-lg font-bold">{sales.length}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Métriques Intelligentes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
        {smartMetrics.map((metric, index) => (
          <Card 
            key={metric.id} 
            className="group transition-all duration-300 hover:shadow-lg hover:border-primary/30"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    {getMetricIcon(metric.icon)}
                  </div>
                  <CardTitle className="text-sm lg:text-base font-medium">{metric.title}</CardTitle>
                </div>
                <div className="flex items-center gap-1.5">
                  {metric.trend > 0 ? (
                    <TrendingUp className="w-4 h-4 text-success" />
                  ) : metric.trend < 0 ? (
                    <TrendingDown className="w-4 h-4 text-destructive" />
                  ) : (
                    <Target className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className={`text-sm font-medium ${
                    metric.trend > 0 ? 'text-success' : metric.trend < 0 ? 'text-destructive' : 'text-muted-foreground'
                  }`}>
                    {metric.trend > 0 ? '+' : ''}{metric.trend.toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-4 px-4">
              <div className="space-y-3">
                <div className="text-2xl lg:text-3xl font-bold">{metric.value}</div>
                <div className="text-sm text-primary font-medium">{metric.prediction}</div>
                <div className="text-xs text-muted-foreground">{metric.insight}</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Confiance</span>
                  <Progress value={metric.confidence * 100} className="h-1.5 flex-1" />
                  <span className="text-xs font-medium">{Math.round(metric.confidence * 100)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Résumé rapide */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
        <Card className="group hover:shadow-md transition-all">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
              <CardTitle className="text-sm font-medium">Ventes</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pb-4 px-4">
            {sales.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucune vente</p>
            ) : (
              <div className="space-y-2">
                <div className="text-xl font-bold">{sales.reduce((acc, sale) => acc + sale.total, 0).toLocaleString()} CFA</div>
                <div className="text-xs text-muted-foreground">
                  Moy: {Math.round(sales.reduce((acc, sale) => acc + sale.total, 0) / sales.length).toLocaleString()} CFA
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-all">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-success/10">
                <PieChart className="w-4 h-4 text-success" />
              </div>
              <CardTitle className="text-sm font-medium">Stock</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pb-4 px-4">
            {products.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucun produit</p>
            ) : (
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Normal</span>
                  <span className="font-medium text-success">{products.filter(p => p.stock > p.alertThreshold).length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Faible</span>
                  <span className="font-medium text-warning">{products.filter(p => p.stock <= p.alertThreshold && p.stock > 0).length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rupture</span>
                  <span className="font-medium text-destructive">{products.filter(p => p.stock === 0).length}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-all">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-info/10">
                <Activity className="w-4 h-4 text-info" />
              </div>
              <CardTitle className="text-sm font-medium">Activité</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pb-4 px-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full" />
                <span className="text-sm">{products.length} produits</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-sm">{clients.length} clients</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-info rounded-full" />
                <span className="text-sm">{sales.length} ventes</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
