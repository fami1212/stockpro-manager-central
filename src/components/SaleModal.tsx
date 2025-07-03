
import { useState } from 'react';
import { X, Plus, Minus, Calculator, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

interface SaleModalProps {
  onClose: () => void;
}

interface SaleItem {
  id: number;
  product: string;
  price: number;
  quantity: number;
  discount: number;
  total: number;
}

export const SaleModal = ({ onClose }: SaleModalProps) => {
  const [client, setClient] = useState('');
  const [documentType, setDocumentType] = useState('facture');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(20);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<SaleItem[]>([]);

  const products = [
    { name: 'iPhone 15 Pro', price: 999, stock: 25 },
    { name: 'Samsung Galaxy S24', price: 799, stock: 2 },
    { name: 'MacBook Air M2', price: 1199, stock: 15 },
    { name: 'iPad Pro', price: 799, stock: 8 },
  ];

  const clients = [
    'Marie Dupont',
    'Pierre Martin',
    'Sophie Bernard',
    'Lucas Moreau'
  ];

  const paymentMethods = [
    'Espèces',
    'Carte bancaire',
    'Virement',
    'Chèque',
    'Crédit client'
  ];

  const addItem = () => {
    const newItem: SaleItem = {
      id: Date.now(),
      product: '',
      price: 0,
      quantity: 1,
      discount: 0,
      total: 0
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: number, field: keyof SaleItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'product') {
          const product = products.find(p => p.name === value);
          if (product) {
            updated.price = product.price;
          }
        }
        updated.total = (updated.price * updated.quantity) * (1 - updated.discount / 100);
        return updated;
      }
      return item;
    }));
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const getSubtotal = () => items.reduce((acc, item) => acc + item.total, 0);
  const getDiscountAmount = () => getSubtotal() * (globalDiscount / 100);
  const getTaxAmount = () => (getSubtotal() - getDiscountAmount()) * (taxRate / 100);
  const getTotal = () => getSubtotal() - getDiscountAmount() + getTaxAmount();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Nouvelle vente:', {
      client,
      documentType,
      items,
      globalDiscount,
      taxRate,
      paymentMethod,
      notes,
      subtotal: getSubtotal(),
      discount: getDiscountAmount(),
      tax: getTaxAmount(),
      total: getTotal()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Nouvelle Vente</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* En-tête de la vente */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de document *
              </label>
              <Select value={documentType} onValueChange={setDocumentType}>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client *
              </label>
              <Select value={client} onValueChange={setClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mode de paiement
              </label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
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
              <Button type="button" onClick={addItem} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un article
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-lg">
                  <div className="col-span-4">
                    <Select 
                      value={item.product} 
                      onValueChange={(value) => updateItem(item.id, 'product', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Produit" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.name} value={product.name}>
                            {product.name} (€{product.price})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Prix"
                      value={item.price}
                      onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                      step="0.01"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Qté"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                      min="1"
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
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <div className="text-sm font-medium">€{item.total.toFixed(2)}</div>
                  </div>
                  
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-700"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Remise globale (%)
                    </label>
                    <Input
                      type="number"
                      value={globalDiscount}
                      onChange={(e) => setGlobalDiscount(parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Taux TVA (%)
                    </label>
                    <Input
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Sous-total:</span>
                    <span className="font-medium">€{getSubtotal().toFixed(2)}</span>
                  </div>
                  {globalDiscount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Remise ({globalDiscount}%):</span>
                      <span>-€{getDiscountAmount().toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>TVA ({taxRate}%):</span>
                    <span>€{getTaxAmount().toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total TTC:</span>
                    <span>€{getTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <Textarea
              placeholder="Notes complémentaires..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
              <Calculator className="w-4 h-4 mr-2" />
              Enregistrer la vente
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
