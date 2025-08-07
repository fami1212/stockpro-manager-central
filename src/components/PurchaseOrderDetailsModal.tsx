import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PurchaseOrderItem {
  products?: { name: string };
  quantity: number;
  unit_price: number;
  total: number;
}

interface Supplier {
  name: string;
}

interface PurchaseOrder {
  id: string;
  reference: string;
  date: string;
  expected_date?: string;
  status: string;
  total: number;
  notes?: string;
  supplier?: Supplier;
  purchase_order_items?: PurchaseOrderItem[];
}

interface PurchaseOrderDetailsModalProps {
  order: PurchaseOrder | null;
  open: boolean;
  onClose: () => void;
}

export const PurchaseOrderDetailsModal = ({ order, open, onClose }: PurchaseOrderDetailsModalProps) => {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails de la commande {order.reference}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <strong>Fournisseur:</strong> {order.supplier?.name || 'N/A'}
          </div>
          <div>
            <strong>Date:</strong> {new Date(order.date).toLocaleDateString('fr-FR')}
          </div>
          <div>
            <strong>Date prévue:</strong> {order.expected_date ? new Date(order.expected_date).toLocaleDateString('fr-FR') : 'Non définie'}
          </div>
          <div>
            <strong>Statut:</strong> {order.status}
          </div>
          <div>
            <strong>Total:</strong> {order.total.toLocaleString()} CFA
          </div>
          {order.notes && (
            <div>
              <strong>Notes:</strong> {order.notes}
            </div>
          )}
          <div className="mt-4">
            <h4 className="font-medium mb-2">Articles:</h4>
            <div className="space-y-2">
              {order.purchase_order_items && order.purchase_order_items.length > 0 ? (
                order.purchase_order_items.map((item, index) => (
                  <div key={index} className="border p-2 rounded">
                    <div className="font-medium">{item.products?.name || 'N/A'}</div>
                    <div className="text-sm text-gray-600">
                      Quantité: {item.quantity} × {item.unit_price.toLocaleString()} CFA = {item.total.toLocaleString()} CFA
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Aucun article</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={onClose} variant="outline">
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};