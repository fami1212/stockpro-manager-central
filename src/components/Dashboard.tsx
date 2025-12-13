import { MetricCard } from '@/components/MetricCard';
import { SalesChart } from '@/components/SalesChart';
import { StockAlerts } from '@/components/StockAlerts';
import { TopProducts } from '@/components/TopProducts';
import { SmartDashboard } from '@/components/SmartDashboard';
import { AIAssistant } from '@/components/AIAssistant';
import { PredictiveAnalytics } from '@/components/PredictiveAnalytics';
import { IntelligentReports } from '@/components/IntelligentReports';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, TrendingUp, BarChart3, FileText, DollarSign, ShoppingCart, 
  Package, Users, AlertTriangle, CheckCircle, Clock, LayoutDashboard,
  Sparkles, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { cn } from '@/lib/utils';

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
        <div className="text-center space-y-4">
          <div className="relative mx-auto h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
          <p className="text-muted-foreground animate-pulse">Chargement du tableau de bord...</p>
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
    <div className="space-y-6 animate-fade-in">
      {/* Header Hero Section */}
      <div className="relative overflow-hidden rounded-2xl p-8 text-primary-foreground metric-card-gradient-primary">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute right-1/4 top-1/2 h-32 w-32 rounded-full bg-white/5 blur-2xl animate-pulse-slow" />
        </div>
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 animate-float" />
              <span className="text-sm font-medium text-primary-foreground/80">Bienvenue</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Tableau de Bord</h1>
            <div className="flex items-center gap-4 text-primary-foreground/80">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span>{todaySales.length} ventes aujourd'hui</span>
              </div>
              <span className="text-primary-foreground/40">•</span>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span>{todayRevenue.toLocaleString()} CFA</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              size="lg"
              className="bg-white/20 hover:bg-white/30 text-primary-foreground border-0 backdrop-blur-sm"
              onClick={() => {
                const event = new CustomEvent('openSaleModal');
                window.dispatchEvent(event);
              }}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Nouvelle vente
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/30 bg-transparent text-primary-foreground hover:bg-white/10"
              onClick={() => {
                const reportsTab = document.querySelector('[value="reports"]') as HTMLElement;
                if (reportsTab) reportsTab.click();
              }}
            >
              <FileText className="mr-2 h-4 w-4" />
              Rapports
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs pour organiser les vues */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="hidden lg:inline-flex h-12 w-full justify-start gap-1 rounded-xl bg-muted/50 p-1">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="smart" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Brain className="mr-2 h-4 w-4" />
            Smart Dashboard
          </TabsTrigger>
          <TabsTrigger value="ai-assistant" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Sparkles className="mr-2 h-4 w-4" />
            Assistant IA
          </TabsTrigger>
          <TabsTrigger value="predictions" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <TrendingUp className="mr-2 h-4 w-4" />
            Prédictions
          </TabsTrigger>
          <TabsTrigger value="reports" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <FileText className="mr-2 h-4 w-4" />
            Rapports IA
          </TabsTrigger>
        </TabsList>

        {/* Mobile Cards pour les tabs */}
        <div className="lg:hidden grid grid-cols-2 gap-3 mb-6">
          <TabsList className="contents">
            <TabsTrigger 
              value="overview" 
              className="flex flex-col items-center gap-2 p-4 h-auto rounded-xl bg-card border border-border/50 shadow-sm transition-all data-[state=active]:border-primary/50 data-[state=active]:bg-primary/5 data-[state=active]:shadow-md"
            >
              <LayoutDashboard className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Vue d'ensemble</span>
            </TabsTrigger>
            <TabsTrigger 
              value="smart" 
              className="flex flex-col items-center gap-2 p-4 h-auto rounded-xl bg-card border border-border/50 shadow-sm transition-all data-[state=active]:border-primary/50 data-[state=active]:bg-primary/5 data-[state=active]:shadow-md"
            >
              <Brain className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Smart</span>
            </TabsTrigger>
            <TabsTrigger 
              value="ai-assistant" 
              className="flex flex-col items-center gap-2 p-4 h-auto rounded-xl bg-card border border-border/50 shadow-sm transition-all data-[state=active]:border-primary/50 data-[state=active]:bg-primary/5 data-[state=active]:shadow-md"
            >
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Assistant IA</span>
            </TabsTrigger>
            <TabsTrigger 
              value="predictions" 
              className="flex flex-col items-center gap-2 p-4 h-auto rounded-xl bg-card border border-border/50 shadow-sm transition-all data-[state=active]:border-primary/50 data-[state=active]:bg-primary/5 data-[state=active]:shadow-md"
            >
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Prédictions</span>
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="col-span-2 flex flex-col items-center gap-2 p-4 h-auto rounded-xl bg-card border border-border/50 shadow-sm transition-all data-[state=active]:border-primary/50 data-[state=active]:bg-primary/5 data-[state=active]:shadow-md"
            >
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Rapports IA</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Métriques principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="animate-fade-in">
              <MetricCard
                title="Chiffre d'affaires"
                value={`${totalRevenue.toLocaleString()} CFA`}
                change={`${parseFloat(revenueChange) >= 0 ? '+' : ''}${revenueChange}%`}
                changeType={parseFloat(revenueChange) >= 0 ? "positive" : "negative"}
                description="Ce mois"
                icon={DollarSign}
                color="success"
              />
            </div>
            <div className="animate-fade-in-delay-1">
              <MetricCard
                title="Ventes totales"
                value={totalSales.toString()}
                change={`${parseFloat(salesChange) >= 0 ? '+' : ''}${salesChange}%`}
                changeType={parseFloat(salesChange) >= 0 ? "positive" : "negative"}
                description="Ce mois"
                icon={ShoppingCart}
                color="info"
              />
            </div>
            <div className="animate-fade-in-delay-2">
              <MetricCard
                title="Produits en stock"
                value={totalStock.toString()}
                icon={Package}
                color="warning"
              />
            </div>
            <div className="animate-fade-in-delay-3">
              <MetricCard
                title="Clients actifs"
                value={activeClients.toString()}
                icon={Users}
                color="primary"
              />
            </div>
          </div>

          {/* Métriques secondaires */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="dashboard-card p-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Panier moyen</p>
                  <p className="text-2xl font-bold text-foreground">{Math.round(averageBasket).toLocaleString()} CFA</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
              </div>
            </div>

            <div className="dashboard-card p-6 animate-fade-in-delay-1">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Achats en cours</p>
                  <p className="text-2xl font-bold text-foreground">{pendingPurchases.length}</p>
                  <p className="text-xs text-muted-foreground">{pendingPurchasesAmount.toLocaleString()} CFA</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
              </div>
            </div>

            <div className="dashboard-card p-6 animate-fade-in-delay-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Stock critique</p>
                  <p className="text-2xl font-bold text-foreground">{criticalStockProducts.length}</p>
                  <p className="text-xs text-destructive">{outOfStockProducts.length} en rupture</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
              </div>
            </div>

            <div className="dashboard-card p-6 animate-fade-in-delay-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Fournisseurs</p>
                  <p className="text-2xl font-bold text-foreground">{suppliers.length}</p>
                  <p className="text-xs text-muted-foreground">Total enregistrés</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info/10">
                  <CheckCircle className="h-5 w-5 text-info" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts et alertes */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="dashboard-card overflow-hidden">
              <SalesChart />
            </div>
            <div className="dashboard-card overflow-hidden">
              <StockAlerts />
            </div>
          </div>

          {/* Section inférieure */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="dashboard-card overflow-hidden">
              <TopProducts />
            </div>
            <div className="dashboard-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Activité récente</h3>
                  <p className="text-sm text-muted-foreground">Dernières transactions et alertes</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-lg">
                  Voir tout
                </Button>
              </div>
              <div className="space-y-1">
                {sales.length === 0 && products.length === 0 && clients.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                      <Clock className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">Aucune activité récente</p>
                  </div>
                ) : (
                  <>
                    {/* Ventes du jour */}
                    {todaySales.slice(0, 3).map((sale, index) => (
                      <div 
                        key={`sale-${sale.id}`} 
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-muted/50",
                          index === 0 && "animate-fade-in",
                          index === 1 && "animate-fade-in-delay-1",
                          index === 2 && "animate-fade-in-delay-2"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                            <ShoppingCart className="h-5 w-5 text-success" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">Vente #{sale.reference}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(sale.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-success">
                          <ArrowUpRight className="h-4 w-4" />
                          <span className="text-sm font-semibold">{sale.total.toLocaleString()} CFA</span>
                        </div>
                      </div>
                    ))}

                    {/* Alertes stock */}
                    {criticalStockProducts.slice(0, 2).map((product, index) => (
                      <div 
                        key={`stock-${product.id}`} 
                        className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">Stock critique</p>
                            <p className="text-xs text-muted-foreground">{product.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-destructive">
                          <ArrowDownRight className="h-4 w-4" />
                          <span className="text-sm font-semibold">{product.stock} restant</span>
                        </div>
                      </div>
                    ))}

                    {/* Commandes en attente */}
                    {pendingPurchases.slice(0, 2).map((order) => (
                      <div 
                        key={`purchase-${order.id}`} 
                        className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                            <Clock className="h-5 w-5 text-warning" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">Commande en attente</p>
                            <p className="text-xs text-muted-foreground">{order.reference}</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-warning">{order.total.toLocaleString()} CFA</span>
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
