import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GitBranch, Download, Upload, RotateCcw, Tag, CheckCircle, AlertTriangle, Clock, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Version {
  id: string;
  version: string;
  date: Date;
  author: string;
  description: string;
  changes: string[];
  status: 'stable' | 'beta' | 'deprecated';
  isCurrent: boolean;
}

export function VersionManagement() {
  const { toast } = useToast();
  const [versions, setVersions] = useState<Version[]>([
    {
      id: '1',
      version: '1.3.0',
      date: new Date('2024-01-15'),
      author: 'Admin',
      description: 'Ajout des fonctionnalités de promotions et de retours produits',
      changes: [
        'Nouveau module de gestion des promotions',
        'Système de retours produits avec traçabilité',
        'Amélioration des performances',
        'Corrections de bugs mineurs',
      ],
      status: 'stable',
      isCurrent: true,
    },
    {
      id: '2',
      version: '1.2.1',
      date: new Date('2024-01-08'),
      author: 'Admin',
      description: 'Correctifs de sécurité et améliorations mineures',
      changes: [
        'Patch de sécurité pour authentification',
        'Optimisation des requêtes base de données',
        'Amélioration de l\'interface utilisateur',
      ],
      status: 'stable',
      isCurrent: false,
    },
    {
      id: '3',
      version: '1.2.0',
      date: new Date('2023-12-20'),
      author: 'Admin',
      description: 'Nouvelle interface et fonctionnalités de reporting',
      changes: [
        'Refonte complète de l\'interface',
        'Module de rapports avancés',
        'Export Excel amélioré',
        'Graphiques interactifs',
      ],
      status: 'stable',
      isCurrent: false,
    },
    {
      id: '4',
      version: '1.1.0',
      date: new Date('2023-11-15'),
      author: 'Admin',
      description: 'Ajout de la gestion des fournisseurs',
      changes: [
        'Module de gestion des fournisseurs',
        'Bons de commande',
        'Suivi des réceptions',
      ],
      status: 'deprecated',
      isCurrent: false,
    },
  ]);
  const [newVersionOpen, setNewVersionOpen] = useState(false);
  const [rollbackConfirmOpen, setRollbackConfirmOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [newVersion, setNewVersion] = useState({
    version: '',
    description: '',
    changes: '',
  });

  const handleCreateVersion = () => {
    if (!newVersion.version || !newVersion.description) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    const version: Version = {
      id: Date.now().toString(),
      version: newVersion.version,
      date: new Date(),
      author: 'Admin',
      description: newVersion.description,
      changes: newVersion.changes.split('\n').filter((c) => c.trim() !== ''),
      status: 'stable',
      isCurrent: false,
    };

    setVersions((prev) => [version, ...prev]);
    setNewVersionOpen(false);
    setNewVersion({ version: '', description: '', changes: '' });

    toast({
      title: 'Version créée',
      description: `La version ${version.version} a été créée avec succès`,
    });
  };

  const handleRollback = (version: Version) => {
    // Simuler un rollback
    setVersions((prev) =>
      prev.map((v) => ({
        ...v,
        isCurrent: v.id === version.id,
      }))
    );

    setRollbackConfirmOpen(false);
    setSelectedVersion(null);

    toast({
      title: 'Rollback effectué',
      description: `L'application a été restaurée à la version ${version.version}`,
    });
  };

  const getStatusBadge = (status: Version['status']) => {
    switch (status) {
      case 'stable':
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Stable
          </Badge>
        );
      case 'beta':
        return (
          <Badge className="bg-blue-500">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Beta
          </Badge>
        );
      case 'deprecated':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Obsolète
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Versions</h2>
          <p className="text-muted-foreground">
            Historique des versions et rollback
          </p>
        </div>
        <Dialog open={newVersionOpen} onOpenChange={setNewVersionOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Créer une Version
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer une Nouvelle Version</DialogTitle>
              <DialogDescription>
                Enregistrer l'état actuel comme nouvelle version
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="version">Numéro de Version *</Label>
                <Input
                  id="version"
                  placeholder="ex: 1.4.0"
                  value={newVersion.version}
                  onChange={(e) =>
                    setNewVersion({ ...newVersion, version: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  placeholder="Résumé des changements"
                  value={newVersion.description}
                  onChange={(e) =>
                    setNewVersion({ ...newVersion, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="changes">Changelog (un changement par ligne)</Label>
                <Textarea
                  id="changes"
                  placeholder="- Nouvelle fonctionnalité X&#10;- Correction du bug Y&#10;- Amélioration de Z"
                  rows={6}
                  value={newVersion.changes}
                  onChange={(e) =>
                    setNewVersion({ ...newVersion, changes: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewVersionOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateVersion}>Créer la Version</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Version actuelle */}
      {versions.find((v) => v.isCurrent) && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
          <Tag className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-400">
            Version actuelle:{' '}
            <strong>{versions.find((v) => v.isCurrent)?.version}</strong>
          </AlertDescription>
        </Alert>
      )}

      {/* Liste des versions */}
      <div className="space-y-4">
        {versions.map((version, index) => (
          <Card
            key={version.id}
            className={version.isCurrent ? 'border-green-500' : ''}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">Version {version.version}</CardTitle>
                    {version.isCurrent && (
                      <Badge variant="outline" className="border-green-500 text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Actuelle
                      </Badge>
                    )}
                    {getStatusBadge(version.status)}
                  </div>
                  <CardDescription>
                    {format(version.date, 'PPP', { locale: fr })} par {version.author}
                  </CardDescription>
                </div>
                {!version.isCurrent && version.status !== 'deprecated' && (
                  <Dialog
                    open={rollbackConfirmOpen && selectedVersion?.id === version.id}
                    onOpenChange={(open) => {
                      setRollbackConfirmOpen(open);
                      if (!open) setSelectedVersion(null);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedVersion(version)}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Rollback
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirmer le Rollback</DialogTitle>
                        <DialogDescription>
                          Êtes-vous sûr de vouloir restaurer l'application à la version{' '}
                          {version.version} ? Cette action peut affecter les données récentes.
                        </DialogDescription>
                      </DialogHeader>
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Attention : Cette action peut entraîner une perte de données si des
                          modifications de schéma ont été effectuées depuis cette version.
                        </AlertDescription>
                      </Alert>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setRollbackConfirmOpen(false);
                            setSelectedVersion(null);
                          }}
                        >
                          Annuler
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleRollback(version)}
                        >
                          Confirmer le Rollback
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">{version.description}</p>

              {version.changes.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      Changelog
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {version.changes.map((change, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger
                </Button>
                <Button variant="outline" size="sm">
                  <GitBranch className="mr-2 h-4 w-4" />
                  Voir les Détails
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
