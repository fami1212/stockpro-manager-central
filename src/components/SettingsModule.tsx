
import { useState, useEffect } from 'react';
import { Save, User, Building2, Bell, Shield, Palette, Database, Download, FileText, Settings, Mail, Phone, Moon, Sun, Globe, Clock, X } from 'lucide-react';
import { InvoiceTemplateSettings } from './InvoiceTemplateSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { exportToExcel } from '@/utils/exportData';
import { format } from 'date-fns';

const SETTINGS_KEY = 'stockpro_user_settings';

interface UserSettings {
  notifications: {
    stock_alerts: boolean;
    new_sales: boolean;
    reports: boolean;
    new_clients: boolean;
  };
  appearance: {
    theme: string;
    language: string;
    date_format: string;
  };
  security: {
    session_timeout: number;
    two_factor: boolean;
    audit_log: boolean;
  };
}

const defaultSettings: UserSettings = {
  notifications: {
    stock_alerts: true,
    new_sales: true,
    reports: false,
    new_clients: false
  },
  appearance: {
    theme: 'light',
    language: 'fr',
    date_format: 'dd/mm/yyyy'
  },
  security: {
    session_timeout: 30,
    two_factor: false,
    audit_log: true
  }
};

export const SettingsModule = () => {
  const { user } = useAuth();
  const { products, sales, clients } = useApp();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    company: '',
    phone: ''
  });
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'invoice', label: 'Factures', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'data', label: 'Données', icon: Database },
  ];

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (e) {
        console.error('Error parsing saved settings:', e);
      }
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  // Apply theme when it changes
  useEffect(() => {
    const root = document.documentElement;
    if (settings.appearance.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.appearance.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // Auto - check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings.appearance.theme]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          company: data.company || '',
          phone: data.phone || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', user.id);

      if (error) throw error;

      // Also save settings
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

      toast({
        title: 'Paramètres sauvegardés',
        description: 'Vos informations et préférences ont été sauvegardées avec succès.'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le profil.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    const data = {
      profile,
      settings,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donnees_stockpro_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Export réussi',
      description: 'Vos données ont été exportées avec succès.'
    });
  };

  const handleExportAllData = async () => {
    try {
      // Export products
      const productsData = products.map(p => ({
        Nom: p.name,
        Référence: p.reference,
        'Code-barres': p.barcode,
        Stock: p.stock,
        'Prix achat': p.buy_price,
        'Prix vente': p.sell_price,
        Statut: p.status
      }));

      exportToExcel({
        filename: `produits_${format(new Date(), 'yyyy-MM-dd')}`,
        sheetName: 'Produits',
        data: productsData
      });

      toast({
        title: 'Export réussi',
        description: 'Les produits ont été exportés avec succès.'
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de l\'export.',
        variant: 'destructive'
      });
    }
  };

  const handleExportSales = () => {
    const salesData = sales.map(s => ({
      Référence: s.reference,
      Date: s.date,
      'Sous-total': s.subtotal,
      Remise: s.discount,
      Taxe: s.tax,
      Total: s.total,
      Statut: s.status,
      Paiement: s.payment_method
    }));

    exportToExcel({
      filename: `ventes_${format(new Date(), 'yyyy-MM-dd')}`,
      sheetName: 'Ventes',
      data: salesData
    });

    toast({
      title: 'Export réussi',
      description: 'Les ventes ont été exportées avec succès.'
    });
  };

  const handleExportClients = () => {
    const clientsData = clients.map(c => ({
      Nom: c.name,
      Email: c.email,
      Téléphone: c.phone,
      Adresse: c.address,
      'Total commandes': c.total_orders,
      'Montant total': c.total_amount,
      Statut: c.status
    }));

    exportToExcel({
      filename: `clients_${format(new Date(), 'yyyy-MM-dd')}`,
      sheetName: 'Clients',
      data: clientsData
    });

    toast({
      title: 'Export réussi',
      description: 'Les clients ont été exportés avec succès.'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête moderne */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 p-6">
        <div className="absolute inset-0 bg-grid-white/5" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/20 backdrop-blur-sm">
              <Settings className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
              <p className="text-muted-foreground">Gérez votre profil et vos préférences</p>
            </div>
          </div>
          <Button onClick={handleSaveProfile} disabled={loading} className="shadow-lg">
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 animate-fade-in ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                  : 'bg-card hover:bg-accent text-muted-foreground hover:text-foreground border border-border'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Contenu des onglets */}
      <div className="animate-fade-in">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <Card className="border-border/50 shadow-lg">
              <CardHeader className="border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Informations personnelles</CardTitle>
                    <CardDescription>
                      Gérez vos informations de profil et de contact
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 animate-fade-in" style={{ animationDelay: '50ms' }}>
                    <Label htmlFor="first_name" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Prénom
                    </Label>
                    <Input 
                      id="first_name" 
                      value={profile.first_name}
                      onChange={(e) => setProfile(prev => ({ ...prev, first_name: e.target.value }))}
                      placeholder="Votre prénom"
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2 animate-fade-in" style={{ animationDelay: '100ms' }}>
                    <Label htmlFor="last_name" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Nom
                    </Label>
                    <Input 
                      id="last_name" 
                      value={profile.last_name}
                      onChange={(e) => setProfile(prev => ({ ...prev, last_name: e.target.value }))}
                      placeholder="Votre nom"
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2 animate-fade-in" style={{ animationDelay: '150ms' }}>
                    <Label htmlFor="company" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      Entreprise
                    </Label>
                    <Input 
                      id="company" 
                      value={profile.company}
                      onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="Nom de votre entreprise"
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2 animate-fade-in" style={{ animationDelay: '200ms' }}>
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      Téléphone
                    </Label>
                    <Input 
                      id="phone" 
                      value={profile.phone}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Votre numéro de téléphone"
                      className="bg-background/50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-lg animate-fade-in" style={{ animationDelay: '250ms' }}>
              <CardHeader className="border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Compte</CardTitle>
                    <CardDescription>
                      Informations de votre compte utilisateur
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email
                  </Label>
                  <Input 
                    id="email" 
                    value={user?.email || ''}
                    disabled
                    className="bg-muted/50"
                  />
                  <p className="text-sm text-muted-foreground">
                    L'email ne peut pas être modifié depuis cette interface
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'invoice' && (
          <InvoiceTemplateSettings />
        )}

        {activeTab === 'notifications' && (
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Préférences de notification</CardTitle>
                  <CardDescription>
                    Configurez les notifications que vous souhaitez recevoir
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {[
                { key: 'stock_alerts', label: 'Alertes de stock bas', description: 'Recevoir une notification quand le stock est faible' },
                { key: 'new_sales', label: 'Nouvelles ventes', description: 'Notification à chaque nouvelle vente' },
                { key: 'reports', label: 'Rapports automatiques', description: 'Recevoir les rapports hebdomadaires par email' },
                { key: 'new_clients', label: 'Nouveaux clients', description: 'Notification lors de l\'ajout d\'un nouveau client' },
              ].map((item, index) => (
                <div 
                  key={item.key}
                  className="flex items-center justify-between p-4 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div>
                    <h4 className="font-medium text-foreground">{item.label}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch 
                    checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, [item.key]: checked }
                      }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeTab === 'appearance' && (
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Palette className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Personnalisation de l'apparence</CardTitle>
                  <CardDescription>
                    Personnalisez l'apparence de l'application
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Thème */}
              <div className="space-y-3 animate-fade-in">
                <Label className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-muted-foreground" />
                  Thème
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'light', label: 'Clair', icon: Sun },
                    { value: 'dark', label: 'Sombre', icon: Moon },
                    { value: 'auto', label: 'Automatique', icon: Settings },
                  ].map((theme) => {
                    const Icon = theme.icon;
                    const isSelected = settings.appearance.theme === theme.value;
                    return (
                      <button
                        key={theme.value}
                        onClick={() =>
                          setSettings(prev => ({
                            ...prev,
                            appearance: { ...prev.appearance, theme: theme.value }
                          }))
                        }
                        className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="font-medium">{theme.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Langue */}
              <div className="space-y-3 animate-fade-in" style={{ animationDelay: '100ms' }}>
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  Langue
                </Label>
                <Select 
                  value={settings.appearance.language}
                  onValueChange={(value) => 
                    setSettings(prev => ({
                      ...prev,
                      appearance: { ...prev.appearance, language: value }
                    }))
                  }
                >
                  <SelectTrigger className="w-full md:w-48 bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Format de date */}
              <div className="space-y-3 animate-fade-in" style={{ animationDelay: '150ms' }}>
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Format de date
                </Label>
                <Select 
                  value={settings.appearance.date_format}
                  onValueChange={(value) => 
                    setSettings(prev => ({
                      ...prev,
                      appearance: { ...prev.appearance, date_format: value }
                    }))
                  }
                >
                  <SelectTrigger className="w-full md:w-48 bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'security' && (
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Sécurité et accès</CardTitle>
                  <CardDescription>
                    Configurez les paramètres de sécurité de votre compte
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Timeout de session */}
              <div className="space-y-3 animate-fade-in">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Délai d'expiration de session
                </Label>
                <Select
                  value={settings.security.session_timeout.toString()}
                  onValueChange={(value) =>
                    setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, session_timeout: parseInt(value) }
                    }))
                  }
                >
                  <SelectTrigger className="w-full md:w-48 bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 heure</SelectItem>
                    <SelectItem value="120">2 heures</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {[
                { key: 'two_factor', label: 'Authentification à deux facteurs', description: 'Sécurité renforcée pour les connexions' },
                { key: 'audit_log', label: 'Journalisation des actions', description: 'Enregistrer toutes les actions des utilisateurs' },
              ].map((item, index) => (
                <div 
                  key={item.key}
                  className="flex items-center justify-between p-4 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors animate-fade-in"
                  style={{ animationDelay: `${(index + 1) * 50}ms` }}
                >
                  <div>
                    <h4 className="font-medium text-foreground">{item.label}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch 
                    checked={settings.security[item.key as keyof typeof settings.security] as boolean}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, [item.key]: checked }
                      }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeTab === 'data' && (
          <div className="space-y-6">
            <Card className="border-border/50 shadow-lg">
              <CardHeader className="border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Database className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Gestion des données</CardTitle>
                    <CardDescription>
                      Sauvegarde, export et gestion de vos données
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Export paramètres', description: 'Exporter vos paramètres et données de profil', action: handleExportData },
                    { label: 'Export produits', description: `Exporter tous vos produits en Excel (${products.length} produits)`, action: handleExportAllData },
                    { label: 'Export ventes', description: `Exporter toutes vos ventes en Excel (${sales.length} ventes)`, action: handleExportSales },
                    { label: 'Export clients', description: `Exporter tous vos clients en Excel (${clients.length} clients)`, action: handleExportClients },
                  ].map((item, index) => (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="flex items-start gap-4 p-4 rounded-xl bg-accent/30 hover:bg-accent/50 transition-all duration-300 text-left group animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Download className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-lg animate-fade-in" style={{ animationDelay: '200ms' }}>
              <CardHeader className="border-b border-border/50">
                <CardTitle>Statistiques des données</CardTitle>
                <CardDescription>
                  Aperçu de vos données stockées
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { value: products.length, label: 'Produits', color: 'from-blue-500/20 to-blue-600/10 text-blue-600 dark:text-blue-400' },
                    { value: sales.length, label: 'Ventes', color: 'from-emerald-500/20 to-emerald-600/10 text-emerald-600 dark:text-emerald-400' },
                    { value: clients.length, label: 'Clients', color: 'from-purple-500/20 to-purple-600/10 text-purple-600 dark:text-purple-400' },
                    { value: sales.reduce((acc, s) => acc + (s.total || 0), 0).toLocaleString(), label: 'CA Total (CFA)', color: 'from-orange-500/20 to-orange-600/10 text-orange-600 dark:text-orange-400' },
                  ].map((stat, index) => (
                    <div 
                      key={stat.label}
                      className={`text-center p-4 rounded-xl bg-gradient-to-br ${stat.color} animate-fade-in`}
                      style={{ animationDelay: `${(index + 4) * 50}ms` }}
                    >
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
