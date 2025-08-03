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
import { Brain, TrendingUp, BarChart3, FileText, DollarSign, ShoppingCart, Package, Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';

export const Dashboard = () => {
  console.log('Dashboard: Component rendering...');
  
  const appContext = useApp();
  const { products, sales, clients, suppliers, loading, initialized } = appContext;
  const { purchaseOrders } = usePurchaseOrders();

  console.log('Dashboard: Context loaded, initialized:', initialized, 'loading:', loading);

  // Show loading while context is initializing
  if (!initialized || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  // Calcul des métriques avancées
  const totalRevenue = sales.reduce((acc, sale) => acc + sale.total, 0);
  const totalSales = sales.length;
  const totalStock = products.reduce((acc, product) => acc + product.stock, 0);
  const activeClients = clients.filter(client => client.status === 'Actif').length;
  
  // Calcul des pourcentages de changement
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

  const thisMonthSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    return saleDate.getMonth() === thisMonth && saleDate.getFullYear() === thisYear;
  });

  const lastMonthSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    return saleDate.getMonth() === lastMonth && saleDate.getFullYear() === lastMonthYear;
  });

  const thisMonthRevenue = thisMonthSales.reduce((acc, sale) => acc + sale.total, 0);
  const lastMonthRevenue = lastMonthSales.reduce((acc, sale) => acc + sale.total, 0);

  const revenueChange = lastMonthRevenue > 0 
    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
    : thisMonthRevenue > 0 ? "100" : "0";

  const salesChange = lastMonthSales.length > 0 
    ? ((thisMonthSales.length - lastMonthSales.length) / lastMonthSales.length * 100).toFixed(1)
    : thisMonthSales.length > 0 ? "100" : "0";

  // Calcul du stock critique
  const criticalStockProducts = products.filter(p => p.stock <= p.alert_threshold);
  const outOfStockProducts = products.filter(p => p.stock === 0);
  
  // Calcul des achats
  const pendingPurchases = purchaseOrders.filter(order => order.status === 'En cours');
  const pendingPurchasesAmount = pendingPurchases.reduce((acc, order) => acc + order.total, 0);
  
  // Calcul des ventes du jour
  const today = new Date().toDateString();
  const todaySales = sales.filter(sale => new Date(sale.date).toDateString() === today);
  const todayRevenue = todaySales.reduce((acc, sale) => acc + sale.total, 0);
  
  // Panier moyen
  const averageBasket = sales.length > 0 ? totalRevenue / sales.length : 0;

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Tableau de Bord</h1>
            <p className="text-blue-100">
              Aujourd'hui: {todaySales.length} ventes • {todayRevenue.toLocaleString()} CFA de chiffre d'affaires
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <Button variant="secondary" size="sm">Nouvelle vente</Button>
            <Button variant="outline" size="sm" className="text-white border-white hover:bg-white/10">
              Voir rapports
            </Button>
          </div>
        </div>
      </div>

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

        <TabsContent value="overview" className="space-y-6">
          {/* Métriques principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Chiffre d'affaires"
              value={`${totalRevenue.toLocaleString()} CFA`}
              change={`${revenueChange.startsWith('-') ? '' : '+'}${revenueChange}%`}
              changeType={parseFloat(revenueChange) >= 0 ? "positive" : "negative"}
              description="Ce mois"
              icon={DollarSign}
              color="green"
            />
            <MetricCard
              title="Ventes totales"
              value={totalSales.toString()}
              change={`${salesChange.startsWith('-') ? '' : '+'}${salesChange}%`}
              changeType={parseFloat(salesChange) >= 0 ? "positive" : "negative"}
              description="Ce mois"
              icon={ShoppingCart}
              color="blue"
            />
            <MetricCard
              title="Produits en stock"
              value={totalStock.toString()}
              icon={Package}
              color="yellow"
            />
            <MetricCard
              title="Clients actifs"
              value={activeClients.toString()}
              icon={Users}
              color="purple"
            />
          </div>

          {/* Métriques secondaires */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Panier moyen</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{Math.round(averageBasket).toLocaleString()} CFA</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Achats en cours</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{pendingPurchases.length}</p>
                  <p className="text-xs text-gray-500 mt-1">{pendingPurchasesAmount.toLocaleString()} CFA</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Stock critique</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{criticalStockProducts.length}</p>
                  <p className="text-xs text-gray-500 mt-1">{outOfStockProducts.length} en rupture</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Fournisseurs</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{suppliers.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Total enregistrés</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Charts et alertes */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <SalesChart />
            <StockAlerts />
          </div>

          {/* Section inférieure */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <TopProducts />
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Activité récente</h3>
                <Button variant="outline" size="sm">Voir tout</Button>
              </div>
              <div className="space-y-4">
                {sales.length === 0 && products.length === 0 && clients.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Aucune activité récente</p>
                ) : (
                  <>
                    {/* Ventes du jour */}
                    {todaySales.slice(0, 3).map((sale) => (
                      <div key={`sale-${sale.id}`} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <ShoppingCart className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Vente #{sale.reference}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(sale.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-green-600 font-medium">{sale.total.toLocaleString()} CFA</span>
                      </div>
                    ))}

                    {/* Alertes stock */}
                    {criticalStockProducts.slice(0, 2).map((product) => (
                      <div key={`stock-${product.id}`} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Stock critique</p>
                            <p className="text-xs text-gray-500">{product.name}</p>
                          </div>
                        </div>
                        <span className="text-sm text-red-600 font-medium">{product.stock} restant</span>
                      </div>
                    ))}

                    {/* Commandes en attente */}
                    {pendingPurchases.slice(0, 2).map((order) => (
                      <div key={`purchase-${order.id}`} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                            <Clock className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Commande en attente</p>
                            <p className="text-xs text-gray-500">{order.reference}</p>
                          </div>
                        </div>
                        <span className="text-sm text-orange-600 font-medium">{order.total.toLocaleString()} CFA</span>
                      </div>
                    ))}
                  </>
                )}
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
