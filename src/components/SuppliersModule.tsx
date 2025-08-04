
import { useState, useMemo } from 'react';
import { Plus, Search, Mail, Phone, MapPin, Edit, Trash2, Users, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SupplierModal } from '@/components/SupplierModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { MetricCard } from '@/components/MetricCard';
import { PaginationControls } from '@/components/PaginationControls';
import { useSupplierStats } from '@/hooks/useSupplierStats';
import { usePagination } from '@/hooks/usePagination';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useSuppliers } from '@/hooks/useSuppliers';

export const SuppliersModule = () => {
  const { suppliers: originalSuppliers, loading, deleteSupplier } = useSuppliers();
  const { suppliers } = useSupplierStats();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; supplierId?: string; supplierName?: string }>({
    open: false
  });

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => {
      const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (supplier.contact && supplier.contact.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [suppliers, searchTerm, statusFilter]);

  const {
    currentData: paginatedSuppliers,
    currentPage,
    totalPages,
    totalItems,
    hasNextPage,
    hasPreviousPage,
    goToPage
  } = usePagination({
    data: filteredSuppliers,
    itemsPerPage: 12
  });

  const handleEdit = (supplier: any) => {
    setEditingSupplier(supplier);
    setShowSupplierModal(true);
  };

  const handleDelete = (supplier: any) => {
    setDeleteConfirm({
      open: true,
      supplierId: supplier.id,
      supplierName: supplier.name
    });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.supplierId) {
      await deleteSupplier(deleteConfirm.supplierId);
    }
    setDeleteConfirm({ open: false });
  };

  const handleCloseModal = () => {
    setShowSupplierModal(false);
    setEditingSupplier(null);
  };

  // Calculs des métriques dynamiques
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.status === 'Actif').length;
  const totalAmount = suppliers.reduce((acc, supplier) => acc + (supplier.calculatedTotalAmount || 0), 0);
  const totalOrders = suppliers.reduce((acc, supplier) => acc + (supplier.calculatedTotalOrders || 0), 0);
  
  // Fournisseurs avec commandes récentes
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const recentSuppliers = suppliers.filter(supplier => {
    if (!supplier.last_order) return false;
    const lastOrderDate = new Date(supplier.last_order);
    return lastOrderDate.getMonth() === thisMonth && lastOrderDate.getFullYear() === thisYear;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Chargement des fournisseurs..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Fournisseurs</h2>
        <Button 
          onClick={() => setShowSupplierModal(true)} 
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau fournisseur
        </Button>
      </div>

      {/* Métriques améliorées */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total fournisseurs"
          value={totalSuppliers.toString()}
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Fournisseurs actifs"
          value={activeSuppliers.toString()}
          icon={TrendingUp}
          color="green"
        />
         <MetricCard
           title="Montant total"
           value={`${totalAmount.toLocaleString()} CFA`}
           icon={DollarSign}
           color="yellow"
         />
        <MetricCard
          title="Commandes totales"
          value={totalOrders.toString()}
          icon={Clock}
          color="red"
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Rechercher un fournisseur..."
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
                <SelectItem value="Actif">Actifs</SelectItem>
                <SelectItem value="Inactif">Inactifs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {suppliers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Aucun fournisseur enregistré"
            description="Commencez par ajouter votre premier fournisseur pour gérer vos approvisionnements."
            actionText="Nouveau fournisseur"
            onAction={() => setShowSupplierModal(true)}
          />
        ) : paginatedSuppliers.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Aucun résultat"
            description="Aucun fournisseur ne correspond à vos critères de recherche."
          />
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedSuppliers.map((supplier) => (
                <div key={supplier.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 truncate">{supplier.name}</h3>
                      <p className="text-sm text-gray-600 truncate">{supplier.contact}</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                        supplier.status === 'Actif' 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {supplier.status}
                      </span>
                    </div>
                  </div>
                  
                   {/* Métriques du fournisseur */}
                   <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                     <div className="text-center">
                       <p className="text-2xl font-bold text-indigo-600">{(supplier.calculatedTotalAmount || 0).toLocaleString()} CFA</p>
                       <p className="text-xs text-gray-500">Montant total</p>
                     </div>
                     <div className="text-center">
                       <p className="text-2xl font-bold text-green-600">{supplier.calculatedTotalOrders || 0}</p>
                       <p className="text-xs text-gray-500">Commandes</p>
                     </div>
                   </div>
                  
                  {/* Informations de contact */}
                  <div className="space-y-2 mb-4">
                    {supplier.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{supplier.email}</span>
                      </div>
                    )}
                    {supplier.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{supplier.phone}</span>
                      </div>
                    )}
                    {supplier.address && (
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-xs leading-tight">{supplier.address}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Footer avec dernière commande et actions */}
                   <div className="border-t pt-4">
                     <p className="text-xs text-gray-500 mb-3">
                       Dernière commande: {supplier.calculatedLastOrder 
                         ? new Date(supplier.calculatedLastOrder).toLocaleDateString('fr-FR')
                         : 'Aucune'
                       }
                     </p>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleEdit(supplier)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Modifier
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-red-600 hover:text-red-700 hover:border-red-300"
                        onClick={() => handleDelete(supplier)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={12}
              onPageChange={goToPage}
              hasNextPage={hasNextPage}
              hasPreviousPage={hasPreviousPage}
            />
          </>
        )}
      </div>

      {showSupplierModal && (
        <SupplierModal 
          supplier={editingSupplier} 
          onClose={handleCloseModal} 
        />
      )}

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open })}
        title="Supprimer le fournisseur"
        description={`Êtes-vous sûr de vouloir supprimer le fournisseur ${deleteConfirm.supplierName} ? Cette action est irréversible.`}
        onConfirm={confirmDelete}
        confirmText="Supprimer"
        variant="destructive"
      />
    </div>
  );
};
