
import { useState, useEffect } from 'react';
import { Save, User, Building, Bell, Shield, Palette, Database, Download, FileText } from 'lucide-react';
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
import { fr } from 'date-fns/locale';

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Paramètres</h2>
        <Button onClick={handleSaveProfile} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4 inline mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informations personnelles</CardTitle>
                  <CardDescription>
                    Gérez vos informations de profil et de contact
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="first_name">Prénom</Label>
                      <Input 
                        id="first_name" 
                        value={profile.first_name}
                        onChange={(e) => setProfile(prev => ({ ...prev, first_name: e.target.value }))}
                        placeholder="Votre prénom"
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Nom</Label>
                      <Input 
                        id="last_name" 
                        value={profile.last_name}
                        onChange={(e) => setProfile(prev => ({ ...prev, last_name: e.target.value }))}
                        placeholder="Votre nom"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Entreprise</Label>
                      <Input 
                        id="company" 
                        value={profile.company}
                        onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Nom de votre entreprise"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input 
                        id="phone" 
                        value={profile.phone}
                        onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Votre numéro de téléphone"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compte</CardTitle>
                  <CardDescription>
                    Informations de votre compte utilisateur
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      value={user?.email || ''}
                      disabled
                      className="bg-gray-100"
                    />
                    <p className="text-sm text-gray-500 mt-1">
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
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Préférences de notification</CardTitle>
                  <CardDescription>
                    Configurez les notifications que vous souhaitez recevoir
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Alertes de stock bas</h4>
                        <p className="text-sm text-gray-500">Recevoir une notification quand le stock est faible</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.stock_alerts}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, stock_alerts: checked }
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Nouvelles ventes</h4>
                        <p className="text-sm text-gray-500">Notification à chaque nouvelle vente</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.new_sales}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, new_sales: checked }
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Rapports automatiques</h4>
                        <p className="text-sm text-gray-500">Recevoir les rapports hebdomadaires par email</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.reports}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, reports: checked }
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Nouveaux clients</h4>
                        <p className="text-sm text-gray-500">Notification lors de l'ajout d'un nouveau client</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.new_clients}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, new_clients: checked }
                          }))
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Apparence</CardTitle>
                  <CardDescription>
                    Personnalisez l'apparence de l'application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Thème</Label>
                      <Select 
                        value={settings.appearance.theme}
                        onValueChange={(value) => 
                          setSettings(prev => ({
                            ...prev,
                            appearance: { ...prev.appearance, theme: value }
                          }))
                        }
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Clair</SelectItem>
                          <SelectItem value="dark">Sombre</SelectItem>
                          <SelectItem value="auto">Automatique</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Langue</Label>
                      <Select 
                        value={settings.appearance.language}
                        onValueChange={(value) => 
                          setSettings(prev => ({
                            ...prev,
                            appearance: { ...prev.appearance, language: value }
                          }))
                        }
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Format de date</Label>
                      <Select 
                        value={settings.appearance.date_format}
                        onValueChange={(value) => 
                          setSettings(prev => ({
                            ...prev,
                            appearance: { ...prev.appearance, date_format: value }
                          }))
                        }
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                          <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                          <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sécurité et accès</CardTitle>
                  <CardDescription>
                    Configurez les paramètres de sécurité de votre compte
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="session-timeout">Délai d'expiration de session (minutes)</Label>
                      <Input 
                        id="session-timeout" 
                        type="number" 
                        value={settings.security.session_timeout}
                        onChange={(e) => 
                          setSettings(prev => ({
                            ...prev,
                            security: { ...prev.security, session_timeout: parseInt(e.target.value) || 30 }
                          }))
                        }
                        className="w-32" 
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Authentification à deux facteurs</h4>
                        <p className="text-sm text-gray-500">Sécurité renforcée pour les connexions</p>
                      </div>
                      <Switch 
                        checked={settings.security.two_factor}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({
                            ...prev,
                            security: { ...prev.security, two_factor: checked }
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Journalisation des actions</h4>
                        <p className="text-sm text-gray-500">Enregistrer toutes les actions des utilisateurs</p>
                      </div>
                      <Switch 
                        checked={settings.security.audit_log}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({
                            ...prev,
                            security: { ...prev.security, audit_log: checked }
                          }))
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des données</CardTitle>
                  <CardDescription>
                    Sauvegarde, export et gestion de vos données
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Export paramètres</h4>
                      <p className="text-sm text-gray-500 mb-4">
                        Exporter vos paramètres et données de profil
                      </p>
                      <Button variant="outline" onClick={handleExportData}>
                        <Download className="w-4 h-4 mr-2" />
                        Paramètres
                      </Button>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Export produits</h4>
                      <p className="text-sm text-gray-500 mb-4">
                        Exporter tous vos produits en Excel ({products.length} produits)
                      </p>
                      <Button variant="outline" onClick={handleExportAllData}>
                        <Download className="w-4 h-4 mr-2" />
                        Produits
                      </Button>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Export ventes</h4>
                      <p className="text-sm text-gray-500 mb-4">
                        Exporter toutes vos ventes en Excel ({sales.length} ventes)
                      </p>
                      <Button variant="outline" onClick={handleExportSales}>
                        <Download className="w-4 h-4 mr-2" />
                        Ventes
                      </Button>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Export clients</h4>
                      <p className="text-sm text-gray-500 mb-4">
                        Exporter tous vos clients en Excel ({clients.length} clients)
                      </p>
                      <Button variant="outline" onClick={handleExportClients}>
                        <Download className="w-4 h-4 mr-2" />
                        Clients
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Statistiques des données</CardTitle>
                  <CardDescription>
                    Aperçu de vos données stockées
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{products.length}</p>
                      <p className="text-sm text-gray-600">Produits</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{sales.length}</p>
                      <p className="text-sm text-gray-600">Ventes</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{clients.length}</p>
                      <p className="text-sm text-gray-600">Clients</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">
                        {sales.reduce((acc, s) => acc + s.total, 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">CA Total (CFA)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
