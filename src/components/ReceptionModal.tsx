
import { useState, useEffect } from 'react';
import { X, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ReceptionModalProps {
  onClose: () => void;
  orderId?: string;
}

export const ReceptionModal = ({ onClose, orderId }: ReceptionModalProps) => {
  const [selectedOrder, setSelectedOrder] = useState(orderId || '');
  const [receivedItems, setReceivedItems] = useState<{[key: string]: number}>({});
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { purchaseOrders, refetch } = usePurchaseOrders();
  
  // Filtrer les commandes "En cours" seulement
  const pendingOrders = purchaseOrders.filter(order => order.status === 'En cours');
  
  const selectedOrderData = pendingOrders.find(o => o.id === selectedOrder);

  useEffect(() => {
    if (selectedOrderData && selectedOrderData.purchase_order_items) {
      const initialReceived: {[key: string]: number} = {};
      selectedOrderData.purchase_order_items.forEach((item: any) => {
        initialReceived[item.id] = 0;
      });
      setReceivedItems(initialReceived);
    }
  }, [selectedOrderData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderData) return;

    setIsSubmitting(true);
    try {
      // Mettre à jour le statut de la commande
      const { error: orderError } = await supabase
        .from('purchase_orders')
        .update({ 
          status: 'Reçue',
          notes: notes 
        })
        .eq('id', selectedOrder);

      if (orderError) throw orderError;

      // Mettre à jour les stocks des produits
      for (const item of selectedOrderData.purchase_order_items || []) {
        const receivedQty = receivedItems[item.id] || 0;
        if (receivedQty > 0) {
          // Récupérer le stock actuel
          const { data: product, error: productError } = await supabase
            .from('products')
            .select('stock')
            .eq('id', item.product_id)
            .single();

          if (productError) throw productError;

          // Mettre à jour le stock
          const { error: stockError } = await supabase
            .from('products')
            .update({ stock: (product.stock || 0) + receivedQty })
            .eq('id', item.product_id);

          if (stockError) throw stockError;
        }
      }

      toast({
        title: 'Réception validée',
        description: `La commande ${selectedOrderData.reference} a été reçue avec succès.`
      });

      await refetch();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la réception:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de valider la réception',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateReceived = (itemId: string, received: number) => {
    setReceivedItems(prev => ({
      ...prev,
      [itemId]: received
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Réception de Marchandise</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commande à recevoir *
            </label>
            <Select value={selectedOrder} onValueChange={setSelectedOrder}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une commande" />
              </SelectTrigger>
              <SelectContent>
                {pendingOrders.map((order) => (
                  <SelectItem key={order.id} value={order.id}>
                    {order.reference} - {order.supplier?.name || 'Fournisseur inconnu'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedOrderData && selectedOrderData.purchase_order_items && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Articles commandés</h4>
              <div className="space-y-3">
                {selectedOrderData.purchase_order_items.map((item: any) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-lg">
                    <div className="col-span-5">
                      <div className="flex items-center">
                        <Package className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="font-medium">{item.products?.name || 'Produit inconnu'}</span>
                      </div>
                    </div>
                    
                    <div className="col-span-2 text-center">
                      <div className="text-sm text-gray-500">Commandé</div>
                      <div className="font-medium">{item.quantity}</div>
                    </div>
                    
                    <div className="col-span-3">
                      <div className="text-sm text-gray-500">Reçu</div>
                      <Input
                        type="number"
                        min="0"
                        max={item.quantity}
                        placeholder="0"
                        value={receivedItems[item.id] || ''}
                        onChange={(e) => updateReceived(item.id, parseInt(e.target.value) || 0)}
                      />
                    </div>
                    
                    <div className="col-span-2 text-center">
                      <div className="text-sm text-gray-500">Restant</div>
                      <div className="font-medium">{item.quantity - (receivedItems[item.id] || 0)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes de réception
            </label>
            <Textarea
              placeholder="Commentaires sur la réception..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isSubmitting || !selectedOrder}
            >
              {isSubmitting ? 'Validation...' : 'Valider la réception'}
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
