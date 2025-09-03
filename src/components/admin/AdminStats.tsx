import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShoppingCart, Package, TrendingUp, Shield, ShieldCheck, User, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AdminStatsData {
  total_users: number;
  new_users_this_month: number;
  active_users_week: number;
  admin_count: number;
  manager_count: number;
  user_count: number;
  total_sales: number;
  total_products: number;
  total_revenue: number;
}

export function AdminStats() {
  const [stats, setStats] = useState<AdminStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Get user stats
      const { data: userStats } = await supabase
        .from('profiles')
        .select('id, created_at, last_login');

      // Get user roles separately
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('user_id, role');

      // Get sales stats
      const { data: salesStats } = await supabase
        .from('sales')
        .select('total, created_at');

      // Get products stats
      const { data: productsStats } = await supabase
        .from('products')
        .select('id');

      const now = new Date();
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Count roles
      const adminCount = userRoles?.filter(r => r.role === 'admin').length || 0;
      const managerCount = userRoles?.filter(r => r.role === 'manager').length || 0;
      const userCount = userRoles?.filter(r => r.role === 'user').length || 0;

      const adminStats: AdminStatsData = {
        total_users: userStats?.length || 0,
        new_users_this_month: userStats?.filter(u => new Date(u.created_at) >= oneMonthAgo).length || 0,
        active_users_week: userStats?.filter(u => u.last_login && new Date(u.last_login) >= oneWeekAgo).length || 0,
        admin_count: adminCount,
        manager_count: managerCount,
        user_count: userCount,
        total_sales: salesStats?.length || 0,
        total_products: productsStats?.length || 0,
        total_revenue: salesStats?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0
      };

      setStats(adminStats);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Chargement des statistiques...</div>;
  }

  if (!stats) {
    return <div className="text-center p-8">Erreur lors du chargement des statistiques</div>;
  }

  const mainStats = [
    {
      title: "Utilisateurs Total",
      value: stats.total_users.toString(),
      description: `+${stats.new_users_this_month} ce mois`,
      icon: Users,
    },
    {
      title: "Ventes Total",
      value: stats.total_sales.toString(),
      description: "Toutes les ventes",
      icon: ShoppingCart,
    },
    {
      title: "Produits",
      value: stats.total_products.toString(),
      description: "Dans la base de données",
      icon: Package,
    },
    {
      title: "Revenus Total",
      value: `CFA${stats.total_revenue.toLocaleString()}`,
      description: "Chiffre d'affaires total",
      icon: TrendingUp,
    },
  ];

  const roleStats = [
    {
      title: "Administrateurs",
      value: stats.admin_count.toString(),
      icon: Shield,
      color: "text-red-600"
    },
    {
      title: "Managers",
      value: stats.manager_count.toString(),
      icon: ShieldCheck,
      color: "text-blue-600"
    },
    {
      title: "Utilisateurs",
      value: stats.user_count.toString(),
      icon: User,
      color: "text-green-600"
    },
    {
      title: "Actifs (7j)",
      value: stats.active_users_week.toString(),
      icon: Activity,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mainStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Répartition des Rôles</CardTitle>
          <CardDescription>
            Distribution des utilisateurs par rôle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {roleStats.map((stat, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 rounded-lg border">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <div>
                  <p className="text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}