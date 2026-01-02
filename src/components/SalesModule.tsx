import { useState } from 'react';
import { Plus, Search, Eye, Edit, Trash2, FileText, ShoppingCart, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FunctionalSaleModal } from '@/components/FunctionalSaleModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PaginationControls } from '@/components/PaginationControls';
import { EmptyState } from '@/components/EmptyState';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { usePagination } from '@/hooks/usePagination';
import { supabase } from '@/integrations/supabase/client';
import { downloadInvoicePDF } from '@/utils/invoicePdfGenerator';
import { toast } from 'sonner';

export const SalesModule = () => {
  const { state, deleteSale } = useApp();
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; saleId?: string; saleName?: string }>({
    open: false
  });

  const {
    currentData: paginatedSales,
    currentPage,
    totalPages,
    totalItems,
    hasNextPage,
    hasPreviousPage,
    goToPage
  } = usePagination({
    data: state.sales,
    itemsPerPage: 10,
    searchTerm,
    searchFields: ['reference', 'client'],
    filters: { status: statusFilter }
  });

  const handleEdit = (sale: any) => {
    setEditingSale(sale);
    setShowSaleModal(true);
  };

  const handleDelete = (sale: any) => {
    setDeleteConfirm({
      open: true,
      saleId: sale.id,
      saleName: sale.reference
    });
  };

  const confirmDelete = () => {
    if (deleteConfirm.saleId) {
      deleteSale(deleteConfirm.saleId);
    }
    setDeleteConfirm({ open: false });
  };

  const handleCloseModal = () => {
    setShowSaleModal(false);
    setEditingSale(null);
  };

  const handleGenerateInvoice = async (sale: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Vous devez être connecté');
        return;
      }

      const { data: settings } = await supabase
        .from('invoice_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const client = state.clients.find(c => c.id === sale.client_id || c.name === sale.client);

      const invoiceData = {
        invoice_number: `INV-${sale.reference}`,
        invoice_date: sale.date,
        due_date: undefined,
        client: {
          name: client?.name || sale.client || 'Client',
          email: client?.email,
          phone: client?.phone,
          address: client?.address,
        },
        items: sale.items.map((item: any) => ({
          description: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          total: item.total,
        })),
        subtotal: sale.total - sale.tax,
        tax: sale.tax || 0,
        discount: sale.discount || 0,
        total: sale.total,
        amount_paid: 0,
        notes: undefined,
      };

      await downloadInvoicePDF(invoiceData, settings || undefined);
      toast.success('Facture générée');
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Erreur lors de la génération');
    }
  };

  const totalRevenue = state.sales.reduce((acc, sale) => acc + sale.total, 0);
  const thisMonthSales = state.sales.filter(sale => {
    const saleDate = new Date(sale.date);
    const currentDate = new Date();
    return saleDate.getMonth() === currentDate.getMonth() && 
           saleDate.getFullYear() === currentDate.getFullYear();
  });
  const thisMonthRevenue = thisMonthSales.reduce((acc, sale) => acc + sale.total, 0);
  const averageBasket = state.sales.length > 0 ? totalRevenue / state.sales.length : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmée':
        return <Badge className="bg-success/10 text-success border-0">{status}</Badge>;
      case 'Livrée':
        return <Badge className="bg-info/10 text-info border-0">{status}</Badge>;
      case 'Brouillon':
        return <Badge className="bg-warning/10 text-warning border-0">{status}</Badge>;
      default:
        return <Badge className="bg-destructive/10 text-destructive border-0">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-foreground">Gestion des Ventes</h2>
          <p className="text-sm text-muted-foreground">Gérez vos transactions</p>
        </div>
        <Button 
          onClick={() => setShowSaleModal(true)} 
          className="w-full sm:w-auto" 
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle vente
        </Button>
      </div>

      {/* Indicateurs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="dashboard-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <DollarSign className="h-5 w-5 text-success" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">Chiffre d'affaires</p>
              <p className="text-lg lg:text-xl font-bold text-foreground">{totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">CFA total</p>
            </div>
          </div>
        </div>
        
        <div className="dashboard-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
              <ShoppingCart className="h-5 w-5 text-info" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">Ce mois</p>
              <p className="text-lg lg:text-xl font-bold text-foreground">{thisMonthSales.length}</p>
              <p className="text-xs text-muted-foreground">ventes</p>
            </div>
          </div>
        </div>
        
        <div className="dashboard-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">Panier moyen</p>
              <p className="text-lg lg:text-xl font-bold text-foreground">{Math.round(averageBasket).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">CFA</p>
            </div>
          </div>
        </div>
        
        <div className="dashboard-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <BarChart3 className="h-5 w-5 text-warning" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">Total ventes</p>
              <p className="text-lg lg:text-xl font-bold text-foreground">{state.sales.length}</p>
              <p className="text-xs text-muted-foreground">enregistrées</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-card p-4 lg:p-6">
        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="Brouillon">Brouillon</SelectItem>
              <SelectItem value="Confirmée">Confirmée</SelectItem>
              <SelectItem value="Livrée">Livrée</SelectItem>
              <SelectItem value="Annulée">Annulée</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {state.sales.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Aucune vente"
            description="Créez votre première vente"
            actionText="Nouvelle vente"
            onAction={() => setShowSaleModal(true)}
          />
        ) : paginatedSales.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Aucun résultat"
            description="Aucune vente ne correspond à vos critères"
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Référence</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Client</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Articles</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Total</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Statut</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSales.map((sale) => (
                    <tr key={sale.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground">{sale.reference}</td>
                      <td className="py-3 px-4 text-muted-foreground">{sale.client}</td>
                      <td className="py-3 px-4 text-muted-foreground">{sale.date}</td>
                      <td className="py-3 px-4 text-muted-foreground">{sale.items.length}</td>
                      <td className="py-3 px-4 font-medium text-foreground">{sale.total.toLocaleString()} CFA</td>
                      <td className="py-3 px-4">{getStatusBadge(sale.status)}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleGenerateInvoice(sale)}
                          >
                            <FileText className="w-4 h-4 text-info" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(sale)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDelete(sale)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
              {paginatedSales.map((sale) => (
                <div key={sale.id} className="border border-border rounded-lg p-4 space-y-3 bg-card/50">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-foreground">{sale.reference}</h3>
                      <p className="text-sm text-muted-foreground">{sale.client}</p>
                    </div>
                    {getStatusBadge(sale.status)}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{sale.date} • {sale.items.length} articles</span>
                    <span className="font-bold text-foreground">{sale.total.toLocaleString()} CFA</span>
                  </div>
                  
                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs"
                      onClick={() => handleGenerateInvoice(sale)}
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      Facture
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => handleEdit(sale)}>
                      <Edit className="w-3 h-3 mr-1" />
                      Modifier
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive text-xs"
                      onClick={() => handleDelete(sale)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
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
      </div>

      {showSaleModal && (
        <FunctionalSaleModal 
          sale={editingSale} 
          onClose={handleCloseModal} 
        />
      )}

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open })}
        title="Supprimer la vente"
        description={`Êtes-vous sûr de vouloir supprimer la vente ${deleteConfirm.saleName} ?`}
        onConfirm={confirmDelete}
        confirmText="Supprimer"
        variant="destructive"
      />
    </div>
  );
};
