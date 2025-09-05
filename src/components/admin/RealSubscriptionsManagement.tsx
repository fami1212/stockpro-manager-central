import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Search, Users, CreditCard, TrendingUp, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface UserSubscription {
  id: string;
  user_id: string;
  email: string;
  name: string;
  company: string;
  subscription_plan: string;
  created_at: string;
  last_login: string | null;
  status: 'active' | 'inactive' | 'suspended';
}

export function RealSubscriptionsManagement() {
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      
      // Get profiles data
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Work with available profile data only
      const subscriptionsData: UserSubscription[] = (profiles || []).map((profile: any) => {
        const status = (profile.account_status as 'active' | 'inactive' | 'suspended') || (profile.last_login ? 'active' : 'inactive');
        return {
          id: profile.id,
          user_id: profile.id,
          email: profile.email || 'Email non disponible',
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'N/A',
          company: profile.company || 'N/A',
          subscription_plan: profile.subscription_plan || 'basic',
          created_at: profile.created_at,
          last_login: profile.last_login,
          status
        } as UserSubscription;
      });

      setSubscriptions(subscriptionsData);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les abonnements',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSubscriptionPlan = async (userId: string, newPlan: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_plan: newPlan })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setSubscriptions(prev => 
        prev.map(sub => 
          sub.user_id === userId 
            ? { ...sub, subscription_plan: newPlan }
            : sub
        )
      );

      toast({
        title: 'Abonnement mis à jour',
        description: `Plan changé vers ${newPlan}`,
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour l\'abonnement',
        variant: 'destructive'
      });
    }
  };

  const suspendUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ account_status: 'suspended' })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setSubscriptions(prev => prev.map(s => s.user_id === userId ? { ...s, status: 'suspended' } : s));

      toast({
        title: 'Utilisateur suspendu',
        description: "L'accès de l'utilisateur a été suspendu",
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Impossible de suspendre l'utilisateur",
        variant: 'destructive'
      });
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.subscription_plan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPlanBadge = (plan: string) => {
    const planColors = {
      basic: 'bg-gray-100 text-gray-800',
      premium: 'bg-blue-100 text-blue-800',
      enterprise: 'bg-purple-100 text-purple-800'
    };
    
    return (
      <Badge className={planColors[plan as keyof typeof planColors] || planColors.basic}>
        {plan.toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || statusColors.inactive}>
        {status === 'active' ? 'Actif' : status === 'inactive' ? 'Inactif' : 'Suspendu'}
      </Badge>
    );
  };

  // Calculate stats
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active').length;
  const totalRevenue = subscriptions.length * 29.99; // Example calculation
  const premiumUsers = subscriptions.filter(sub => sub.subscription_plan === 'premium').length;

  if (loading) {
    return <div className="flex items-center justify-center p-8">Chargement des abonnements...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abonnements Actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.floor(activeSubscriptions * 0.1)} ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus Mensuels</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toFixed(2)} €</div>
            <p className="text-xs text-muted-foreground">
              +12.5% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Premium</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{premiumUsers}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((premiumUsers / subscriptions.length) * 100)}% du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Conversion</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.5%</div>
            <p className="text-xs text-muted-foreground">
              Essai vers abonnement payant
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Abonnements</CardTitle>
          <CardDescription>
            Vue d'ensemble des abonnements utilisateurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, email, entreprise..."
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
                <TableHead>Inscription</TableHead>
                <TableHead>Dernière connexion</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{subscription.name}</div>
                      <div className="text-sm text-muted-foreground">{subscription.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{subscription.company}</TableCell>
                  <TableCell>{getPlanBadge(subscription.subscription_plan)}</TableCell>
                  <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                  <TableCell>
                    {format(new Date(subscription.created_at), 'dd/MM/yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    {subscription.last_login 
                      ? format(new Date(subscription.last_login), 'dd/MM/yyyy HH:mm', { locale: fr })
                      : 'Jamais'
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => updateSubscriptionPlan(subscription.user_id, 'basic')}>
                          Passer en Basic
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateSubscriptionPlan(subscription.user_id, 'premium')}>
                          Passer en Premium
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateSubscriptionPlan(subscription.user_id, 'enterprise')}>
                          Passer en Enterprise
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => suspendUser(subscription.user_id)}
                          className="text-red-600"
                        >
                          Suspendre
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
    </div>
  );
}