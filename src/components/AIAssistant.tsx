import { useState, useEffect, useCallback } from 'react';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Target, Zap, Sparkles, RefreshCw, ChevronRight, Shield, Rocket } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { toast } from '@/hooks/use-toast';

interface LocalInsight {
  id: string;
  type: 'prediction' | 'recommendation' | 'alert' | 'optimization';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  data?: Record<string, unknown>;
}

export const AIAssistant = () => {
  const { products, clients, sales, categories, loading } = useApp();
  const { isLoading: isAILoading, analyzeComprehensive, lastAnalysis } = useAIAnalysis();
  const [localInsights, setLocalInsights] = useState<LocalInsight[]>([]);
  const [isLocalAnalyzing, setIsLocalAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('local');

  // Algorithmes locaux améliorés
  const predictStockNeeds = useCallback(() => {
    const predictions: LocalInsight[] = [];
    if (products.length === 0) return predictions;
    
    // Calcul de vélocité de vente par produit
    const productVelocity = new Map<string, number>();
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    
    products.forEach(product => {
      const recentSales = sales.filter(sale => {
        const saleDate = new Date(sale.date).getTime();
        return saleDate >= thirtyDaysAgo && sale.items.some(item => item.product === product.name);
      });
      
      const totalSold = recentSales.reduce((acc, sale) => {
        const item = sale.items.find(i => i.product === product.name);
        return acc + (item ? item.quantity : 0);
      }, 0);
      
      const dailyVelocity = totalSold / 30;
      productVelocity.set(product.id, dailyVelocity);
      
      // Prédiction de rupture
      const daysUntilStockout = dailyVelocity > 0 ? Math.floor(product.stock / dailyVelocity) : Infinity;
      const safetyStock = Math.ceil(dailyVelocity * 14); // 2 semaines de sécurité
      const recommendedOrder = Math.max(safetyStock - product.stock, 0);
      
      if (daysUntilStockout < 14 || product.stock <= product.alertThreshold) {
        const confidence = Math.min(0.95, 0.6 + (recentSales.length * 0.05));
        predictions.push({
          id: `stock-${product.id}`,
          type: 'prediction',
          title: product.stock === 0 ? `🚨 Rupture: ${product.name}` : `⚠️ Stock critique: ${product.name}`,
          description: product.stock === 0 
            ? `Rupture totale détectée. Vélocité: ${dailyVelocity.toFixed(1)}/jour. Commander ${Math.max(recommendedOrder, 20)} unités.`
            : `${product.stock} restants (~${daysUntilStockout}j). Vélocité: ${dailyVelocity.toFixed(1)}/jour. Recommandation: ${recommendedOrder} unités.`,
          confidence,
          impact: product.stock === 0 ? 'high' : daysUntilStockout < 7 ? 'high' : 'medium',
          actionable: true,
          data: { 
            productId: product.id, 
            recommendedOrder: Math.max(recommendedOrder, 10), 
            currentStock: product.stock,
            velocity: dailyVelocity,
            daysUntilStockout
          }
        });
      }
    });
    
    return predictions;
  }, [products, sales]);

  const analyzeProfitability = useCallback(() => {
    const insights: LocalInsight[] = [];
    if (products.length === 0) return insights;
    
    // Analyse des marges
    const marginAnalysis = products
      .filter(p => p.sellPrice > 0 && p.buyPrice > 0)
      .map(p => ({
        ...p,
        margin: ((p.sellPrice - p.buyPrice) / p.sellPrice) * 100,
        profit: p.sellPrice - p.buyPrice
      }))
      .sort((a, b) => a.margin - b.margin);
    
    const lowMarginProducts = marginAnalysis.filter(p => p.margin < 15);
    const highMarginProducts = marginAnalysis.filter(p => p.margin > 40);
    const avgMargin = marginAnalysis.reduce((a, p) => a + p.margin, 0) / marginAnalysis.length;
    
    if (lowMarginProducts.length > 0) {
      insights.push({
        id: 'low-margin',
        type: 'optimization',
        title: `💰 ${lowMarginProducts.length} produits à faible marge`,
        description: `Marges <15%: ${lowMarginProducts.slice(0, 3).map(p => p.name).join(', ')}${lowMarginProducts.length > 3 ? '...' : ''}. Potentiel d'optimisation: +${Math.round(lowMarginProducts.length * 5000)} CFA/mois.`,
        confidence: 0.92,
        impact: 'high',
        actionable: true,
        data: { products: lowMarginProducts.map(p => p.name), avgMargin }
      });
    }
    
    if (highMarginProducts.length > 0) {
      insights.push({
        id: 'high-margin-opportunity',
        type: 'recommendation',
        title: `🌟 ${highMarginProducts.length} produits stars identifiés`,
        description: `Marges >40%: ${highMarginProducts.slice(0, 3).map(p => `${p.name} (${p.margin.toFixed(0)}%)`).join(', ')}. Augmentez leur visibilité!`,
        confidence: 0.88,
        impact: 'medium',
        actionable: true,
        data: { products: highMarginProducts.map(p => p.name) }
      });
    }

    return insights;
  }, [products]);

  const analyzeClientBehavior = useCallback(() => {
    const insights: LocalInsight[] = [];
    if (clients.length === 0) return insights;
    
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;
    
    // Segmentation clients
    const segments = {
      vip: clients.filter(c => c.totalAmount > 500000),
      active: clients.filter(c => {
        if (!c.lastOrder) return false;
        return new Date(c.lastOrder).getTime() > thirtyDaysAgo;
      }),
      dormant: clients.filter(c => {
        if (!c.lastOrder) return true;
        const lastDate = new Date(c.lastOrder).getTime();
        return lastDate < ninetyDaysAgo;
      }),
      atRisk: clients.filter(c => {
        if (!c.lastOrder) return false;
        const lastDate = new Date(c.lastOrder).getTime();
        return lastDate < thirtyDaysAgo && lastDate > ninetyDaysAgo && c.totalOrders > 2;
      })
    };
    
    if (segments.atRisk.length > 0) {
      insights.push({
        id: 'clients-at-risk',
        type: 'alert',
        title: `🔥 ${segments.atRisk.length} clients à risque`,
        description: `Clients réguliers inactifs: ${segments.atRisk.slice(0, 3).map(c => c.name).join(', ')}. Action de réactivation urgente recommandée.`,
        confidence: 0.85,
        impact: 'high',
        actionable: true,
        data: { clients: segments.atRisk.map(c => c.name), potentialLoss: segments.atRisk.reduce((a, c) => a + (c.totalAmount / c.totalOrders), 0) }
      });
    }
    
    if (segments.vip.length > 0) {
      insights.push({
        id: 'vip-clients',
        type: 'recommendation',
        title: `👑 ${segments.vip.length} clients VIP détectés`,
        description: `Top clients: ${segments.vip.slice(0, 3).map(c => `${c.name} (${c.totalAmount.toLocaleString()} CFA)`).join(', ')}. Programme fidélité recommandé.`,
        confidence: 0.95,
        impact: 'high',
        actionable: true,
        data: { clients: segments.vip.map(c => c.name), totalValue: segments.vip.reduce((a, c) => a + c.totalAmount, 0) }
      });
    }
    
    if (segments.dormant.length > 5) {
      insights.push({
        id: 'dormant-clients',
        type: 'optimization',
        title: `😴 ${segments.dormant.length} clients dormants`,
        description: `${Math.round((segments.dormant.length / clients.length) * 100)}% de votre base inactive. Campagne de réactivation: potentiel ${Math.round(segments.dormant.length * 25000).toLocaleString()} CFA.`,
        confidence: 0.78,
        impact: 'medium',
        actionable: true,
        data: { count: segments.dormant.length, percentage: Math.round((segments.dormant.length / clients.length) * 100) }
      });
    }

    return insights;
  }, [clients]);

  const analyzeSalesTrends = useCallback(() => {
    const insights: LocalInsight[] = [];
    if (sales.length < 5) return insights;
    
    // Analyse des tendances
    const sortedSales = [...sales].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const recentSales = sortedSales.slice(-10);
    const olderSales = sortedSales.slice(-20, -10);
    
    const recentAvg = recentSales.reduce((a, s) => a + s.total, 0) / recentSales.length;
    const olderAvg = olderSales.length > 0 ? olderSales.reduce((a, s) => a + s.total, 0) / olderSales.length : recentAvg;
    
    const growth = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
    
    if (Math.abs(growth) > 10) {
      insights.push({
        id: 'sales-trend',
        type: growth > 0 ? 'prediction' : 'alert',
        title: growth > 0 ? `📈 Croissance de ${growth.toFixed(1)}%` : `📉 Baisse de ${Math.abs(growth).toFixed(1)}%`,
        description: growth > 0 
          ? `Panier moyen en hausse: ${Math.round(recentAvg).toLocaleString()} CFA vs ${Math.round(olderAvg).toLocaleString()} CFA. Tendance positive!`
          : `Panier moyen en baisse: ${Math.round(recentAvg).toLocaleString()} CFA vs ${Math.round(olderAvg).toLocaleString()} CFA. Action requise.`,
        confidence: 0.82,
        impact: Math.abs(growth) > 20 ? 'high' : 'medium',
        actionable: growth < 0,
        data: { recentAvg, olderAvg, growth }
      });
    }
    
    // Meilleur jour de vente
    const salesByDay = sales.reduce((acc, sale) => {
      const day = new Date(sale.date).toLocaleDateString('fr-FR', { weekday: 'long' });
      acc[day] = (acc[day] || 0) + sale.total;
      return acc;
    }, {} as Record<string, number>);
    
    const bestDay = Object.entries(salesByDay).sort((a, b) => b[1] - a[1])[0];
    if (bestDay) {
      insights.push({
        id: 'best-day',
        type: 'recommendation',
        title: `📅 Meilleur jour: ${bestDay[0]}`,
        description: `${bestDay[0]} génère ${Math.round(bestDay[1]).toLocaleString()} CFA. Planifiez vos promotions ce jour!`,
        confidence: 0.75,
        impact: 'low',
        actionable: true,
        data: { day: bestDay[0], total: bestDay[1] }
      });
    }

    return insights;
  }, [sales]);

  // Analyse locale
  const runLocalAnalysis = useCallback(async () => {
    setIsLocalAnalyzing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const allInsights = [
        ...predictStockNeeds(),
        ...analyzeProfitability(),
        ...analyzeClientBehavior(),
        ...analyzeSalesTrends()
      ];
      
      // Tri par impact et confiance
      allInsights.sort((a, b) => {
        const impactWeight = { high: 3, medium: 2, low: 1 };
        return (impactWeight[b.impact] * b.confidence) - (impactWeight[a.impact] * a.confidence);
      });
      
      setLocalInsights(allInsights);
      
      if (allInsights.length > 0) {
        toast({
          title: 'Analyse terminée',
          description: `${allInsights.length} insights générés`
        });
      }
    } finally {
      setIsLocalAnalyzing(false);
    }
  }, [predictStockNeeds, analyzeProfitability, analyzeClientBehavior, analyzeSalesTrends]);

  // Analyse IA réelle
  const runAIAnalysis = useCallback(async () => {
    const businessData = {
      products: products.map(p => ({
        name: p.name,
        stock: p.stock,
        alertThreshold: p.alertThreshold,
        sellPrice: p.sellPrice,
        buyPrice: p.buyPrice,
        category: p.category
      })),
      sales: sales.map(s => ({
        total: s.total,
        date: s.date,
        items: s.items.map(i => ({ product: i.product, quantity: i.quantity }))
      })),
      clients: clients.map(c => ({
        name: c.name,
        status: c.status,
        totalOrders: c.totalOrders,
        totalAmount: c.totalAmount,
        lastOrder: c.lastOrder
      }))
    };
    
    await analyzeComprehensive(businessData);
  }, [products, sales, clients, analyzeComprehensive]);

  useEffect(() => {
    if (!loading && (products.length > 0 || clients.length > 0 || sales.length > 0)) {
      runLocalAnalysis();
    }
  }, [loading, products.length, clients.length, sales.length, runLocalAnalysis]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'prediction': return <TrendingUp className="w-4 h-4" />;
      case 'recommendation': return <Lightbulb className="w-4 h-4" />;
      case 'alert': return <AlertTriangle className="w-4 h-4" />;
      case 'optimization': return <Target className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getImpactStyles = (impact: string) => {
    switch (impact) {
      case 'high': return 'border-l-destructive bg-destructive/5';
      case 'medium': return 'border-l-warning bg-warning/5';
      default: return 'border-l-success bg-success/5';
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary to-primary/60 rounded-xl">
            <Brain className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Assistant IA</h2>
            <p className="text-sm text-muted-foreground">Analyses intelligentes</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={runLocalAnalysis} 
            disabled={isLocalAnalyzing}
            variant="outline"
            size="sm"
          >
            {isLocalAnalyzing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            Analyse rapide
          </Button>
          <Button 
            onClick={runAIAnalysis} 
            disabled={isAILoading}
            size="sm"
            className="bg-gradient-to-r from-primary to-primary/80"
          >
            {isAILoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Analyse IA avancée
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="local" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Analyse locale
            {localInsights.length > 0 && (
              <Badge variant="secondary" className="ml-1">{localInsights.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            IA Avancée
            {lastAnalysis && <Badge variant="secondary" className="ml-1">✓</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="local" className="mt-4 space-y-4">
          {localInsights.length === 0 && !isLocalAnalyzing ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {products.length === 0 && sales.length === 0 
                    ? "Ajoutez des produits et des ventes pour commencer"
                    : "Cliquez sur 'Analyse rapide' pour générer des insights"
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {localInsights.map((insight) => (
                <Card key={insight.id} className={`border-l-4 ${getImpactStyles(insight.impact)} transition-all hover:shadow-md`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-background">
                          {getInsightIcon(insight.type)}
                        </div>
                        <CardTitle className="text-base">{insight.title}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {Math.round(insight.confidence * 100)}%
                        </Badge>
                        <Badge 
                          variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {insight.impact}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ai" className="mt-4 space-y-4">
          {!lastAnalysis ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Analyse IA Avancée</h3>
                <p className="text-muted-foreground mb-4">
                  Utilisez l'IA pour des insights plus profonds et personnalisés
                </p>
                <Button onClick={runAIAnalysis} disabled={isAILoading}>
                  {isAILoading ? 'Analyse en cours...' : 'Lancer l\'analyse IA'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Summary */}
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    Résumé IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground">{lastAnalysis.summary}</p>
                </CardContent>
              </Card>

              {/* Insights */}
              {lastAnalysis.insights?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Lightbulb className="w-5 h-5 text-warning" />
                      Insights clés
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {lastAnalysis.insights.map((insight, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <ChevronRight className="w-4 h-4 mt-0.5 text-primary" />
                        <div className="flex-1">
                          <div className="font-medium">{insight.title}</div>
                          <p className="text-sm text-muted-foreground">{insight.description}</p>
                        </div>
                        <Badge variant={insight.impact === 'high' ? 'destructive' : 'secondary'}>
                          {insight.impact}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {lastAnalysis.recommendations?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Rocket className="w-5 h-5 text-success" />
                      Recommandations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {lastAnalysis.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/20">
                        <div className="p-1 rounded-full bg-success/20">
                          <Target className="w-3 h-3 text-success" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{rec.title}</div>
                          <p className="text-sm text-muted-foreground">{rec.action}</p>
                        </div>
                        <Badge variant={rec.priority === 'urgent' ? 'destructive' : 'outline'}>
                          {rec.priority}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Risks */}
              {lastAnalysis.risks?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Shield className="w-5 h-5 text-destructive" />
                      Risques identifiés
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {lastAnalysis.risks.map((risk, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                        <AlertTriangle className="w-4 h-4 mt-0.5 text-destructive" />
                        <div className="flex-1">
                          <div className="font-medium">{risk.title}</div>
                          <p className="text-sm text-muted-foreground">{risk.description}</p>
                        </div>
                        <Badge variant={risk.severity === 'critical' ? 'destructive' : 'outline'}>
                          {risk.severity}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Opportunities */}
              {lastAnalysis.opportunities?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="w-5 h-5 text-info" />
                      Opportunités
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {lastAnalysis.opportunities.map((opp, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-info/5 border border-info/20">
                        <Sparkles className="w-4 h-4 mt-0.5 text-info" />
                        <div className="flex-1">
                          <div className="font-medium">{opp.title}</div>
                          <p className="text-sm text-muted-foreground">{opp.description}</p>
                        </div>
                        <Badge variant="outline">{opp.potential}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
