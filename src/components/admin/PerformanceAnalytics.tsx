import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Users, ShoppingCart, Package, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function PerformanceAnalytics() {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(false);

  // Données de performance simulées (dans une vraie app, ces données viendraient de la base de données)
  const performanceData = [
    { date: '01/01', users: 120, sales: 45, revenue: 12500, products: 234 },
    { date: '05/01', users: 145, sales: 52, revenue: 15200, products: 241 },
    { date: '10/01', users: 168, sales: 61, revenue: 18900, products: 255 },
    { date: '15/01', users: 192, sales: 73, revenue: 22100, products: 268 },
    { date: '20/01', users: 215, sales: 85, revenue: 26800, products: 280 },
    { date: '25/01', users: 238, sales: 94, revenue: 31500, products: 295 },
    { date: '30/01', users: 265, sales: 108, revenue: 37200, products: 312 },
  ];

  const usageByFeature = [
    { name: 'Ventes', value: 35, color: '#8b5cf6' },
    { name: 'Inventaire', value: 28, color: '#3b82f6' },
    { name: 'Clients', value: 20, color: '#10b981' },
    { name: 'Rapports', value: 12, color: '#f59e0b' },
    { name: 'Autres', value: 5, color: '#6b7280' },
  ];

  const responseTimeData = [
    { endpoint: '/api/sales', avg: 145, p95: 280, p99: 420 },
    { endpoint: '/api/products', avg: 98, p95: 180, p99: 310 },
    { endpoint: '/api/clients', avg: 112, p95: 220, p99: 380 },
    { endpoint: '/api/reports', avg: 234, p95: 450, p99: 680 },
  ];

  const userActivityData = [
    { hour: '00h', active: 12 },
    { hour: '04h', active: 8 },
    { hour: '08h', active: 45 },
    { hour: '12h', active: 78 },
    { hour: '16h', active: 92 },
    { hour: '20h', active: 65 },
    { hour: '23h', active: 28 },
  ];

  const metrics = [
    {
      title: 'Utilisateurs Actifs',
      value: '265',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-500',
    },
    {
      title: 'Ventes Totales',
      value: '108',
      change: '+8.3%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'text-green-500',
    },
    {
      title: 'Revenus',
      value: '37.2K DH',
      change: '+15.7%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-purple-500',
    },
    {
      title: 'Produits',
      value: '312',
      change: '+5.8%',
      trend: 'up',
      icon: Package,
      color: 'text-orange-500',
    },
  ];

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

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;
          return (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <Badge
                    variant="secondary"
                    className={`${
                      metric.trend === 'up'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}
                  >
                    <TrendIcon className="h-3 w-3 mr-1" />
                    {metric.change}
                  </Badge>
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
          <TabsTrigger value="response">Temps de Réponse</TabsTrigger>
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
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Utilisateurs"
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Ventes"
                  />
                  <Line
                    type="monotone"
                    dataKey="products"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="Produits"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenus</CardTitle>
              <CardDescription>Évolution des revenus dans le temps</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.3}
                    name="Revenus (DH)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Utilisation par Fonctionnalité */}
        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Utilisation par Fonctionnalité</CardTitle>
                <CardDescription>
                  Répartition de l'utilisation des différentes fonctionnalités
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={usageByFeature}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistiques d'Utilisation</CardTitle>
                <CardDescription>Détails par fonctionnalité</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {usageByFeature.map((feature, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: feature.color }}
                          />
                          <span className="font-medium">{feature.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{feature.value}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${feature.value}%`,
                            backgroundColor: feature.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activité Utilisateur */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activité Utilisateur par Heure</CardTitle>
              <CardDescription>
                Distribution de l'activité des utilisateurs au cours de la journée
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={userActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="active" fill="#3b82f6" name="Utilisateurs Actifs" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Temps de Réponse */}
        <TabsContent value="response">
          <Card>
            <CardHeader>
              <CardTitle>Temps de Réponse des API</CardTitle>
              <CardDescription>
                Performance des endpoints par percentile (en ms)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={responseTimeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="endpoint" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avg" fill="#10b981" name="Moyenne" />
                  <Bar dataKey="p95" fill="#f59e0b" name="P95" />
                  <Bar dataKey="p99" fill="#ef4444" name="P99" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
