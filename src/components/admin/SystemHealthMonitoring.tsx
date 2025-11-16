import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, AlertTriangle, CheckCircle, Database, HardDrive, Server, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SystemMetric {
  name: string;
  value: number;
  status: 'healthy' | 'warning' | 'critical';
  icon: any;
  unit: string;
}

export function SystemHealthMonitoring() {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    { name: 'Utilisation CPU', value: 0, status: 'healthy', icon: Server, unit: '%' },
    { name: 'Mémoire', value: 0, status: 'healthy', icon: HardDrive, unit: '%' },
    { name: 'Base de données', value: 0, status: 'healthy', icon: Database, unit: 'MB' },
    { name: 'Utilisateurs actifs', value: 0, status: 'healthy', icon: Users, unit: '' },
  ]);
  const [alerts, setAlerts] = useState<Array<{ type: string; message: string }>>([]);

  useEffect(() => {
    loadSystemMetrics();
    const interval = setInterval(loadSystemMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSystemMetrics = async () => {
    try {
      // Simulate system metrics (in production, these would come from actual monitoring)
      const cpuUsage = Math.random() * 100;
      const memoryUsage = Math.random() * 100;
      const dbSize = Math.random() * 1000;

      // Get active users count
      const { count: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('account_status', 'active');

      const newMetrics: SystemMetric[] = [
        {
          name: 'Utilisation CPU',
          value: Math.round(cpuUsage),
          status: cpuUsage > 80 ? 'critical' : cpuUsage > 60 ? 'warning' : 'healthy',
          icon: Server,
          unit: '%',
        },
        {
          name: 'Mémoire',
          value: Math.round(memoryUsage),
          status: memoryUsage > 85 ? 'critical' : memoryUsage > 70 ? 'warning' : 'healthy',
          icon: HardDrive,
          unit: '%',
        },
        {
          name: 'Base de données',
          value: Math.round(dbSize),
          status: dbSize > 800 ? 'critical' : dbSize > 600 ? 'warning' : 'healthy',
          icon: Database,
          unit: 'MB',
        },
        {
          name: 'Utilisateurs actifs',
          value: activeUsers || 0,
          status: 'healthy',
          icon: Users,
          unit: '',
        },
      ];

      setMetrics(newMetrics);

      // Generate alerts for critical metrics
      const newAlerts: Array<{ type: string; message: string }> = [];
      newMetrics.forEach((metric) => {
        if (metric.status === 'critical') {
          newAlerts.push({
            type: 'critical',
            message: `${metric.name} est en état critique (${metric.value}${metric.unit})`,
          });
        } else if (metric.status === 'warning') {
          newAlerts.push({
            type: 'warning',
            message: `${metric.name} nécessite une attention (${metric.value}${metric.unit})`,
          });
        }
      });

      setAlerts(newAlerts);
    } catch (error) {
      console.error('Error loading system metrics:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les métriques système',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-500">Sain</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500">Attention</Badge>;
      case 'critical':
        return <Badge className="bg-red-500">Critique</Badge>;
      default:
        return <Badge>Inconnu</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Monitoring de la Santé du Système
          </CardTitle>
          <CardDescription>
            Métriques de performance en temps réel et alertes système
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length > 0 && (
            <div className="mb-6 space-y-2">
              {alerts.map((alert, index) => (
                <Alert key={index} variant={alert.type === 'critical' ? 'destructive' : 'default'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{alert.message}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 ${getStatusColor(metric.status)}`} />
                        <CardTitle className="text-base">{metric.name}</CardTitle>
                      </div>
                      {getStatusBadge(metric.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">
                          {metric.value}
                          {metric.unit}
                        </span>
                        {metric.status === 'healthy' && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        {metric.status === 'warning' && (
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        )}
                        {metric.status === 'critical' && (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      {metric.unit === '%' && (
                        <Progress
                          value={metric.value}
                          className={
                            metric.status === 'critical'
                              ? '[&>div]:bg-red-500'
                              : metric.status === 'warning'
                              ? '[&>div]:bg-yellow-500'
                              : '[&>div]:bg-green-500'
                          }
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
