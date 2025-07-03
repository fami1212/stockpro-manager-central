import { useState } from 'react';
import { Plus, Search, Mail, Phone, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ClientModal } from '@/components/ClientModal';
import { PaymentModal } from '@/components/PaymentModal';

export const ClientsModule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showClientModal, setShowClientModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const clients = [
    { 
      id: 1, 
      name: 'Marie Dupont', 
      email: 'marie.dupont@email.com', 
      phone: '06 12 34 56 78', 
      totalPurchases: 3450, 
      lastPurchase: '2024-01-15',
      status: 'Actif'
    },
    { 
      id: 2, 
      name: 'Pierre Martin', 
      email: 'pierre.martin@email.com', 
      phone: '06 87 65 43 21', 
      totalPurchases: 1299, 
      lastPurchase: '2024-01-15',
      status: 'Actif'
    },
    { 
      id: 3, 
      name: 'Sophie Bernard', 
      email: 'sophie.bernard@email.com', 
      phone: '06 45 67 89 12', 
      totalPurchases: 2800, 
      lastPurchase: '2024-01-14',
      status: 'Actif'
    },
    { 
      id: 4, 
      name: 'Lucas Moreau', 
      email: 'lucas.moreau@email.com', 
      phone: '06 98 76 54 32', 
      totalPurchases: 890, 
      lastPurchase: '2024-01-10',
      status: 'Inactif'
    },
  ];

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Clients</h2>
        <div className="flex space-x-2">
          <Button onClick={() => setShowPaymentModal(true)} variant="outline">
            <CreditCard className="w-4 h-4 mr-2" />
            Paiement
          </Button>
          <Button onClick={() => setShowClientModal(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau client
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total clients</h3>
          <p className="text-3xl font-bold text-purple-600">342</p>
          <p className="text-sm text-gray-500 mt-1">+15 ce mois</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Clients actifs</h3>
          <p className="text-3xl font-bold text-green-600">298</p>
          <p className="text-sm text-gray-500 mt-1">87% du total</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Panier moyen</h3>
          <p className="text-3xl font-bold text-blue-600">€289</p>
          <p className="text-sm text-gray-500 mt-1">Par client</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">Filtrer</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <div key={client.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{client.name}</h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                    client.status === 'Actif' 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {client.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-purple-600">€{client.totalPurchases}</p>
                  <p className="text-xs text-gray-500">Total achats</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{client.phone}</span>
                </div>
              </div>
              
              <div className="border-t pt-3">
                <p className="text-xs text-gray-500 mb-2">Dernier achat: {client.lastPurchase}</p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">Voir</Button>
                  <Button variant="outline" size="sm" className="flex-1">Contacter</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showClientModal && (
        <ClientModal onClose={() => setShowClientModal(false)} />
      )}

      {showPaymentModal && (
        <PaymentModal 
          onClose={() => setShowPaymentModal(false)} 
          type="client"
        />
      )}
    </div>
  );
};
