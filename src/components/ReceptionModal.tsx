
import { useState } from 'react';
import { X, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface ReceptionModalProps {
  onClose: () => void;
  orderId?: string;
}

export const ReceptionModal = ({ onClose, orderId }: ReceptionModalProps) => {
  const [selectedOrder, setSelectedOrder] = useState(orderId || '');
  const [receivedItems, setReceivedItems] = useState<any[]>([]);
  const [notes, setNotes] = useState('');

  const orders = [
    { id: 'A-001', supplier: 'TechDistrib', items: [
      { product: 'iPhone 15 Pro', ordered: 20, received: 0 },
      { product: 'iPad Pro', ordered: 10, received: 0 },
    ]},
    { id: 'A-002', supplier: 'GlobalSupply', items: [
      { product: 'Samsung Galaxy S24', ordered: 15, received: 0 },
    ]},
  ];

  const selectedOrderData = orders.find(o => o.id === selectedOrder);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Nouvelle réception:', {
      orderId: selectedOrder,
      receivedItems,
      notes
    });
    onClose();
  };

  const updateReceived = (index: number, received: number) => {
    const updatedItems = [...(selectedOrderData?.items || [])];
    updatedItems[index] = { ...updatedItems[index], received };
    setReceivedItems(updatedItems);
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
                {orders.map((order) => (
                  <SelectItem key={order.id} value={order.id}>
                    {order.id} - {order.supplier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedOrderData && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Articles commandés</h4>
              <div className="space-y-3">
                {selectedOrderData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-lg">
                    <div className="col-span-5">
                      <div className="flex items-center">
                        <Package className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="font-medium">{item.product}</span>
                      </div>
                    </div>
                    
                    <div className="col-span-2 text-center">
                      <div className="text-sm text-gray-500">Commandé</div>
                      <div className="font-medium">{item.ordered}</div>
                    </div>
                    
                    <div className="col-span-3">
                      <div className="text-sm text-gray-500">Reçu</div>
                      <Input
                        type="number"
                        min="0"
                        max={item.ordered}
                        placeholder="0"
                        onChange={(e) => updateReceived(index, parseInt(e.target.value) || 0)}
                      />
                    </div>
                    
                    <div className="col-span-2 text-center">
                      <div className="text-sm text-gray-500">Restant</div>
                      <div className="font-medium">{item.ordered - (receivedItems[index]?.received || 0)}</div>
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
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
              Valider la réception
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
