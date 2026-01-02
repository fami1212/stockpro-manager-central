import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useApp } from '@/contexts/AppContext';
import { TrendingUp } from 'lucide-react';

export const SalesChart = () => {
  const { sales } = useApp();

  // Générer les données des 7 derniers jours
  const chartData = useMemo(() => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const today = new Date();
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      const dateStr = date.toDateString();
      
      const daySales = sales.filter(sale => 
        new Date(sale.date).toDateString() === dateStr
      );
      
      const total = daySales.reduce((acc, sale) => acc + sale.total, 0);
      
      last7Days.push({
        name: dayName,
        ventes: total,
        count: daySales.length
      });
    }

    return last7Days;
  }, [sales]);

  const totalWeek = chartData.reduce((acc, day) => acc + day.ventes, 0);
  const avgDay = Math.round(totalWeek / 7);

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Ventes (7 jours)</h3>
          <p className="text-sm text-muted-foreground">Moyenne: {avgDay.toLocaleString()} CFA/jour</p>
        </div>
        <div className="flex items-center gap-1 text-success text-sm">
          <TrendingUp className="h-4 w-4" />
          <span className="font-medium">{totalWeek.toLocaleString()} CFA</span>
        </div>
      </div>
      <div className="h-48 lg:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'hsl(var(--foreground))',
                boxShadow: 'var(--shadow-md)'
              }}
              formatter={(value: number) => [`${value.toLocaleString()} CFA`, 'Ventes']}
            />
            <Area 
              type="monotone" 
              dataKey="ventes" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              fill="url(#colorVentes)"
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
