import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Percent, 
  DollarSign, 
  ShoppingCart,
  Calendar,
  Target
} from 'lucide-react';
import { Promotion } from '@/hooks/usePromotions';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface PromotionsDashboardProps {
  promotions: Promotion[];
}

export const PromotionsDashboard = ({ promotions }: PromotionsDashboardProps) => {
  // Calculate stats
  const activePromotions = promotions.filter(p => p.is_active).length;
  const inactivePromotions = promotions.filter(p => !p.is_active).length;
  
  const avgDiscount = promotions.length > 0
    ? promotions.reduce((sum, p) => sum + Number(p.discount_value), 0) / promotions.length
    : 0;

  // Promotions by type
  const promotionsByType = [
    {
      name: 'Produit',
      value: promotions.filter(p => p.applies_to === 'product').length,
      color: 'hsl(var(--chart-1))'
    },
    {
      name: 'Vente',
      value: promotions.filter(p => p.applies_to === 'sale').length,
      color: 'hsl(var(--chart-2))'
    },
    {
      name: 'Catégorie',
      value: promotions.filter(p => p.applies_to === 'category').length,
      color: 'hsl(var(--chart-3))'
    }
  ];

  // Promotions by discount type
  const discountTypeData = [
    {
      type: 'Pourcentage',
      count: promotions.filter(p => p.discount_type === 'percentage').length
    },
    {
      type: 'Fixe',
      count: promotions.filter(p => p.discount_type === 'fixed').length
    }
  ];

  // Active vs Expired promotions timeline
  const now = new Date();
  const upcoming = promotions.filter(p => 
    p.start_date && new Date(p.start_date) > now
  ).length;
  
  const current = promotions.filter(p => {
    const start = p.start_date ? new Date(p.start_date) : null;
    const end = p.end_date ? new Date(p.end_date) : null;
    return (!start || start <= now) && (!end || end >= now) && p.is_active;
  }).length;
  
  const expired = promotions.filter(p => 
    p.end_date && new Date(p.end_date) < now
  ).length;

  const timelineData = [
    { status: 'À venir', count: upcoming },
    { status: 'En cours', count: current },
    { status: 'Expirées', count: expired }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Promotions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promotions.length}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="default" className="text-xs">
                {activePromotions} actives
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {inactivePromotions} inactives
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remise Moyenne</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgDiscount.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Moyenne des remises actives
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Cours</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{current}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Promotions actuellement actives
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">À Venir</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcoming}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Promotions planifiées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Promotions by Type - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Répartition par Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={promotionsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {promotionsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Timeline Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Chronologie des Promotions</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Discount Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Types de Remise</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={discountTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Promotions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Meilleures Remises</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {promotions
                .sort((a, b) => Number(b.discount_value) - Number(a.discount_value))
                .slice(0, 5)
                .map((promo) => (
                  <div key={promo.id} className="flex items-center justify-between border-b pb-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm truncate">{promo.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {promo.applies_to === 'product' ? 'Produit' : 
                         promo.applies_to === 'sale' ? 'Vente' : 'Catégorie'}
                      </p>
                    </div>
                    <Badge variant={promo.is_active ? 'default' : 'secondary'}>
                      {promo.discount_type === 'percentage' 
                        ? `${promo.discount_value}%` 
                        : `${promo.discount_value} DA`}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
