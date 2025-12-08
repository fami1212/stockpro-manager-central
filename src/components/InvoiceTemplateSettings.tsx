import { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Palette, Layout, FileText, Save, Sparkles, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { InvoiceStyleSelector, InvoiceStyle, getInvoiceStyleSettings } from './InvoiceStyleSelector';
import { InvoicePreview } from './InvoicePreview';

interface InvoiceSettings {
  company_name: string;
  company_logo_url: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  company_tax_id: string;
  primary_color: string;
  secondary_color: string;
  text_color: string;
  logo_position: 'left' | 'center' | 'right';
  show_header: boolean;
  show_footer: boolean;
  footer_text: string;
  invoice_prefix: string;
  invoice_notes: string;
  payment_terms: string;
  template_style: InvoiceStyle;
}

export const InvoiceTemplateSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [settings, setSettings] = useState<InvoiceSettings>({
    company_name: '',
    company_logo_url: '',
    company_address: '',
    company_phone: '',
    company_email: '',
    company_tax_id: '',
    primary_color: '#1e40af',
    secondary_color: '#3b82f6',
    text_color: '#1f2937',
    logo_position: 'left',
    show_header: true,
    show_footer: true,
    footer_text: '',
    invoice_prefix: 'INV',
    invoice_notes: '',
    payment_terms: 'Paiement dû à réception',
    template_style: 'modern' as InvoiceStyle
  });

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('invoice_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings({
          ...data,
          template_style: (data.template_style as InvoiceStyle) || 'modern'
        });
        setLogoPreview(data.company_logo_url || '');
      }
    } catch (error) {
      console.error('Error fetching invoice settings:', error);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Erreur',
        description: 'La taille du fichier ne doit pas dépasser 2 MB.',
        variant: 'destructive'
      });
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const uploadLogo = async () => {
    if (!logoFile || !user) return null;

    setUploading(true);
    try {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('invoice-logos')
        .upload(fileName, logoFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('invoice-logos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de télécharger le logo.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let logoUrl = settings.company_logo_url;

      if (logoFile) {
        const uploadedUrl = await uploadLogo();
        if (uploadedUrl) {
          logoUrl = uploadedUrl;
        }
      }

      const settingsData = {
        ...settings,
        company_logo_url: logoUrl,
        user_id: user.id
      };

      const { error } = await supabase
        .from('invoice_settings')
        .upsert(settingsData, { onConflict: 'user_id' });

      if (error) throw error;

      toast({
        title: 'Paramètres sauvegardés',
        description: 'Vos paramètres de facture ont été mis à jour avec succès.'
      });

      fetchSettings();
      setLogoFile(null);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder les paramètres.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Modèle de facture</h3>
          <p className="text-sm text-muted-foreground">
            Personnalisez l'apparence de vos factures
          </p>
        </div>
        <Button onClick={handleSave} disabled={loading || uploading}>
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>

      {/* Main layout with preview */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Settings Column */}
        <div className="xl:col-span-2 space-y-6">

      {/* Company Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Identité de l'entreprise
          </CardTitle>
          <CardDescription>
            Logo et informations de votre entreprise
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="logo-upload">Logo de l'entreprise</Label>
            <div className="mt-2 flex items-center gap-4">
              {logoPreview && (
                <div className="w-32 h-32 border-2 border-border rounded-lg overflow-hidden bg-card">
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                </div>
              )}
              <div className="flex-1">
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choisir un logo
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  PNG, JPG ou WEBP (Max 2 MB)
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company_name">Nom de l'entreprise</Label>
              <Input
                id="company_name"
                value={settings.company_name}
                onChange={(e) => setSettings(prev => ({ ...prev, company_name: e.target.value }))}
                placeholder="Votre entreprise"
              />
            </div>
            <div>
              <Label htmlFor="company_tax_id">N° Identification fiscale</Label>
              <Input
                id="company_tax_id"
                value={settings.company_tax_id}
                onChange={(e) => setSettings(prev => ({ ...prev, company_tax_id: e.target.value }))}
                placeholder="IF123456"
              />
            </div>
            <div>
              <Label htmlFor="company_email">Email</Label>
              <Input
                id="company_email"
                type="email"
                value={settings.company_email}
                onChange={(e) => setSettings(prev => ({ ...prev, company_email: e.target.value }))}
                placeholder="contact@entreprise.com"
              />
            </div>
            <div>
              <Label htmlFor="company_phone">Téléphone</Label>
              <Input
                id="company_phone"
                value={settings.company_phone}
                onChange={(e) => setSettings(prev => ({ ...prev, company_phone: e.target.value }))}
                placeholder="+212 6XX XXX XXX"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="company_address">Adresse</Label>
              <Textarea
                id="company_address"
                value={settings.company_address}
                onChange={(e) => setSettings(prev => ({ ...prev, company_address: e.target.value }))}
                placeholder="Adresse complète de l'entreprise"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Couleurs
          </CardTitle>
          <CardDescription>
            Personnalisez les couleurs de vos factures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="primary_color">Couleur primaire</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="primary_color"
                  type="color"
                  value={settings.primary_color}
                  onChange={(e) => setSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                  className="w-20 h-10 p-1"
                />
                <Input
                  type="text"
                  value={settings.primary_color}
                  onChange={(e) => setSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                  placeholder="#1e40af"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="secondary_color">Couleur secondaire</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="secondary_color"
                  type="color"
                  value={settings.secondary_color}
                  onChange={(e) => setSettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                  className="w-20 h-10 p-1"
                />
                <Input
                  type="text"
                  value={settings.secondary_color}
                  onChange={(e) => setSettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="text_color">Couleur du texte</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="text_color"
                  type="color"
                  value={settings.text_color}
                  onChange={(e) => setSettings(prev => ({ ...prev, text_color: e.target.value }))}
                  className="w-20 h-10 p-1"
                />
                <Input
                  type="text"
                  value={settings.text_color}
                  onChange={(e) => setSettings(prev => ({ ...prev, text_color: e.target.value }))}
                  placeholder="#1f2937"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predefined Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Style de facture
          </CardTitle>
          <CardDescription>
            Choisissez un style prédéfini pour vos factures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InvoiceStyleSelector
            value={settings.template_style}
            onChange={(style) => {
              const styleSettings = getInvoiceStyleSettings(style);
              setSettings(prev => ({
                ...prev,
                template_style: style,
                primary_color: styleSettings.primaryColor,
                secondary_color: styleSettings.secondaryColor
              }));
            }}
          />
        </CardContent>
      </Card>

      {/* Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="w-5 h-5" />
            Mise en page
          </CardTitle>
          <CardDescription>
            Configurez la disposition de vos factures
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Position du logo</Label>
            <Select
              value={settings.logo_position}
              onValueChange={(value: 'left' | 'center' | 'right') =>
                setSettings(prev => ({ ...prev, logo_position: value }))
              }
            >
              <SelectTrigger className="w-48 mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Gauche</SelectItem>
                <SelectItem value="center">Centre</SelectItem>
                <SelectItem value="right">Droite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h4 className="font-medium text-foreground">Afficher l'en-tête</h4>
              <p className="text-sm text-muted-foreground">Inclure le logo et les infos entreprise</p>
            </div>
            <Switch
              checked={settings.show_header}
              onCheckedChange={(checked) =>
                setSettings(prev => ({ ...prev, show_header: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h4 className="font-medium text-foreground">Afficher le pied de page</h4>
              <p className="text-sm text-muted-foreground">Inclure le texte personnalisé en bas</p>
            </div>
            <Switch
              checked={settings.show_footer}
              onCheckedChange={(checked) =>
                setSettings(prev => ({ ...prev, show_footer: checked }))
              }
            />
          </div>

          {settings.show_footer && (
            <div>
              <Label htmlFor="footer_text">Texte du pied de page</Label>
              <Textarea
                id="footer_text"
                value={settings.footer_text}
                onChange={(e) => setSettings(prev => ({ ...prev, footer_text: e.target.value }))}
                placeholder="Ex: Merci pour votre confiance"
                rows={2}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Détails de facturation
          </CardTitle>
          <CardDescription>
            Configurez les paramètres par défaut des factures
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="invoice_prefix">Préfixe des factures</Label>
            <Input
              id="invoice_prefix"
              value={settings.invoice_prefix}
              onChange={(e) => setSettings(prev => ({ ...prev, invoice_prefix: e.target.value }))}
              placeholder="INV"
              className="w-32"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Exemple: {settings.invoice_prefix}-2024-00001
            </p>
          </div>

          <div>
            <Label htmlFor="payment_terms">Conditions de paiement</Label>
            <Input
              id="payment_terms"
              value={settings.payment_terms}
              onChange={(e) => setSettings(prev => ({ ...prev, payment_terms: e.target.value }))}
              placeholder="Paiement dû à réception"
            />
          </div>

          <div>
            <Label htmlFor="invoice_notes">Notes par défaut</Label>
            <Textarea
              id="invoice_notes"
              value={settings.invoice_notes}
              onChange={(e) => setSettings(prev => ({ ...prev, invoice_notes: e.target.value }))}
              placeholder="Notes qui apparaîtront sur toutes vos factures"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
        </div>

        {/* Preview Column */}
        <div className="xl:col-span-1">
          <div className="sticky top-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Aperçu en temps réel
                </CardTitle>
                <CardDescription>
                  Prévisualisation de votre facture
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InvoicePreview 
                  settings={settings} 
                  logoPreview={logoPreview}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};