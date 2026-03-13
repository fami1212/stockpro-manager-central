import { useState } from 'react';
import { Plus, Minus, Package, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useApp } from '@/contexts/AppContext';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { toast } from 'sonner';

interface RestockModalProps {
  open: boolean;
  onClose: () => void;
}

interface RestockItem {
  product_id: string;
  name: string;
  current_stock: number;
  alert_threshold: number;
  quantity: number;
  unit_price: number;
  selected: boolean;
}

export const RestockModal = ({ open, onClose }: RestockModalProps) => {
  const { products, suppliers } = useApp();
  const { addPurchaseOrder } = usePurchaseOrders();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supplierId, setSupplierId] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');

  // Pre-fill with low stock products
  const [items, setItems] = useState<RestockItem[]>(() =>
    products
      .filter(p => (p.stock || 0) <= (p.alert_threshold || 5))
      .map(p => ({
        product_id: p.id,
        name: p.name,
        current_stock: p.stock || 0,
        alert_threshold: p.alert_threshold || 5,
        quantity: Math.max(10, (p.alert_threshold || 5) * 2 - (p.stock || 0)),
        unit_price: p.buy_price || 0,
        selected: true,
      }))
  );

  const toggleItem = (productId: string) => {
    setItems(prev => prev.map(item =>
      item.product_id === productId ? { ...item, selected: !item.selected } : item
    ));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setItems(prev => prev.map(item =>
      item.product_id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
    ));
  };

  const updatePrice = (productId: string, price: number) => {
    setItems(prev => prev.map(item =>
      item.product_id === productId ? { ...item, unit_price: Math.max(0, price) } : item
    ));
  };

  const selectedItems = items.filter(i => i.selected);
  const total = selectedItems.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);

  const handleSubmit = async () => {
    if (!supplierId) {
      toast.error('Veuillez sélectionner un fournisseur');
      return;
    }
    if (selectedItems.length === 0) {
      toast.error('Veuillez sélectionner au moins un produit');
      return;
    }

    setIsSubmitting(true);
    try {
      await addPurchaseOrder({
        supplier_id: supplierId,
        expected_date: deliveryDate,
        items: selectedItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.quantity * item.unit_price,
        })),
        total,
        notes: notes || 'Réapprovisionnement automatique - stock bas',
      });
      toast.success('Commande de réapprovisionnement créée avec succès');
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la création de la commande');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Réapprovisionnement rapide
          </DialogTitle>
          <DialogDescription>
            Produits en stock bas ou en rupture pré-sélectionnés. Créez une commande fournisseur en un clic.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Fournisseur *</label>
            <Select value={supplierId} onValueChange={setSupplierId} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Date de livraison</label>
            <Input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} disabled={isSubmitting} />
          </div>
        </div>

        <ScrollArea className="flex-1 max-h-[40vh] border rounded-lg">
          <div className="p-3 space-y-2">
            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>Aucun produit en stock bas</p>
              </div>
            ) : (
              items.map(item => (
                <div
                  key={item.product_id}
                  className={`flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg border transition-colors ${
                    item.selected
                      ? 'bg-primary/5 border-primary/20'
                      : 'bg-muted/30 border-border opacity-60'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(item.product_id)}
                    className="flex items-center gap-2 flex-1 text-left"
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                      item.selected ? 'bg-primary border-primary' : 'border-muted-foreground'
                    }`}>
                      {item.selected && <span className="text-primary-foreground text-xs">✓</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>Stock: <span className={item.current_stock === 0 ? 'text-destructive font-bold' : 'text-warning font-bold'}>{item.current_stock}</span></span>
                        <span>Seuil: {item.alert_threshold}</span>
                      </div>
                    </div>
                    {item.current_stock === 0 && (
                      <Badge variant="destructive" className="text-[10px] shrink-0">Rupture</Badge>
                    )}
                  </button>

                  {item.selected && (
                    <div className="flex items-center gap-2 sm:ml-auto">
                      <div className="flex items-center gap-1">
                        <Button
                          type="button" variant="outline" size="icon" className="h-7 w-7"
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          disabled={isSubmitting}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number" min={1}
                          value={item.quantity}
                          onChange={e => updateQuantity(item.product_id, parseInt(e.target.value) || 1)}
                          className="w-16 h-7 text-center text-sm"
                          disabled={isSubmitting}
                        />
                        <Button
                          type="button" variant="outline" size="icon" className="h-7 w-7"
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          disabled={isSubmitting}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Input
                        type="number" min={0}
                        value={item.unit_price}
                        onChange={e => updatePrice(item.product_id, parseFloat(e.target.value) || 0)}
                        className="w-24 h-7 text-sm"
                        placeholder="Prix"
                        disabled={isSubmitting}
                      />
                      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap w-20 text-right">
                        {(item.quantity * item.unit_price).toLocaleString()} CFA
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Notes</label>
          <Textarea
            placeholder="Notes sur la commande..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            disabled={isSubmitting}
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            <p className="text-sm text-muted-foreground">{selectedItems.length} produit(s) sélectionné(s)</p>
            <p className="text-lg font-bold">{total.toLocaleString()} CFA</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Annuler</Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || selectedItems.length === 0 || !supplierId}
            >
              {isSubmitting ? 'Création...' : 'Créer la commande'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
