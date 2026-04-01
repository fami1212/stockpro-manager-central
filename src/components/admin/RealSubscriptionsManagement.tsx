import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Search, Users, CreditCard, TrendingUp, AlertCircle, Crown, Zap, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { UserStatsModal } from './UserStatsModal';

interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  price_monthly: number;
  currency: string;
}

interface UserWithSubscription {
  id: string;
  user_id: string;
  email: string;
  name: string;
  company: string;
  subscription_plan: string;
  plan_display_name: string;
  plan_id: string | null;
  sub_status: string;
  trial_end: string | null;
  created_at: string;
  last_login: string | null;
  account_status: string;
}

export function RealSubscriptionsManagement() {
  const [users, setUsers] = useState<UserWithSubscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch plans
      const { data: plansData } = await supabase
        .from('subscription_plans' as any)
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      const fetchedPlans = (plansData || []) as any[];
      setPlans(fetchedPlans);

      // Fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*');

      // Fetch subscriptions
      const { data: subscriptions } = await supabase
        .from('user_subscriptions' as any)
        .select('*');

      const subsMap = new Map((subscriptions || []).map((s: any) => [s.user_id, s]));

      const usersData: UserWithSubscription[] = (profiles || []).map((profile: any) => {
        const sub = subsMap.get(profile.id) as any;
        const plan = sub ? fetchedPlans.find((p: any) => p.id === sub.plan_id) : null;

        return {
          id: profile.id,
          user_id: profile.id,
          email: profile.email || 'N/A',
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'N/A',
          company: profile.company || 'N/A',
          subscription_plan: plan?.name || sub?.status || profile.subscription_plan || 'trial',
          plan_display_name: plan?.display_name || 'Essai',
          plan_id: sub?.plan_id || null,
          sub_status: sub?.status || 'trial',
          trial_end: sub?.trial_end || null,
          created_at: profile.created_at,
          last_login: profile.last_login,
          account_status: profile.account_status || 'active',
        };
      });

      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: 'Erreur', description: 'Impossible de charger les données', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const assignPlan = async (userId: string, planName: string) => {
    try {
      const plan = plans.find((p: any) => p.name === planName);
      if (!plan) return;

      // Check if subscription exists
      const { data: existingSub } = await supabase
        .from('user_subscriptions' as any)
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingSub) {
        await supabase
          .from('user_subscriptions' as any)
          .update({
            plan_id: plan.id,
            status: planName === 'trial' ? 'trial' : 'active',
            subscription_start: planName !== 'trial' ? new Date().toISOString() : null,
            activated_by: (await supabase.auth.getUser()).data.user?.id,
            updated_at: new Date().toISOString(),
          } as any)
          .eq('user_id', userId);
      } else {
        await supabase
          .from('user_subscriptions' as any)
          .insert({
            user_id: userId,
            plan_id: plan.id,
            status: planName === 'trial' ? 'trial' : 'active',
            subscription_start: planName !== 'trial' ? new Date().toISOString() : null,
            activated_by: (await supabase.auth.getUser()).data.user?.id,
          } as any);
      }

      // Also update profiles for backward compatibility
      await supabase.from('profiles').update({ subscription_plan: planName }).eq('id', userId);

      toast({ title: 'Plan mis à jour', description: `Utilisateur passé en ${plan.display_name}` });
      fetchData();
    } catch (error) {
      console.error('Error assigning plan:', error);
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour le plan', variant: 'destructive' });
    }
  };

  const suspendUser = async (userId: string) => {
    try {
      await supabase.from('profiles').update({ account_status: 'suspended' }).eq('id', userId);
      await supabase.from('user_subscriptions' as any).update({ status: 'cancelled' } as any).eq('user_id', userId);
      toast({ title: 'Utilisateur suspendu' });
      fetchData();
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de suspendre', variant: 'destructive' });
    }
  };

  const restoreUser = async (userId: string) => {
    try {
      await supabase.from('profiles').update({ account_status: 'active' }).eq('id', userId);
      toast({ title: 'Utilisateur restauré' });
      fetchData();
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de restaurer', variant: 'destructive' });
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPlanBadge = (planName: string) => {
    const config: Record<string, { icon: any; className: string; label: string }> = {
      trial: { icon: Clock, className: 'bg-yellow-100 text-yellow-800', label: 'Essai' },
      pro: { icon: Zap, className: 'bg-blue-100 text-blue-800', label: 'Pro' },
      premium: { icon: Crown, className: 'bg-amber-100 text-amber-800', label: 'Premium' },
    };
    const c = config[planName] || config.trial;
    const Icon = c.icon;
    return (
      <Badge className={c.className}>
        <Icon className="h-3 w-3 mr-1" />
        {c.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      trial: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800',
      cancelled: 'bg-red-100 text-red-800',
      suspended: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      active: 'Actif',
      trial: 'Essai',
      expired: 'Expiré',
      cancelled: 'Annulé',
      suspended: 'Suspendu',
    };
    return <Badge className={colors[status] || colors.trial}>{labels[status] || status}</Badge>;
  };

  // Stats
  const activeCount = users.filter(u => u.sub_status === 'active').length;
  const trialCount = users.filter(u => u.sub_status === 'trial').length;
  const premiumCount = users.filter(u => u.subscription_plan === 'premium').length;

  if (loading) {
    return <div className="flex items-center justify-center p-8">Chargement des abonnements...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abonnés Actifs</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Essai</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trialCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{premiumCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Abonnements</CardTitle>
          <CardDescription>Gérez les plans et accès des utilisateurs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Entreprise</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Fin essai</TableHead>
                <TableHead>Inscription</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{user.company}</TableCell>
                  <TableCell>{getPlanBadge(user.subscription_plan)}</TableCell>
                  <TableCell>{getStatusBadge(user.account_status === 'suspended' ? 'suspended' : user.sub_status)}</TableCell>
                  <TableCell>
                    {user.trial_end
                      ? format(new Date(user.trial_end), 'dd/MM/yyyy HH:mm', { locale: fr })
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => assignPlan(user.user_id, 'trial')}>
                          <Clock className="h-4 w-4 mr-2" /> Essai Gratuit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => assignPlan(user.user_id, 'pro')}>
                          <Zap className="h-4 w-4 mr-2" /> Plan Pro
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => assignPlan(user.user_id, 'premium')}>
                          <Crown className="h-4 w-4 mr-2" /> Plan Premium
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.account_status === 'suspended' ? (
                          <DropdownMenuItem onClick={() => restoreUser(user.user_id)} className="text-green-600">
                            Restaurer
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => suspendUser(user.user_id)} className="text-destructive">
                            Suspendre
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {
                          setSelectedUser({ id: user.user_id, name: user.name, email: user.email });
                          setShowStatsModal(true);
                        }}>
                          Voir les statistiques
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedUser && (
        <UserStatsModal
          open={showStatsModal}
          onOpenChange={setShowStatsModal}
          userId={selectedUser.id}
          userName={selectedUser.name}
          userEmail={selectedUser.email}
        />
      )}
    </div>
  );
}
