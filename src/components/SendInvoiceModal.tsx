import { useState, useEffect } from 'react';
import { Send, Mail, Paperclip, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { generateInvoicePDF } from '@/utils/invoicePdfGenerator';

interface SendInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: {
    id: string;
    invoice_number: string;
    total: number;
    due_date?: string;
    client?: {
      name: string;
      email?: string;
    };
  };
  invoiceSettings?: any;
}

export const SendInvoiceModal = ({ open, onOpenChange, invoice, invoiceSettings }: SendInvoiceModalProps) => {
  const { user } = useAuth();
  const { templates, getDefaultTemplate } = useEmailTemplates();
  const [sending, setSending] = useState(false);
  const [attachPdf, setAttachPdf] = useState(true);
  
  const [formData, setFormData] = useState({
    recipientEmail: '',
    recipientName: '',
    templateId: '',
    customSubject: '',
    customBody: '',
    useCustom: false
  });

  useEffect(() => {
    if (open && invoice.client) {
      const defaultTemplate = getDefaultTemplate();
      setFormData({
        recipientEmail: invoice.client.email || '',
        recipientName: invoice.client.name || '',
        templateId: defaultTemplate?.id || '',
        customSubject: '',
        customBody: '',
        useCustom: false
      });
    }
  }, [open, invoice.client]);

  const handleSend = async () => {
    if (!user || !formData.recipientEmail) return;

    setSending(true);
    try {
      // Generate PDF if needed
      let pdfBase64 = undefined;
      if (attachPdf) {
        const pdfDoc = await generateInvoicePDF({
          invoice_number: invoice.invoice_number,
          invoice_date: new Date().toISOString(),
          due_date: invoice.due_date,
          client: {
            name: invoice.client?.name || 'Client',
            email: invoice.client?.email
          },
          items: [],
          subtotal: invoice.total,
          tax: 0,
          discount: 0,
          total: invoice.total
        }, invoiceSettings);
        
        pdfBase64 = pdfDoc.output('datauristring').split(',')[1];
      }

      // Get company name from settings
      const companyName = invoiceSettings?.company_name || 'Votre entreprise';

      const { data, error } = await supabase.functions.invoke('send-invoice-email', {
        body: {
          invoiceId: invoice.id,
          recipientEmail: formData.recipientEmail,
          recipientName: formData.recipientName,
          emailTemplateId: formData.useCustom ? undefined : formData.templateId || undefined,
          customSubject: formData.useCustom ? formData.customSubject : undefined,
          customBody: formData.useCustom ? formData.customBody : undefined,
          invoicePdfBase64: pdfBase64,
          invoiceNumber: invoice.invoice_number,
          invoiceTotal: invoice.total,
          companyName: companyName,
          dueDate: invoice.due_date
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: 'Facture envoyée',
          description: `La facture a été envoyée à ${formData.recipientEmail}`
        });
        onOpenChange(false);
      } else {
        throw new Error(data.error || 'Erreur lors de l\'envoi');
      }
    } catch (error: any) {
      console.error('Error sending invoice:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'envoyer la facture.',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Envoyer la facture par email
          </DialogTitle>
          <DialogDescription>
            Facture {invoice.invoice_number} - {invoice.total.toFixed(2)} MAD
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info about Resend domain verification */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-xs">
            <p className="text-amber-800 dark:text-amber-200">
              <strong>Note:</strong> Sans domaine vérifié sur{' '}
              <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="underline">
                resend.com/domains
              </a>
              , les emails ne peuvent être envoyés qu'à l'adresse associée à votre compte Resend.
            </p>
          </div>

          <div>
            <Label htmlFor="recipient-email">Email du destinataire *</Label>
            <Input
              id="recipient-email"
              type="email"
              value={formData.recipientEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, recipientEmail: e.target.value }))}
              placeholder="client@example.com"
            />
          </div>

          <div>
            <Label htmlFor="recipient-name">Nom du destinataire</Label>
            <Input
              id="recipient-name"
              value={formData.recipientName}
              onChange={(e) => setFormData(prev => ({ ...prev, recipientName: e.target.value }))}
              placeholder="Nom du client"
            />
          </div>

          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
            <div className="flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-muted-foreground" />
              <div>
                <h4 className="text-sm font-medium text-foreground">Joindre le PDF</h4>
                <p className="text-xs text-muted-foreground">Inclure la facture en pièce jointe</p>
              </div>
            </div>
            <Switch checked={attachPdf} onCheckedChange={setAttachPdf} />
          </div>

          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-foreground">Personnaliser l'email</h4>
              <p className="text-xs text-muted-foreground">Écrire un message personnalisé</p>
            </div>
            <Switch 
              checked={formData.useCustom} 
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, useCustom: checked }))} 
            />
          </div>

          {!formData.useCustom ? (
            <div>
              <Label>Modèle d'email</Label>
              <Select
                value={formData.templateId || 'default'}
                onValueChange={(value) => setFormData(prev => ({ ...prev, templateId: value === 'default' ? '' : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Modèle par défaut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Modèle par défaut</SelectItem>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <>
              <div>
                <Label htmlFor="custom-subject">Sujet</Label>
                <Input
                  id="custom-subject"
                  value={formData.customSubject}
                  onChange={(e) => setFormData(prev => ({ ...prev, customSubject: e.target.value }))}
                  placeholder="Facture {{invoice_number}}"
                />
              </div>
              <div>
                <Label htmlFor="custom-body">Message</Label>
                <Textarea
                  id="custom-body"
                  value={formData.customBody}
                  onChange={(e) => setFormData(prev => ({ ...prev, customBody: e.target.value }))}
                  placeholder="Bonjour, veuillez trouver ci-joint votre facture..."
                  rows={6}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Variables: {'{{client_name}}'}, {'{{invoice_number}}'}, {'{{invoice_total}}'}, {'{{due_date}}'}
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Annuler
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={sending || !formData.recipientEmail}
            className="w-full sm:w-auto"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Envoi...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Envoyer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
