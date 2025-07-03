
import { useState } from 'react';
import { Plus, Search, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const SalesModule = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const sales = [
    { id: 'V-001', date: '2024-01-15', client: 'Marie Dupont', total: 1299, status: 'Payée', items: 2 },
    { id: 'V-002', date: '2024-01-15', client: 'Pierre Martin', total: 799, status: 'Payée', items: 1 },
    { id: 'V-003', date: '2024-01-14', client: 'Sophie Bernard', total: 2400, status: 'En attente', items: 3 },
    { id: 'V-004', date: '2024-01-14', client: 'Lucas Moreau', total: 450, status: 'Payée', items: 1 },
    { id: 'V-005', date: '2024-01-13', client: 'Emma Rousseau', total: 1599, status: 'Payée', items: 2 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Ventes</h2>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle vente
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ventes du jour</h3>
          <p className="text-3xl font-bold text-green-600">€3,948</p>
          <p className="text-sm text-gray-500 mt-1">7 transactions</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ventes du mois</h3>
          <p className="text-3xl font-bold text-blue-600">€45,231</p>
          <p className="text-sm text-gray-500 mt-1">156 transactions</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Panier moyen</h3>
          <p className="text-3xl font-bold text-purple-600">€289</p>
          <p className="text-sm text-gray-500 mt-1">+12% vs mois dernier</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Rechercher une vente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Filtrer par date
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">N° Vente</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Client</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Articles</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Total</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Statut</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-blue-600">{sale.id}</td>
                  <td className="py-3 px-4 text-gray-600">{sale.date}</td>
                  <td className="py-3 px-4 text-gray-900">{sale.client}</td>
                  <td className="py-3 px-4 text-gray-600">{sale.items} article(s)</td>
                  <td className="py-3 px-4 font-medium text-gray-900">€{sale.total}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      sale.status === 'Payée' 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {sale.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Voir</Button>
                      <Button variant="outline" size="sm">Imprimer</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
