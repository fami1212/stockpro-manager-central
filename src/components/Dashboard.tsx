
import { useState } from 'react';
import { MetricCard } from '@/components/MetricCard';
import { SalesChart } from '@/components/SalesChart';
import { StockAlerts } from '@/components/StockAlerts';
import { TopProducts } from '@/components/TopProducts';
import { SmartDashboard } from '@/components/SmartDashboard';
import { AIAssistant } from '@/components/AIAssistant';
import { PredictiveAnalytics } from '@/components/PredictiveAnalytics';
import { IntelligentReports } from '@/components/IntelligentReports';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, TrendingUp, BarChart3, FileText } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

export const Dashboard = () => {
  const { products, sales, clients, loading } = useApp();

  // Calcul des métriques réelles
  const totalRevenue = sales.reduce((acc, sale) => acc + sale.total, 0);
  const totalSales = sales.length;
  const totalStock = products.reduce((acc, product) => acc + product.stock, 0);
  const activeClients = clients.filter(client => client.status === 'Actif').length;
  
  // Calcul des pourcentages de changement (simulé pour le moment)
  const revenueChange = "+12.5%";
  const salesChange = "+8.2%";
  const stockChange = totalStock < 100 ? "-2.4%" : "+3.1%";
  const clientsChange = "+15.3%";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Tabs pour organiser les vues */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="smart">
            <Brain className="w-4 h-4 mr-2" />
            Smart Dashboard
          </TabsTrigger>
          <TabsTrigger value="ai-assistant">
            <Brain className="w-4 h-4 mr-2" />
            Assistant IA
          </TabsTrigger>
          <TabsTrigger value="predictions">
            <TrendingUp className="w-4 h-4 mr-2" />
            Prédictions
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="w-4 h-4 mr-2" />
            Rapports IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 lg:space-y-6">
          {/* Metrics Cards avec vraies données */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <MetricCard
              title="Chiffre d'affaires"
              value={`€${totalRevenue.toLocaleString()}`}
              change={revenueChange}
              changeType="positive"
              description="Ce mois"
            />
            <MetricCard
              title="Ventes totales"
              value={totalSales.toString()}
              change={salesChange}
              changeType="positive"
              description="Ce mois"
            />
            <MetricCard
              title="Produits en stock"
              value={totalStock.toString()}
              change={stockChange}
              changeType={stockChange.startsWith('+') ? "positive" : "negative"}
              description="Articles"
            />
            <MetricCard
              title="Clients actifs"
              value={activeClients.toString()}
              change={clientsChange}
              changeType="positive"
              description="Ce mois"
            />
          </div>

          {/* Charts and Alerts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
            <SalesChart />
            <StockAlerts />
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
            <TopProducts />
            <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
              <div className="space-y-3">
                {sales.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Aucune activité récente</p>
                ) : (
                  sales.slice(0, 3).map((sale, index) => (
                    <div key={sale.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-gray-100 space-y-1 sm:space-y-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Vente #{sale.reference}</p>
                        <p className="text-xs text-gray-500">Client: {sale.client || 'Client direct'}</p>
                      </div>
                      <span className="text-sm text-green-600 font-medium self-start">€{sale.total.toLocaleString()}</span>
                    </div>
                  ))
                )}
                {products.filter(p => p.stock <= p.alertThreshold).slice(0, 2).map((product, index) => (
                  <div key={`stock-${product.id}`} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-gray-100 space-y-1 sm:space-y-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Stock faible</p>
                      <p className="text-xs text-gray-500">Produit: {product.name}</p>
                    </div>
                    <span className="text-sm text-orange-600 font-medium self-start">{product.stock} restant</span>
                  </div>
                ))}
                {clients.slice(-1).map((client, index) => (
                  <div key={`client-${client.id}`} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 space-y-1 sm:space-y-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Nouveau client</p>
                      <p className="text-xs text-gray-500">{client.name}</p>
                    </div>
                    <span className="text-sm text-gray-600 self-start">Récemment ajouté</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="smart">
          <SmartDashboard />
        </TabsContent>

        <TabsContent value="ai-assistant">
          <AIAssistant />
        </TabsContent>

        <TabsContent value="predictions">
          <PredictiveAnalytics />
        </TabsContent>

        <TabsContent value="reports">
          <IntelligentReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};
