import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

interface ProductFormModalProps {
  onClose: () => void;
  product?: any;
}

export const ProductFormModal = ({ onClose, product }: ProductFormModalProps) => {
  const { categories, units, addProduct, updateProduct } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category_id: product?.category_id || '',
    unit_id: product?.unit_id || '',
    stock: product?.stock || 0,
    alert_threshold: product?.alert_threshold || 5,
    buy_price: product?.buy_price || 0,
    sell_price: product?.sell_price || 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category_id || !formData.unit_id) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const productData = {
        name: formData.name,
        category_id: formData.category_id,
        unit_id: formData.unit_id,
        stock: Number(formData.stock),
        alert_threshold: Number(formData.alert_threshold),
        buy_price: Number(formData.buy_price),
        sell_price: Number(formData.sell_price),
        status: (Number(formData.stock) <= 0 ? 'Rupture' : Number(formData.stock) <= Number(formData.alert_threshold) ? 'Stock bas' : 'En stock') as 'En stock' | 'Stock bas' | 'Rupture'
      };

      if (product) {
        await updateProduct(product.id, productData);
        toast.success('Produit modifié avec succès');
      } else {
        await addProduct(productData);
        toast.success('Produit créé avec succès');
      }
      
      onClose();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      toast.error('Erreur lors de la sauvegarde du produit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (categories.length === 0 || units.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration requise</h3>
            <p className="text-gray-600 mb-4">
              Vous devez créer au moins une catégorie et une unité avant d'ajouter un produit.
            </p>
            <Button onClick={onClose} className="w-full">
              Fermer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {product ? 'Modifier le produit' : 'Nouveau Produit'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nom du produit *</Label>
              <Input
                id="name"
                placeholder="Nom du produit"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="category">Catégorie *</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(value) => handleChange('category_id', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="unit">Unité *</Label>
              <Select 
                value={formData.unit_id} 
                onValueChange={(value) => handleChange('unit_id', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une unité" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>{unit.name} ({unit.symbol})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="stock">Stock initial</Label>
              <Input
                id="stock"
                type="number"
                placeholder="0"
                value={formData.stock}
                onChange={(e) => handleChange('stock', parseInt(e.target.value) || 0)}
                min="0"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="alert_threshold">Seuil d'alerte</Label>
              <Input
                id="alert_threshold"
                type="number"
                placeholder="5"
                value={formData.alert_threshold}
                onChange={(e) => handleChange('alert_threshold', parseInt(e.target.value) || 0)}
                min="0"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="buy_price">Prix d'achat (CFA) *</Label>
              <Input
                id="buy_price"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.buy_price}
                onChange={(e) => handleChange('buy_price', parseFloat(e.target.value) || 0)}
                min="0"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="sell_price">Prix de vente (CFA) *</Label>
              <Input
                id="sell_price"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.sell_price}
                onChange={(e) => handleChange('sell_price', parseFloat(e.target.value) || 0)}
                min="0"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sauvegarde...' : (product ? 'Modifier le produit' : 'Créer le produit')}
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
    </div>
  );
};