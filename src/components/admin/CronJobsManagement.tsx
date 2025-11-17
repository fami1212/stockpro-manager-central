import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle, CheckCircle2, Clock, Play, Pause, Trash2, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface CronJob {
  id: string;
  name: string;
  description: string;
  schedule: string;
  status: 'active' | 'paused' | 'failed';
  lastRun?: Date;
  nextRun?: Date;
  lastStatus?: 'success' | 'error';
  lastError?: string;
  executionCount: number;
  successCount: number;
  errorCount: number;
}

export function CronJobsManagement() {
  const [cronJobs, setCronJobs] = useState<CronJob[]>([
    {
      id: '1',
      name: 'Backup Database',
      description: 'Sauvegarde automatique de la base de données',
      schedule: '0 2 * * *',
      status: 'active',
      lastRun: new Date(Date.now() - 3600000),
      nextRun: new Date(Date.now() + 82800000),
      lastStatus: 'success',
      executionCount: 45,
      successCount: 44,
      errorCount: 1,
    },
    {
      id: '2',
      name: 'Send Reports',
      description: 'Envoi des rapports hebdomadaires par email',
      schedule: '0 8 * * 1',
      status: 'active',
      lastRun: new Date(Date.now() - 86400000 * 2),
      nextRun: new Date(Date.now() + 86400000 * 5),
      lastStatus: 'success',
      executionCount: 12,
      successCount: 12,
      errorCount: 0,
    },
    {
      id: '3',
      name: 'Clean Old Logs',
      description: 'Nettoyage des logs de plus de 30 jours',
      schedule: '0 3 * * 0',
      status: 'active',
      lastRun: new Date(Date.now() - 86400000),
      nextRun: new Date(Date.now() + 86400000 * 6),
      lastStatus: 'error',
      lastError: 'Timeout during cleanup operation',
      executionCount: 8,
      successCount: 7,
      errorCount: 1,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    name: '',
    description: '',
    schedule: '0 0 * * *',
  });

  const getStatusBadge = (status: CronJob['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Actif</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">En pause</Badge>;
      case 'failed':
        return <Badge variant="destructive">Échec</Badge>;
    }
  };

  const getLastStatusIcon = (status?: 'success' | 'error') => {
    if (!status) return <Clock className="h-4 w-4 text-muted-foreground" />;
    return status === 'success' ? (
      <CheckCircle2 className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-destructive" />
    );
  };

  const handleToggleStatus = (id: string) => {
    setCronJobs(jobs =>
      jobs.map(job =>
        job.id === id
          ? { ...job, status: job.status === 'active' ? 'paused' : 'active' }
          : job
      )
    );
    toast.success('Statut de la tâche mis à jour');
  };

  const handleRunNow = (id: string) => {
    const job = cronJobs.find(j => j.id === id);
    toast.success(`Exécution de "${job?.name}" en cours...`);
    
    setTimeout(() => {
      setCronJobs(jobs =>
        jobs.map(j =>
          j.id === id
            ? {
                ...j,
                lastRun: new Date(),
                lastStatus: Math.random() > 0.2 ? 'success' : 'error',
                executionCount: j.executionCount + 1,
                successCount: Math.random() > 0.2 ? j.successCount + 1 : j.successCount,
                errorCount: Math.random() > 0.2 ? j.errorCount : j.errorCount + 1,
              }
            : j
        )
      );
      toast.success('Exécution terminée');
    }, 2000);
  };

  const handleDelete = (id: string) => {
    setCronJobs(jobs => jobs.filter(job => job.id !== id));
    toast.success('Tâche supprimée');
  };

  const handleCreateJob = () => {
    if (!newJob.name || !newJob.schedule) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const job: CronJob = {
      id: Date.now().toString(),
      name: newJob.name,
      description: newJob.description,
      schedule: newJob.schedule,
      status: 'active',
      executionCount: 0,
      successCount: 0,
      errorCount: 0,
    };

    setCronJobs([...cronJobs, job]);
    setIsDialogOpen(false);
    setNewJob({ name: '', description: '', schedule: '0 0 * * *' });
    toast.success('Tâche planifiée créée');
  };

  const formatDate = (date?: Date) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getSuccessRate = (job: CronJob) => {
    if (job.executionCount === 0) return 0;
    return Math.round((job.successCount / job.executionCount) * 100);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <LoadingSpinner size="lg" text="Chargement des tâches planifiées..." />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tâches Planifiées (Cron Jobs)</CardTitle>
              <CardDescription>
                Gérez et surveillez vos tâches automatisées
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle tâche
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer une tâche planifiée</DialogTitle>
                  <DialogDescription>
                    Configurez une nouvelle tâche automatisée
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom *</Label>
                    <Input
                      id="name"
                      value={newJob.name}
                      onChange={e => setNewJob({ ...newJob, name: e.target.value })}
                      placeholder="Nom de la tâche"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newJob.description}
                      onChange={e => setNewJob({ ...newJob, description: e.target.value })}
                      placeholder="Description de la tâche"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schedule">Planning Cron *</Label>
                    <Input
                      id="schedule"
                      value={newJob.schedule}
                      onChange={e => setNewJob({ ...newJob, schedule: e.target.value })}
                      placeholder="0 0 * * *"
                    />
                    <p className="text-sm text-muted-foreground">
                      Format: minute heure jour mois jour_semaine
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreateJob}>Créer</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Planning</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Dernière exécution</TableHead>
                <TableHead>Prochaine exécution</TableHead>
                <TableHead>Taux de succès</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cronJobs.map(job => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{job.name}</div>
                      <div className="text-sm text-muted-foreground">{job.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{job.schedule}</code>
                  </TableCell>
                  <TableCell>{getStatusBadge(job.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getLastStatusIcon(job.lastStatus)}
                      <span className="text-sm">{formatDate(job.lastRun)}</span>
                    </div>
                    {job.lastError && (
                      <div className="text-xs text-destructive mt-1">{job.lastError}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(job.nextRun)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">{getSuccessRate(job)}%</div>
                      <div className="text-xs text-muted-foreground">
                        ({job.successCount}/{job.executionCount})
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRunNow(job.id)}
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(job.id)}
                      >
                        {job.status === 'active' ? (
                          <Pause className="h-3 w-3" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(job.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total des tâches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cronJobs.length}</div>
            <p className="text-xs text-muted-foreground">
              {cronJobs.filter(j => j.status === 'active').length} actives
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Exécutions totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cronJobs.reduce((sum, job) => sum + job.executionCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Toutes les tâches confondues</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taux de succès global</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                (cronJobs.reduce((sum, job) => sum + job.successCount, 0) /
                  Math.max(cronJobs.reduce((sum, job) => sum + job.executionCount, 0), 1)) *
                  100
              )}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {cronJobs.reduce((sum, job) => sum + job.errorCount, 0)} erreurs au total
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
