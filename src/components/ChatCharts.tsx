import { useMemo, useRef } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Package, Users, DollarSign, Download, Image } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ChatChartsProps {
  chartType: string;
  products: any[];
  sales: any[];
  clients: any[];
  showExportButtons?: boolean;
}

// Chart color palette for visualizations
const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00C49F'] as const;

export function ChatCharts({ chartType, products, sales, clients, showExportButtons = true }: ChatChartsProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  
  const chartData = useMemo(() => {
    switch (chartType) {
      case 'sales-trend': {
        // Group sales by date
        const salesByDate: Record<string, number> = {};
        sales.forEach(sale => {
          const date = new Date(sale.date || sale.created_at).toLocaleDateString('fr-FR', { 
            day: '2-digit', 
            month: 'short' 
          });
          salesByDate[date] = (salesByDate[date] || 0) + (sale.total || 0);
        });
        
        return Object.entries(salesByDate)
          .slice(-7)
          .map(([date, total]) => ({ date, total }));
      }
      
      case 'stock-levels': {
        // Products with stock levels vs alert threshold
        return products
          .sort((a, b) => (a.stock || 0) - (b.stock || 0))
          .slice(0, 8)
          .map(p => ({
            name: p.name.length > 12 ? p.name.slice(0, 12) + '...' : p.name,
            stock: p.stock || 0,
            seuil: p.alert_threshold || p.alertThreshold || 5,
          }));
      }
      
      case 'top-products': {
        // Top products by estimated revenue (price * sold quantity estimate)
        return products
          .map(p => ({
            name: p.name.length > 15 ? p.name.slice(0, 15) + '...' : p.name,
            valeur: (p.sell_price || p.sellPrice || 0) * (p.stock || 0),
          }))
          .sort((a, b) => b.valeur - a.valeur)
          .slice(0, 5);
      }
      
      case 'client-distribution': {
        // Client distribution by status
        const activeClients = clients.filter(c => c.status === 'Actif').length;
        const inactiveClients = clients.filter(c => c.status !== 'Actif').length;
        
        return [
          { name: 'Actifs', value: activeClients, fill: CHART_COLORS[1] },
          { name: 'Inactifs', value: inactiveClients, fill: CHART_COLORS[3] },
        ];
      }
      
      case 'revenue-by-category': {
        // Revenue by category
        const revenueByCategory: Record<string, number> = {};
        products.forEach(p => {
          const category = p.category || 'Sans catégorie';
          revenueByCategory[category] = (revenueByCategory[category] || 0) + 
            ((p.sell_price || p.sellPrice || 0) * (p.stock || 0));
        });
        
        return Object.entries(revenueByCategory)
          .map(([name, value], index) => ({ 
            name: name.length > 12 ? name.slice(0, 12) + '...' : name, 
            value,
            fill: CHART_COLORS[index % CHART_COLORS.length]
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);
      }
      
      case 'margin-analysis': {
        // Margin analysis by product
        return products
          .map(p => {
            const sellPrice = p.sell_price || p.sellPrice || 0;
            const buyPrice = p.buy_price || p.buyPrice || 0;
            const margin = sellPrice > 0 ? ((sellPrice - buyPrice) / sellPrice) * 100 : 0;
            return {
              name: p.name.length > 12 ? p.name.slice(0, 12) + '...' : p.name,
              marge: Math.round(margin),
            };
          })
          .sort((a, b) => a.marge - b.marge)
          .slice(0, 8);
      }
      
      default:
        return [];
    }
  }, [chartType, products, sales, clients]);

  const renderChart = () => {
    switch (chartType) {
      case 'sales-trend':
        return (
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 9 }} 
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 9 }} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toLocaleString()} CFA`, 'Ventes']}
                contentStyle={{ fontSize: 11, borderRadius: 8 }}
              />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'stock-levels':
        return (
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
              <YAxis 
                dataKey="name" 
                type="category" 
                tick={{ fontSize: 8 }} 
                tickLine={false}
                axisLine={false}
                width={60}
              />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="stock" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Stock" />
              <Bar dataKey="seuil" fill="hsl(var(--destructive)/0.5)" radius={[0, 4, 4, 0]} name="Seuil" />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'top-products':
        return (
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 8 }} 
                tickLine={false}
                axisLine={false}
                angle={-20}
                textAnchor="end"
                height={40}
              />
              <YAxis 
                tick={{ fontSize: 9 }} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toLocaleString()} CFA`, 'Valeur']}
                contentStyle={{ fontSize: 11, borderRadius: 8 }}
              />
              <Bar dataKey="valeur" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'client-distribution':
        return (
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={45}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        );
        
      case 'revenue-by-category':
        return (
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 8 }} 
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 9 }} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toLocaleString()} CFA`, 'Valeur']}
                contentStyle={{ fontSize: 11, borderRadius: 8 }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'margin-analysis':
        return (
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                type="number" 
                tick={{ fontSize: 9 }} 
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                tick={{ fontSize: 8 }} 
                tickLine={false}
                axisLine={false}
                width={60}
              />
              <Tooltip 
                formatter={(value: number) => [`${value}%`, 'Marge']}
                contentStyle={{ fontSize: 11, borderRadius: 8 }}
              />
              <Bar dataKey="marge" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.marge < 20 ? 'hsl(var(--destructive))' : entry.marge > 40 ? 'hsl(var(--chart-2))' : 'hsl(var(--primary))'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
        
      default:
        return null;
    }
  };

  const getChartTitle = () => {
    switch (chartType) {
      case 'sales-trend': return 'Tendance des ventes';
      case 'stock-levels': return 'Niveaux de stock';
      case 'top-products': return 'Top produits';
      case 'client-distribution': return 'Répartition clients';
      case 'revenue-by-category': return 'CA par catégorie';
      case 'margin-analysis': return 'Analyse des marges';
      default: return 'Graphique';
    }
  };

  const getChartIcon = () => {
    switch (chartType) {
      case 'sales-trend': return <TrendingUp className="h-3 w-3" />;
      case 'stock-levels': return <Package className="h-3 w-3" />;
      case 'top-products': return <DollarSign className="h-3 w-3" />;
      case 'client-distribution': return <Users className="h-3 w-3" />;
      case 'revenue-by-category': return <DollarSign className="h-3 w-3" />;
      case 'margin-analysis': return <TrendingUp className="h-3 w-3" />;
      default: return null;
    }
  };

  const exportToPNG = async () => {
    if (!chartRef.current) return;
    
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2
      });
      
      const link = document.createElement('a');
      link.download = `chart-${chartType}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success('Graphique exporté en PNG');
    } catch {
      toast.error('Erreur lors de l\'export');
    }
  };

  const exportToPDF = async () => {
    if (!chartRef.current) return;
    
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`chart-${chartType}-${Date.now()}.pdf`);
      
      toast.success('Graphique exporté en PDF');
    } catch {
      toast.error('Erreur lors de l\'export');
    }
  };

  if (chartData.length === 0) return null;

  return (
    <Card className="mt-2 bg-background/50 border-primary/10">
      <CardHeader className="py-2 px-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
            {getChartIcon()}
            {getChartTitle()}
          </CardTitle>
          {showExportButtons && (
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={exportToPNG}
                title="Exporter en PNG"
              >
                <Image className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={exportToPDF}
                title="Exporter en PDF"
              >
                <Download className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-2 pt-0" ref={chartRef}>
        {renderChart()}
      </CardContent>
    </Card>
  );
}

// Utility function to detect chart type from message
export function detectChartType(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('vente') || lowerMessage.includes('tendance') || lowerMessage.includes('évolution')) {
    return 'sales-trend';
  }
  if (lowerMessage.includes('stock') || lowerMessage.includes('rupture') || lowerMessage.includes('commander') || lowerMessage.includes('réapprovisionner')) {
    return 'stock-levels';
  }
  if (lowerMessage.includes('meilleur') && lowerMessage.includes('produit') || lowerMessage.includes('top produit')) {
    return 'top-products';
  }
  if (lowerMessage.includes('client') && (lowerMessage.includes('répartition') || lowerMessage.includes('actif') || lowerMessage.includes('inactif'))) {
    return 'client-distribution';
  }
  if (lowerMessage.includes('catégorie') || lowerMessage.includes('categorie')) {
    return 'revenue-by-category';
  }
  if (lowerMessage.includes('marge') || lowerMessage.includes('rentabilité') || lowerMessage.includes('profit')) {
    return 'margin-analysis';
  }
  
  return null;
}
