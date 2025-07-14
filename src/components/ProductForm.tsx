
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useApp, Product } from '@/contexts/AppContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ProductFormProps {
  product?: Product;
  onClose: () => void;
}

interface ProductFormData {
  name: string;
  reference: string;
  category: string;
  stock: number;
  alertThreshold: number;
  buyPrice: number;
  sellPrice: number;
  unit: string;
  barcode: string;
  description?: string;
}

export function ProductForm({ product, onClose }: ProductFormProps) {
  const { state, addProduct, updateProduct } = useApp();
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
      reference: product.reference,
      category: product.category,
      stock: product.stock,
      alertThreshold: product.alertThreshold,
      buyPrice: product.buyPrice,
      sellPrice: product.sellPrice,
      unit: product.unit,
      barcode: product.barcode
    } : {
      stock: 0,
      alertThreshold: 5,
      buyPrice: 0,
      sellPrice: 0
    }
  });

  const watchedCategory = watch('category');
  const watchedUnit = watch('unit');

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const productData = {
        ...data,
        status: (data.stock <= data.alertThreshold ? 'Stock bas' : 'En stock') as 'En stock' | 'Stock bas' | 'Rupture',
        variants: product?.variants || []
      };

      if (product) {
        await updateProduct(product.id, productData);
      } else {
        await addProduct(productData);
      }
      
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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

            <div>
              <Label htmlFor="reference">Référence *</Label>
              <Input
                id="reference"
                {...register('reference', { required: 'La référence est requise' })}
                placeholder="Ex: IPH15P-128"
                disabled={isSubmitting}
              />
              {errors.reference && (
                <p className="text-sm text-red-600 mt-1">{errors.reference.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Catégorie *</Label>
              <Select 
                value={watchedCategory} 
                onValueChange={(value) => setValue('category', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {state.categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="unit">Unité *</Label>
              <Select 
                value={watchedUnit} 
                onValueChange={(value) => setValue('unit', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une unité" />
                </SelectTrigger>
                <SelectContent>
                  {state.units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.symbol}>
                      {unit.name} ({unit.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unit && (
                <p className="text-sm text-red-600 mt-1">{errors.unit.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="stock">Stock actuel</Label>
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
              <Label htmlFor="alertThreshold">Seuil d'alerte</Label>
              <Input
                id="alertThreshold"
                type="number"
                {...register('alertThreshold', { 
                  required: 'Le seuil d\'alerte est requis',
                  min: { value: 0, message: 'Le seuil doit être positif' }
                })}
                min="0"
                disabled={isSubmitting}
              />
              {errors.alertThreshold && (
                <p className="text-sm text-red-600 mt-1">{errors.alertThreshold.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="barcode">Code-barres</Label>
              <Input
                id="barcode"
                {...register('barcode')}
                placeholder="1234567890123"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="buyPrice">Prix d'achat (€) *</Label>
              <Input
                id="buyPrice"
                type="number"
                step="0.01"
                {...register('buyPrice', { 
                  required: 'Le prix d\'achat est requis',
                  min: { value: 0, message: 'Le prix doit être positif' }
                })}
                min="0"
                disabled={isSubmitting}
              />
              {errors.buyPrice && (
                <p className="text-sm text-red-600 mt-1">{errors.buyPrice.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="sellPrice">Prix de vente (€) *</Label>
              <Input
                id="sellPrice"
                type="number"
                step="0.01"
                {...register('sellPrice', { 
                  required: 'Le prix de vente est requis',
                  min: { value: 0, message: 'Le prix doit être positif' }
                })}
                min="0"
                disabled={isSubmitting}
              />
              {errors.sellPrice && (
                <p className="text-sm text-red-600 mt-1">{errors.sellPrice.message}</p>
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
