
import { useState } from 'react';
import { Plus, Search, Eye, Edit, Trash2, FileText, CreditCard, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FunctionalSaleModal } from '@/components/FunctionalSaleModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PaginationControls } from '@/components/PaginationControls';
import { EmptyState } from '@/components/EmptyState';
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

      // Fetch invoice settings
      const { data: settings } = await supabase
        .from('invoice_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Get client details if available
      const client = state.clients.find(c => c.id === sale.client_id || c.name === sale.client);

      // Transform sale data to invoice format
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
      toast.success('Facture générée avec succès');
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Erreur lors de la génération de la facture');
    }
  };

  const totalRevenue = state.sales.reduce((acc, sale) => acc + sale.total, 0);
  const thisMonthSales = state.sales.filter(sale => {
    const saleDate = new Date(sale.date);
    const currentDate = new Date();
    return saleDate.getMonth() === currentDate.getMonth() && 
           saleDate.getFullYear() === currentDate.getFullYear();
  });

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Gestion des Ventes</h2>
        <Button 
          onClick={() => setShowSaleModal(true)} 
          className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" 
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle vente
        </Button>
      </div>

      {/* Indicateurs clés */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">Chiffre d'affaires</h3>
          <p className="text-2xl lg:text-3xl font-bold text-green-600">{totalRevenue.toLocaleString()} CFA</p>
          <p className="text-xs lg:text-sm text-gray-500 mt-1">Total</p>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">Ventes ce mois</h3>
          <p className="text-2xl lg:text-3xl font-bold text-blue-600">{thisMonthSales.length}</p>
          <p className="text-xs lg:text-sm text-gray-500 mt-1">Transactions</p>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">Panier moyen</h3>
           <p className="text-2xl lg:text-3xl font-bold text-purple-600">
             {state.sales.length > 0 ? (totalRevenue / state.sales.length).toFixed(0) : '0'} CFA
           </p>
          <p className="text-xs lg:text-sm text-gray-500 mt-1">Par vente</p>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">Total ventes</h3>
          <p className="text-2xl lg:text-3xl font-bold text-orange-600">{state.sales.length}</p>
          <p className="text-xs lg:text-sm text-gray-500 mt-1">Enregistrées</p>
        </div>
      </div>

      <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
        {/* Filtres */}
        <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-4 lg:w-5 h-4 lg:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Rechercher une vente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
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
            title="Aucune vente enregistrée"
            description="Commencez par créer votre première vente pour voir les données ici."
            actionText="Nouvelle vente"
            onAction={() => setShowSaleModal(true)}
          />
        ) : paginatedSales.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Aucun résultat"
            description="Aucune vente ne correspond à vos critères de recherche."
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Référence</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Client</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Articles</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Total HT</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Total TTC</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Statut</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSales.map((sale) => (
                    <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{sale.reference}</td>
                      <td className="py-3 px-4 text-gray-600">{sale.client}</td>
                      <td className="py-3 px-4 text-gray-600">{sale.date}</td>
                      <td className="py-3 px-4 text-gray-600">{sale.items.length} article(s)</td>
                      <td className="py-3 px-4 text-gray-900">{(sale.total - sale.tax).toLocaleString()} CFA</td>
                      <td className="py-3 px-4 font-medium text-gray-900">{sale.total.toLocaleString()} CFA</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          sale.status === 'Confirmée' 
                            ? 'bg-green-100 text-green-700'
                            : sale.status === 'Livrée'
                            ? 'bg-blue-100 text-blue-700'
                            : sale.status === 'Brouillon'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {sale.status}
                        </span>
                      </td>
                       <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              // Afficher les détails de la vente
                              alert(`Détails de la vente ${sale.reference}:\n\nClient: ${sale.client}\nDate: ${sale.date}\nStatut: ${sale.status}\nTotal: ${sale.total.toLocaleString()} CFA\nArticles: ${sale.items.length}\n\nMode de paiement: ${sale.payment_method || 'Non spécifié'}`);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleGenerateInvoice(sale)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(sale)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDelete(sale)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {paginatedSales.map((sale) => (
                <div key={sale.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-900 text-sm">{sale.reference}</h3>
                      <p className="text-xs text-gray-500">{sale.client}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      sale.status === 'Confirmée' 
                        ? 'bg-green-100 text-green-700'
                        : sale.status === 'Livrée'
                        ? 'bg-blue-100 text-blue-700'
                        : sale.status === 'Brouillon'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {sale.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Date:</span>
                      <p className="font-medium">{sale.date}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Articles:</span>
                      <p className="font-medium">{sale.items.length}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Total HT:</span>
                      <p className="font-medium">{(sale.total - sale.tax).toLocaleString()} CFA</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Total TTC:</span>
                      <p className="font-medium text-green-600">{sale.total.toLocaleString()} CFA</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 pt-2 border-t">
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => {
                          // Afficher les détails de la vente en mobile
                          alert(`Détails de la vente ${sale.reference}:\n\nClient: ${sale.client}\nDate: ${sale.date}\nStatut: ${sale.status}\nTotal: ${sale.total.toLocaleString()} CFA\nArticles: ${sale.items.length}\n\nMode de paiement: ${sale.payment_method || 'Non spécifié'}`);
                        }}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Voir
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-blue-600 hover:text-blue-700 text-xs"
                        onClick={() => handleGenerateInvoice(sale)}
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Facture
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="text-xs" onClick={() => handleEdit(sale)}>
                        <Edit className="w-3 h-3 mr-1" />
                        Modifier
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700 text-xs"
                        onClick={() => handleDelete(sale)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-6">
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
        description={`Êtes-vous sûr de vouloir supprimer la vente ${deleteConfirm.saleName} ? Cette action est irréversible.`}
        onConfirm={confirmDelete}
        confirmText="Supprimer"
        variant="destructive"
      />

    </div>
  );
};
