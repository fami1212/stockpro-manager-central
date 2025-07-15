
import { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';

interface PurchaseOrderModalProps {
  onClose: () => void;
}

interface OrderItem {
  id: number;
  product_id: string;
  product: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export const PurchaseOrderModal = ({ onClose }: PurchaseOrderModalProps) => {
  const { suppliers, products } = useApp();
  const { addPurchaseOrder } = usePurchaseOrders();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supplier_id, setSupplier_id] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);

  const addItem = () => {
    const newItem: OrderItem = {
      id: Date.now(),
      product_id: '',
      product: '',
      quantity: 1,
      unit_price: 0,
      total: 0
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: number, field: keyof OrderItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'product') {
          const product = products.find(p => p.name === value);
          if (product) {
            updated.unit_price = product.buy_price || 0;
            updated.product_id = product.id;
          }
        }
        updated.total = updated.quantity * updated.unit_price;
        return updated;
      }
      return item;
    }));
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const getTotal = () => items.reduce((acc, item) => acc + item.total, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supplier_id) {
      console.error('Fournisseur requis');
      return;
    }

    if (items.length === 0) {
      console.error('Au moins un article est requis');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        supplier_id,
        expected_date: deliveryDate,
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total
        })),
        total: getTotal(),
        notes
      };

      console.log('Order data to submit:', orderData);
      await addPurchaseOrder(orderData);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Nouvelle Commande Fournisseur</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fournisseur *
              </label>
              <Select value={supplier_id} onValueChange={setSupplier_id} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un fournisseur" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((sup) => (
                    <SelectItem key={sup.id} value={sup.id}>{sup.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!supplier_id && (
                <p className="text-sm text-red-600 mt-1">Le fournisseur est requis</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de livraison souhaitée
              </label>
              <Input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">Articles à commander</h4>
              <Button type="button" onClick={addItem} variant="outline" size="sm" disabled={isSubmitting}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un article
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-lg">
                  <div className="col-span-5">
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
                          <SelectItem key={product.id} value={product.name}>{product.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      placeholder="Prix unitaire"
                      value={item.unit_price}
                      onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                      step="0.01"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <div className="text-sm font-medium">€{item.total.toFixed(2)}</div>
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

          {items.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between text-lg font-bold">
                <span>Total de la commande:</span>
                <span>€{getTotal().toFixed(2)}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <Textarea
              placeholder="Notes sur la commande..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              disabled={isSubmitting || items.length === 0 || !supplier_id}
            >
              {isSubmitting ? 'Création...' : 'Créer la commande'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isSubmitting}>
              Annuler
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
