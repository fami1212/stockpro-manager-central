import { useState } from 'react';
import { Tag, Plus, Edit, Trash2, Percent, DollarSign, Calendar, Power, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PromotionModal } from '@/components/PromotionModal';
import { PromotionsDashboard } from '@/components/PromotionsDashboard';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { usePromotions, Promotion } from '@/hooks/usePromotions';
import { useApp } from '@/contexts/AppContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const PromotionsModule = () => {
  const { promotions, loading, addPromotion, updatePromotion, deletePromotion, togglePromotion } = usePromotions();
  const { products, categories } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string | null }>({
    show: false,
    id: null
  });

  const handleAdd = () => {
    setSelectedPromotion(undefined);
    setShowModal(true);
  };

  const handleEdit = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setShowModal(true);
  };

  const handleSave = async (data: Omit<Promotion, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (selectedPromotion) {
      await updatePromotion(selectedPromotion.id, data);
    } else {
      await addPromotion(data);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm.id) {
      await deletePromotion(deleteConfirm.id);
      setDeleteConfirm({ show: false, id: null });
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    await togglePromotion(id, !isActive);
  };

  const getTargetName = (promotion: Promotion) => {
    if (!promotion.target_id) return 'Tous';
    if (promotion.applies_to === 'product') {
      const product = products.find(p => p.id === promotion.target_id);
      return product?.name || 'Produit supprimé';
    }
    if (promotion.applies_to === 'category') {
      const category = categories.find(c => c.id === promotion.target_id);
      return category?.name || 'Catégorie supprimée';
    }
    return 'N/A';
  };

  const getAppliesToLabel = (appliesTo: string) => {
    const labels = {
      sale: 'Vente',
      product: 'Produit',
      category: 'Catégorie'
    };
    return labels[appliesTo as keyof typeof labels] || appliesTo;
  };

  const isPromotionActive = (promotion: Promotion) => {
    if (!promotion.is_active) return false;
    const now = new Date();
    if (promotion.start_date && new Date(promotion.start_date) > now) return false;
    if (promotion.end_date && new Date(promotion.end_date) < now) return false;
    return true;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Promotions & Remises</h2>
          <p className="text-muted-foreground">
            Gérez vos promotions et remises automatiques
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          Nouvelle promotion
        </Button>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list" className="gap-2">
            <Tag className="w-4 h-4" />
            Liste
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Tableau de bord
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <PromotionsDashboard promotions={promotions} />
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
      {promotions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Tag className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune promotion</h3>
            <p className="text-muted-foreground text-center mb-4">
              Créez votre première promotion pour offrir des remises à vos clients
            </p>
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="w-4 h-4" />
              Créer une promotion
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {promotions.map((promotion) => {
            const active = isPromotionActive(promotion);
            return (
              <Card key={promotion.id} className={active ? 'border-primary' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {promotion.name}
                        {active && (
                          <Badge variant="default" className="text-xs">
                            Active
                          </Badge>
                        )}
                      </CardTitle>
                      {promotion.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {promotion.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Valeur de la remise */}
                  <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                    {promotion.discount_type === 'percentage' ? (
                      <>
                        <Percent className="w-5 h-5 text-primary" />
                        <span className="font-bold text-xl text-primary">
                          -{promotion.discount_value}%
                        </span>
                      </>
                    ) : (
                      <>
                        <DollarSign className="w-5 h-5 text-primary" />
                        <span className="font-bold text-xl text-primary">
                          -{promotion.discount_value.toLocaleString()} CFA
                        </span>
                      </>
                    )}
                  </div>

                  {/* Détails */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">S'applique à:</span>
                      <span className="font-medium">
                        {getAppliesToLabel(promotion.applies_to)}
                      </span>
                    </div>
                    {promotion.target_id && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cible:</span>
                        <span className="font-medium">{getTargetName(promotion)}</span>
                      </div>
                    )}
                    {promotion.min_quantity > 1 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Qté min:</span>
                        <span className="font-medium">{promotion.min_quantity}</span>
                      </div>
                    )}
                    {promotion.min_amount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Montant min:</span>
                        <span className="font-medium">
                          {promotion.min_amount.toLocaleString()} CFA
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Période */}
                  {(promotion.start_date || promotion.end_date) && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                      <Calendar className="w-3 h-3" />
                      {promotion.start_date && (
                        <span>Du {format(new Date(promotion.start_date), 'dd MMM', { locale: fr })}</span>
                      )}
                      {promotion.end_date && (
                        <span>au {format(new Date(promotion.end_date), 'dd MMM', { locale: fr })}</span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggle(promotion.id, promotion.is_active)}
                      className="flex-1 gap-2"
                    >
                      <Power className="w-4 h-4" />
                      {promotion.is_active ? 'Désactiver' : 'Activer'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(promotion)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteConfirm({ show: true, id: promotion.id })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
        </TabsContent>
      </Tabs>

      {showModal && (
        <PromotionModal
          promotion={selectedPromotion}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      <ConfirmDialog
        open={deleteConfirm.show}
        onOpenChange={(show) => setDeleteConfirm({ show, id: show ? deleteConfirm.id : null })}
        title="Supprimer la promotion"
        description="Êtes-vous sûr de vouloir supprimer cette promotion ? Cette action est irréversible."
        onConfirm={handleDelete}
        variant="destructive"
        confirmText="Supprimer"
      />
    </div>
  );
};