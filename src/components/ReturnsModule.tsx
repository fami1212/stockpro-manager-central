import { useState } from 'react';
import { PackageX, Plus, Edit, Trash2, TrendingDown, Clock, CheckCircle, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ReturnModal } from '@/components/ReturnModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useProductReturns, ProductReturn } from '@/hooks/useProductReturns';
import { useApp } from '@/contexts/AppContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const ReturnsModule = () => {
  const { returns, loading, addReturn, updateReturn, deleteReturn, getReturnStats } = useProductReturns();
  const { products } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<ProductReturn | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string | null }>({
    show: false,
    id: null
  });

  const stats = getReturnStats();

  const handleAdd = () => {
    setSelectedReturn(undefined);
    setShowModal(true);
  };

  const handleEdit = (returnData: ProductReturn) => {
    setSelectedReturn(returnData);
    setShowModal(true);
  };

  const handleSave = async (data: Omit<ProductReturn, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (selectedReturn) {
      await updateReturn(selectedReturn.id, data);
    } else {
      await addReturn(data);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm.id) {
      await deleteReturn(deleteConfirm.id);
      setDeleteConfirm({ show: false, id: null });
    }
  };

  const getProductName = (productId?: string) => {
    if (!productId) return 'N/A';
    const product = products.find(p => p.id === productId);
    return product?.name || 'Produit supprimé';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'En attente': 'secondary',
      'Approuvé': 'default',
      'Rejeté': 'destructive',
      'Remboursé': 'outline'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestion des Retours</h2>
          <p className="text-muted-foreground">
            Gérez les retours produits et remboursements
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          Nouveau retour
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Retours</CardTitle>
            <PackageX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReturns}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReturns}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approuvés</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedReturns}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Remboursé</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRefunded.toLocaleString()} CFA</div>
          </CardContent>
        </Card>
      </div>

      {/* Returns List */}
      {returns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PackageX className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun retour</h3>
            <p className="text-muted-foreground text-center mb-4">
              Commencez à enregistrer les retours produits
            </p>
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="w-4 h-4" />
              Créer un retour
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Liste des retours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {returns.map((returnData) => (
                <div
                  key={returnData.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold">{getProductName(returnData.product_id)}</h4>
                      {getStatusBadge(returnData.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{returnData.reason}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Quantité: {returnData.quantity}</span>
                      <span>Remboursement: {returnData.refund_amount.toLocaleString()} CFA</span>
                      <span>{format(new Date(returnData.created_at), 'dd MMM yyyy', { locale: fr })}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(returnData)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteConfirm({ show: true, id: returnData.id })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {showModal && (
        <ReturnModal
          returnData={selectedReturn}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      <ConfirmDialog
        open={deleteConfirm.show}
        onOpenChange={(show) => setDeleteConfirm({ show, id: show ? deleteConfirm.id : null })}
        title="Supprimer le retour"
        description="Êtes-vous sûr de vouloir supprimer ce retour ? Cette action est irréversible."
        onConfirm={handleDelete}
        variant="destructive"
        confirmText="Supprimer"
      />
    </div>
  );
};
