
import { MetricCard } from '@/components/MetricCard';
import { SalesChart } from '@/components/SalesChart';
import { StockAlerts } from '@/components/StockAlerts';
import { TopProducts } from '@/components/TopProducts';

export const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Chiffre d'affaires"
          value="€45,231"
          change="+12.5%"
          changeType="positive"
          description="Ce mois"
        />
        <MetricCard
          title="Ventes totales"
          value="1,234"
          change="+8.2%"
          changeType="positive"
          description="Ce mois"
        />
        <MetricCard
          title="Produits en stock"
          value="856"
          change="-2.4%"
          changeType="negative"
          description="Articles"
        />
        <MetricCard
          title="Clients actifs"
          value="342"
          change="+15.3%"
          changeType="positive"
          description="Ce mois"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart />
        <StockAlerts />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProducts />
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">Nouvelle vente #1234</p>
                <p className="text-xs text-gray-500">Client: Marie Dupont</p>
              </div>
              <span className="text-sm text-green-600 font-medium">€234.50</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">Stock ajouté</p>
                <p className="text-xs text-gray-500">Produit: iPhone 15</p>
              </div>
              <span className="text-sm text-blue-600 font-medium">+50 unités</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">Nouveau client</p>
                <p className="text-xs text-gray-500">Pierre Martin</p>
              </div>
              <span className="text-sm text-gray-600">Il y a 2h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
