
import { useState } from 'react';
import { Plus, Search, Calendar, Package, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PurchaseOrderModal } from '@/components/PurchaseOrderModal';
import { ReceptionModal } from '@/components/ReceptionModal';

export const PurchasesModule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('orders');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showReceptionModal, setShowReceptionModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>();

  const orders = [
    { 
      id: 'A-001', 
      date: '2024-01-15', 
      supplier: 'TechDistrib', 
      total: 15600, 
      status: 'En cours', 
      items: 5,
      expected: '2024-01-20'
    },
    { 
      id: 'A-002', 
      date: '2024-01-14', 
      supplier: 'GlobalSupply', 
      total: 8950, 
      status: 'Reçue', 
      items: 3,
      expected: '2024-01-18'
    },
    { 
      id: 'A-003', 
      date: '2024-01-12', 
      supplier: 'TechDistrib', 
      total: 4200, 
      status: 'Facturée', 
      items: 2,
      expected: '2024-01-16'
    },
  ];

  const receptions = [
    { id: 'R-001', date: '2024-01-15', order: 'A-002', items: 3, received: 3, status: 'Complète' },
    { id: 'R-002', date: '2024-01-14', order: 'A-001', items: 5, received: 3, status: 'Partielle' },
  ];

  const handleReceiveOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowReceptionModal(true);
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Gestion des Achats</h2>
        <Button onClick={() => setShowOrderModal(true)} className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle commande
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">Commandes en cours</h3>
          <p className="text-2xl lg:text-3xl font-bold text-orange-600">3</p>
          <p className="text-xs lg:text-sm text-gray-500 mt-1">€29,750 en attente</p>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">Reçu ce mois</h3>
          <p className="text-2xl lg:text-3xl font-bold text-green-600">€18,450</p>
          <p className="text-xs lg:text-sm text-gray-500 mt-1">12 réceptions</p>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">Fournisseurs actifs</h3>
          <p className="text-2xl lg:text-3xl font-bold text-blue-600">8</p>
          <p className="text-xs lg:text-sm text-gray-500 mt-1">Ce mois</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex px-4 lg:px-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Package className="w-4 h-4 inline mr-2" />
              Commandes
            </button>
            <button
              onClick={() => setActiveTab('receptions')}
              className={`py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'receptions'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Truck className="w-4 h-4 inline mr-2" />
              Réceptions
            </button>
          </nav>
        </div>

        <div className="p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Calendar className="w-4 h-4 mr-2" />
              Filtrer par date
            </Button>
          </div>

          {activeTab === 'orders' && (
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* Mobile view */}
                <div className="lg:hidden space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-orange-600">{order.id}</h4>
                          <p className="text-sm text-gray-600">{order.date}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'Reçue' 
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'En cours'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="space-y-1 mb-3 text-sm">
                        <p><span className="font-medium">Fournisseur:</span> {order.supplier}</p>
                        <p><span className="font-medium">Articles:</span> {order.items}</p>
                        <p><span className="font-medium">Total:</span> €{order.total}</p>
                        <p><span className="font-medium">Livraison:</span> {order.expected}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" className="w-full text-xs">Voir</Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleReceiveOrder(order.id)}
                          className="w-full text-xs"
                        >
                          Recevoir
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop table */}
                <table className="hidden lg:table w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">N° Commande</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Fournisseur</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Articles</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Total</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Statut</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Livraison</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-orange-600">{order.id}</td>
                        <td className="py-3 px-4 text-gray-600">{order.date}</td>
                        <td className="py-3 px-4 text-gray-900">{order.supplier}</td>
                        <td className="py-3 px-4 text-gray-600">{order.items} article(s)</td>
                        <td className="py-3 px-4 font-medium text-gray-900">€{order.total}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'Reçue' 
                              ? 'bg-green-100 text-green-700'
                              : order.status === 'En cours'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{order.expected}</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">Voir</Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleReceiveOrder(order.id)}
                            >
                              Recevoir
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'receptions' && (
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* Mobile view */}
                <div className="lg:hidden space-y-4">
                  {receptions.map((reception) => (
                    <div key={reception.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-orange-600">{reception.id}</h4>
                          <p className="text-sm text-gray-600">{reception.date}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          reception.status === 'Complète'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {reception.status}
                        </span>
                      </div>
                      <div className="space-y-1 mb-3 text-sm">
                        <p><span className="font-medium">Commande:</span> {reception.order}</p>
                        <p><span className="font-medium">Articles:</span> {reception.items}</p>
                        <p><span className="font-medium">Reçu:</span> {reception.received}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" className="w-full text-xs">Voir</Button>
                        <Button variant="outline" size="sm" className="w-full text-xs">Imprimer</Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop table */}
                <table className="hidden lg:table w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">N° Réception</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Commande</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Articles</th>
                      <th className="text-left py-3 px-4 font-semibent text-gray-900">Reçu</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Statut</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receptions.map((reception) => (
                      <tr key={reception.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-orange-600">{reception.id}</td>
                        <td className="py-3 px-4 text-gray-600">{reception.date}</td>
                        <td className="py-3 px-4 text-gray-900">{reception.order}</td>
                        <td className="py-3 px-4 text-gray-600">{reception.items}</td>
                        <td className="py-3 px-4 text-gray-600">{reception.received}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            reception.status === 'Complète'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {reception.status}
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
          )}
        </div>
      </div>

      {showOrderModal && (
        <PurchaseOrderModal onClose={() => setShowOrderModal(false)} />
      )}

      {showReceptionModal && (
        <ReceptionModal 
          onClose={() => {
            setShowReceptionModal(false);
            setSelectedOrderId(undefined);
          }} 
          orderId={selectedOrderId}
        />
      )}
    </div>
  );
};
