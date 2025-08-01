
import { useState, useMemo } from 'react';
import { Plus, Search, Calendar, Package, Truck, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PurchaseOrderModal } from '@/components/PurchaseOrderModal';
import { ReceptionModal } from '@/components/ReceptionModal';
import { MetricCard } from '@/components/MetricCard';
import { EmptyState } from '@/components/EmptyState';
import { PaginationControls } from '@/components/PaginationControls';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { usePagination } from '@/hooks/usePagination';
import { useApp } from '@/contexts/AppContext';

export const PurchasesModule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('orders');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showReceptionModal, setShowReceptionModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>();

  const { purchaseOrders, loading } = usePurchaseOrders();
  const { suppliers } = useApp();

  const filteredOrders = useMemo(() => {
    return purchaseOrders.filter(order => {
      const matchesSearch = order.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [purchaseOrders, searchTerm, statusFilter]);

  const {
    currentData: paginatedOrders,
    currentPage,
    totalPages,
    totalItems,
    hasNextPage,
    hasPreviousPage,
    goToPage
  } = usePagination({
    data: filteredOrders,
    itemsPerPage: 10
  });

  const handleReceiveOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowReceptionModal(true);
  };

  // Calculs des métriques
  const pendingOrders = purchaseOrders.filter(order => order.status === 'En cours');
  const totalPendingAmount = pendingOrders.reduce((acc, order) => acc + order.total, 0);
  
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  
  const receivedThisMonth = purchaseOrders.filter(order => {
    const orderDate = new Date(order.date);
    return orderDate.getMonth() === thisMonth &&
           orderDate.getFullYear() === thisYear &&
           order.status === 'Reçue';
  });
  
  const receivedAmount = receivedThisMonth.reduce((acc, order) => acc + order.total, 0);
  
  const overdueOrders = purchaseOrders.filter(order => {
    if (order.status !== 'En cours' || !order.expected_date) return false;
    return new Date(order.expected_date) < new Date();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des achats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Achats</h2>
        <Button onClick={() => setShowOrderModal(true)} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle commande
        </Button>
      </div>

      {/* Métriques améliorées */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Commandes en cours"
          value={pendingOrders.length.toString()}
          icon={Clock}
          color="orange"
        />
        <MetricCard
          title="En attente"
          value={`€${totalPendingAmount.toLocaleString()}`}
          icon={AlertTriangle}
          color="yellow"
        />
        <MetricCard
          title="Reçu ce mois"
          value={`€${receivedAmount.toLocaleString()}`}
          icon={CheckCircle}
          color="green"
        />
        <MetricCard
          title="En retard"
          value={overdueOrders.length.toString()}
          icon={TrendingUp}
          color="red"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex px-6">
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Package className="w-4 h-4 inline mr-2" />
              Commandes ({purchaseOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('receptions')}
              className={`py-4 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'receptions'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Truck className="w-4 h-4 inline mr-2" />
              Réceptions ({receivedThisMonth.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher une commande..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  <SelectItem value="En cours">En cours</SelectItem>
                  <SelectItem value="Reçue">Reçue</SelectItem>
                  <SelectItem value="Annulée">Annulée</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Filtrer par date
              </Button>
            </div>
          </div>

          {activeTab === 'orders' && (
            <>
              {paginatedOrders.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="Aucune commande trouvée"
                  description={searchTerm || statusFilter !== 'all' 
                    ? "Aucune commande ne correspond à vos critères."
                    : "Commencez par créer votre première commande d'achat."
                  }
                  actionText="Nouvelle commande"
                  onAction={() => setShowOrderModal(true)}
                />
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Référence</th>
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
                        {paginatedOrders.map((order) => {
                          const isOverdue = order.status === 'En cours' && order.expected_date && 
                                          new Date(order.expected_date) < new Date();
                          
                          return (
                            <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div>
                                  <p className="font-medium text-orange-600">{order.reference}</p>
                                  {order.notes && (
                                    <p className="text-xs text-gray-500 mt-1">{order.notes}</p>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-gray-600">
                                {new Date(order.date).toLocaleDateString('fr-FR')}
                              </td>
                              <td className="py-3 px-4">
                                <div>
                                  <p className="font-medium text-gray-900">{order.supplier?.name || 'N/A'}</p>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-gray-600">
                                {order.purchase_order_items?.length || 0} article(s)
                              </td>
                              <td className="py-3 px-4">
                                <p className="font-medium text-gray-900">€{order.total.toLocaleString()}</p>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  order.status === 'Reçue' 
                                    ? 'bg-green-100 text-green-700'
                                    : order.status === 'En cours'
                                    ? (isOverdue ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700')
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {isOverdue ? 'En retard' : order.status}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                {order.expected_date ? (
                                  <div>
                                    <p className="text-gray-900">
                                      {new Date(order.expected_date).toLocaleDateString('fr-FR')}
                                    </p>
                                    {isOverdue && (
                                      <p className="text-xs text-red-600">En retard</p>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-500">Non définie</span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex space-x-2">
                                  <Button variant="outline" size="sm">
                                    Voir
                                  </Button>
                                  {order.status === 'En cours' && (
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => handleReceiveOrder(order.id)}
                                      className="text-green-600 hover:text-green-700"
                                    >
                                      Recevoir
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={10}
                    onPageChange={goToPage}
                    hasNextPage={hasNextPage}
                    hasPreviousPage={hasPreviousPage}
                  />
                </>
              )}
            </>
          )}

          {activeTab === 'receptions' && (
            <div className="space-y-4">
              {receivedThisMonth.length === 0 ? (
                <EmptyState
                  icon={Truck}
                  title="Aucune réception ce mois"
                  description="Les commandes reçues ce mois apparaîtront ici."
                />
              ) : (
                <div className="grid gap-4">
                  {receivedThisMonth.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-green-600">{order.reference}</h4>
                          <p className="text-sm text-gray-600">
                            Reçu le {new Date(order.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          Reçue
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Fournisseur:</span>
                          <p className="text-gray-600">{order.supplier?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="font-medium">Articles:</span>
                          <p className="text-gray-600">{order.purchase_order_items?.length || 0}</p>
                        </div>
                        <div>
                          <span className="font-medium">Total:</span>
                          <p className="text-gray-600">€{order.total.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="font-medium">Statut:</span>
                          <p className="text-green-600">Complète</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
