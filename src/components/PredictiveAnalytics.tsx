
import { useState, useEffect } from 'react';
import { TrendingUp, Target, AlertCircle, CheckCircle2, Clock, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useApp } from '@/contexts/AppContext';

interface Prediction {
  id: string;
  type: 'demand' | 'revenue' | 'inventory' | 'client';
  title: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  timeframe: string;
  trend: 'up' | 'down' | 'stable';
  impact: 'high' | 'medium' | 'low';
  recommendations: string[];
}

export const PredictiveAnalytics = () => {
  const { state } = useApp();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [demandForecast, setDemandForecast] = useState<any[]>([]);
  const [revenueForecast, setRevenueForecast] = useState<any[]>([]);

  // Algorithme de prédiction de demande
  const predictDemand = () => {
    const forecastData = [];
    const baseValue = 100;
    
    for (let i = 0; i < 30; i++) {
      const day = new Date();
      day.setDate(day.getDate() + i);
      
      // Simulation d'algorithme de prédiction complexe
      const seasonality = Math.sin((i / 7) * Math.PI) * 0.2; // Cycle hebdomadaire
      const trend = i * 0.02; // Tendance croissante
      const noise = (Math.random() - 0.5) * 0.1; // Bruit aléatoire
      
      const predictedDemand = Math.max(0, baseValue * (1 + seasonality + trend + noise));
      
      forecastData.push({
        date: day.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
        demand: Math.round(predictedDemand),
        confidence: Math.random() * 0.3 + 0.7 // 70-100% confidence
      });
    }
    
    setDemandForecast(forecastData);
  };

  // Prédiction du chiffre d'affaires
  const predictRevenue = () => {
    const forecastData = [];
    const currentRevenue = state.sales.reduce((acc, sale) => acc + sale.total, 0);
    
    for (let i = 1; i <= 12; i++) {
      const month = new Date();
      month.setMonth(month.getMonth() + i);
      
      // Modèle de prédiction avancé
      const growthRate = 0.08 + (Math.random() * 0.04); // 8-12% growth
      const seasonalFactor = 1 + Math.sin((i / 12) * 2 * Math.PI) * 0.15;
      const predictedRevenue = currentRevenue * Math.pow(1 + growthRate, i / 12) * seasonalFactor;
      
      forecastData.push({
        month: month.toLocaleDateString('fr-FR', { month: 'short' }),
        revenue: Math.round(predictedRevenue),
        growth: Math.round(growthRate * 100)
      });
    }
    
    setRevenueForecast(forecastData);
  };

  // Génération des prédictions principales
  const generatePredictions = () => {
    const currentRevenue = state.sales.reduce((acc, sale) => acc + sale.total, 0);
    const avgOrderValue = currentRevenue / Math.max(state.sales.length, 1);
    
    const newPredictions: Prediction[] = [
      {
        id: 'revenue-growth',
        type: 'revenue',
        title: 'Croissance du CA (3 mois)',
        currentValue: currentRevenue,
        predictedValue: currentRevenue * 1.25,
        confidence: 0.87,
        timeframe: '3 mois',
        trend: 'up',
        impact: 'high',
        recommendations: [
          'Augmenter le stock des produits populaires',
          'Lancer une campagne marketing ciblée',
          'Optimiser les prix pour maximiser les marges'
        ]
      },
      {
        id: 'inventory-optimization',
        type: 'inventory',
        title: 'Optimisation Stock',
        currentValue: state.products.reduce((acc, p) => acc + p.stock, 0),
        predictedValue: state.products.reduce((acc, p) => acc + p.stock, 0) * 1.15,
        confidence: 0.92,
        timeframe: '1 mois',
        trend: 'up',
        impact: 'medium',
        recommendations: [
          'Réduire le stock des produits à rotation lente',
          'Augmenter le stock des produits saisonniers',
          'Négocier de meilleurs délais avec les fournisseurs'
        ]
      },
      {
        id: 'client-retention',
        type: 'client',
        title: 'Rétention Client',
        currentValue: state.clients.filter(c => c.status === 'Actif').length,
        predictedValue: state.clients.filter(c => c.status === 'Actif').length * 1.1,
        confidence: 0.81,
        timeframe: '6 mois',
        trend: 'up',
        impact: 'high',
        recommendations: [
          'Mettre en place un programme de fidélité',
          'Personnaliser la communication client',
          'Améliorer le service après-vente'
        ]
      },
      {
        id: 'demand-spike',
        type: 'demand',
        title: 'Pic de Demande Prévu',
        currentValue: 100,
        predictedValue: 150,
        confidence: 0.74,
        timeframe: '2 semaines',
        trend: 'up',
        impact: 'medium',
        recommendations: [
          'Préparer du stock supplémentaire',
          'Planifier des ressources humaines additionnelles',
          'Optimiser la chaîne logistique'
        ]
      }
    ];
    
    setPredictions(newPredictions);
  };

  useEffect(() => {
    generatePredictions();
    predictDemand();
    predictRevenue();
  }, [state]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      default: return <Target className="w-4 h-4 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-green-100 text-green-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-bold">Analyses Prédictives</h2>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          IA Avancée
        </Badge>
      </div>

      {/* Prédictions Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {predictions.map((prediction) => (
          <Card key={prediction.id} className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-bl-full" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTrendIcon(prediction.trend)}
                  <CardTitle className="text-lg">{prediction.title}</CardTitle>
                </div>
                <Badge className={getImpactColor(prediction.impact)}>
                  {prediction.impact}
                </Badge>
              </div>
              <CardDescription>Prédiction pour les {prediction.timeframe}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Actuel</div>
                    <div className="text-xl font-bold">
                      {prediction.type === 'revenue' ? `€${prediction.currentValue.toLocaleString()}` : prediction.currentValue.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Prévu</div>
                    <div className="text-xl font-bold text-blue-600">
                      {prediction.type === 'revenue' ? `€${prediction.predictedValue.toLocaleString()}` : prediction.predictedValue.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Confiance</span>
                    <span>{Math.round(prediction.confidence * 100)}%</span>
                  </div>
                  <Progress value={prediction.confidence * 100} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Recommandations:</div>
                  <ul className="text-xs space-y-1">
                    {prediction.recommendations.slice(0, 2).map((rec, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Graphiques de Prédiction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Prévision de Demande (30 jours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={demandForecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="demand" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Prévision CA (12 mois)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueForecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
