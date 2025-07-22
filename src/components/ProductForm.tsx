
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useApp, Product } from '@/contexts/AppContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ProductFormProps {
  product?: Product;
  onClose: () => void;
}

interface ProductFormData {
  name: string;
  category_id: string;
  stock: number;
  alert_threshold: number;
  buy_price: number;
  sell_price: number;
  unit_id: string;
}

export function ProductForm({ product, onClose }: ProductFormProps) {
  const { categories, units, addProduct, updateProduct } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ProductFormData>({
    defaultValues: product ? {
      name: product.name,
      category_id: categories.find(c => c.name === product.category)?.id || '',
      stock: product.stock,
      alert_threshold: product.alert_threshold,
      buy_price: product.buy_price,
      sell_price: product.sell_price,
      unit_id: units.find(u => u.symbol === product.unit)?.id || ''
    } : {
      stock: 0,
      alert_threshold: 5,
      buy_price: 0,
      sell_price: 0
    }
  });

  const watchedCategoryId = watch('category_id');
  const watchedUnitId = watch('unit_id');

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    
    try {
      const productData = {
        name: data.name,
        category_id: data.category_id,
        stock: Number(data.stock),
        alert_threshold: Number(data.alert_threshold),
        buy_price: Number(data.buy_price),
        sell_price: Number(data.sell_price),
        unit_id: data.unit_id,
        status: (Number(data.stock) <= 0 ? 'Rupture' : Number(data.stock) <= Number(data.alert_threshold) ? 'Stock bas' : 'En stock') as 'En stock' | 'Stock bas' | 'Rupture'
      };

      console.log('Submitting product data:', productData);

      if (product) {
        await updateProduct(product.id, productData);
      } else {
        // Pour la création, la base de données va automatiquement créer le mouvement de stock via le trigger
        await addProduct(productData);
      }
      
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (categories.length === 0 || units.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {product ? 'Modifier le produit' : 'Nouveau produit'}
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
              <Label htmlFor="name">Nom du produit *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Le nom est requis' })}
                placeholder="Ex: iPhone 15 Pro"
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            {product && (
              <div>
                <Label htmlFor="reference">Référence (générée automatiquement)</Label>
                <Input
                  id="reference"
                  value={product.reference}
                  disabled
                  className="bg-gray-100"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category_id">Catégorie *</Label>
              <Select 
                value={watchedCategoryId} 
                onValueChange={(value) => setValue('category_id', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && (
                <p className="text-sm text-red-600 mt-1">{errors.category_id.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="unit_id">Unité *</Label>
              <Select 
                value={watchedUnitId} 
                onValueChange={(value) => setValue('unit_id', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une unité" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name} ({unit.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unit_id && (
                <p className="text-sm text-red-600 mt-1">{errors.unit_id.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stock">Stock initial</Label>
              <Input
                id="stock"
                type="number"
                {...register('stock', { 
                  required: 'Le stock est requis',
                  min: { value: 0, message: 'Le stock doit être positif' }
                })}
                min="0"
                disabled={isSubmitting}
              />
              {errors.stock && (
                <p className="text-sm text-red-600 mt-1">{errors.stock.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="alert_threshold">Seuil d'alerte</Label>
              <Input
                id="alert_threshold"
                type="number"
                {...register('alert_threshold', { 
                  required: 'Le seuil d\'alerte est requis',
                  min: { value: 0, message: 'Le seuil doit être positif' }
                })}
                min="0"
                disabled={isSubmitting}
              />
              {errors.alert_threshold && (
                <p className="text-sm text-red-600 mt-1">{errors.alert_threshold.message}</p>
              )}
            </div>
          </div>

          {product && (
            <div>
              <Label htmlFor="barcode">Code-barres (généré automatiquement)</Label>
              <Input
                id="barcode"
                value={product.barcode}
                disabled
                className="bg-gray-100"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="buy_price">Prix d'achat (€) *</Label>
              <Input
                id="buy_price"
                type="number"
                step="0.01"
                {...register('buy_price', { 
                  required: 'Le prix d\'achat est requis',
                  min: { value: 0, message: 'Le prix doit être positif' }
                })}
                min="0"
                disabled={isSubmitting}
              />
              {errors.buy_price && (
                <p className="text-sm text-red-600 mt-1">{errors.buy_price.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="sell_price">Prix de vente (€) *</Label>
              <Input
                id="sell_price"
                type="number"
                step="0.01"
                {...register('sell_price', { 
                  required: 'Le prix de vente est requis',
                  min: { value: 0, message: 'Le prix doit être positif' }
                })}
                min="0"
                disabled={isSubmitting}
              />
              {errors.sell_price && (
                <p className="text-sm text-red-600 mt-1">{errors.sell_price.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" text={product ? 'Modification...' : 'Création...'} />
              ) : (
                product ? 'Modifier le produit' : 'Créer le produit'
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
    </div>
  );
}
