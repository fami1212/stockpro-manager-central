import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Search, Filter, RefreshCw, AlertCircle, Info, AlertTriangle, Bug } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ApplicationLog {
  id: string;
  timestamp: Date;
  level: 'error' | 'warning' | 'info' | 'debug';
  category: string;
  message: string;
  details?: string;
  userId?: string;
  userEmail?: string;
  source: string;
}

export function ApplicationLogs() {
  const [logs, setLogs] = useState<ApplicationLog[]>([
    {
      id: '1',
      timestamp: new Date(),
      level: 'error',
      category: 'API',
      message: 'Failed to fetch products data',
      details: 'Connection timeout after 30 seconds',
      userId: 'user-123',
      userEmail: 'user@example.com',
      source: 'ProductsModule',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 300000),
      level: 'warning',
      category: 'Authentication',
      message: 'Multiple failed login attempts detected',
      details: 'IP: 192.168.1.100, Attempts: 5',
      userEmail: 'suspicious@example.com',
      source: 'AuthService',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 600000),
      level: 'info',
      category: 'System',
      message: 'Database backup completed successfully',
      details: 'Size: 245MB, Duration: 3.2s',
      source: 'BackupService',
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 900000),
      level: 'debug',
      category: 'Performance',
      message: 'Slow query detected',
      details: 'Query execution time: 2.5s for SELECT * FROM sales',
      source: 'DatabaseMonitor',
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 1200000),
      level: 'error',
      category: 'Payment',
      message: 'Payment processing failed',
      details: 'Transaction ID: TRX-12345, Error: Insufficient funds',
      userId: 'user-456',
      userEmail: 'customer@example.com',
      source: 'PaymentGateway',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const getLevelBadge = (level: ApplicationLog['level']) => {
    switch (level) {
      case 'error':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Error
          </Badge>
        );
      case 'warning':
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Warning
          </Badge>
        );
      case 'info':
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 flex items-center gap-1">
            <Info className="h-3 w-3" />
            Info
          </Badge>
        );
      case 'debug':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Bug className="h-3 w-3" />
            Debug
          </Badge>
        );
    }
  };

  const categories = ['all', ...Array.from(new Set(logs.map(log => log.category)))];

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;

    const matchesDateRange =
      (!startDate || log.timestamp >= new Date(startDate)) &&
      (!endDate || log.timestamp <= new Date(endDate));

    return matchesSearch && matchesLevel && matchesCategory && matchesDateRange;
  });

  const handleExport = () => {
    const csvContent = [
      ['Timestamp', 'Level', 'Category', 'Source', 'Message', 'Details', 'User Email'].join(','),
      ...filteredLogs.map(log =>
        [
          log.timestamp.toISOString(),
          log.level,
          log.category,
          log.source,
          `"${log.message}"`,
          `"${log.details || ''}"`,
          log.userEmail || '',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `application-logs-${new Date().toISOString()}.csv`;
    a.click();
    toast.success('Logs exportés avec succès');
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Logs actualisés');
    }, 1000);
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const getLogStats = () => {
    return {
      total: logs.length,
      errors: logs.filter(l => l.level === 'error').length,
      warnings: logs.filter(l => l.level === 'warning').length,
      info: logs.filter(l => l.level === 'info').length,
    };
  };

  const stats = getLogStats();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Erreurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.errors}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Avertissements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.warnings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.info}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Logs Applicatifs</CardTitle>
              <CardDescription>
                Recherchez et analysez les logs de l'application
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              <Button size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher dans les logs..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les niveaux</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat === 'all' ? 'Toutes les catégories' : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">Du:</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-[160px]"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">Au:</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-[160px]"
                />
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              {filteredLogs.length} résultat(s) trouvé(s)
            </div>

            {loading ? (
              <LoadingSpinner size="lg" text="Chargement des logs..." />
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Niveau</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Utilisateur</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Aucun log trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map(log => (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm font-mono">
                            {formatTimestamp(log.timestamp)}
                          </TableCell>
                          <TableCell>{getLevelBadge(log.level)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.category}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {log.source}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-md">
                              <div className="font-medium text-sm">{log.message}</div>
                              {log.details && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {log.details}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {log.userEmail || '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
