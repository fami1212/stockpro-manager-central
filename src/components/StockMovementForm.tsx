
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface StockMovementFormProps {
  onClose: () => void;
}

export const StockMovementForm = ({ onClose }: StockMovementFormProps) => {
  const { products, updateProduct } = useApp();
  const [selectedProduct, setSelectedProduct] = useState('');
  const [movementType, setMovementType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const movementTypes = [
    { value: 'in', label: 'Entrée de stock' },
    { value: 'out', label: 'Sortie de stock' },
    { value: 'adjustment', label: 'Ajustement' },
    { value: 'return', label: 'Retour' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !movementType || !quantity || !reason) return;

    setIsSubmitting(true);
    try {
      const product = products.find(p => p.id === selectedProduct);
      if (!product) throw new Error('Produit non trouvé');

      const quantityChange = parseInt(quantity);
      const newStock = movementType === 'in' 
        ? product.stock + quantityChange
        : product.stock - quantityChange;

      if (newStock < 0) {
        throw new Error('Le stock ne peut pas être négatif');
      }

      await updateProduct(selectedProduct, {
        stock: newStock
      });

      console.log('Mouvement de stock enregistré:', {
        product: product.name,
        type: movementType,
        quantity: quantityChange,
        reason,
        newStock
      });

      onClose();
    } catch (error) {
      console.error('Erreur lors du mouvement de stock:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Mouvement de Stock</h3>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Produit *
          </label>
          <Select value={selectedProduct} onValueChange={setSelectedProduct} disabled={isSubmitting}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un produit" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name} (Stock actuel: {product.stock})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de mouvement *
          </label>
          <Select value={movementType} onValueChange={setMovementType} disabled={isSubmitting}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner le type" />
            </SelectTrigger>
            <SelectContent>
              {movementTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantité *
          </label>
          <Input
            type="number"
            min="1"
            placeholder="Ex: 10"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Raison du mouvement *
          </label>
          <Textarea
            placeholder="Ex: Réception commande, Inventaire, Défaut..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="flex space-x-3 pt-4">
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
};
