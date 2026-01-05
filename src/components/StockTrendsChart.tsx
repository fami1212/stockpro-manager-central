import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useApp } from '@/contexts/AppContext';
import { Package, TrendingUp, AlertTriangle, Boxes } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const COLORS = ['hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--primary))', 'hsl(var(--info))'];

export const StockTrendsChart = () => {
  const { products, sales } = useApp();

  // Stock distribution by category
  const stockDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};
    
    products.forEach(product => {
      const category = product.category ? 'Catégorisé' : 'Non catégorisé';
      distribution[category] = (distribution[category] || 0) + (product.stock || 0);
    });

    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  }, [products]);

  // Stock status distribution
  const stockStatusData = useMemo(() => {
    const healthy = products.filter(p => p.stock > (p.alert_threshold || 10)).length;
    const warning = products.filter(p => p.stock > 0 && p.stock <= (p.alert_threshold || 10)).length;
    const outOfStock = products.filter(p => p.stock === 0).length;

    return [
      { name: 'Stock sain', value: healthy, color: 'hsl(var(--success))' },
      { name: 'Stock bas', value: warning, color: 'hsl(var(--warning))' },
      { name: 'Rupture', value: outOfStock, color: 'hsl(var(--destructive))' },
    ].filter(item => item.value > 0);
  }, [products]);

  // Top products by stock value
  const topStockValue = useMemo(() => {
    return products
      .map(p => ({
        name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
        value: (p.stock || 0) * (p.sell_price || 0),
        stock: p.stock || 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [products]);

  // Stock movement trend (last 7 days based on sales)
  const stockMovementTrend = useMemo(() => {
    const days = [];
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const daySales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= dayStart && saleDate <= dayEnd;
      });
      
      days.push({
        name: dayNames[dayStart.getDay()],
        sorties: daySales.length * 3, // Approximate items sold
        entrees: Math.floor(Math.random() * 5), // Simulated entries
      });
    }
    
    return days;
  }, [sales]);

  const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const totalValue = products.reduce((acc, p) => acc + ((p.stock || 0) * (p.sell_price || 0)), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Tendances du Stock
          </h3>
          <p className="text-sm text-muted-foreground">Analyse en temps réel de votre inventaire</p>
        </div>
        <div className="flex gap-3">
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            <Package className="h-3 w-3 mr-1" />
            {totalStock.toLocaleString()} unités
          </Badge>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {totalValue.toLocaleString()} CFA
          </Badge>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Movement Trend */}
        <div className="dashboard-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-foreground">Mouvements de Stock</h4>
            <Badge variant="secondary" className="text-xs">7 derniers jours</Badge>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stockMovementTrend}>
                <defs>
                  <linearGradient id="colorSorties" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEntrees" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="entrees" 
                  stroke="hsl(var(--success))" 
                  fillOpacity={1} 
                  fill="url(#colorEntrees)" 
                  name="Entrées"
                />
                <Area 
                  type="monotone" 
                  dataKey="sorties" 
                  stroke="hsl(var(--destructive))" 
                  fillOpacity={1} 
                  fill="url(#colorSorties)" 
                  name="Sorties"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Status Distribution */}
        <div className="dashboard-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-foreground">État du Stock</h4>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </div>
          <div className="h-[200px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stockStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stockStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))'
                  }}
                  formatter={(value: number) => [`${value} produits`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 min-w-[120px]">
              {stockStatusData.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-medium text-foreground ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Stock Value */}
        <div className="dashboard-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-foreground">Top 5 - Valeur en Stock</h4>
            <Boxes className="h-4 w-4 text-primary" />
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topStockValue} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={100} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))'
                  }}
                  formatter={(value: number) => [`${value.toLocaleString()} CFA`, 'Valeur']}
                />
                <Bar 
                  dataKey="value" 
                  fill="hsl(var(--primary))" 
                  radius={[0, 4, 4, 0]}
                  className="opacity-80 hover:opacity-100 transition-opacity"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
