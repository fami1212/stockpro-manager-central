import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  FileText, 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  Search,
  TrendingUp,
  Calendar,
  DollarSign,
  Eye,
  CreditCard
} from 'lucide-react';
import { format, differenceInDays, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { InvoicePaymentModal } from '@/components/InvoicePaymentModal';

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string | null;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  amount_paid: number;
  status: string;
  notes: string | null;
  client_id: string | null;
  sale_id: string | null;
  clients?: {
    name: string;
    email: string | null;
    phone: string | null;
  } | null;
}

export const UnpaidInvoicesDashboard = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const fetchInvoices = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          clients (
            name,
            email,
            phone
          )
        `)
        .eq('user_id', user.id)
        .neq('status', 'Payée')
        .order('due_date', { ascending: true });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des factures:', error);
      toast.error('Erreur lors du chargement des factures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const getPaymentStatus = (invoice: Invoice) => {
    const remaining = invoice.total - invoice.amount_paid;
    const today = new Date();
    const dueDate = invoice.due_date ? new Date(invoice.due_date) : null;

    if (remaining <= 0) return { label: 'Payée', color: 'bg-green-100 text-green-800', priority: 0 };
    if (invoice.amount_paid > 0) return { label: 'Partielle', color: 'bg-blue-100 text-blue-800', priority: 2 };
    if (dueDate && isAfter(today, dueDate)) {
      const daysLate = differenceInDays(today, dueDate);
      if (daysLate > 30) return { label: 'Critique', color: 'bg-red-100 text-red-800', priority: 5 };
      if (daysLate > 14) return { label: 'En retard', color: 'bg-orange-100 text-orange-800', priority: 4 };
      return { label: 'Échue', color: 'bg-yellow-100 text-yellow-800', priority: 3 };
    }
    return { label: 'En attente', color: 'bg-gray-100 text-gray-800', priority: 1 };
  };

  const getDaysInfo = (invoice: Invoice) => {
    if (!invoice.due_date) return { text: 'Sans échéance', color: 'text-gray-500' };
    
    const today = new Date();
    const dueDate = new Date(invoice.due_date);
    const days = differenceInDays(dueDate, today);

    if (days < 0) return { text: `${Math.abs(days)} jours de retard`, color: 'text-red-600' };
    if (days === 0) return { text: "Échéance aujourd'hui", color: 'text-orange-600' };
    if (days <= 7) return { text: `${days} jours restants`, color: 'text-yellow-600' };
    return { text: `${days} jours restants`, color: 'text-green-600' };
  };

  const handlePayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  const processPayment = async (amount: number, method: string) => {
    if (!selectedInvoice) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newAmountPaid = selectedInvoice.amount_paid + amount;
      const newStatus = newAmountPaid >= selectedInvoice.total ? 'Payée' : 'Partielle';

      const { error } = await supabase
        .from('invoices')
        .update({
          amount_paid: newAmountPaid,
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedInvoice.id);

      if (error) throw error;

      toast.success(`Paiement de ${amount.toLocaleString()} CFA enregistré`);
      setShowPaymentModal(false);
      setSelectedInvoice(null);
      fetchInvoices();
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
      toast.error('Erreur lors de l\'enregistrement du paiement');
    }
  };

  // Filtrage des factures
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    
    const status = getPaymentStatus(invoice);
    if (statusFilter === 'overdue') return matchesSearch && status.priority >= 3;
    if (statusFilter === 'partial') return matchesSearch && status.label === 'Partielle';
    if (statusFilter === 'pending') return matchesSearch && status.label === 'En attente';
    
    return matchesSearch;
  });

  // Statistiques
  const totalUnpaid = invoices.reduce((acc, inv) => acc + (inv.total - inv.amount_paid), 0);
  const overdueCount = invoices.filter(inv => getPaymentStatus(inv).priority >= 3).length;
  const partialCount = invoices.filter(inv => getPaymentStatus(inv).label === 'Partielle').length;
  const criticalAmount = invoices
    .filter(inv => getPaymentStatus(inv).priority === 5)
    .reduce((acc, inv) => acc + (inv.total - inv.amount_paid), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Factures Impayées</h2>
          <p className="text-muted-foreground">Suivi des paiements et relances</p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total impayé</p>
                <p className="text-2xl font-bold text-foreground">{totalUnpaid.toLocaleString()} CFA</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En retard</p>
                <p className="text-2xl font-bold text-foreground">{overdueCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paiements partiels</p>
                <p className="text-2xl font-bold text-foreground">{partialCount}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Montant critique</p>
                <p className="text-2xl font-bold text-red-600">{criticalAmount.toLocaleString()} CFA</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par numéro ou client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="partial">Paiement partiel</SelectItem>
                <SelectItem value="overdue">En retard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des factures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Factures ({filteredInvoices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">Aucune facture impayée</h3>
              <p className="text-muted-foreground">Toutes vos factures sont à jour</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Facture</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Échéance</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead className="text-right">Payé</TableHead>
                    <TableHead className="text-right">Reste</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => {
                    const status = getPaymentStatus(invoice);
                    const daysInfo = getDaysInfo(invoice);
                    const remaining = invoice.total - invoice.amount_paid;

                    return (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.invoice_number}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{invoice.clients?.name || 'Client inconnu'}</p>
                            {invoice.clients?.phone && (
                              <p className="text-xs text-muted-foreground">{invoice.clients.phone}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(invoice.invoice_date), 'dd/MM/yyyy', { locale: fr })}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p>{invoice.due_date ? format(new Date(invoice.due_date), 'dd/MM/yyyy', { locale: fr }) : '-'}</p>
                            <p className={`text-xs ${daysInfo.color}`}>{daysInfo.text}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {invoice.total.toLocaleString()} CFA
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          {invoice.amount_paid.toLocaleString()} CFA
                        </TableCell>
                        <TableCell className="text-right font-bold text-red-600">
                          {remaining.toLocaleString()} CFA
                        </TableCell>
                        <TableCell>
                          <Badge className={status.color}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePayment(invoice)}
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              Payer
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de paiement */}
      {showPaymentModal && selectedInvoice && (
        <InvoicePaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedInvoice(null);
          }}
          invoice={selectedInvoice}
          onPayment={processPayment}
        />
      )}
    </div>
  );
};
