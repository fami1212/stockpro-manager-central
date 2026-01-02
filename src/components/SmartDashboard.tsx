import { useState, useEffect } from 'react';
import { Brain, TrendingUp, TrendingDown, Target, BarChart3, PieChart, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/contexts/AppContext';

interface SmartMetric {
  id: string;
  title: string;
  value: string;
  trend: number;
  prediction: string;
  confidence: number;
  insight: string;
}

export const SmartDashboard = () => {
  const { products, sales, clients, loading } = useApp();
  const [smartMetrics, setSmartMetrics] = useState<SmartMetric[]>([]);
  const [performanceScore, setPerformanceScore] = useState(0);

  const calculateSmartMetrics = () => {
    if (loading) return;

    const totalRevenue = sales.reduce((acc, sale) => acc + sale.total, 0);
    const totalProducts = products.length;
    const activeClients = clients.filter(c => c.status === 'Actif').length;
    
    const salesGrowth = sales.length > 0 ? Math.min(Math.max(sales.length * 0.05, 0.05), 0.20) : 0.10;
    const predictedRevenue = totalRevenue * (1 + salesGrowth);
    
    const stockHealth = totalProducts > 0 
      ? products.filter(p => p.stock > p.alertThreshold).length / totalProducts 
      : 0;
    
    const clientSatisfaction = activeClients / Math.max(clients.length, 1);
    
    const marginHealth = totalProducts > 0 
      ? products.reduce((acc, p) => {
          if (p.sellPrice === 0 || p.buyPrice === 0) return acc;
          const margin = (p.sellPrice - p.buyPrice) / p.sellPrice;
          return acc + margin;
        }, 0) / totalProducts 
      : 0;
    
    const overallScore = Math.round((stockHealth * 0.3 + clientSatisfaction * 0.4 + marginHealth * 0.3) * 100);
    setPerformanceScore(overallScore);

    const metrics: SmartMetric[] = [
      {
        id: 'revenue-prediction',
        title: 'CA Prévu (30j)',
        value: `${predictedRevenue.toLocaleString()} CFA`,
        trend: salesGrowth * 100,
        prediction: `+${Math.round(salesGrowth * 100)}% basé sur vos données`,
        confidence: sales.length > 5 ? 0.89 : 0.65,
        insight: sales.length > 0 
          ? `Basé sur ${sales.length} ventes` 
          : 'Ajoutez des ventes pour des prédictions'
      },
      {
        id: 'stock-optimization',
        title: 'Santé Stock',
        value: `${Math.round(stockHealth * 100)}%`,
        trend: stockHealth > 0.8 ? 5 : -3,
        prediction: stockHealth > 0.8 ? 'Stock bien géré' : 'Attention aux ruptures',
        confidence: 0.94,
        insight: totalProducts > 0 
          ? `${products.filter(p => p.stock <= p.alertThreshold).length} produits en alerte`
          : 'Ajoutez des produits'
      },
      {
        id: 'client-retention',
        title: 'Clients Actifs',
        value: `${Math.round(clientSatisfaction * 100)}%`,
        trend: clientSatisfaction > 0.7 ? 8.5 : -2.1,
        prediction: clientSatisfaction > 0.7 ? 'Excellent taux' : 'Besoin de réactivation',
        confidence: 0.82,
        insight: `${activeClients} actifs sur ${clients.length}`
      },
      {
        id: 'margin-analysis',
        title: 'Marge Moyenne',
        value: `${Math.round(marginHealth * 100)}%`,
        trend: marginHealth > 0.25 ? 4 : -2,
        prediction: marginHealth > 0.25 ? 'Marges saines' : 'Optimisation possible',
        confidence: 0.91,
        insight: marginHealth > 0 
          ? `Sur ${products.filter(p => p.buyPrice > 0 && p.sellPrice > 0).length} produits`
          : 'Ajoutez les prix'
      }
    ];

    setSmartMetrics(metrics);
  };

  useEffect(() => {
    calculateSmartMetrics();
  }, [products, sales, clients, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
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
    return 'À améliorer';
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Score de Performance Global */}
      <Card className="overflow-hidden border-primary/20">
        <div className="metric-card-gradient-primary p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-foreground/20 rounded-lg backdrop-blur-sm">
                <Brain className="w-5 h-5 lg:w-6 lg:h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-base lg:text-lg font-semibold text-primary-foreground">Score IA</h3>
                <p className="text-xs lg:text-sm text-primary-foreground/70">Basé sur vos données</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-2xl lg:text-3xl font-bold text-primary-foreground">{performanceScore}</div>
              <Badge className="bg-primary-foreground/20 text-primary-foreground border-0">
                {getScoreLabel()}
              </Badge>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={performanceScore} className="h-2 bg-primary-foreground/20" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 lg:gap-4 text-center text-primary-foreground/80">
            <div className="p-2 rounded-lg bg-primary-foreground/10">
              <div className="text-xs lg:text-sm">Stock</div>
              <div className="text-sm lg:text-base font-semibold text-primary-foreground">{products.length}</div>
            </div>
            <div className="p-2 rounded-lg bg-primary-foreground/10">
              <div className="text-xs lg:text-sm">Clients</div>
              <div className="text-sm lg:text-base font-semibold text-primary-foreground">{clients.length}</div>
            </div>
            <div className="p-2 rounded-lg bg-primary-foreground/10">
              <div className="text-xs lg:text-sm">Ventes</div>
              <div className="text-sm lg:text-base font-semibold text-primary-foreground">{sales.length}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Métriques Intelligentes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
        {smartMetrics.map((metric, index) => (
          <Card 
            key={metric.id} 
            className={`animate-fade-in transition-all hover:shadow-md`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm lg:text-base font-medium">{metric.title}</CardTitle>
                <div className="flex items-center gap-1">
                  {metric.trend > 0 ? (
                    <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 text-success" />
                  ) : (
                    <TrendingDown className="w-3 h-3 lg:w-4 lg:h-4 text-destructive" />
                  )}
                  <span className={`text-xs lg:text-sm font-medium ${metric.trend > 0 ? 'text-success' : 'text-destructive'}`}>
                    {metric.trend > 0 ? '+' : ''}{metric.trend.toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-4 px-4">
              <div className="space-y-2">
                <div className="text-xl lg:text-2xl font-bold text-foreground">{metric.value}</div>
                <div className="text-xs lg:text-sm text-primary font-medium">{metric.prediction}</div>
                <div className="text-xs text-muted-foreground">{metric.insight}</div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-muted-foreground">Confiance</div>
                  <Progress value={metric.confidence * 100} className="h-1 flex-1" />
                  <div className="text-xs text-muted-foreground">{Math.round(metric.confidence * 100)}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Résumé rapide */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
        <Card className="animate-fade-in">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-medium">Ventes</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pb-4 px-4">
            {sales.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucune vente</p>
            ) : (
              <div className="space-y-1">
                <div className="text-lg font-bold">{sales.reduce((acc, sale) => acc + sale.total, 0).toLocaleString()} CFA</div>
                <div className="text-xs text-muted-foreground">
                  Moy: {Math.round(sales.reduce((acc, sale) => acc + sale.total, 0) / sales.length).toLocaleString()} CFA
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-success" />
              <CardTitle className="text-sm font-medium">Stock</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pb-4 px-4">
            {products.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucun produit</p>
            ) : (
              <div className="space-y-1">
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

        <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-info" />
              <CardTitle className="text-sm font-medium">Activité</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pb-4 px-4">
            <div className="space-y-1">
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
