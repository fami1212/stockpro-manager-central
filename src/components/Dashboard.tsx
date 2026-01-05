import { useEffect } from 'react';
import { MetricCard } from '@/components/MetricCard';
import { SalesChart } from '@/components/SalesChart';
import { StockAlerts } from '@/components/StockAlerts';
import { TopProducts } from '@/components/TopProducts';
import { SmartDashboard } from '@/components/SmartDashboard';
import { AIAssistant } from '@/components/AIAssistant';
import { PredictiveAnalytics } from '@/components/PredictiveAnalytics';
import { IntelligentReports } from '@/components/IntelligentReports';
import { StockTrendsChart } from '@/components/StockTrendsChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, TrendingUp, FileText, DollarSign, ShoppingCart, 
  Package, Users, AlertTriangle, Clock, LayoutDashboard,
  Sparkles, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';

export const Dashboard = () => {
  const appContext = useApp();
  const { products, sales, clients, suppliers, loading, initialized } = appContext;
  const { purchaseOrders } = usePurchaseOrders();

  // Détection automatique du thème système
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const savedTheme = localStorage.getItem('user-settings');
      if (savedTheme) {
        const settings = JSON.parse(savedTheme);
        if (settings.theme === 'auto') {
          document.documentElement.classList.toggle('dark', e.matches);
        }
      } else {
        document.documentElement.classList.toggle('dark', e.matches);
      }
    };

    handleChange(mediaQuery);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (!initialized || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="relative mx-auto h-10 w-10">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
          <p className="text-muted-foreground text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  // Calculs
  const totalRevenue = sales.reduce((acc, sale) => acc + sale.total, 0);
  const totalSales = sales.length;
  const totalStock = products.reduce((acc, product) => acc + product.stock, 0);
  const activeClients = clients.filter(client => client.status === 'Actif').length;

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

  const criticalStockProducts = products.filter(p => p.stock <= p.alert_threshold);
  const outOfStockProducts = products.filter(p => p.stock === 0);
  const pendingPurchases = purchaseOrders.filter(order => order.status === 'En cours');

  const today = new Date().toDateString();
  const todaySales = sales.filter(sale => new Date(sale.date).toDateString() === today);
  const todayRevenue = todaySales.reduce((acc, sale) => acc + sale.total, 0);

  return (
    <div className="space-y-4 lg:space-y-6 animate-fade-in">
      {/* Header simplifié */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-card border border-border/50">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground">Tableau de Bord</h1>
          <p className="text-sm text-muted-foreground">
            {todaySales.length} ventes aujourd'hui • {todayRevenue.toLocaleString()} CFA
          </p>
        </div>
        <Button
          size="sm"
          className="w-full sm:w-auto"
          onClick={() => {
            const event = new CustomEvent('openSaleModal');
            window.dispatchEvent(event);
          }}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Nouvelle vente
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        {/* Desktop tabs */}
        <TabsList className="hidden lg:inline-flex h-10 w-full justify-start gap-1 rounded-lg bg-muted/50 p-1">
          <TabsTrigger value="overview" className="rounded-md text-sm data-[state=active]:bg-background">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="stock-trends" className="rounded-md text-sm data-[state=active]:bg-background">
            <BarChart3 className="mr-2 h-4 w-4" />
            Tendances Stock
          </TabsTrigger>
          <TabsTrigger value="smart" className="rounded-md text-sm data-[state=active]:bg-background">
            <Brain className="mr-2 h-4 w-4" />
            Smart Dashboard
          </TabsTrigger>
          <TabsTrigger value="ai-assistant" className="rounded-md text-sm data-[state=active]:bg-background">
            <Sparkles className="mr-2 h-4 w-4" />
            Assistant IA
          </TabsTrigger>
          <TabsTrigger value="predictions" className="rounded-md text-sm data-[state=active]:bg-background">
            <TrendingUp className="mr-2 h-4 w-4" />
            Prédictions
          </TabsTrigger>
          <TabsTrigger value="reports" className="rounded-md text-sm data-[state=active]:bg-background">
            <FileText className="mr-2 h-4 w-4" />
            Rapports
          </TabsTrigger>
        </TabsList>

        {/* Mobile tabs - horizontal scroll */}
        <div className="lg:hidden overflow-x-auto scrollbar-hide -mx-4 px-4">
          <TabsList className="inline-flex h-10 w-max min-w-full gap-1 rounded-lg bg-muted/50 p-1">
            <TabsTrigger value="overview" className="flex-shrink-0 rounded-md text-xs data-[state=active]:bg-background px-3 whitespace-nowrap">
              <LayoutDashboard className="mr-1.5 h-3.5 w-3.5" />
              Général
            </TabsTrigger>
            <TabsTrigger value="stock-trends" className="flex-shrink-0 rounded-md text-xs data-[state=active]:bg-background px-3 whitespace-nowrap">
              <BarChart3 className="mr-1.5 h-3.5 w-3.5" />
              Stock
            </TabsTrigger>
            <TabsTrigger value="smart" className="flex-shrink-0 rounded-md text-xs data-[state=active]:bg-background px-3 whitespace-nowrap">
              <Brain className="mr-1.5 h-3.5 w-3.5" />
              Smart
            </TabsTrigger>
            <TabsTrigger value="ai-assistant" className="flex-shrink-0 rounded-md text-xs data-[state=active]:bg-background px-3 whitespace-nowrap">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              IA
            </TabsTrigger>
            <TabsTrigger value="predictions" className="flex-shrink-0 rounded-md text-xs data-[state=active]:bg-background px-3 whitespace-nowrap">
              <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
              Prédictions
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex-shrink-0 rounded-md text-xs data-[state=active]:bg-background px-3 whitespace-nowrap">
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              Rapports
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4 lg:space-y-6 mt-4">
          {/* Métriques principales */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <MetricCard
              title="Chiffre d'affaires"
              value={`${totalRevenue.toLocaleString()} CFA`}
              change={`${parseFloat(revenueChange) >= 0 ? '+' : ''}${revenueChange}%`}
              changeType={parseFloat(revenueChange) >= 0 ? "positive" : "negative"}
              description="Ce mois"
              icon={DollarSign}
              color="success"
            />
            <MetricCard
              title="Ventes"
              value={totalSales.toString()}
              change={`${parseFloat(salesChange) >= 0 ? '+' : ''}${salesChange}%`}
              changeType={parseFloat(salesChange) >= 0 ? "positive" : "negative"}
              description="Ce mois"
              icon={ShoppingCart}
              color="info"
            />
            <MetricCard
              title="Stock"
              value={totalStock.toString()}
              icon={Package}
              color="warning"
            />
            <MetricCard
              title="Clients actifs"
              value={activeClients.toString()}
              icon={Users}
              color="primary"
            />
          </div>

          {/* Alertes rapides */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <div className="dashboard-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Stock critique</p>
                  <p className="text-lg font-bold">{criticalStockProducts.length}</p>
                </div>
              </div>
            </div>

            <div className="dashboard-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10">
                  <Clock className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Achats en cours</p>
                  <p className="text-lg font-bold">{pendingPurchases.length}</p>
                </div>
              </div>
            </div>

            <div className="dashboard-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10">
                  <Package className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Rupture</p>
                  <p className="text-lg font-bold">{outOfStockProducts.length}</p>
                </div>
              </div>
            </div>

            <div className="dashboard-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-info/10">
                  <Users className="h-4 w-4 text-info" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fournisseurs</p>
                  <p className="text-lg font-bold">{suppliers.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div className="dashboard-card overflow-hidden">
              <SalesChart />
            </div>
            <div className="dashboard-card overflow-hidden">
              <StockAlerts />
            </div>
          </div>

          {/* Top products */}
          <div className="dashboard-card overflow-hidden">
            <TopProducts />
          </div>
        </TabsContent>

        <TabsContent value="stock-trends" className="mt-4">
          <StockTrendsChart />
        </TabsContent>

        <TabsContent value="smart" className="mt-4">
          <SmartDashboard />
        </TabsContent>

        <TabsContent value="ai-assistant" className="mt-4">
          <AIAssistant />
        </TabsContent>

        <TabsContent value="predictions" className="mt-4">
          <PredictiveAnalytics />
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <IntelligentReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};
