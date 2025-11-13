import { useState, useEffect } from 'react';
import { X, Tag, Percent, DollarSign, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Promotion } from '@/hooks/usePromotions';
import { useApp } from '@/contexts/AppContext';

interface PromotionModalProps {
  promotion?: Promotion;
  onClose: () => void;
  onSave: (data: Omit<Promotion, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

export const PromotionModal = ({ promotion, onClose, onSave }: PromotionModalProps) => {
  const { products, categories } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: promotion?.name || '',
    description: promotion?.description || '',
    discount_type: promotion?.discount_type || 'percentage' as 'percentage' | 'fixed',
    discount_value: promotion?.discount_value || 0,
    applies_to: promotion?.applies_to || 'sale' as 'product' | 'sale' | 'category',
    target_id: promotion?.target_id || '',
    min_quantity: promotion?.min_quantity || 1,
    min_amount: promotion?.min_amount || 0,
    start_date: promotion?.start_date || '',
    end_date: promotion?.end_date || '',
    is_active: promotion?.is_active ?? true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.discount_value <= 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving promotion:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">
              {promotion ? 'Modifier la promotion' : 'Nouvelle promotion'}
            </h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nom de la promotion *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ex: Soldes d'été -20%"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Détails de la promotion..."
                rows={3}
              />
            </div>
          </div>

          {/* Type et valeur de remise */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="discount_type">Type de remise</Label>
              <Select
                value={formData.discount_type}
                onValueChange={(value) => handleChange('discount_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4" />
                      Pourcentage
                    </div>
                  </SelectItem>
                  <SelectItem value="fixed">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Montant fixe
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="discount_value">
                Valeur {formData.discount_type === 'percentage' ? '(%)' : '(CFA)'} *
              </Label>
              <Input
                id="discount_value"
                type="number"
                min="0"
                step={formData.discount_type === 'percentage' ? '0.01' : '1'}
                max={formData.discount_type === 'percentage' ? '100' : undefined}
                value={formData.discount_value}
                onChange={(e) => handleChange('discount_value', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          {/* Application */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="applies_to">S'applique à</Label>
              <Select
                value={formData.applies_to}
                onValueChange={(value) => {
                  handleChange('applies_to', value);
                  handleChange('target_id', '');
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">Vente complète</SelectItem>
                  <SelectItem value="product">Produit spécifique</SelectItem>
                  <SelectItem value="category">Catégorie</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.applies_to === 'product' && (
              <div>
                <Label htmlFor="target_id">Produit</Label>
                <Select
                  value={formData.target_id}
                  onValueChange={(value) => handleChange('target_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un produit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les produits</SelectItem>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.applies_to === 'category' && (
              <div>
                <Label htmlFor="target_id">Catégorie</Label>
                <Select
                  value={formData.target_id}
                  onValueChange={(value) => handleChange('target_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes les catégories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Conditions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min_quantity">Quantité minimale</Label>
              <Input
                id="min_quantity"
                type="number"
                min="1"
                value={formData.min_quantity}
                onChange={(e) => handleChange('min_quantity', parseInt(e.target.value) || 1)}
              />
            </div>

            <div>
              <Label htmlFor="min_amount">Montant minimum (CFA)</Label>
              <Input
                id="min_amount"
                type="number"
                min="0"
                value={formData.min_amount}
                onChange={(e) => handleChange('min_amount', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Période */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date de début
                </div>
              </Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleChange('start_date', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="end_date">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date de fin
                </div>
              </Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleChange('end_date', e.target.value)}
              />
            </div>
          </div>

          {/* Statut */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <Label htmlFor="is_active" className="text-base font-medium">
                Promotion active
              </Label>
              <p className="text-sm text-muted-foreground">
                La promotion sera appliquée automatiquement si active
              </p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleChange('is_active', checked)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Enregistrement...' : promotion ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};