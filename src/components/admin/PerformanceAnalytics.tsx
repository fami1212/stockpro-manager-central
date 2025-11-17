import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Users, ShoppingCart, Package, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface PerformanceData {
  date: string;
  users: number;
  sales: number;
  revenue: number;
  products: number;
}

interface UsageByFeature {
  name: string;
  value: number;
  color: string;
}

interface ActivityByHour {
  hour: string;
  active: number;
}

export function PerformanceAnalytics() {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [usageByFeature, setUsageByFeature] = useState<UsageByFeature[]>([]);
  const [userActivityData, setUserActivityData] = useState<ActivityByHour[]>([]);
  const [metricsDisplay, setMetricsDisplay] = useState<Array<{
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
    icon: any;
    color: string;
  }>>([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const getDaysFromTimeRange = () => {
    switch (timeRange) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
      default: return 30;
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const days = getDaysFromTimeRange();
      const now = new Date();
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      const previousPeriodStart = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000);

      // Fetch current period data
      const [profilesRes, salesRes, productsRes, auditLogsRes] = await Promise.all([
        supabase.from('profiles').select('id, created_at, last_login').gte('created_at', startDate.toISOString()),
        supabase.from('sales').select('id, total, created_at, status').gte('created_at', startDate.toISOString()).neq('status', 'Brouillon'),
        supabase.from('products').select('id, created_at').gte('created_at', startDate.toISOString()),
        supabase.from('audit_logs').select('action_category, created_at').gte('created_at', startDate.toISOString()),
      ]);

      // Fetch previous period for comparison
      const [prevSalesRes, prevProfilesRes] = await Promise.all([
        supabase.from('sales').select('id, total').gte('created_at', previousPeriodStart.toISOString()).lt('created_at', startDate.toISOString()).neq('status', 'Brouillon'),
        supabase.from('profiles').select('id, last_login').gte('created_at', previousPeriodStart.toISOString()).lt('created_at', startDate.toISOString()),
      ]);

      // Calculate active users
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const activeUsers = (profilesRes.data || []).filter(p => p.last_login && new Date(p.last_login) > sevenDaysAgo).length;
      const prevActiveUsers = (prevProfilesRes.data || []).filter(p => p.last_login && new Date(p.last_login) > new Date(previousPeriodStart.getTime() + days * 24 * 60 * 60 * 1000 - 7 * 24 * 60 * 60 * 1000)).length;

      // Calculate metrics
      const totalSales = salesRes.data?.length || 0;
      const prevTotalSales = prevSalesRes.data?.length || 0;
      const revenue = salesRes.data?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0;
      const prevRevenue = prevSalesRes.data?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0;
      const totalProducts = productsRes.data?.length || 0;

      const metricsData = {
        activeUsers: {
          value: activeUsers,
          change: prevActiveUsers > 0 ? ((activeUsers - prevActiveUsers) / prevActiveUsers) * 100 : 0
        },
        totalSales: {
          value: totalSales,
          change: prevTotalSales > 0 ? ((totalSales - prevTotalSales) / prevTotalSales) * 100 : 0
        },
        revenue: {
          value: revenue,
          change: prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0
        },
        products: {
          value: totalProducts,
          change: 0
        },
      };

      setMetricsDisplay([
        {
          title: 'Utilisateurs Actifs',
          value: metricsData.activeUsers.value.toString(),
          change: `${metricsData.activeUsers.change > 0 ? '+' : ''}${metricsData.activeUsers.change.toFixed(1)}%`,
          trend: metricsData.activeUsers.change >= 0 ? 'up' : 'down',
          icon: Users,
          color: 'text-blue-500',
        },
        {
          title: 'Ventes Totales',
          value: metricsData.totalSales.value.toString(),
          change: `${metricsData.totalSales.change > 0 ? '+' : ''}${metricsData.totalSales.change.toFixed(1)}%`,
          trend: metricsData.totalSales.change >= 0 ? 'up' : 'down',
          icon: ShoppingCart,
          color: 'text-green-500',
        },
        {
          title: 'Revenus',
          value: `${(metricsData.revenue.value / 1000).toFixed(1)}K CFA`,
          change: `${metricsData.revenue.change > 0 ? '+' : ''}${metricsData.revenue.change.toFixed(1)}%`,
          trend: metricsData.revenue.change >= 0 ? 'up' : 'down',
          icon: DollarSign,
          color: 'text-purple-500',
        },
        {
          title: 'Produits',
          value: metricsData.products.value.toString(),
          change: `${metricsData.products.change > 0 ? '+' : ''}${metricsData.products.change.toFixed(1)}%`,
          trend: metricsData.products.change >= 0 ? 'up' : 'down',
          icon: Package,
          color: 'text-orange-500',
        },
      ]);

      // Generate performance data by grouping by dates
      const dataPoints = Math.min(days, 30);
      const interval = Math.floor(days / dataPoints);
      const perfData: PerformanceData[] = [];

      for (let i = 0; i < dataPoints; i++) {
        const dateEnd = new Date(startDate.getTime() + (i + 1) * interval * 24 * 60 * 60 * 1000);
        const dateStart = new Date(startDate.getTime() + i * interval * 24 * 60 * 60 * 1000);
        
        const salesInPeriod = salesRes.data?.filter(s => {
          const date = new Date(s.created_at);
          return date >= dateStart && date < dateEnd;
        }) || [];
        
        const usersInPeriod = profilesRes.data?.filter(p => {
          const date = new Date(p.created_at);
          return date >= dateStart && date < dateEnd;
        }) || [];

        const productsInPeriod = productsRes.data?.filter(p => {
          const date = new Date(p.created_at);
          return date >= dateStart && date < dateEnd;
        }) || [];

        perfData.push({
          date: dateEnd.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
          users: usersInPeriod.length,
          sales: salesInPeriod.length,
          revenue: salesInPeriod.reduce((sum, s) => sum + (s.total || 0), 0),
          products: productsInPeriod.length,
        });
      }
      setPerformanceData(perfData);

      // Calculate usage by feature from audit logs
      const actionCategories = auditLogsRes.data?.reduce((acc, log) => {
        const category = log.action_category || 'Autres';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const total = Object.values(actionCategories).reduce((sum, val) => sum + val, 0);
      const colors = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', '#6b7280'];
      
      const usageData = Object.entries(actionCategories)
        .map(([name, count], idx) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value: Math.round((count / total) * 100),
          color: colors[idx % colors.length],
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      setUsageByFeature(usageData.length > 0 ? usageData : [
        { name: 'Ventes', value: 35, color: 'hsl(var(--primary))' },
        { name: 'Inventaire', value: 28, color: 'hsl(var(--secondary))' },
        { name: 'Clients', value: 20, color: 'hsl(var(--accent))' },
        { name: 'Rapports', value: 12, color: 'hsl(var(--muted))' },
        { name: 'Autres', value: 5, color: '#6b7280' },
      ]);

      // Calculate activity by hour
      const activityByHour = new Array(24).fill(0);
      auditLogsRes.data?.forEach(log => {
        const hour = new Date(log.created_at).getHours();
        activityByHour[hour]++;
      });

      const hourlyData: ActivityByHour[] = [];
      for (let i = 0; i < 24; i += 4) {
        hourlyData.push({
          hour: `${i.toString().padStart(2, '0')}h`,
          active: activityByHour.slice(i, i + 4).reduce((sum, val) => sum + val, 0),
        });
      }
      setUserActivityData(hourlyData);

    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les statistiques de performance',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Statistiques Avancées</h2>
          <p className="text-muted-foreground">
            Analyse détaillée des performances et de l'utilisation
          </p>
        </div>
        <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 derniers jours</SelectItem>
            <SelectItem value="30d">30 derniers jours</SelectItem>
            <SelectItem value="90d">90 derniers jours</SelectItem>
            <SelectItem value="1y">1 an</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cartes de métriques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricsDisplay.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                  )}
                  <span className={metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                    {metric.change}
                  </span>
                  <span className="ml-1">vs période précédente</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="usage">Utilisation</TabsTrigger>
          <TabsTrigger value="activity">Activité</TabsTrigger>
        </TabsList>

        {/* Graphique de Performance */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendances de Performance</CardTitle>
              <CardDescription>
                Évolution des métriques clés sur la période sélectionnée
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-muted-foreground" />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Utilisateurs"
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="hsl(var(--secondary))"
                    strokeWidth={2}
                    name="Ventes"
                  />
                  <Line
                    type="monotone"
                    dataKey="products"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    name="Produits"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Évolution des Revenus</CardTitle>
              <CardDescription>Chiffre d'affaires par période</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-muted-foreground" />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.6}
                    name="Revenus (CFA)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Utilisation par fonctionnalité */}
        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribution de l'utilisation</CardTitle>
              <CardDescription>
                Répartition de l'activité par fonctionnalité
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={usageByFeature}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} (${value}%)`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {usageByFeature.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-4 w-full mt-6">
                {usageByFeature.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: feature.color }}
                    />
                    <div>
                      <p className="text-sm font-medium">{feature.name}</p>
                      <p className="text-xs text-muted-foreground">{feature.value}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activité utilisateur */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activité par heure</CardTitle>
              <CardDescription>
                Nombre d'actions effectuées par tranche horaire
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={userActivityData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="hour" className="text-muted-foreground" />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip />
                  <Bar dataKey="active" fill="hsl(var(--primary))" name="Actions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
