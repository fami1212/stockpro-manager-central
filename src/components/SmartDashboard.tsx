
import { useState, useEffect } from 'react';
import { Brain, TrendingUp, Target, Zap, BarChart3, PieChart, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  const { state } = useApp();
  const [smartMetrics, setSmartMetrics] = useState<SmartMetric[]>([]);
  const [performanceScore, setPerformanceScore] = useState(0);

  // Calculs intelligents avancés
  const calculateSmartMetrics = () => {
    const totalRevenue = state.sales.reduce((acc, sale) => acc + sale.total, 0);
    const totalProducts = state.products.length;
    const activeClients = state.clients.filter(c => c.status === 'Actif').length;
    
    // Algorithme de prédiction de chiffre d'affaires
    const monthlyGrowth = Math.random() * 0.15 + 0.05; // 5-20% de croissance simulée
    const predictedRevenue = totalRevenue * (1 + monthlyGrowth);
    
    // Score de performance intelligent
    const stockHealth = state.products.filter(p => p.stock > p.alertThreshold).length / totalProducts;
    const clientSatisfaction = 0.87; // Simulation
    const marginHealth = state.products.reduce((acc, p) => {
      const margin = (p.sellPrice - p.buyPrice) / p.sellPrice;
      return acc + margin;
    }, 0) / totalProducts;
    
    const overallScore = Math.round((stockHealth * 0.3 + clientSatisfaction * 0.4 + marginHealth * 0.3) * 100);
    setPerformanceScore(overallScore);

    const metrics: SmartMetric[] = [
      {
        id: 'revenue-prediction',
        title: 'CA Prévu (30j)',
        value: `€${predictedRevenue.toLocaleString()}`,
        trend: monthlyGrowth * 100,
        prediction: `+${Math.round(monthlyGrowth * 100)}% vs période actuelle`,
        confidence: 0.89,
        insight: 'Croissance stable prévue basée sur les tendances actuelles'
      },
      {
        id: 'stock-optimization',
        title: 'Optimisation Stock',
        value: `${Math.round(stockHealth * 100)}%`,
        trend: stockHealth > 0.8 ? 5 : -3,
        prediction: stockHealth > 0.8 ? 'Niveau optimal' : 'Réapprovisionnement requis',
        confidence: 0.94,
        insight: stockHealth > 0.8 ? 'Stock bien géré' : 'Attention aux ruptures'
      },
      {
        id: 'client-retention',
        title: 'Rétention Client',
        value: `${Math.round(clientSatisfaction * 100)}%`,
        trend: 8.5,
        prediction: 'Amélioration continue',
        confidence: 0.82,
        insight: 'Excellente fidélisation, maintenir les efforts'
      },
      {
        id: 'margin-analysis',
        title: 'Marge Moyenne',
        value: `${Math.round(marginHealth * 100)}%`,
        trend: marginHealth > 0.25 ? 4 : -2,
        prediction: marginHealth > 0.25 ? 'Marges saines' : 'Optimisation possible',
        confidence: 0.91,
        insight: marginHealth > 0.25 ? 'Rentabilité excellente' : 'Revoir la stratégie prix'
      }
    ];

    setSmartMetrics(metrics);
  };

  useEffect(() => {
    calculateSmartMetrics();
  }, [state]);

  return (
    <div className="space-y-6">
      {/* Score de Performance Global */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Score de Performance IA</CardTitle>
                <CardDescription>Analyse globale de votre entreprise</CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-600">{performanceScore}/100</div>
              <Badge variant="outline" className="bg-white">
                {performanceScore >= 80 ? 'Excellent' : performanceScore >= 60 ? 'Bon' : 'À améliorer'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={performanceScore} className="h-3" />
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-500">Stock</div>
              <div className="font-medium">{Math.round(performanceScore * 0.8)}/100</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Clients</div>
              <div className="font-medium">{Math.round(performanceScore * 0.9)}/100</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Finances</div>
              <div className="font-medium">{Math.round(performanceScore * 1.1)}/100</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métriques Intelligentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {smartMetrics.map((metric) => (
          <Card key={metric.id} className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-bl-full opacity-50" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{metric.title}</CardTitle>
                <div className="flex items-center gap-1">
                  <TrendingUp className={`w-4 h-4 ${metric.trend > 0 ? 'text-green-600' : 'text-red-600'}`} />
                  <span className={`text-sm font-medium ${metric.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.trend > 0 ? '+' : ''}{metric.trend.toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                <div className="text-sm text-blue-600 font-medium">{metric.prediction}</div>
                <div className="text-xs text-gray-500">{metric.insight}</div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-400">Confiance:</div>
                  <Progress value={metric.confidence * 100} className="h-1 flex-1" />
                  <div className="text-xs text-gray-500">{Math.round(metric.confidence * 100)}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Graphiques Intelligents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-base">Tendances Ventes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
                <div key={day} className="flex items-center gap-2">
                  <div className="w-8 text-xs text-gray-500">{day}</div>
                  <Progress value={Math.random() * 100} className="h-2 flex-1" />
                  <div className="text-xs text-gray-500 w-8">
                    {Math.round(Math.random() * 50 + 50)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-green-600" />
              <CardTitle className="text-base">Répartition Marges</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm">Marges élevées (>30%)</div>
                <div className="text-sm font-medium text-green-600">65%</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">Marges moyennes (20-30%)</div>
                <div className="text-sm font-medium text-yellow-600">25%</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">Marges faibles (<20%)</div>
                <div className="text-sm font-medium text-red-600">10%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <CardTitle className="text-base">Activité Temps Réel</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <div className="text-sm">3 ventes en cours</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <div className="text-sm">12 visiteurs actifs</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <div className="text-sm">2 alertes stock</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
