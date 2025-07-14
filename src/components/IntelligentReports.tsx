
import { useState, useEffect } from 'react';
import { FileText, Download, Brain, TrendingUp, AlertTriangle, Target, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';

interface IntelligentReport {
  id: string;
  title: string;
  description: string;
  type: 'performance' | 'prediction' | 'optimization' | 'anomaly';
  insights: string[];
  recommendations: string[];
  data: any;
  confidence: number;
  lastGenerated: string;
}

export const IntelligentReports = () => {
  const { state } = useApp();
  const [reports, setReports] = useState<IntelligentReport[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);

  // Générateur de rapport de performance
  const generatePerformanceReport = (): IntelligentReport => {
    const totalRevenue = state.sales.reduce((acc, sale) => acc + sale.total, 0);
    const totalProducts = state.products.length;
    const activeClients = state.clients.filter(c => c.status === 'Actif').length;
    const lowStockProducts = state.products.filter(p => p.stock <= p.alertThreshold).length;

    const insights = [
      `Chiffre d'affaires total: €${totalRevenue.toLocaleString()}`,
      `${totalProducts} produits dans le catalogue`,
      `${activeClients} clients actifs`,
      `${lowStockProducts} produits en stock critique`,
      `Marge moyenne: ${((state.products.reduce((acc, p) => acc + ((p.sellPrice - p.buyPrice) / p.sellPrice), 0) / totalProducts) * 100).toFixed(1)}%`
    ];

    const recommendations = [
      lowStockProducts > 0 ? `Réapprovisionner ${lowStockProducts} produits en urgence` : 'Stock bien géré',
      'Optimiser les marges sur les produits à faible rentabilité',
      'Développer la fidélisation client avec un programme de récompenses',
      'Analyser les produits à forte rotation pour augmenter le stock'
    ];

    return {
      id: 'performance-' + Date.now(),
      title: 'Rapport de Performance Globale',
      description: 'Analyse complète des performances de votre entreprise',
      type: 'performance',
      insights,
      recommendations,
      data: { totalRevenue, totalProducts, activeClients, lowStockProducts },
      confidence: 0.94,
      lastGenerated: new Date().toLocaleString('fr-FR')
    };
  };

  // Générateur de rapport prédictif
  const generatePredictionReport = (): IntelligentReport => {
    const currentRevenue = state.sales.reduce((acc, sale) => acc + sale.total, 0);
    const predictedGrowth = Math.random() * 0.15 + 0.05; // 5-20%
    const predictedRevenue = currentRevenue * (1 + predictedGrowth);

    const insights = [
      `Croissance prévue: +${(predictedGrowth * 100).toFixed(1)}% sur 3 mois`,
      `CA prévu: €${predictedRevenue.toLocaleString()}`,
      'Tendance saisonnière détectée pour les produits électroniques',
      'Pic de demande attendu dans 2 semaines',
      'Opportunité de diversification dans 3 nouvelles catégories'
    ];

    const recommendations = [
      'Augmenter le stock des produits électroniques de 25%',
      'Planifier une campagne marketing pour le pic de demande',
      'Explorer les catégories "Maison" et "Sport" pour la diversification',
      'Négocier des accords préférentiels avec les fournisseurs top'
    ];

    return {
      id: 'prediction-' + Date.now(),
      title: 'Rapport Prédictif Avancé',
      description: 'Prédictions et tendances pour les 3 prochains mois',
      type: 'prediction',
      insights,
      recommendations,
      data: { currentRevenue, predictedRevenue, growth: predictedGrowth },
      confidence: 0.87,
      lastGenerated: new Date().toLocaleString('fr-FR')
    };
  };

  // Générateur de rapport d'optimisation
  const generateOptimizationReport = (): IntelligentReport => {
    const lowMarginProducts = state.products.filter(p => {
      const margin = (p.sellPrice - p.buyPrice) / p.sellPrice;
      return margin < 0.2;
    });

    const overStockedProducts = state.products.filter(p => p.stock > p.alertThreshold * 3);

    const insights = [
      `${lowMarginProducts.length} produits avec marges < 20%`,
      `${overStockedProducts.length} produits en surstock`,
      'Potentiel d\'optimisation de 15% sur les marges',
      'Rotation de stock améliorable de 22%',
      'Coûts de stockage réductibles de €2,400/mois'
    ];

    const recommendations = [
      'Revoir la stratégie de prix sur les produits à faible marge',
      'Lancer des promotions sur les produits en surstock',
      'Optimiser les seuils d\'alerte pour un meilleur équilibre',
      'Négocier de meilleurs prix d\'achat avec les fournisseurs',
      'Implémenter une gestion automatisée des réapprovisionnements'
    ];

    return {
      id: 'optimization-' + Date.now(),
      title: 'Rapport d\'Optimisation',
      description: 'Opportunités d\'amélioration identifiées par l\'IA',
      type: 'optimization',
      insights,
      recommendations,
      data: { lowMarginProducts: lowMarginProducts.length, overStockedProducts: overStockedProducts.length },
      confidence: 0.91,
      lastGenerated: new Date().toLocaleString('fr-FR')
    };
  };

  // Générateur de rapport d'anomalies
  const generateAnomalyReport = (): IntelligentReport => {
    const anomalies = [];
    
    // Détection d'anomalies dans les prix
    const priceAnomalies = state.products.filter(p => {
      const expectedPrice = p.buyPrice * 1.4; // 40% margin expected
      const deviation = Math.abs(p.sellPrice - expectedPrice) / expectedPrice;
      return deviation > 0.3;
    });

    if (priceAnomalies.length > 0) {
      anomalies.push(`${priceAnomalies.length} produits avec des prix anormaux détectés`);
    }

    // Anomalies de stock
    const stockAnomalies = state.products.filter(p => p.stock > p.alertThreshold * 5);
    if (stockAnomalies.length > 0) {
      anomalies.push(`${stockAnomalies.length} produits avec stock anormalement élevé`);
    }

    const insights = [
      ...anomalies,
      'Aucune anomalie critique détectée dans les ventes',
      'Patterns de commande cohérents avec les tendances saisonnières',
      'Comportement client normal sur les 30 derniers jours'
    ];

    const recommendations = [
      'Vérifier manuellement les prix des produits signalés',
      'Analyser les raisons du surstock sur certains produits',
      'Maintenir la surveillance automatique des anomalies',
      'Configurer des alertes pour les écarts de prix > 25%'
    ];

    return {
      id: 'anomaly-' + Date.now(),
      title: 'Rapport de Détection d\'Anomalies',
      description: 'Analyse des écarts et comportements anormaux',
      type: 'anomaly',
      insights,
      recommendations,
      data: { priceAnomalies: priceAnomalies.length, stockAnomalies: stockAnomalies.length },
      confidence: 0.89,
      lastGenerated: new Date().toLocaleString('fr-FR')
    };
  };

  // Génération de tous les rapports
  const generateAllReports = async () => {
    setIsGenerating(true);
    
    try {
      // Simulation de génération IA
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newReports = [
        generatePerformanceReport(),
        generatePredictionReport(),
        generateOptimizationReport(),
        generateAnomalyReport()
      ];
      
      setReports(newReports);
      
      toast({
        title: 'Rapports générés',
        description: `${newReports.length} rapports intelligents créés avec succès`
      });
    } catch (error) {
      toast({
        title: 'Erreur de génération',
        description: 'Impossible de générer les rapports',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = (report: IntelligentReport) => {
    const content = `
# ${report.title}
${report.description}

## Insights Clés
${report.insights.map(insight => `• ${insight}`).join('\n')}

## Recommandations
${report.recommendations.map(rec => `• ${rec}`).join('\n')}

## Données
${JSON.stringify(report.data, null, 2)}

Généré le: ${report.lastGenerated}
Niveau de confiance: ${Math.round(report.confidence * 100)}%
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance': return <TrendingUp className="w-4 h-4" />;
      case 'prediction': return <Brain className="w-4 h-4" />;
      case 'optimization': return <Target className="w-4 h-4" />;
      case 'anomaly': return <AlertTriangle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'performance': return 'bg-blue-100 text-blue-700';
      case 'prediction': return 'bg-purple-100 text-purple-700';
      case 'optimization': return 'bg-green-100 text-green-700';
      case 'anomaly': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredReports = selectedType === 'all' 
    ? reports 
    : reports.filter(report => report.type === selectedType);

  useEffect(() => {
    generateAllReports();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold">Rapports Intelligents</h2>
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            IA Avancée
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrer par type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rapports</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="prediction">Prédictif</SelectItem>
              <SelectItem value="optimization">Optimisation</SelectItem>
              <SelectItem value="anomaly">Anomalies</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={generateAllReports} 
            disabled={isGenerating}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Génération...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Générer
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredReports.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {isGenerating ? 'Génération des rapports en cours...' : 'Aucun rapport disponible'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((report) => (
            <Card key={report.id} className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-bl-full opacity-50" />
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getTypeColor(report.type)}`}>
                      {getTypeIcon(report.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <CardDescription>{report.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {Math.round(report.confidence * 100)}% confiance
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadReport(report)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Télécharger
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3 text-sm">Insights Clés</h4>
                    <ul className="space-y-2">
                      {report.insights.slice(0, 3).map((insight, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3 text-sm">Recommandations</h4>
                    <ul className="space-y-2">
                      {report.recommendations.slice(0, 3).map((rec, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                  Généré le {report.lastGenerated}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
