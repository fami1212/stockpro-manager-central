import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Banknote, Smartphone, Building2 } from 'lucide-react';

interface InvoicePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: {
    id: string;
    invoice_number: string;
    total: number;
    amount_paid: number;
    clients?: {
      name: string;
    } | null;
  };
  onPayment: (amount: number, method: string) => void;
}

export const InvoicePaymentModal = ({ isOpen, onClose, invoice, onPayment }: InvoicePaymentModalProps) => {
  const remaining = invoice.total - invoice.amount_paid;
  const [amount, setAmount] = useState(remaining.toString());
  const [paymentMethod, setPaymentMethod] = useState('Espèces');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    { value: 'Espèces', label: 'Espèces', icon: Banknote },
    { value: 'Carte bancaire', label: 'Carte bancaire', icon: CreditCard },
    { value: 'Mobile Money', label: 'Mobile Money', icon: Smartphone },
    { value: 'Virement', label: 'Virement bancaire', icon: Building2 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const paymentAmount = parseFloat(amount);
    
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return;
    }

    if (paymentAmount > remaining) {
      return;
    }

    setIsProcessing(true);
    await onPayment(paymentAmount, paymentMethod);
    setIsProcessing(false);
  };

  const handleQuickAmount = (percentage: number) => {
    const quickAmount = (remaining * percentage) / 100;
    setAmount(quickAmount.toFixed(0));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enregistrer un paiement</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de la facture */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Facture</span>
              <span className="font-medium">{invoice.invoice_number}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Client</span>
              <span className="font-medium">{invoice.clients?.name || 'Client inconnu'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium">{invoice.total.toLocaleString()} CFA</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Déjà payé</span>
              <span className="font-medium text-green-600">{invoice.amount_paid.toLocaleString()} CFA</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-2">
              <span className="font-medium">Reste à payer</span>
              <span className="font-bold text-red-600">{remaining.toLocaleString()} CFA</span>
            </div>
          </div>

          {/* Montant du paiement */}
          <div className="space-y-2">
            <Label htmlFor="amount">Montant du paiement (CFA)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              max={remaining}
              min={0}
              placeholder="Montant"
              className="text-lg"
            />
            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickAmount(25)}
              >
                25%
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickAmount(50)}
              >
                50%
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickAmount(100)}
              >
                100%
              </Button>
            </div>
          </div>

          {/* Méthode de paiement */}
          <div className="space-y-2">
            <Label>Méthode de paiement</Label>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((method) => (
                <Button
                  key={method.value}
                  type="button"
                  variant={paymentMethod === method.value ? 'default' : 'outline'}
                  className="justify-start"
                  onClick={() => setPaymentMethod(method.value)}
                >
                  <method.icon className="h-4 w-4 mr-2" />
                  {method.label}
                </Button>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isProcessing || parseFloat(amount) <= 0 || parseFloat(amount) > remaining}
            >
              {isProcessing ? 'Traitement...' : `Enregistrer ${parseFloat(amount).toLocaleString()} CFA`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
