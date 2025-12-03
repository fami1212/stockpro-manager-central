import { useState, useEffect } from 'react';
import { Bell, Mail, Calendar, Send, Plus, Trash2, Settings, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface ReminderRule {
  id: string;
  name: string;
  days_before_due: number;
  days_after_due: number;
  is_active: boolean;
  email_template_id?: string;
  subject: string;
  body: string;
}

interface OverdueInvoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  total: number;
  due_date: string;
  days_overdue: number;
  reminders_sent: number;
}

export const PaymentRemindersModule = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overdue');
  const [overdueInvoices, setOverdueInvoices] = useState<OverdueInvoice[]>([]);
  const [reminderRules, setReminderRules] = useState<ReminderRule[]>([
    {
      id: '1',
      name: 'Première relance',
      days_before_due: 0,
      days_after_due: 3,
      is_active: true,
      subject: 'Rappel de paiement - Facture {{invoice_number}}',
      body: 'Bonjour {{client_name}},\n\nNous vous rappelons que la facture {{invoice_number}} d\'un montant de {{invoice_total}} MAD est arrivée à échéance le {{due_date}}.\n\nMerci de procéder au règlement dans les meilleurs délais.\n\nCordialement,\n{{company_name}}'
    },
    {
      id: '2',
      name: 'Deuxième relance',
      days_before_due: 0,
      days_after_due: 10,
      is_active: true,
      subject: 'URGENT: Relance de paiement - Facture {{invoice_number}}',
      body: 'Bonjour {{client_name}},\n\nMalgré notre précédent rappel, nous n\'avons pas encore reçu le règlement de la facture {{invoice_number}} d\'un montant de {{invoice_total}} MAD.\n\nNous vous prions de bien vouloir régulariser cette situation dans les plus brefs délais.\n\nCordialement,\n{{company_name}}'
    },
    {
      id: '3',
      name: 'Mise en demeure',
      days_before_due: 0,
      days_after_due: 30,
      is_active: false,
      subject: 'MISE EN DEMEURE - Facture {{invoice_number}}',
      body: 'Bonjour {{client_name}},\n\nNous vous mettons en demeure de régler la facture {{invoice_number}} d\'un montant de {{invoice_total}} MAD, impayée depuis plus de 30 jours.\n\nSans règlement de votre part sous 8 jours, nous serons contraints d\'engager des poursuites.\n\nCordialement,\n{{company_name}}'
    }
  ]);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<ReminderRule | null>(null);
  const [sending, setSending] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOverdueInvoices();
    }
  }, [user]);

  const fetchOverdueInvoices = async () => {
    try {
      setLoading(true);
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          total,
          due_date,
          client_id,
          clients!invoices_client_id_fkey (name, email)
        `)
        .eq('user_id', user?.id)
        .in('status', ['Impayée', 'Partiel'])
        .not('due_date', 'is', null)
        .lt('due_date', new Date().toISOString().split('T')[0]);

      if (error) throw error;

      // Get sent reminders count
      const { data: sentReminders } = await supabase
        .from('sent_invoices')
        .select('invoice_id')
        .eq('user_id', user?.id);

      const reminderCounts = sentReminders?.reduce((acc: Record<string, number>, r) => {
        acc[r.invoice_id] = (acc[r.invoice_id] || 0) + 1;
        return acc;
      }, {}) || {};

      const overdueList: OverdueInvoice[] = (invoices || [])
        .filter(inv => {
          const client = inv.clients as any;
          return client?.email;
        })
        .map(inv => {
          const client = inv.clients as any;
          const dueDate = new Date(inv.due_date!);
          const today = new Date();
          const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
          
          return {
            id: inv.id,
            invoice_number: inv.invoice_number,
            client_name: (inv.clients as any)?.name || 'Client',
            client_email: (inv.clients as any)?.email || '',
            total: inv.total,
            due_date: inv.due_date!,
            days_overdue: daysOverdue,
            reminders_sent: reminderCounts[inv.id] || 0
          };
        })
        .sort((a, b) => b.days_overdue - a.days_overdue);

      setOverdueInvoices(overdueList);
    } catch (error) {
      console.error('Error fetching overdue invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async (invoice: OverdueInvoice) => {
    setSending(invoice.id);
    try {
      // Get invoice settings
      const { data: settings } = await supabase
        .from('invoice_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      // Find appropriate reminder template based on days overdue
      const template = reminderRules
        .filter(r => r.is_active && invoice.days_overdue >= r.days_after_due)
        .sort((a, b) => b.days_after_due - a.days_after_due)[0];

      if (!template) {
        toast({
          title: 'Aucun modèle',
          description: 'Aucun modèle de relance actif pour ce délai',
          variant: 'destructive'
        });
        return;
      }

      const { error } = await supabase.functions.invoke('send-invoice-email', {
        body: {
          invoiceId: invoice.id,
          recipientEmail: invoice.client_email,
          recipientName: invoice.client_name,
          customSubject: template.subject,
          customBody: template.body.replace(/\n/g, '<br/>'),
          invoiceNumber: invoice.invoice_number,
          invoiceTotal: invoice.total,
          companyName: settings?.company_name || 'Votre entreprise',
          dueDate: invoice.due_date
        }
      });

      if (error) throw error;

      toast({
        title: 'Relance envoyée',
        description: `Email de relance envoyé à ${invoice.client_email}`
      });
      
      fetchOverdueInvoices();
    } catch (error: any) {
      console.error('Error sending reminder:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'envoyer la relance',
        variant: 'destructive'
      });
    } finally {
      setSending(null);
    }
  };

  const handleSendAllReminders = async () => {
    for (const invoice of overdueInvoices) {
      await handleSendReminder(invoice);
    }
  };

  const handleSaveRule = (rule: ReminderRule) => {
    if (editingRule) {
      setReminderRules(rules => 
        rules.map(r => r.id === rule.id ? rule : r)
      );
    } else {
      setReminderRules(rules => [...rules, { ...rule, id: Date.now().toString() }]);
    }
    setShowRuleModal(false);
    setEditingRule(null);
    toast({
      title: 'Règle sauvegardée',
      description: 'La règle de relance a été enregistrée'
    });
  };

  const handleDeleteRule = (id: string) => {
    setReminderRules(rules => rules.filter(r => r.id !== id));
    toast({
      title: 'Règle supprimée',
      description: 'La règle de relance a été supprimée'
    });
  };

  const handleToggleRule = (id: string, active: boolean) => {
    setReminderRules(rules =>
      rules.map(r => r.id === id ? { ...r, is_active: active } : r)
    );
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-foreground">Relances de Paiement</h2>
          <p className="text-sm text-muted-foreground">Gérez les relances automatiques pour les factures en retard</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleSendAllReminders}
            disabled={overdueInvoices.length === 0}
            className="w-full sm:w-auto"
            size="sm"
          >
            <Send className="w-4 h-4 mr-2" />
            Envoyer toutes les relances
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Factures en retard</CardDescription>
            <CardTitle className="text-2xl text-destructive">{overdueInvoices.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Montant total dû</CardDescription>
            <CardTitle className="text-xl lg:text-2xl text-orange-600">
              {overdueInvoices.reduce((sum, inv) => sum + inv.total, 0).toLocaleString()} MAD
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Règles actives</CardDescription>
            <CardTitle className="text-2xl text-primary">
              {reminderRules.filter(r => r.is_active).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Relances envoyées</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {overdueInvoices.reduce((sum, inv) => sum + inv.reminders_sent, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full lg:w-auto grid grid-cols-2 lg:flex">
          <TabsTrigger value="overdue" className="text-xs lg:text-sm">
            <AlertTriangle className="w-4 h-4 mr-1 lg:mr-2" />
            Factures en retard
          </TabsTrigger>
          <TabsTrigger value="rules" className="text-xs lg:text-sm">
            <Settings className="w-4 h-4 mr-1 lg:mr-2" />
            Règles de relance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overdue" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base lg:text-lg">Factures impayées en retard</CardTitle>
              <CardDescription className="text-xs lg:text-sm">
                Cliquez sur "Relancer" pour envoyer un email de rappel au client
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Chargement...</div>
              ) : overdueInvoices.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucune facture en retard</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Desktop Table */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-sm font-medium">Facture</th>
                          <th className="text-left py-3 px-4 text-sm font-medium">Client</th>
                          <th className="text-left py-3 px-4 text-sm font-medium">Montant</th>
                          <th className="text-left py-3 px-4 text-sm font-medium">Échéance</th>
                          <th className="text-left py-3 px-4 text-sm font-medium">Retard</th>
                          <th className="text-left py-3 px-4 text-sm font-medium">Relances</th>
                          <th className="text-left py-3 px-4 text-sm font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overdueInvoices.map(invoice => (
                          <tr key={invoice.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4 font-medium">{invoice.invoice_number}</td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium">{invoice.client_name}</p>
                                <p className="text-xs text-muted-foreground">{invoice.client_email}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-medium">{invoice.total.toLocaleString()} MAD</td>
                            <td className="py-3 px-4">{new Date(invoice.due_date).toLocaleDateString('fr-FR')}</td>
                            <td className="py-3 px-4">
                              <Badge variant={invoice.days_overdue > 30 ? 'destructive' : invoice.days_overdue > 10 ? 'default' : 'secondary'}>
                                {invoice.days_overdue} jour{invoice.days_overdue > 1 ? 's' : ''}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="outline">{invoice.reminders_sent}</Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Button
                                size="sm"
                                onClick={() => handleSendReminder(invoice)}
                                disabled={sending === invoice.id}
                              >
                                {sending === invoice.id ? (
                                  <Clock className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Mail className="w-4 h-4 mr-1" />
                                    Relancer
                                  </>
                                )}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="lg:hidden space-y-3">
                    {overdueInvoices.map(invoice => (
                      <div key={invoice.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{invoice.invoice_number}</p>
                            <p className="text-xs text-muted-foreground">{invoice.client_name}</p>
                          </div>
                          <Badge variant={invoice.days_overdue > 30 ? 'destructive' : invoice.days_overdue > 10 ? 'default' : 'secondary'}>
                            {invoice.days_overdue}j
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Montant:</span>
                            <p className="font-medium">{invoice.total.toLocaleString()} MAD</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Relances:</span>
                            <p className="font-medium">{invoice.reminders_sent}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => handleSendReminder(invoice)}
                          disabled={sending === invoice.id}
                        >
                          {sending === invoice.id ? (
                            <Clock className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Mail className="w-4 h-4 mr-2" />
                          )}
                          Envoyer relance
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="mt-4">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base lg:text-lg">Règles de relance automatique</CardTitle>
                <CardDescription className="text-xs lg:text-sm">
                  Configurez les emails de relance selon le nombre de jours de retard
                </CardDescription>
              </div>
              <Button size="sm" onClick={() => {
                setEditingRule(null);
                setShowRuleModal(true);
              }}>
                <Plus className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Nouvelle règle</span>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reminderRules.map(rule => (
                  <div 
                    key={rule.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 lg:p-4 border rounded-lg"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{rule.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          Envoyé {rule.days_after_due} jour{rule.days_after_due > 1 ? 's' : ''} après l'échéance
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{rule.subject}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 self-end sm:self-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingRule(rule);
                          setShowRuleModal(true);
                        }}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteRule(rule.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rule Modal */}
      <ReminderRuleModal
        open={showRuleModal}
        onOpenChange={setShowRuleModal}
        rule={editingRule}
        onSave={handleSaveRule}
      />
    </div>
  );
};

interface ReminderRuleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule: ReminderRule | null;
  onSave: (rule: ReminderRule) => void;
}

const ReminderRuleModal = ({ open, onOpenChange, rule, onSave }: ReminderRuleModalProps) => {
  const [formData, setFormData] = useState<ReminderRule>({
    id: '',
    name: '',
    days_before_due: 0,
    days_after_due: 7,
    is_active: true,
    subject: 'Rappel de paiement - Facture {{invoice_number}}',
    body: 'Bonjour {{client_name}},\n\nNous vous rappelons que la facture {{invoice_number}} d\'un montant de {{invoice_total}} MAD est arrivée à échéance.\n\nMerci de procéder au règlement.\n\nCordialement,\n{{company_name}}'
  });

  useEffect(() => {
    if (rule) {
      setFormData(rule);
    } else {
      setFormData({
        id: '',
        name: '',
        days_before_due: 0,
        days_after_due: 7,
        is_active: true,
        subject: 'Rappel de paiement - Facture {{invoice_number}}',
        body: 'Bonjour {{client_name}},\n\nNous vous rappelons que la facture {{invoice_number}} d\'un montant de {{invoice_total}} MAD est arrivée à échéance.\n\nMerci de procéder au règlement.\n\nCordialement,\n{{company_name}}'
      });
    }
  }, [rule, open]);

  const handleSubmit = () => {
    if (!formData.name) {
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{rule ? 'Modifier la règle' : 'Nouvelle règle de relance'}</DialogTitle>
          <DialogDescription>
            Configurez quand et comment envoyer les relances de paiement
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="rule-name">Nom de la règle *</Label>
            <Input
              id="rule-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Première relance"
            />
          </div>

          <div>
            <Label htmlFor="days-after">Jours après l'échéance</Label>
            <Input
              id="days-after"
              type="number"
              min="0"
              value={formData.days_after_due}
              onChange={(e) => setFormData(prev => ({ ...prev, days_after_due: parseInt(e.target.value) || 0 }))}
            />
            <p className="text-xs text-muted-foreground mt-1">
              L'email sera envoyé {formData.days_after_due} jour{formData.days_after_due > 1 ? 's' : ''} après la date d'échéance
            </p>
          </div>

          <div>
            <Label htmlFor="subject">Sujet de l'email</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Rappel de paiement - Facture {{invoice_number}}"
            />
          </div>

          <div>
            <Label htmlFor="body">Contenu de l'email</Label>
            <Textarea
              id="body"
              value={formData.body}
              onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
              rows={8}
              placeholder="Bonjour {{client_name}}..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Variables: {'{{client_name}}'}, {'{{invoice_number}}'}, {'{{invoice_total}}'}, {'{{due_date}}'}, {'{{company_name}}'}
            </p>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h4 className="text-sm font-medium">Règle active</h4>
              <p className="text-xs text-muted-foreground">Activer cette règle de relance</p>
            </div>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.name}>
            {rule ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
