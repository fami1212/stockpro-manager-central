
import { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Target, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';

interface AIInsight {
  id: string;
  type: 'prediction' | 'recommendation' | 'alert' | 'optimization';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  data?: any;
}

export const AIAssistant = () => {
  const { products, clients, sales, categories, loading } = useApp();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Système de prédiction de stock intelligent avec vraies données
  const predictStockNeeds = () => {
    const predictions: AIInsight[] = [];
    
    if (products.length === 0) return predictions;
    
    products.forEach(product => {
      // Calcul basé sur les vraies données de vente
      const productSales = sales.filter(sale => 
        sale.items.some(item => item.product === product.name)
      );
      
      const totalSold = productSales.reduce((acc, sale) => {
        const item = sale.items.find(item => item.product === product.name);
        return acc + (item ? item.quantity : 0);
      }, 0);
      
      const averageSales = productSales.length > 0 ? totalSold / Math.max(productSales.length, 1) : 5;
      const predictedStock = Math.max(Math.floor(averageSales * 2), 10);
      const daysUntilStockout = product.stock > 0 ? Math.floor(product.stock / Math.max(averageSales / 30, 0.5)) : 0;
      
      if (product.stock <= product.alertThreshold || daysUntilStockout < 7) {
        predictions.push({
          id: `stock-${product.id}`,
          type: 'prediction',
          title: `Stock critique pour ${product.name}`,
          description: product.stock === 0 
            ? `Rupture de stock détectée. Commandez ${predictedStock} unités immédiatement.`
            : `Stock faible (${product.stock} restant). Rupture prévue dans ${daysUntilStockout} jours. Commandez ${predictedStock} unités.`,
          confidence: 0.85,
          impact: product.stock === 0 ? 'high' : 'medium',
          actionable: true,
          data: { productId: product.id, recommendedOrder: predictedStock, currentStock: product.stock }
        });
      }
    });
    
    return predictions;
  };

  // Analyseur de tendances avec vraies données
  const analyzeTrends = () => {
    const trends: AIInsight[] = [];
    
    if (products.length === 0) return trends;
    
    // Analyse des marges réelles
    const lowMarginProducts = products.filter(p => {
      if (p.sellPrice === 0 || p.buyPrice === 0) return false;
      const margin = ((p.sellPrice - p.buyPrice) / p.sellPrice) * 100;
      return margin < 20;
    });
    
    if (lowMarginProducts.length > 0) {
      trends.push({
        id: 'margin-optimization',
        type: 'optimization',
        title: 'Optimisation des marges détectée',
        description: `${lowMarginProducts.length} produits ont des marges faibles (<20%). Révision des prix recommandée.`,
        confidence: 0.92,
        impact: 'high',
        actionable: true,
        data: { products: lowMarginProducts.map(p => p.name) }
      });
    }

    // Analyse des ventes
    if (sales.length > 0) {
      const totalRevenue = sales.reduce((acc, sale) => acc + sale.total, 0);
      const averageOrderValue = totalRevenue / sales.length;
      
      if (averageOrderValue < 50) {
        trends.push({
          id: 'order-value',
          type: 'recommendation',
          title: 'Valeur moyenne des commandes faible',
          description: `Panier moyen de ${Math.round(averageOrderValue).toLocaleString()} CFA. Opportunité d'augmentation par vente croisée.`,
          confidence: 0.78,
          impact: 'medium',
          actionable: true,
          data: { currentAOV: averageOrderValue }
        });
      }
    }

    return trends;
  };

  // Recommandations intelligentes avec vraies données
  const generateRecommendations = () => {
    const recommendations: AIInsight[] = [];
    
    // Analyse de diversification
    if (categories.length > 0 && products.length > 0) {
      const avgProductsPerCategory = products.length / categories.length;
      
      if (avgProductsPerCategory > 10) {
        recommendations.push({
          id: 'diversification',
          type: 'recommendation',
          title: 'Diversification du catalogue',
          description: `${Math.round(avgProductsPerCategory)} produits par catégorie en moyenne. Considérez ajouter de nouvelles catégories.`,
          confidence: 0.71,
          impact: 'medium',
          actionable: true,
          data: { currentCategories: categories.length, totalProducts: products.length }
        });
      }
    }

    // Analyse des clients inactifs
    if (clients.length > 0) {
      const inactiveClients = clients.filter(c => {
        if (!c.lastOrder) return true;
        const lastOrderDate = new Date(c.lastOrder);
        const daysSinceOrder = (Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceOrder > 60;
      });

      if (inactiveClients.length > 0) {
        recommendations.push({
          id: 'client-reactivation',
          type: 'recommendation',
          title: 'Clients à réactiver',
          description: `${inactiveClients.length} clients inactifs depuis plus de 60 jours. Campagne de relance recommandée.`,
          confidence: 0.88,
          impact: 'high',
          actionable: true,
          data: { inactiveCount: inactiveClients.length, totalClients: clients.length }
        });
      }
    }

    // Recommandation si pas de données
    if (products.length === 0) {
      recommendations.push({
        id: 'setup-products',
        type: 'recommendation',
        title: 'Configurez vos premiers produits',
        description: 'Ajoutez vos produits pour commencer à bénéficier des analyses IA personnalisées.',
        confidence: 1.0,
        impact: 'high',
        actionable: true
      });
    }

    if (sales.length === 0) {
      recommendations.push({
        id: 'first-sales',
        type: 'recommendation',
        title: 'Enregistrez vos premières ventes',
        description: 'Commencez à enregistrer vos ventes pour des analyses prédictives précises.',
        confidence: 1.0,
        impact: 'high',
        actionable: true
      });
    }

    return recommendations;
  };

  // Fonction principale d'analyse IA
  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulation d'analyse IA
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const stockPredictions = predictStockNeeds();
      const trendAnalysis = analyzeTrends();
      const recommendations = generateRecommendations();
      
      const allInsights = [...stockPredictions, ...trendAnalysis, ...recommendations];
      
      // Tri par impact et confiance
      allInsights.sort((a, b) => {
        const impactWeight = { high: 3, medium: 2, low: 1 };
        return (impactWeight[b.impact] * b.confidence) - (impactWeight[a.impact] * a.confidence);
      });
      
      setInsights(allInsights);
      
      toast({
        title: 'Analyse IA terminée',
        description: `${allInsights.length} insights générés avec vos données`
      });
    } catch (error) {
      toast({
        title: 'Erreur d\'analyse',
        description: 'Impossible de terminer l\'analyse IA',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (!loading && (products.length > 0 || clients.length > 0 || sales.length > 0)) {
      runAIAnalysis();
    }
  }, [products, clients, sales, loading]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'prediction': return <TrendingUp className="w-4 h-4" />;
      case 'recommendation': return <Lightbulb className="w-4 h-4" />;
      case 'alert': return <AlertTriangle className="w-4 h-4" />;
      case 'optimization': return <Target className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getInsightColor = (type: string, impact: string) => {
    if (type === 'alert') return 'bg-red-100 text-red-700 border-red-200';
    if (impact === 'high') return 'bg-orange-100 text-orange-700 border-orange-200';
    if (impact === 'medium') return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold">Assistant IA</h2>
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            Données Personnalisées
          </Badge>
        </div>
        <Button 
          onClick={runAIAnalysis} 
          disabled={isAnalyzing}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Analyse en cours...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Analyser mes données
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4">
        {insights.length === 0 && !isAnalyzing ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                {products.length === 0 && sales.length === 0 
                  ? "Ajoutez des produits et des ventes pour commencer l'analyse IA"
                  : "Cliquez sur 'Analyser mes données' pour générer des insights personnalisés"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          insights.map((insight) => (
            <Card key={insight.id} className={`border-l-4 ${getInsightColor(insight.type, insight.impact)}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getInsightIcon(insight.type)}
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {Math.round(insight.confidence * 100)}% confiance
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
              <CardContent>
                <CardDescription className="text-sm mb-4">
                  {insight.description}
                </CardDescription>
                {insight.data && (
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border-l-4 border-blue-200">
                    <strong>Détails supplémentaires:</strong>
                    {insight.data.productId && <div>• Produit concerné</div>}
                    {insight.data.recommendedOrder && <div>• Quantité recommandée: {insight.data.recommendedOrder}</div>}
                    {insight.data.currentStock !== undefined && <div>• Stock actuel: {insight.data.currentStock}</div>}
                    {insight.data.products && <div>• Produits affectés: {insight.data.products.slice(0,3).join(', ')}{insight.data.products.length > 3 ? '...' : ''}</div>}
                    {insight.data.currentAOV && <div>• Panier moyen actuel: {Math.round(insight.data.currentAOV).toLocaleString()} CFA</div>}
                    {insight.data.inactiveCount && <div>• Clients inactifs: {insight.data.inactiveCount}/{insight.data.totalClients}</div>}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
