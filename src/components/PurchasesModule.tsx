
import { useState } from 'react';
import { Plus, Search, Calendar, Package, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PurchaseOrderModal } from '@/components/PurchaseOrderModal';
import { ReceptionModal } from '@/components/ReceptionModal';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { useApp } from '@/contexts/AppContext';

export const PurchasesModule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('orders');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showReceptionModal, setShowReceptionModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>();

  const { purchaseOrders, loading } = usePurchaseOrders();
  const { suppliers } = useApp();

  const handleReceiveOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowReceptionModal(true);
  };

  const filteredOrders = purchaseOrders.filter(order =>
    order.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOrdersAmount = purchaseOrders
    .filter(order => order.status === 'En cours')
    .reduce((acc, order) => acc + order.total, 0);

  const receivedThisMonth = purchaseOrders
    .filter(order => {
      const orderDate = new Date(order.date);
      const currentDate = new Date();
      return orderDate.getMonth() === currentDate.getMonth() &&
             orderDate.getFullYear() === currentDate.getFullYear() &&
             order.status === 'Reçue';
    })
    .reduce((acc, order) => acc + order.total, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

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
          <p className="text-2xl lg:text-3xl font-bold text-orange-600">
            {purchaseOrders.filter(order => order.status === 'En cours').length}
          </p>
          <p className="text-xs lg:text-sm text-gray-500 mt-1">€{totalOrdersAmount.toLocaleString()} en attente</p>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">Reçu ce mois</h3>
          <p className="text-2xl lg:text-3xl font-bold text-green-600">€{receivedThisMonth.toLocaleString()}</p>
          <p className="text-xs lg:text-sm text-gray-500 mt-1">
            {purchaseOrders.filter(order => {
              const orderDate = new Date(order.date);
              const currentDate = new Date();
              return orderDate.getMonth() === currentDate.getMonth() &&
                     orderDate.getFullYear() === currentDate.getFullYear() &&
                     order.status === 'Reçue';
            }).length} réceptions
          </p>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">Fournisseurs actifs</h3>
          <p className="text-2xl lg:text-3xl font-bold text-blue-600">{suppliers.length}</p>
          <p className="text-xs lg:text-sm text-gray-500 mt-1">Total</p>
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
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {purchaseOrders.length === 0 
                      ? "Aucune commande. Créez votre première commande d'achat."
                      : "Aucune commande ne correspond à votre recherche."
                    }
                  </div>
                ) : (
                  <>
                    {/* Mobile view */}
                    <div className="lg:hidden space-y-4">
                      {filteredOrders.map((order) => (
                        <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium text-orange-600">{order.reference}</h4>
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
                            <p><span className="font-medium">Fournisseur:</span> {order.supplier?.name || 'N/A'}</p>
                            <p><span className="font-medium">Articles:</span> {order.purchase_order_items?.length || 0}</p>
                            <p><span className="font-medium">Total:</span> €{order.total.toLocaleString()}</p>
                            <p><span className="font-medium">Livraison:</span> {order.expected_date || 'Non définie'}</p>
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
                        {filteredOrders.map((order) => (
                          <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-orange-600">{order.reference}</td>
                            <td className="py-3 px-4 text-gray-600">{order.date}</td>
                            <td className="py-3 px-4 text-gray-900">{order.supplier?.name || 'N/A'}</td>
                            <td className="py-3 px-4 text-gray-600">{order.purchase_order_items?.length || 0} article(s)</td>
                            <td className="py-3 px-4 font-medium text-gray-900">€{order.total.toLocaleString()}</td>
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
                            <td className="py-3 px-4 text-gray-600">{order.expected_date || 'Non définie'}</td>
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
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'receptions' && (
            <div className="text-center py-8 text-gray-500">
              Module de réception en cours de développement
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
