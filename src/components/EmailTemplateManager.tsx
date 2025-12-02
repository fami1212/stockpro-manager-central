import { useState } from 'react';
import { Plus, Edit, Trash2, Mail, Star, StarOff, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useEmailTemplates, EmailTemplate } from '@/hooks/useEmailTemplates';
import { ConfirmDialog } from '@/components/ConfirmDialog';

const placeholdersList = [
  { key: '{{company_name}}', desc: 'Nom de l\'entreprise' },
  { key: '{{client_name}}', desc: 'Nom du client' },
  { key: '{{invoice_number}}', desc: 'Numéro de facture' },
  { key: '{{invoice_total}}', desc: 'Montant total' },
  { key: '{{due_date}}', desc: 'Date d\'échéance' },
];

const defaultTemplateExamples = [
  {
    name: 'Professionnel',
    subject: 'Facture {{invoice_number}} - {{company_name}}',
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #1e40af;">{{company_name}}</h2>
  <p>Bonjour {{client_name}},</p>
  <p>Veuillez trouver ci-joint votre facture <strong>{{invoice_number}}</strong> d'un montant de <strong>{{invoice_total}} MAD</strong>.</p>
  <p>Date d'échéance: {{due_date}}</p>
  <p>Cordialement,<br/>{{company_name}}</p>
</div>`
  },
  {
    name: 'Simple',
    subject: 'Votre facture {{invoice_number}}',
    body: `<p>Bonjour {{client_name}},</p>
<p>Votre facture {{invoice_number}} est disponible en pièce jointe.</p>
<p>Montant: {{invoice_total}} MAD</p>
<p>Merci pour votre confiance.</p>
<p>{{company_name}}</p>`
  },
  {
    name: 'Rappel',
    subject: 'Rappel - Facture {{invoice_number}}',
    body: `<div style="font-family: Arial, sans-serif;">
  <p>Bonjour {{client_name}},</p>
  <p>Nous vous rappelons que la facture <strong>{{invoice_number}}</strong> d'un montant de <strong>{{invoice_total}} MAD</strong> arrive à échéance le <strong>{{due_date}}</strong>.</p>
  <p>Merci de procéder au règlement dans les meilleurs délais.</p>
  <p>Cordialement,<br/>{{company_name}}</p>
</div>`
  }
];

export const EmailTemplateManager = () => {
  const { templates, loading, addTemplate, updateTemplate, deleteTemplate } = useEmailTemplates();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    is_default: false,
    template_type: 'invoice'
  });

  const handleOpenModal = (template?: EmailTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        subject: template.subject,
        body: template.body,
        is_default: template.is_default,
        template_type: template.template_type
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: '',
        subject: '',
        body: '',
        is_default: false,
        template_type: 'invoice'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.subject || !formData.body) return;

    if (editingTemplate) {
      await updateTemplate(editingTemplate.id, formData);
    } else {
      await addTemplate(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteTemplate(deleteId);
      setDeleteId(null);
    }
  };

  const handleUseExample = (example: typeof defaultTemplateExamples[0]) => {
    setFormData(prev => ({
      ...prev,
      name: example.name,
      subject: example.subject,
      body: example.body
    }));
  };

  const handlePreview = (html: string) => {
    // Replace placeholders with example data
    const previewData = html
      .replace(/{{company_name}}/g, 'Ma Société')
      .replace(/{{client_name}}/g, 'Jean Dupont')
      .replace(/{{invoice_number}}/g, 'INV-2024-00001')
      .replace(/{{invoice_total}}/g, '1,500.00')
      .replace(/{{due_date}}/g, '31/12/2024');
    
    setPreviewHtml(previewData);
    setIsPreviewOpen(true);
  };

  const handleSetDefault = async (template: EmailTemplate) => {
    await updateTemplate(template.id, { is_default: !template.is_default, template_type: template.template_type });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Modèles d'email</h3>
          <p className="text-sm text-muted-foreground">
            Créez et gérez vos modèles d'email pour les factures
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau modèle
        </Button>
      </div>

      {/* Placeholders Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Variables disponibles</CardTitle>
          <CardDescription>
            Utilisez ces variables dans vos modèles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {placeholdersList.map(p => (
              <Badge key={p.key} variant="secondary" className="font-mono text-xs">
                {p.key}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Templates List */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Chargement...</div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h4 className="font-medium text-foreground mb-2">Aucun modèle d'email</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Créez votre premier modèle pour personnaliser vos emails de facturation.
            </p>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Créer un modèle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {templates.map(template => (
            <Card key={template.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground">{template.name}</h4>
                      {template.is_default && (
                        <Badge variant="default" className="text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          Par défaut
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Sujet: {template.subject}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Créé le {new Date(template.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePreview(template.body)}
                      title="Aperçu"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSetDefault(template)}
                      title={template.is_default ? "Retirer par défaut" : "Définir par défaut"}
                    >
                      {template.is_default ? (
                        <StarOff className="w-4 h-4" />
                      ) : (
                        <Star className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenModal(template)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(template.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Modifier le modèle' : 'Nouveau modèle d\'email'}
            </DialogTitle>
            <DialogDescription>
              Créez un modèle d'email personnalisé pour vos factures
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Quick Templates */}
            {!editingTemplate && (
              <div>
                <Label className="mb-2 block">Modèles rapides</Label>
                <div className="flex gap-2">
                  {defaultTemplateExamples.map(example => (
                    <Button
                      key={example.name}
                      variant="outline"
                      size="sm"
                      onClick={() => handleUseExample(example)}
                    >
                      {example.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="template-name">Nom du modèle</Label>
              <Input
                id="template-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Facture standard"
              />
            </div>

            <div>
              <Label htmlFor="template-subject">Sujet de l'email</Label>
              <Input
                id="template-subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Ex: Facture {{invoice_number}} - {{company_name}}"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="template-body">Corps de l'email (HTML)</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePreview(formData.body)}
                  disabled={!formData.body}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Aperçu
                </Button>
              </div>
              <Textarea
                id="template-body"
                value={formData.body}
                onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                placeholder="<p>Bonjour {{client_name}},</p>..."
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <h4 className="font-medium text-foreground">Modèle par défaut</h4>
                <p className="text-sm text-muted-foreground">
                  Utiliser ce modèle par défaut pour les factures
                </p>
              </div>
              <Switch
                checked={formData.is_default}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({ ...prev, is_default: checked }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={!formData.name || !formData.subject || !formData.body}>
              {editingTemplate ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Aperçu de l'email</DialogTitle>
          </DialogHeader>
          <div 
            className="border border-border rounded-lg p-4 bg-white"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Supprimer le modèle"
        description="Êtes-vous sûr de vouloir supprimer ce modèle d'email ? Cette action est irréversible."
        confirmText="Supprimer"
        variant="destructive"
      />
    </div>
  );
};
