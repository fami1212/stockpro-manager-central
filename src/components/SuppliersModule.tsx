
import { useState, useMemo } from 'react';
import { Plus, Search, Mail, Phone, MapPin, Edit2, Trash2, Users, TrendingUp, DollarSign, Clock, Building2, ShoppingCart, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SupplierModal } from '@/components/SupplierModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
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
    <div className="space-y-6 animate-fade-in">
      {/* Header moderne */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Gestion des Fournisseurs</h2>
            <p className="text-sm text-muted-foreground">Gérez vos partenaires commerciaux</p>
          </div>
        </div>
        <Button 
          onClick={() => setShowSupplierModal(true)} 
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau fournisseur
        </Button>
      </div>

      {/* Métriques modernes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 p-5 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-blue-500/20">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 text-xs">Total</Badge>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-foreground">{totalSuppliers}</p>
            <p className="text-xs text-muted-foreground mt-1">Fournisseurs</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 p-5 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 text-xs">Actifs</Badge>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-foreground">{activeSuppliers}</p>
            <p className="text-xs text-muted-foreground mt-1">Fournisseurs actifs</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 p-5 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 text-xs">Volume</Badge>
            </div>
            <p className="text-xl md:text-2xl font-bold text-foreground">{totalAmount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">CFA total</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/20 p-5 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-purple-500/20">
                <ShoppingCart className="w-5 h-5 text-purple-600" />
              </div>
              <Badge variant="secondary" className="bg-purple-500/10 text-purple-700 text-xs">Commandes</Badge>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-foreground">{totalOrders}</p>
            <p className="text-xs text-muted-foreground mt-1">Commandes totales</p>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-card/50 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-border/50">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un fournisseur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 rounded-xl"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-background/50 border-border/50 rounded-xl">
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
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedSuppliers.map((supplier, index) => (
                <div 
                  key={supplier.id} 
                  className="group relative overflow-hidden bg-card border border-border/50 rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Background gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Building2 className="w-4 h-4 text-primary" />
                          </div>
                          <h3 className="font-semibold text-lg text-foreground truncate">{supplier.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground truncate pl-10">{supplier.contact}</p>
                      </div>
                      <Badge 
                        variant={supplier.status === 'Actif' ? 'default' : 'secondary'}
                        className={`${
                          supplier.status === 'Actif' 
                            ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {supplier.status}
                      </Badge>
                    </div>
                    
                    {/* Métriques du fournisseur */}
                    <div className="grid grid-cols-2 gap-3 mb-4 p-4 bg-gradient-to-br from-muted/50 to-muted/20 rounded-xl border border-border/30">
                      <div className="text-center">
                        <p className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                          {(supplier.calculatedTotalAmount || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">CFA total</p>
                      </div>
                      <div className="text-center border-l border-border/30">
                        <p className="text-xl font-bold text-emerald-600">{supplier.calculatedTotalOrders || 0}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Commandes</p>
                      </div>
                    </div>
                    
                    {/* Informations de contact */}
                    <div className="space-y-2 mb-4">
                      {supplier.email && (
                        <div className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                          <div className="p-1.5 rounded-md bg-muted/50 mr-2">
                            <Mail className="w-3.5 h-3.5" />
                          </div>
                          <span className="truncate">{supplier.email}</span>
                        </div>
                      )}
                      {supplier.phone && (
                        <div className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                          <div className="p-1.5 rounded-md bg-muted/50 mr-2">
                            <Phone className="w-3.5 h-3.5" />
                          </div>
                          <span>{supplier.phone}</span>
                        </div>
                      )}
                      {supplier.address && (
                        <div className="flex items-start text-sm text-muted-foreground hover:text-foreground transition-colors">
                          <div className="p-1.5 rounded-md bg-muted/50 mr-2 mt-0.5">
                            <MapPin className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs leading-relaxed">{supplier.address}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Footer avec dernière commande et actions */}
                    <div className="border-t border-border/30 pt-4">
                      <div className="flex items-center text-xs text-muted-foreground mb-3">
                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                        <span>
                          Dernière commande: {supplier.calculatedLastOrder 
                            ? new Date(supplier.calculatedLastOrder).toLocaleDateString('fr-FR')
                            : 'Aucune'
                          }
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 rounded-xl border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-200"
                          onClick={() => handleEdit(supplier)}
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                          Modifier
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 rounded-xl border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all duration-200"
                          onClick={() => handleDelete(supplier)}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={12}
                onPageChange={goToPage}
                hasNextPage={hasNextPage}
                hasPreviousPage={hasPreviousPage}
              />
            </div>
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
