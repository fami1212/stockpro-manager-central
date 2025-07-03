
import { useState } from 'react';
import { Plus, Search, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const SuppliersModule = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const suppliers = [
    {
      id: 1,
      name: 'TechDistrib',
      contact: 'Jean Dubois',
      email: 'jean@techdistrib.com',
      phone: '01 23 45 67 89',
      address: '45 Rue de la Tech, 75001 Paris',
      totalOrders: 15,
      totalAmount: 45600,
      lastOrder: '2024-01-15',
      status: 'Actif'
    },
    {
      id: 2,
      name: 'GlobalSupply',
      contact: 'Marie Laurent',
      email: 'marie@globalsupply.com',
      phone: '01 87 65 43 21',
      address: '12 Avenue du Commerce, 69000 Lyon',
      totalOrders: 8,
      totalAmount: 23400,
      lastOrder: '2024-01-10',
      status: 'Actif'
    },
    {
      id: 3,
      name: 'ElectroPlus',
      contact: 'Pierre Martin',
      email: 'pierre@electroplus.fr',
      phone: '01 45 67 89 12',
      address: '78 Boulevard Tech, 13000 Marseille',
      totalOrders: 12,
      totalAmount: 31200,
      lastOrder: '2024-01-08',
      status: 'Inactif'
    },
  ];

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Fournisseurs</h2>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau fournisseur
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total fournisseurs</h3>
          <p className="text-3xl font-bold text-indigo-600">{suppliers.length}</p>
          <p className="text-sm text-gray-500 mt-1">Fournisseurs actifs</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Commandes ce mois</h3>
          <p className="text-3xl font-bold text-green-600">35</p>
          <p className="text-sm text-gray-500 mt-1">+12% vs mois dernier</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Montant total</h3>
          <p className="text-3xl font-bold text-orange-600">€100,200</p>
          <p className="text-sm text-gray-500 mt-1">Ce mois</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Rechercher un fournisseur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">Filtrer</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSuppliers.map((supplier) => (
            <div key={supplier.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
                  <p className="text-sm text-gray-600">{supplier.contact}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                    supplier.status === 'Actif' 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {supplier.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-indigo-600">€{supplier.totalAmount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{supplier.totalOrders} commandes</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="truncate">{supplier.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{supplier.phone}</span>
                </div>
                <div className="flex items-start text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 mt-0.5" />
                  <span className="text-xs">{supplier.address}</span>
                </div>
              </div>
              
              <div className="border-t pt-3">
                <p className="text-xs text-gray-500 mb-2">Dernière commande: {supplier.lastOrder}</p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">Voir</Button>
                  <Button variant="outline" size="sm" className="flex-1">Commander</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
