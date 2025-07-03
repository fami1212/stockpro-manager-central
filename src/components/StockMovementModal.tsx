
import { useState } from 'react';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface StockMovementModalProps {
  onClose: () => void;
}

export const StockMovementModal = ({ onClose }: StockMovementModalProps) => {
  const [movementType, setMovementType] = useState('');
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const products = [
    'iPhone 15 Pro',
    'Samsung Galaxy S24',
    'MacBook Air M2',
    'iPad Pro',
    'AirPods Pro'
  ];

  const entryReasons = [
    'Approvisionnement',
    'Retour client',
    'Ajustement inventaire',
    'Transfert entrepôt'
  ];

  const exitReasons = [
    'Vente',
    'Perte/Casse',
    'Vol',
    'Échantillon',
    'Transfert entrepôt'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Mouvement de stock:', {
      movementType,
      product,
      quantity,
      reason,
      reference,
      notes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Mouvement de Stock</h3>
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
              Type de mouvement *
            </label>
            <Select value={movementType} onValueChange={setMovementType}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entry">
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
                    Entrée
                  </div>
                </SelectItem>
                <SelectItem value="exit">
                  <div className="flex items-center">
                    <TrendingDown className="w-4 h-4 text-red-600 mr-2" />
                    Sortie
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Produit *
            </label>
            <Select value={product} onValueChange={setProduct}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le produit" />
              </SelectTrigger>
              <SelectContent>
                {products.map((prod) => (
                  <SelectItem key={prod} value={prod}>{prod}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantité *
            </label>
            <Input
              type="number"
              placeholder="Entrer la quantité"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motif *
            </label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le motif" />
              </SelectTrigger>
              <SelectContent>
                {movementType === 'entry' 
                  ? entryReasons.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))
                  : exitReasons.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))
                }
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Référence document
            </label>
            <Input
              placeholder="BL, Facture, etc."
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

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

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              Enregistrer
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
