
import { useState } from 'react';
import { Plus, Search, Mail, Phone, MapPin, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SupplierModal } from '@/components/SupplierModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { useSuppliers } from '@/hooks/useSuppliers';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export const SuppliersModule = () => {
  const { suppliers, loading, deleteSupplier } = useSuppliers();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; supplierId?: string; supplierName?: string }>({
    open: false
  });

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.contact && supplier.contact.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.status === 'Actif').length;
  const totalAmount = suppliers.reduce((acc, supplier) => acc + (supplier.total_amount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Chargement des fournisseurs..." />
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Gestion des Fournisseurs</h2>
        <Button 
          onClick={() => setShowSupplierModal(true)} 
          className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto" 
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau fournisseur
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">Total fournisseurs</h3>
          <p className="text-2xl lg:text-3xl font-bold text-indigo-600">{totalSuppliers}</p>
          <p className="text-xs lg:text-sm text-gray-500 mt-1">{activeSuppliers} actifs</p>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">Commandes ce mois</h3>
          <p className="text-2xl lg:text-3xl font-bold text-green-600">{suppliers.reduce((acc, s) => acc + (s.total_orders || 0), 0)}</p>
          <p className="text-xs lg:text-sm text-gray-500 mt-1">Total commandes</p>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">Montant total</h3>
          <p className="text-2xl lg:text-3xl font-bold text-orange-600">€{totalAmount.toLocaleString()}</p>
          <p className="text-xs lg:text-sm text-gray-500 mt-1">Tous les temps</p>
        </div>
      </div>

      <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Rechercher un fournisseur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">Filtrer</Button>
        </div>

        {suppliers.length === 0 ? (
          <EmptyState
            icon={Phone}
            title="Aucun fournisseur enregistré"
            description="Commencez par ajouter votre premier fournisseur pour gérer vos approvisionnements."
            actionText="Nouveau fournisseur"
            onAction={() => setShowSupplierModal(true)}
          />
        ) : filteredSuppliers.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Aucun résultat"
            description="Aucun fournisseur ne correspond à vos critères de recherche."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSuppliers.map((supplier) => (
              <div key={supplier.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 truncate">{supplier.name}</h3>
                    <p className="text-sm text-gray-600 truncate">{supplier.contact}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      supplier.status === 'Actif' 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {supplier.status}
                    </span>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-lg font-bold text-indigo-600">€{(supplier.total_amount || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{supplier.total_orders || 0} commandes</p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{supplier.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{supplier.phone}</span>
                  </div>
                  {supplier.address && (
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-xs leading-tight">{supplier.address}</span>
                    </div>
                  )}
                </div>
                
                <div className="border-t pt-3">
                  <p className="text-xs text-gray-500 mb-3">
                    Dernière commande: {supplier.last_order || 'Aucune'}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs"
                      onClick={() => handleEdit(supplier)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Modifier
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs text-red-600 hover:text-red-700"
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
