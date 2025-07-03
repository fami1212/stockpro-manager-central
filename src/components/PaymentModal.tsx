
import { useState } from 'react';
import { X, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface PaymentModalProps {
  onClose: () => void;
  type: 'client' | 'supplier';
  invoiceId?: string;
}

export const PaymentModal = ({ onClose, type, invoiceId }: PaymentModalProps) => {
  const [paymentData, setPaymentData] = useState({
    invoice: invoiceId || '',
    amount: '',
    method: '',
    date: new Date().toISOString().split('T')[0],
    reference: '',
    notes: ''
  });

  const paymentMethods = ['Espèces', 'Virement', 'Chèque', 'Carte bancaire', 'Prélèvement'];
  
  const clientInvoices = [
    { id: 'F-001', client: 'Marie Dupont', amount: 1200, due: 1200 },
    { id: 'F-002', client: 'Pierre Martin', amount: 800, due: 400 },
  ];

  const supplierInvoices = [
    { id: 'FA-001', supplier: 'TechDistrib', amount: 15600, due: 15600 },
    { id: 'FA-002', supplier: 'GlobalSupply', amount: 8950, due: 8950 },
  ];

  const invoices = type === 'client' ? clientInvoices : supplierInvoices;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Nouveau paiement:', paymentData);
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            <CreditCard className="w-5 h-5 inline mr-2" />
            Nouveau Paiement {type === 'client' ? 'Client' : 'Fournisseur'}
          </h3>
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
              Facture *
            </label>
            <Select value={paymentData.invoice} onValueChange={(value) => handleChange('invoice', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une facture" />
              </SelectTrigger>
              <SelectContent>
                {invoices.map((invoice) => (
                  <SelectItem key={invoice.id} value={invoice.id}>
                    {invoice.id} - €{invoice.due} dû
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant (€) *
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={paymentData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mode de paiement *
            </label>
            <Select value={paymentData.method} onValueChange={(value) => handleChange('method', value)}>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de paiement *
            </label>
            <Input
              type="date"
              value={paymentData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Référence
            </label>
            <Input
              placeholder="Numéro de chèque, virement..."
              value={paymentData.reference}
              onChange={(e) => handleChange('reference', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <Textarea
              placeholder="Commentaires..."
              value={paymentData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
              Enregistrer le paiement
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
