
import { useApp } from '@/contexts/AppContext';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const StockAlerts = () => {
  const { products } = useApp();
  
  // Calculer les produits avec stock bas dynamiquement
  const lowStockProducts = products.filter(product => 
    product.stock <= product.alert_threshold
  ).slice(0, 5); // Limiter à 5 alertes

  if (lowStockProducts.length === 0) {
    return (
      <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Alertes Stock</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">Aucune alerte de stock bas</p>
          <p className="text-sm text-gray-400 mt-1">Tous vos produits ont un stock suffisant</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-red-600" />
        <h3 className="text-lg font-semibold text-gray-900">Alertes Stock Bas</h3>
        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
          {lowStockProducts.length}
        </span>
      </div>
      <div className="space-y-3">
        {lowStockProducts.map((product) => (
          <div key={product.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-400 space-y-2 sm:space-y-0">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{product.name}</p>
              <p className="text-xs text-gray-600">
                Seuil: {product.alert_threshold} • Ref: {product.reference}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-sm font-bold text-red-600">{product.stock} restant</span>
              <p className="text-xs text-red-500">Stock critique!</p>
            </div>
          </div>
        ))}
      </div>
      <Button className="w-full mt-4">
        Gérer les réapprovisionnements
      </Button>
    </div>
  );
};
