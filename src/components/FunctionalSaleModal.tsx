
import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { X, Plus, Minus, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { useApp, SaleItem as SaleItemType, Sale } from '@/contexts/AppContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface SaleModalProps {
  sale?: Sale;
  onClose: () => void;
}

interface SaleFormData {
  client: string;
  documentType: string;
  paymentMethod: string;
  globalDiscount: number;
  taxRate: number;
  notes: string;
  items: {
    product: string;
    price: number;
    quantity: number;
    discount: number;
  }[];
}

export function FunctionalSaleModal({ sale, onClose }: SaleModalProps) {
  const { state, addSale, updateSale } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedTotals, setCalculatedTotals] = useState({
    subtotal: 0,
    discountAmount: 0,
    taxAmount: 0,
    total: 0
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<SaleFormData>({
    defaultValues: sale ? {
      client: sale.client,
      documentType: 'facture',
      paymentMethod: sale.paymentMethod,
      globalDiscount: sale.discount,
      taxRate: 20,
      notes: '',
      items: sale.items.map(item => ({
        product: item.product,
        price: item.price,
        quantity: item.quantity,
        discount: item.discount
      }))
    } : {
      documentType: 'facture',
      globalDiscount: 0,
      taxRate: 20,
      notes: '',
      items: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const watchedItems = watch('items');
  const watchedGlobalDiscount = watch('globalDiscount');
  const watchedTaxRate = watch('taxRate');

  // Calculate totals whenever items or discounts change
  useEffect(() => {
    const subtotal = watchedItems.reduce((acc, item) => {
      const itemTotal = (item.price * item.quantity) * (1 - item.discount / 100);
      return acc + itemTotal;
    }, 0);

    const discountAmount = subtotal * (watchedGlobalDiscount / 100);
    const taxAmount = (subtotal - discountAmount) * (watchedTaxRate / 100);
    const total = subtotal - discountAmount + taxAmount;

    setCalculatedTotals({
      subtotal,
      discountAmount,
      taxAmount,
      total
    });
  }, [watchedItems, watchedGlobalDiscount, watchedTaxRate]);

  const clients = ['Marie Dupont', 'Pierre Martin', 'Sophie Bernard', 'Lucas Moreau'];
  const paymentMethods = ['Espèces', 'Carte bancaire', 'Virement', 'Chèque', 'Crédit client'];

  const addItem = () => {
    append({
      product: '',
      price: 0,
      quantity: 1,
      discount: 0
    });
  };

  const updateItemPrice = (index: number, productName: string) => {
    const product = state.products.find(p => p.name === productName);
    if (product) {
      setValue(`items.${index}.price`, product.sellPrice);
    }
  };

  const onSubmit = async (data: SaleFormData) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const saleItems: SaleItemType[] = data.items.map((item, index) => ({
        id: Date.now() + index,
        product: item.product,
        price: item.price,
        quantity: item.quantity,
        discount: item.discount,
        total: (item.price * item.quantity) * (1 - item.discount / 100)
      }));

      const saleData = {
        reference: `VT-${Date.now()}`,
        client: data.client,
        date: new Date().toISOString().split('T')[0],
        items: saleItems,
        subtotal: calculatedTotals.subtotal,
        discount: calculatedTotals.discountAmount,
        tax: calculatedTotals.taxAmount,
        total: calculatedTotals.total,
        status: 'Confirmée' as const,
        paymentMethod: data.paymentMethod
      };

      if (sale) {
        updateSale({ ...saleData, id: sale.id });
      } else {
        addSale(saleData);
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {sale ? 'Modifier la vente' : 'Nouvelle Vente'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* En-tête de la vente */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="documentType">Type de document *</Label>
              <Select {...register('documentType')} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="devis">Devis</SelectItem>
                  <SelectItem value="facture">Facture</SelectItem>
                  <SelectItem value="ticket">Ticket de caisse</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="client">Client *</Label>
              <Select {...register('client', { required: 'Le client est requis' })} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client} value={client}>{client}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.client && (
                <p className="text-sm text-red-600 mt-1">{errors.client.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="paymentMethod">Mode de paiement</Label>
              <Select {...register('paymentMethod')} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le mode" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>{method}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Articles */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">Articles</h4>
              <Button type="button" onClick={addItem} variant="outline" size="sm" disabled={isSubmitting}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un article
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-lg">
                  <div className="col-span-4">
                    <Select 
                      value={watchedItems[index]?.product || ''}
                      onValueChange={(value) => {
                        setValue(`items.${index}.product`, value);
                        updateItemPrice(index, value);
                      }}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Produit" />
                      </SelectTrigger>
                      <SelectContent>
                        {state.products.map((product) => (
                          <SelectItem key={product.id} value={product.name}>
                            {product.name} (€{product.sellPrice})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Prix"
                      step="0.01"
                      {...register(`items.${index}.price` as const, { 
                        required: 'Prix requis',
                        min: { value: 0, message: 'Prix positif' }
                      })}
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Qté"
                      {...register(`items.${index}.quantity` as const, { 
                        required: 'Quantité requise',
                        min: { value: 1, message: 'Min 1' }
                      })}
                      min="1"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Remise %"
                      {...register(`items.${index}.discount` as const)}
                      min="0"
                      max="100"
                      step="0.1"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <div className="text-sm font-medium">
                      €{((watchedItems[index]?.price || 0) * (watchedItems[index]?.quantity || 1) * (1 - (watchedItems[index]?.discount || 0) / 100)).toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-700"
                      disabled={isSubmitting}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {fields.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucun article ajouté. Cliquez sur "Ajouter un article" pour commencer.
              </div>
            )}
          </div>

          {/* Totaux et remises */}
          {fields.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="globalDiscount">Remise globale (%)</Label>
                    <Input
                      id="globalDiscount"
                      type="number"
                      {...register('globalDiscount')}
                      min="0"
                      max="100"
                      step="0.1"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="taxRate">Taux TVA (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      {...register('taxRate')}
                      min="0"
                      step="0.1"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Sous-total:</span>
                    <span className="font-medium">€{calculatedTotals.subtotal.toFixed(2)}</span>
                  </div>
                  {calculatedTotals.discountAmount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Remise ({watchedGlobalDiscount}%):</span>
                      <span>-€{calculatedTotals.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>TVA ({watchedTaxRate}%):</span>
                    <span>€{calculatedTotals.taxAmount.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total TTC:</span>
                    <span>€{calculatedTotals.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Notes complémentaires..."
              {...register('notes')}
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isSubmitting || fields.length === 0}
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" text="Enregistrement..." />
              ) : (
                <>
                  <Calculator className="w-4 h-4 mr-2" />
                  {sale ? 'Modifier la vente' : 'Enregistrer la vente'}
                </>
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
