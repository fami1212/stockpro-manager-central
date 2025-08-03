
import { useState } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProductModalProps {
  onClose: () => void;
  product?: any;
}

export const ProductModal = ({ onClose, product }: ProductModalProps) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    reference: product?.reference || '',
    category: product?.category || '',
    unit: product?.unit || '',
    purchasePrice: product?.purchasePrice || '',
    salePrice: product?.salePrice || '',
    barcode: product?.barcode || '',
    stock: product?.stock || '',
    minStock: product?.minStock || '',
    description: product?.description || '',
    image: product?.image || null
  });

  const categories = ['Électronique', 'Alimentaire', 'Fournitures', 'Vêtements', 'Autre'];
  const units = ['Pièce', 'Kg', 'Litre', 'Pack', 'Mètre', 'Autre'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Produit:', formData);
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {product ? 'Modifier le produit' : 'Nouveau produit'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Image Upload */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image du produit
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                {formData.image ? (
                  <div className="relative">
                    <img 
                      src={formData.image} 
                      alt="Produit" 
                      className="w-full h-32 object-cover rounded-lg mb-2"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, image: null }))}
                      className="absolute top-2 right-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 mb-2">Glissez une image ou cliquez</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer bg-blue-50 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-100"
                    >
                      Choisir un fichier
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du produit *
                  </label>
                  <Input
                    placeholder="Nom du produit"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Référence *
                  </label>
                  <Input
                    placeholder="REF-001"
                    value={formData.reference}
                    onChange={(e) => handleChange('reference', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie *
                  </label>
                  <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unité *
                  </label>
                  <Select value={formData.unit} onValueChange={(value) => handleChange('unit', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une unité" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Prix d'achat (CFA)
                   </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.purchasePrice}
                    onChange={(e) => handleChange('purchasePrice', e.target.value)}
                  />
                </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Prix de vente (CFA) *
                   </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.salePrice}
                    onChange={(e) => handleChange('salePrice', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code-barres
                  </label>
                  <Input
                    placeholder="123456789..."
                    value={formData.barcode}
                    onChange={(e) => handleChange('barcode', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock initial
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => handleChange('stock', e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seuil d'alerte stock bas
                  </label>
                  <Input
                    type="number"
                    placeholder="5"
                    value={formData.minStock}
                    onChange={(e) => handleChange('minStock', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <Textarea
                  placeholder="Description du produit..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              {product ? 'Modifier le produit' : 'Créer le produit'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
