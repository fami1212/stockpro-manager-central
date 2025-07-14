
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
  const { state } = useApp();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Système de prédiction de stock intelligent
  const predictStockNeeds = () => {
    const predictions: AIInsight[] = [];
    
    state.products.forEach(product => {
      // Simulation d'algorithme de prédiction basé sur les tendances
      const averageSales = Math.random() * 20 + 5; // Simulation de données historiques
      const predictedStock = Math.floor(averageSales * 1.5);
      const daysUntilStockout = Math.floor(product.stock / (averageSales / 30));
      
      if (daysUntilStockout < 7) {
        predictions.push({
          id: `stock-${product.id}`,
          type: 'prediction',
          title: `Stock critique prévu pour ${product.name}`,
          description: `Rupture de stock prévue dans ${daysUntilStockout} jours. Commandez ${predictedStock} unités maintenant.`,
          confidence: 0.85,
          impact: 'high',
          actionable: true,
          data: { productId: product.id, recommendedOrder: predictedStock }
        });
      }
    });
    
    return predictions;
  };

  // Analyseur de tendances et recommandations
  const analyzeTrends = () => {
    const trends: AIInsight[] = [];
    
    // Analyse des marges
    const lowMarginProducts = state.products.filter(p => {
      const margin = ((p.sellPrice - p.buyPrice) / p.sellPrice) * 100;
      return margin < 20;
    });
    
    if (lowMarginProducts.length > 0) {
      trends.push({
        id: 'margin-optimization',
        type: 'optimization',
        title: 'Optimisation des marges détectée',
        description: `${lowMarginProducts.length} produits ont des marges faibles (<20%). Augmentation recommandée de 5-10%.`,
        confidence: 0.92,
        impact: 'high',
        actionable: true,
        data: { products: lowMarginProducts }
      });
    }

    // Détection d'anomalies dans les prix
    const priceAnomalies = state.products.filter(p => {
      const expectedPrice = p.buyPrice * 1.4; // Marge standard de 40%
      const priceDifference = Math.abs(p.sellPrice - expectedPrice) / expectedPrice;
      return priceDifference > 0.3; // Plus de 30% de différence
    });

    if (priceAnomalies.length > 0) {
      trends.push({
        id: 'price-anomaly',
        type: 'alert',
        title: 'Anomalies de prix détectées',
        description: `${priceAnomalies.length} produits ont des prix suspects. Vérification recommandée.`,
        confidence: 0.78,
        impact: 'medium',
        actionable: true,
        data: { products: priceAnomalies }
      });
    }

    return trends;
  };

  // Recommandations intelligentes
  const generateRecommendations = () => {
    const recommendations: AIInsight[] = [];
    
    // Recommandation de diversification
    const categoryCount = state.categories.length;
    const avgProductsPerCategory = state.products.length / categoryCount;
    
    if (avgProductsPerCategory > 10) {
      recommendations.push({
        id: 'diversification',
        type: 'recommendation',
        title: 'Diversification du catalogue recommandée',
        description: 'Votre catalogue est concentré sur peu de catégories. Considérez ajouter 2-3 nouvelles catégories.',
        confidence: 0.71,
        impact: 'medium',
        actionable: true
      });
    }

    // Recommandation de clients inactifs
    const inactiveClients = state.clients.filter(c => {
      const lastOrderDate = new Date(c.lastOrder);
      const daysSinceOrder = (Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceOrder > 60;
    });

    if (inactiveClients.length > 0) {
      recommendations.push({
        id: 'client-reactivation',
        type: 'recommendation',
        title: 'Réactivation clients recommandée',
        description: `${inactiveClients.length} clients inactifs depuis 60+ jours. Campagne de réactivation suggérée.`,
        confidence: 0.88,
        impact: 'high',
        actionable: true,
        data: { clients: inactiveClients }
      });
    }

    return recommendations;
  };

  // Fonction principale d'analyse IA
  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulation d'analyse IA complexe
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
        description: `${allInsights.length} insights générés avec succès`
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
    // Analyse automatique au chargement
    runAIAnalysis();
  }, [state.products, state.clients]);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold">Assistant IA</h2>
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            Intelligence Avancée
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
              Nouvelle analyse
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4">
        {insights.length === 0 && !isAnalyzing ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucun insight disponible. Lancez une analyse pour commencer.</p>
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
                {insight.actionable && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Appliquer la recommandation
                    </Button>
                    <Button size="sm" variant="ghost">
                      En savoir plus
                    </Button>
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
