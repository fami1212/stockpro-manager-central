
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { useStockMovements } from '@/hooks/useStockMovements';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface StockMovementFormProps {
  onClose: () => void;
}

interface StockMovementFormData {
  product_id: string;
  type: 'in' | 'out' | 'adjustment' | 'return';
  quantity: number;
  reason: string;
  reference?: string;
  notes?: string;
}

export function StockMovementForm({ onClose }: StockMovementFormProps) {
  const { products } = useApp();
  const { addStockMovement } = useStockMovements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<StockMovementFormData>();

  const watchedProductId = watch('product_id');
  const watchedType = watch('type');

  const selectedProduct = products.find(p => p.id === watchedProductId);

  const onSubmit = async (data: StockMovementFormData) => {
    setIsSubmitting(true);
    
    try {
      await addStockMovement({
        product_id: data.product_id,
        type: data.type,
        quantity: Number(data.quantity),
        reason: data.reason,
        reference: data.reference || undefined,
        notes: data.notes || undefined
      });
      
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du mouvement:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case 'in': return 'Entrée';
      case 'out': return 'Sortie';
      case 'adjustment': return 'Ajustement';
      case 'return': return 'Retour';
      default: return type;
    }
  };

  const getReasonPlaceholder = (type: string) => {
    switch (type) {
      case 'in': return 'Ex: Réception commande, Production interne...';
      case 'out': return 'Ex: Casse, Perte, Utilisation interne...';
      case 'adjustment': return 'Ex: Correction inventaire, Erreur de saisie...';
      case 'return': return 'Ex: Retour client, Annulation commande...';
      default: return 'Motif du mouvement...';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Nouveau mouvement de stock
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          disabled={isSubmitting}
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="product_id">Produit *</Label>
            <Select 
              value={watchedProductId} 
              onValueChange={(value) => setValue('product_id', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un produit" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} ({product.reference})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.product_id && (
              <p className="text-sm text-red-600 mt-1">Le produit est requis</p>
            )}
          </div>

          <div>
            <Label htmlFor="type">Type de mouvement *</Label>
            <Select 
              value={watchedType} 
              onValueChange={(value) => setValue('type', value as any)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">Entrée</SelectItem>
                <SelectItem value="out">Sortie</SelectItem>
                <SelectItem value="adjustment">Ajustement</SelectItem>
                <SelectItem value="return">Retour</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-600 mt-1">Le type est requis</p>
            )}
          </div>
        </div>

        {selectedProduct && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Stock actuel :</span> {selectedProduct.stock} {selectedProduct.unit}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="quantity">
              {watchedType === 'adjustment' ? 'Nouveau stock' : 'Quantité'} *
            </Label>
            <Input
              id="quantity"
              type="number"
              {...register('quantity', { 
                required: 'La quantité est requise',
                min: { value: 0, message: 'La quantité doit être positive' }
              })}
              min="0"
              disabled={isSubmitting}
              placeholder={watchedType === 'adjustment' ? 'Stock final après ajustement' : 'Quantité du mouvement'}
            />
            {errors.quantity && (
              <p className="text-sm text-red-600 mt-1">{errors.quantity.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="reference">Référence (optionnel)</Label>
            <Input
              id="reference"
              {...register('reference')}
              placeholder="Ex: BC001, RET123..."
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="reason">Motif *</Label>
          <Input
            id="reason"
            {...register('reason', { required: 'Le motif est requis' })}
            placeholder={getReasonPlaceholder(watchedType)}
            disabled={isSubmitting}
          />
          {errors.reason && (
            <p className="text-sm text-red-600 mt-1">{errors.reason.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="notes">Notes (optionnel)</Label>
          <Textarea
            id="notes"
            {...register('notes')}
            placeholder="Informations complémentaires..."
            disabled={isSubmitting}
            rows={3}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button 
            type="submit" 
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <LoadingSpinner size="sm" text="Enregistrement..." />
            ) : (
              'Enregistrer le mouvement'
            )}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose} 
            className="flex-1"
            disabled={isSubmitting}
          >
            Annuler
          </Button>
        </div>
      </form>
    </div>
  );
}
