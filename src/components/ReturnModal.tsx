import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductReturn } from '@/hooks/useProductReturns';
import { useApp } from '@/contexts/AppContext';

interface ReturnModalProps {
  returnData?: ProductReturn;
  onClose: () => void;
  onSave: (data: Omit<ProductReturn, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

export const ReturnModal = ({ returnData, onClose, onSave }: ReturnModalProps) => {
  const { products, sales } = useApp();
  const [formData, setFormData] = useState({
    sale_id: returnData?.sale_id || '',
    product_id: returnData?.product_id || '',
    quantity: returnData?.quantity || 1,
    reason: returnData?.reason || '',
    refund_amount: returnData?.refund_amount || 0,
    refund_method: returnData?.refund_method || '',
    status: returnData?.status || 'En attente' as const,
    notes: returnData?.notes || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving return:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">
            {returnData ? 'Modifier le retour' : 'Nouveau retour'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sale Selection */}
            <div className="space-y-2">
              <Label htmlFor="sale_id">Vente (optionnel)</Label>
              <Select
                value={formData.sale_id || 'none'}
                onValueChange={(value) => setFormData({ ...formData, sale_id: value === 'none' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une vente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  {sales.map((sale) => (
                    <SelectItem key={sale.id} value={sale.id}>
                      {sale.reference} - {new Date(sale.date).toLocaleDateString('fr-FR')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Product Selection */}
            <div className="space-y-2">
              <Label htmlFor="product_id">Produit *</Label>
              <Select
                value={formData.product_id}
                onValueChange={(value) => setFormData({ ...formData, product_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un produit" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantité *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                required
              />
            </div>

            {/* Refund Amount */}
            <div className="space-y-2">
              <Label htmlFor="refund_amount">Montant remboursement *</Label>
              <Input
                id="refund_amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.refund_amount}
                onChange={(e) => setFormData({ ...formData, refund_amount: parseFloat(e.target.value) })}
                required
              />
            </div>

            {/* Refund Method */}
            <div className="space-y-2">
              <Label htmlFor="refund_method">Mode de remboursement</Label>
              <Select
                value={formData.refund_method}
                onValueChange={(value) => setFormData({ ...formData, refund_method: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Espèces">Espèces</SelectItem>
                  <SelectItem value="Carte bancaire">Carte bancaire</SelectItem>
                  <SelectItem value="Virement">Virement</SelectItem>
                  <SelectItem value="Avoir">Avoir</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Statut *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="En attente">En attente</SelectItem>
                  <SelectItem value="Approuvé">Approuvé</SelectItem>
                  <SelectItem value="Rejeté">Rejeté</SelectItem>
                  <SelectItem value="Remboursé">Remboursé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Raison du retour *</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Ex: Produit défectueux, erreur de commande..."
              required
              rows={3}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notes internes..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enregistrement...' : returnData ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
