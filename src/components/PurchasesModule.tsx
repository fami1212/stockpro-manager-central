import { useState, useMemo } from 'react';
import { Plus, Search, Calendar, Package, Truck, TrendingUp, AlertTriangle, CheckCircle, Clock, X, Eye, FileText, Trash2, ShoppingBag } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PurchaseOrderModal } from '@/components/PurchaseOrderModal';
import { ReceptionModal } from '@/components/ReceptionModal';
import { PurchaseOrderDetailsModal } from '@/components/PurchaseOrderDetailsModal';
import { EmptyState } from '@/components/EmptyState';
import { PaginationControls } from '@/components/PaginationControls';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { usePagination } from '@/hooks/usePagination';
import { useApp } from '@/contexts/AppContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const PurchasesModule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('orders');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showReceptionModal, setShowReceptionModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderToDelete, setOrderToDelete] = useState<any>(null);

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

  const handleShowDeleteModal = (order: any) => {
    setOrderToDelete(order);
    setShowDeleteModal(true);
  };

  const handleDeleteOrder = () => {
    console.log('Supprimer commande:', orderToDelete?.id);
    setShowDeleteModal(false);
    setOrderToDelete(null);
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

  function generateInvoicePDF(order: any) {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Facture ${order.reference}`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Fournisseur: ${order.supplier?.name || 'N/A'}`, 14, 30);
    doc.text(`Date: ${new Date(order.date).toLocaleDateString('fr-FR')}`, 14, 37);

    autoTable(doc, {
      startY: 45,
      head: [['Article', 'Quantité', 'Prix unitaire', 'Total']],
      body: order.purchase_order_items?.map((item: any) => [
        item.products?.name || 'N/A',
        item.quantity,
        `${item.unit_price.toLocaleString()} CFA`,
        `${item.total.toLocaleString()} CFA`,
      ]) || [],
    });

    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(14);
    doc.text(`Total: ${order.total.toLocaleString()} CFA`, 14, finalY + 10);
    doc.save(`Facture_${order.reference}.pdf`);
  }

  const getStatusBadge = (status: string, isOverdue: boolean) => {
    if (isOverdue) {
      return <Badge variant="destructive" className="text-xs">En retard</Badge>;
    }
    switch (status) {
      case 'Reçue':
        return <Badge className="bg-success/10 text-success border-success/20 text-xs">Reçue</Badge>;
      case 'En cours':
        return <Badge className="bg-warning/10 text-warning border-warning/20 text-xs">En cours</Badge>;
      case 'Annulée':
        return <Badge variant="secondary" className="text-xs">Annulée</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="relative mx-auto h-10 w-10">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
          <p className="text-muted-foreground text-sm">Chargement des achats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header moderne */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-card border border-border/50">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            Gestion des Achats
          </h1>
          <p className="text-sm text-muted-foreground">Gérez vos commandes fournisseurs</p>
        </div>
        <Button onClick={() => setShowOrderModal(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle commande
        </Button>
      </div>

      {/* Métriques avec style moderne */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="dashboard-card p-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">En cours</p>
              <p className="text-xl font-bold text-foreground">{pendingOrders.length}</p>
            </div>
          </div>
          <Badge variant="outline" className="mt-2 text-xs">commandes</Badge>
        </div>

        <div className="dashboard-card p-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <AlertTriangle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">En attente</p>
              <p className="text-lg font-bold text-foreground">{totalPendingAmount.toLocaleString()}</p>
            </div>
          </div>
          <Badge variant="outline" className="mt-2 text-xs">CFA</Badge>
        </div>

        <div className="dashboard-card p-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Reçu ce mois</p>
              <p className="text-lg font-bold text-foreground">{receivedAmount.toLocaleString()}</p>
            </div>
          </div>
          <Badge variant="outline" className="mt-2 text-xs">CFA</Badge>
        </div>

        <div className="dashboard-card p-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
              <TrendingUp className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">En retard</p>
              <p className="text-xl font-bold text-foreground">{overdueOrders.length}</p>
            </div>
          </div>
          <Badge variant="destructive" className="mt-2 text-xs">urgent</Badge>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="dashboard-card overflow-hidden">
        {/* Onglets */}
        <div className="border-b border-border/50">
          <nav className="flex px-4 lg:px-6">
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'orders'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Package className="w-4 h-4 inline mr-2" />
              Commandes ({purchaseOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('receptions')}
              className={`py-4 px-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'receptions'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Truck className="w-4 h-4 inline mr-2" />
              Réceptions ({receivedThisMonth.length})
            </button>
          </nav>
        </div>

        <div className="p-4 lg:p-6">
          {/* Filtres */}
          <div className="flex flex-col lg:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher une commande..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  <SelectItem value="En cours">En cours</SelectItem>
                  <SelectItem value="Reçue">Reçue</SelectItem>
                  <SelectItem value="Annulée">Annulée</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="hidden lg:flex">
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
                  {/* Table Desktop */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Référence</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Date</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Fournisseur</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Articles</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Total</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Statut</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Livraison</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedOrders.map((order, index) => {
                          const isOverdue = order.status === 'En cours' && order.expected_date &&
                            new Date(order.expected_date) < new Date();

                          return (
                            <tr 
                              key={order.id} 
                              className="border-b border-border/30 hover:bg-muted/30 transition-colors animate-fade-in"
                              style={{ animationDelay: `${index * 0.05}s` }}
                            >
                              <td className="py-3 px-4">
                                <div>
                                  <p className="font-medium text-primary">{order.reference}</p>
                                  {order.notes && (
                                    <p className="text-xs text-muted-foreground mt-1 truncate max-w-[150px]">{order.notes}</p>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-muted-foreground text-sm">
                                {new Date(order.date).toLocaleDateString('fr-FR')}
                              </td>
                              <td className="py-3 px-4">
                                <p className="font-medium text-foreground">{order.supplier?.name || 'N/A'}</p>
                              </td>
                              <td className="py-3 px-4">
                                <Badge variant="secondary" className="text-xs">
                                  {order.purchase_order_items?.length || 0} article(s)
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <p className="font-semibold text-foreground">{order.total.toLocaleString()} CFA</p>
                              </td>
                              <td className="py-3 px-4">
                                {getStatusBadge(order.status, !!isOverdue)}
                              </td>
                              <td className="py-3 px-4">
                                {order.expected_date ? (
                                  <div>
                                    <p className="text-sm text-foreground">
                                      {new Date(order.expected_date).toLocaleDateString('fr-FR')}
                                    </p>
                                    {isOverdue && (
                                      <p className="text-xs text-destructive">En retard</p>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-sm">Non définie</span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setShowDetailsModal(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {order.status === 'En cours' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleReceiveOrder(order.id)}
                                      className="text-success hover:text-success"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {order.status === 'Reçue' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => generateInvoicePDF(order)}
                                      className="text-info hover:text-info"
                                    >
                                      <FileText className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleShowDeleteModal(order)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Cards Mobile */}
                  <div className="lg:hidden space-y-3">
                    {paginatedOrders.map((order, index) => {
                      const isOverdue = order.status === 'En cours' && order.expected_date &&
                        new Date(order.expected_date) < new Date();

                      return (
                        <div 
                          key={order.id} 
                          className="p-4 rounded-lg border border-border/50 bg-card/50 animate-fade-in"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-semibold text-primary">{order.reference}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(order.date).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            {getStatusBadge(order.status, !!isOverdue)}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                            <div>
                              <p className="text-muted-foreground text-xs">Fournisseur</p>
                              <p className="font-medium text-foreground">{order.supplier?.name || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Total</p>
                              <p className="font-semibold text-foreground">{order.total.toLocaleString()} CFA</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Articles</p>
                              <p className="text-foreground">{order.purchase_order_items?.length || 0}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Livraison</p>
                              <p className="text-foreground">
                                {order.expected_date 
                                  ? new Date(order.expected_date).toLocaleDateString('fr-FR')
                                  : 'Non définie'}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowDetailsModal(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Voir
                            </Button>
                            {order.status === 'En cours' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-success border-success/20 hover:bg-success/10"
                                onClick={() => handleReceiveOrder(order.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Recevoir
                              </Button>
                            )}
                            {order.status === 'Reçue' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => generateInvoicePDF(order)}
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Facturer
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4">
                    <PaginationControls
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={totalItems}
                      itemsPerPage={10}
                      onPageChange={goToPage}
                      hasNextPage={hasNextPage}
                      hasPreviousPage={hasPreviousPage}
                    />
                  </div>
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
                <div className="grid gap-3">
                  {receivedThisMonth.map((order, index) => (
                    <div 
                      key={order.id} 
                      className="p-4 rounded-lg border border-border/50 bg-card/50 animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-success">{order.reference}</h4>
                          <p className="text-sm text-muted-foreground">
                            Reçu le {new Date(order.updated_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <Badge className="bg-success/10 text-success border-success/20">
                          Reçue
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground text-xs">Fournisseur</span>
                          <p className="font-medium text-foreground">{order.supplier?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs">Articles</span>
                          <p className="font-medium text-foreground">{order.purchase_order_items?.length || 0}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs">Total</span>
                          <p className="font-semibold text-foreground">{order.total.toLocaleString()} CFA</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs">Statut</span>
                          <p className="text-success">Complète</p>
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

      <PurchaseOrderDetailsModal
        order={selectedOrder}
        open={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedOrder(null);
        }}
      />

      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la commande "{orderToDelete?.reference}" ? 
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOrder} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
