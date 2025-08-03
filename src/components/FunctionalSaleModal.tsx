
import { useState, useEffect } from 'react';
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

interface SaleItemForm {
  id: string;
  product_id: string;
  product: string;
  price: number;
  quantity: number;
  discount: number;
}

export function FunctionalSaleModal({ sale, onClose }: SaleModalProps) {
  const { products, clients, addSale, updateSale } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    client_id: sale?.client_id || '',
    documentType: 'facture',
    paymentMethod: sale?.payment_method || '',
    globalDiscount: sale?.discount || 0,
    taxRate: 20,
    notes: ''
  });
  const [items, setItems] = useState<SaleItemForm[]>(
    sale?.items.map(item => ({
      id: item.id,
      product_id: item.product_id || '',
      product: item.product,
      price: item.price,
      quantity: item.quantity,
      discount: item.discount
    })) || []
  );

  const [calculatedTotals, setCalculatedTotals] = useState({
    subtotal: 0,
    discountAmount: 0,
    taxAmount: 0,
    total: 0
  });

  const paymentMethods = ['Espèces', 'Carte bancaire', 'Virement', 'Chèque', 'Crédit client'];

  // Calculate totals whenever items or discounts change
  useEffect(() => {
    const subtotal = items.reduce((acc, item) => {
      const itemTotal = (item.price * item.quantity) * (1 - item.discount / 100);
      return acc + itemTotal;
    }, 0);

    const discountAmount = subtotal * (formData.globalDiscount / 100);
    const taxAmount = (subtotal - discountAmount) * (formData.taxRate / 100);
    const total = subtotal - discountAmount + taxAmount;

    setCalculatedTotals({
      subtotal,
      discountAmount,
      taxAmount,
      total
    });
  }, [items, formData.globalDiscount, formData.taxRate]);

  const addItem = () => {
    const newItem: SaleItemForm = {
      id: `item-${Date.now()}`,
      product_id: '',
      product: '',
      price: 0,
      quantity: 1,
      discount: 0
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof SaleItemForm, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'product') {
          const product = products.find(p => p.name === value);
          if (product) {
            updated.price = product.sell_price;
            updated.product_id = product.id;
          }
        }
        return updated;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_id) {
      console.error('Client requis');
      return;
    }

    if (items.length === 0) {
      console.error('Au moins un article est requis');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const saleItems: SaleItemType[] = items.map((item) => ({
        id: item.id,
        product: item.product,
        product_id: item.product_id,
        price: item.price,
        quantity: item.quantity,
        discount: item.discount,
        total: (item.price * item.quantity) * (1 - item.discount / 100)
      }));

      const saleData = {
        reference: sale?.reference || `VT-${Date.now()}`,
        client_id: formData.client_id,
        date: new Date().toISOString().split('T')[0],
        items: saleItems,
        subtotal: calculatedTotals.subtotal,
        discount: calculatedTotals.discountAmount,
        tax: calculatedTotals.taxAmount,
        total: calculatedTotals.total,
        status: 'Confirmée' as const,
        payment_method: formData.paymentMethod,
        paymentMethod: formData.paymentMethod
      };

      console.log('Sale data to submit:', saleData);

      if (sale) {
        await updateSale(sale.id, saleData);
      } else {
        await addSale(saleData);
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

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {/* En-tête de la vente */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="documentType">Type de document *</Label>
              <Select value={formData.documentType} onValueChange={(value) => handleFormChange('documentType', value)} disabled={isSubmitting}>
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
              <Select value={formData.client_id} onValueChange={(value) => handleFormChange('client_id', value)} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!formData.client_id && (
                <p className="text-sm text-red-600 mt-1">Le client est requis</p>
              )}
            </div>

            <div>
              <Label htmlFor="paymentMethod">Mode de paiement</Label>
              <Select value={formData.paymentMethod} onValueChange={(value) => handleFormChange('paymentMethod', value)} disabled={isSubmitting}>
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
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-lg">
                  <div className="col-span-4">
                    <Select 
                      value={item.product}
                      onValueChange={(value) => updateItem(item.id, 'product', value)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Produit" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.name}>
                            {product.name} ({product.sell_price.toLocaleString()} CFA)
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
                      value={item.price}
                      onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Qté"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                      min="1"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Remise %"
                      value={item.discount}
                      onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      step="0.1"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <div className="text-sm font-medium">
                      {Math.round((item.price * item.quantity) * (1 - item.discount / 100)).toLocaleString()} CFA
                    </div>
                  </div>
                  
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-700"
                      disabled={isSubmitting}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {items.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucun article ajouté. Cliquez sur "Ajouter un article" pour commencer.
              </div>
            )}
          </div>

          {/* Totaux et remises */}
          {items.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="globalDiscount">Remise globale (%)</Label>
                    <Input
                      id="globalDiscount"
                      type="number"
                      value={formData.globalDiscount}
                      onChange={(e) => handleFormChange('globalDiscount', parseFloat(e.target.value) || 0)}
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
                      value={formData.taxRate}
                      onChange={(e) => handleFormChange('taxRate', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.1"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Sous-total:</span>
                    <span className="font-medium">{Math.round(calculatedTotals.subtotal).toLocaleString()} CFA</span>
                  </div>
                  {calculatedTotals.discountAmount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Remise ({formData.globalDiscount}%):</span>
                      <span>-{Math.round(calculatedTotals.discountAmount).toLocaleString()} CFA</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>TVA ({formData.taxRate}%):</span>
                    <span>{Math.round(calculatedTotals.taxAmount).toLocaleString()} CFA</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total TTC:</span>
                    <span>{Math.round(calculatedTotals.total).toLocaleString()} CFA</span>
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
              value={formData.notes}
              onChange={(e) => handleFormChange('notes', e.target.value)}
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isSubmitting || items.length === 0 || !formData.client_id}
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
