import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Settings, Database, Mail, Shield, AlertTriangle } from 'lucide-react';

interface SystemConfig {
  company_name: string;
  currency: string;
  tax_rate: number;
  email_notifications: boolean;
  auto_backup: boolean;
  maintenance_mode: boolean;
  max_users: number;
  session_timeout: number;
}

export function SystemSettings() {
  const [config, setConfig] = useState<SystemConfig>({
    company_name: 'StockPro Manager',
    currency: 'CFA',
    tax_rate: 18,
    email_notifications: true,
    auto_backup: true,
    maintenance_mode: false,
    max_users: 100,
    session_timeout: 8
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simuler la sauvegarde (à remplacer par une vraie API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Paramètres sauvegardés',
        description: 'Les paramètres système ont été mis à jour avec succès'
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder les paramètres',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBackup = async () => {
    setLoading(true);
    try {
      // Simuler la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Sauvegarde créée',
        description: 'Une sauvegarde complète a été créée avec succès'
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la sauvegarde',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration générale */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration Générale
          </CardTitle>
          <CardDescription>
            Paramètres de base de l'application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Nom de l'entreprise</Label>
              <Input
                id="company_name"
                value={config.company_name}
                onChange={(e) => setConfig({...config, company_name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Devise</Label>
              <Input
                id="currency"
                value={config.currency}
                onChange={(e) => setConfig({...config, currency: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax_rate">Taux de TVA (%)</Label>
              <Input
                id="tax_rate"
                type="number"
                value={config.tax_rate}
                onChange={(e) => setConfig({...config, tax_rate: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_users">Nombre max d'utilisateurs</Label>
              <Input
                id="max_users"
                type="number"
                value={config.max_users}
                onChange={(e) => setConfig({...config, max_users: Number(e.target.value)})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sécurité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sécurité
          </CardTitle>
          <CardDescription>
            Paramètres de sécurité et d'authentification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Délai d'expiration de session (heures)</Label>
              <p className="text-sm text-muted-foreground">
                Temps avant déconnexion automatique
              </p>
            </div>
            <Input
              type="number"
              value={config.session_timeout}
              onChange={(e) => setConfig({...config, session_timeout: Number(e.target.value)})}
              className="w-20"
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mode maintenance</Label>
              <p className="text-sm text-muted-foreground">
                Désactiver l'accès pour les utilisateurs non-admin
              </p>
            </div>
            <Switch
              checked={config.maintenance_mode}
              onCheckedChange={(checked) => setConfig({...config, maintenance_mode: checked})}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configuration des notifications système
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notifications par email</Label>
              <p className="text-sm text-muted-foreground">
                Envoyer des notifications par email pour les événements importants
              </p>
            </div>
            <Switch
              checked={config.email_notifications}
              onCheckedChange={(checked) => setConfig({...config, email_notifications: checked})}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sauvegarde */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Sauvegarde et Restauration
          </CardTitle>
          <CardDescription>
            Gestion des sauvegardes de données
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sauvegarde automatique</Label>
              <p className="text-sm text-muted-foreground">
                Créer une sauvegarde automatique quotidienne
              </p>
            </div>
            <Switch
              checked={config.auto_backup}
              onCheckedChange={(checked) => setConfig({...config, auto_backup: checked})}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sauvegarde manuelle</Label>
              <p className="text-sm text-muted-foreground">
                Créer une sauvegarde complète maintenant
              </p>
            </div>
            <Button 
              onClick={handleBackup} 
              disabled={loading}
              variant="outline"
            >
              {loading ? 'Création...' : 'Créer une sauvegarde'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Zone de danger */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Zone de Danger
          </CardTitle>
          <CardDescription>
            Actions irréversibles - Soyez prudent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Réinitialiser les données</Label>
              <p className="text-sm text-muted-foreground">
                Supprimer toutes les données (IRRÉVERSIBLE)
              </p>
            </div>
            <Button variant="destructive" disabled>
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Boutons d'action */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Annuler
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>
    </div>
  );
}