
import { useState, useMemo } from 'react';
import { Download, FileText, BarChart3, TrendingUp, Calendar, DollarSign, Package, Users, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { format, startOfWeek, startOfMonth, startOfQuarter, startOfYear, endOfWeek, endOfMonth, endOfQuarter, endOfYear, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

export const ReportsModule = () => {
  const { products, sales, clients, loading, initialized } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('sales');

  const reportTypes = [
    { id: 'sales', name: 'Rapport de ventes', icon: TrendingUp },
    { id: 'stock', name: 'Rapport de stock', icon: BarChart3 },
    { id: 'clients', name: 'Rapport clients', icon: Users },
    { id: 'products', name: 'Rapport produits', icon: Package },
  ];

  const periods = [
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'quarter', label: 'Ce trimestre' },
    { value: 'year', label: 'Cette année' },
  ];

  const getDateRange = (period: string) => {
    const now = new Date();
    switch (period) {
      case 'week':
        return { start: startOfWeek(now, { locale: fr }), end: endOfWeek(now, { locale: fr }) };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'quarter':
        return { start: startOfQuarter(now), end: endOfQuarter(now) };
      case 'year':
        return { start: startOfYear(now), end: endOfYear(now) };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

  const filteredData = useMemo(() => {
    const { start, end } = getDateRange(selectedPeriod);
    
    const filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return isWithinInterval(saleDate, { start, end });
    });

    const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalProducts = filteredSales.reduce((sum, sale) => sum + sale.items.length, 0);
    const activeClients = new Set(filteredSales.map(sale => sale.client_id)).size;
    
    // Calculer la marge brute
    const totalCost = filteredSales.reduce((sum, sale) => {
      return sum + sale.items.reduce((itemSum, item) => {
        const product = products.find(p => p.id === item.product_id);
        return itemSum + (product?.buy_price || 0) * item.quantity;
      }, 0);
    }, 0);
    
    const grossMargin = totalSales > 0 ? ((totalSales - totalCost) / totalSales * 100) : 0;

    return {
      totalSales,
      totalProducts,
      activeClients,
      grossMargin,
      salesCount: filteredSales.length,
      averageSale: filteredSales.length > 0 ? totalSales / filteredSales.length : 0,
      filteredSales
    };
  }, [sales, products, selectedPeriod]);

  const stockData = useMemo(() => {
    const totalValue = products.reduce((sum, product) => sum + (product.stock * product.sell_price), 0);
    const lowStock = products.filter(p => p.status === 'Stock bas').length;
    const outOfStock = products.filter(p => p.status === 'Rupture').length;
    const inStock = products.filter(p => p.status === 'En stock').length;

    return {
      totalValue,
      lowStock,
      outOfStock,
      inStock,
      totalProducts: products.length
    };
  }, [products]);

  const topProducts = useMemo(() => {
    const productSales = new Map();
    
    filteredData.filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const current = productSales.get(item.product_id) || { quantity: 0, revenue: 0 };
        productSales.set(item.product_id, {
          quantity: current.quantity + item.quantity,
          revenue: current.revenue + item.total,
          name: item.product
        });
      });
    });

    return Array.from(productSales.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredData.filteredSales]);

  const exportReport = () => {
    const reportData = {
      period: periods.find(p => p.value === selectedPeriod)?.label,
      type: reportTypes.find(r => r.id === selectedReport)?.name,
      generatedAt: format(new Date(), 'dd/MM/yyyy HH:mm', { locale: fr }),
      data: selectedReport === 'sales' ? filteredData : 
            selectedReport === 'stock' ? stockData :
            selectedReport === 'products' ? { products, topProducts } :
            { clients }
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport_${selectedReport}_${selectedPeriod}_${format(new Date(), 'ddMMyyyy')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!initialized || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des rapports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Rapports & Analyses</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm" onClick={exportReport}>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Métriques rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventes totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              €{filteredData.totalSales.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {periods.find(p => p.value === selectedPeriod)?.label}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nombre de ventes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {filteredData.salesCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Vente moyenne: €{filteredData.averageSale.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {filteredData.activeClients}
            </div>
            <p className="text-xs text-muted-foreground">
              Total clients: {clients.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marge brute</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {filteredData.grossMargin.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {periods.find(p => p.value === selectedPeriod)?.label}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Générateur de rapports */}
      <Card>
        <CardHeader>
          <CardTitle>Générateur de rapports</CardTitle>
          <CardDescription>
            Sélectionnez le type de rapport et la période pour générer une analyse détaillée
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type de rapport</label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Période</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="sm" onClick={exportReport}>
              <Download className="w-4 h-4 mr-2" />
              Exporter le rapport
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Détails du rapport */}
      {selectedReport === 'sales' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top 5 des produits vendus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.quantity} vendus</p>
                      </div>
                    </div>
                    <span className="font-semibold text-green-600">€{product.revenue.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ventes récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredData.filteredSales.slice(0, 5).map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{sale.reference}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(sale.date), 'dd/MM/yyyy', { locale: fr })} - {sale.client}
                      </p>
                    </div>
                    <span className="font-semibold text-green-600">€{sale.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedReport === 'stock' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>État du stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-green-700 font-medium">En stock</span>
                  <span className="text-green-600 font-bold">{stockData.inStock} produits</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-yellow-700 font-medium">Stock bas</span>
                  <span className="text-yellow-600 font-bold">{stockData.lowStock} produits</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-red-700 font-medium">Rupture</span>
                  <span className="text-red-600 font-bold">{stockData.outOfStock} produits</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Valeur du stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  €{stockData.totalValue.toLocaleString()}
                </div>
                <p className="text-gray-600">Valeur totale du stock</p>
                <p className="text-sm text-gray-500 mt-2">
                  Répartie sur {stockData.totalProducts} produits
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
