
import { useState } from 'react';
import { Save, User, Building, Bell, Shield, Palette, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const SettingsModule = () => {
  const [activeTab, setActiveTab] = useState('company');

  const tabs = [
    { id: 'company', label: 'Entreprise', icon: Building },
    { id: 'users', label: 'Utilisateurs', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'data', label: 'Données', icon: Database },
  ];

  const users = [
    { id: 1, name: 'Admin Principal', email: 'admin@stockpro.com', role: 'Admin', status: 'Actif' },
    { id: 2, name: 'Marie Vendeur', email: 'marie@stockpro.com', role: 'Vendeur', status: 'Actif' },
    { id: 3, name: 'Pierre Stock', email: 'pierre@stockpro.com', role: 'Magasinier', status: 'Inactif' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Paramètres</h2>
        <Button className="bg-gray-600 hover:bg-gray-700">
          <Save className="w-4 h-4 mr-2" />
          Sauvegarder
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
                      ? 'border-gray-500 text-gray-600'
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
          {activeTab === 'company' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Informations de l'entreprise</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="company-name">Nom de l'entreprise</Label>
                  <Input id="company-name" defaultValue="Mon Entreprise SARL" />
                </div>
                <div>
                  <Label htmlFor="company-siret">SIRET</Label>
                  <Input id="company-siret" defaultValue="12345678901234" />
                </div>
                <div>
                  <Label htmlFor="company-address">Adresse</Label>
                  <Input id="company-address" defaultValue="123 Rue de la République" />
                </div>
                <div>
                  <Label htmlFor="company-city">Ville</Label>
                  <Input id="company-city" defaultValue="75001 Paris" />
                </div>
                <div>
                  <Label htmlFor="company-phone">Téléphone</Label>
                  <Input id="company-phone" defaultValue="01 23 45 67 89" />
                </div>
                <div>
                  <Label htmlFor="company-email">Email</Label>
                  <Input id="company-email" defaultValue="contact@monentreprise.fr" />
                </div>
              </div>

              <div>
                <Label htmlFor="company-currency">Devise</Label>
                <Select defaultValue="eur">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eur">Euro (€)</SelectItem>
                    <SelectItem value="usd">Dollar US ($)</SelectItem>
                    <SelectItem value="gbp">Livre Sterling (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Gestion des utilisateurs</h3>
                <Button>Inviter un utilisateur</Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Nom</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Rôle</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Statut</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{user.name}</td>
                        <td className="py-3 px-4 text-gray-600">{user.email}</td>
                        <td className="py-3 px-4 text-gray-600">{user.role}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === 'Actif'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">Modifier</Button>
                            <Button variant="outline" size="sm">Supprimer</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Préférences de notification</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Alertes de stock bas</h4>
                    <p className="text-sm text-gray-500">Recevoir une notification quand le stock est faible</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Nouvelles ventes</h4>
                    <p className="text-sm text-gray-500">Notification à chaque nouvelle vente</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Rapports automatiques</h4>
                    <p className="text-sm text-gray-500">Recevoir les rapports hebdomadaires par email</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Nouveaux clients</h4>
                    <p className="text-sm text-gray-500">Notification lors de l'ajout d'un nouveau client</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Sécurité et accès</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="session-timeout">Délai d'expiration de session (minutes)</Label>
                  <Input id="session-timeout" type="number" defaultValue="30" className="w-32" />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Authentification à deux facteurs</h4>
                    <p className="text-sm text-gray-500">Sécurité renforcée pour les connexions</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Journalisation des actions</h4>
                    <p className="text-sm text-gray-500">Enregistrer toutes les actions des utilisateurs</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div>
                  <Label>Politique de mot de passe</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm text-gray-600">Minimum 8 caractères</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm text-gray-600">Inclure des majuscules et minuscules</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm text-gray-600">Inclure des chiffres</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Apparence</h3>
              
              <div className="space-y-4">
                <div>
                  <Label>Thème</Label>
                  <Select defaultValue="light">
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
                  <Select defaultValue="fr">
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
                  <Select defaultValue="dd/mm/yyyy">
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
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Gestion des données</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Sauvegarde automatique</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Dernière sauvegarde : 15/01/2024 02:00
                  </p>
                  <Button variant="outline">Configurer</Button>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Export des données</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Exporter toutes vos données
                  </p>
                  <Button variant="outline">Exporter</Button>
                </div>

                <div className="p-4 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-2">Réinitialisation</h4>
                  <p className="text-sm text-red-600 mb-4">
                    Supprimer toutes les données (irréversible)
                  </p>
                  <Button variant="destructive">Réinitialiser</Button>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Import de données</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Importer depuis un fichier CSV/Excel
                  </p>
                  <Button variant="outline">Importer</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
