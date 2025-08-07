import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  status: string;
  calculatedTotalAmount?: number;
  calculatedTotalOrders?: number;
  calculatedLastOrder?: string;
}

interface ClientDetailsModalProps {
  client: Client | null;
  open: boolean;
  onClose: () => void;
}

export const ClientDetailsModal = ({ client, open, onClose }: ClientDetailsModalProps) => {
  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Détails du client</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <strong>Nom:</strong> {client.name}
          </div>
          <div>
            <strong>Email:</strong> {client.email || 'Non renseigné'}
          </div>
          <div>
            <strong>Téléphone:</strong> {client.phone || 'Non renseigné'}
          </div>
          <div>
            <strong>Adresse:</strong> {client.address || 'Non renseignée'}
          </div>
          <div>
            <strong>Statut:</strong> {client.status}
          </div>
          <div>
            <strong>Total achats:</strong> {(client.calculatedTotalAmount || 0).toLocaleString()} CFA
          </div>
          <div>
            <strong>Nombre de commandes:</strong> {client.calculatedTotalOrders || 0}
          </div>
          <div>
            <strong>Dernier achat:</strong> {client.calculatedLastOrder 
              ? new Date(client.calculatedLastOrder).toLocaleDateString('fr-FR') 
              : 'Aucun'}
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