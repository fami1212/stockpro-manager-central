
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, MoreVertical, CreditCard, Calendar, Euro } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Subscription {
  id: string;
  userEmail: string;
  userName: string;
  plan: 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'past_due';
  price: number;
  startDate: string;
  nextBilling: string;
  paymentMethod: string;
}

const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    userEmail: 'jean.dupont@entreprise.com',
    userName: 'Jean Dupont',
    plan: 'pro',
    status: 'active',
    price: 59,
    startDate: '2024-01-15',
    nextBilling: '2024-02-15',
    paymentMethod: 'Visa **** 1234'
  },
  {
    id: '2',
    userEmail: 'marie.martin@startup.com',
    userName: 'Marie Martin',
    plan: 'basic',
    status: 'active',
    price: 29,
    startDate: '2024-01-10',
    nextBilling: '2024-02-10',
    paymentMethod: 'MasterCard **** 5678'
  },
  {
    id: '3',
    userEmail: 'p.dubois@corporation.com',
    userName: 'Pierre Dubois',
    plan: 'enterprise',
    status: 'past_due',
    price: 99,
    startDate: '2024-01-05',
    nextBilling: '2024-02-05',
    paymentMethod: 'Visa **** 9012'
  }
];

export function SubscriptionsManagement() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(mockSubscriptions);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.plan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPlanBadge = (plan: Subscription['plan']) => {
    switch (plan) {
      case 'basic':
        return <Badge className="bg-blue-100 text-blue-800">Basic</Badge>;
      case 'pro':
        return <Badge className="bg-green-100 text-green-800">Pro</Badge>;
      case 'enterprise':
        return <Badge className="bg-purple-100 text-purple-800">Enterprise</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  const getStatusBadge = (status: Subscription['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Annulé</Badge>;
      case 'past_due':
        return <Badge className="bg-yellow-100 text-yellow-800">En retard</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  const handleSubscriptionAction = (subscriptionId: string, action: string) => {
    const subscription = subscriptions.find(s => s.id === subscriptionId);
    
    switch (action) {
      case 'cancel':
        setSubscriptions(prev => prev.map(s => 
          s.id === subscriptionId ? { ...s, status: 'cancelled' as const } : s
        ));
        toast({
          title: 'Abonnement annulé',
          description: `L'abonnement de ${subscription?.userName} a été annulé`
        });
        break;
      case 'reactivate':
        setSubscriptions(prev => prev.map(s => 
          s.id === subscriptionId ? { ...s, status: 'active' as const } : s
        ));
        toast({
          title: 'Abonnement réactivé',
          description: `L'abonnement de ${subscription?.userName} a été réactivé`
        });
        break;
    }
  };

  const totalRevenue = subscriptions
    .filter(sub => sub.status === 'active')
    .reduce((sum, sub) => sum + sub.price, 0);

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus Mensuels</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {subscriptions.filter(s => s.status === 'active').length} abonnements actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abonnements en Retard</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptions.filter(s => s.status === 'past_due').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Nécessitent une attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'Annulation</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((subscriptions.filter(s => s.status === 'cancelled').length / subscriptions.length) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Ce mois-ci
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des abonnements */}
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Abonnements</CardTitle>
          <CardDescription>
            Suivez et gérez tous les abonnements clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un abonnement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Début</TableHead>
                  <TableHead>Prochaine facturation</TableHead>
                  <TableHead>Paiement</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{subscription.userName}</div>
                        <div className="text-sm text-gray-500">{subscription.userEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getPlanBadge(subscription.plan)}</TableCell>
                    <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                    <TableCell>€{subscription.price}/mois</TableCell>
                    <TableCell>{new Date(subscription.startDate).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>{new Date(subscription.nextBilling).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>{subscription.paymentMethod}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {subscription.status === 'cancelled' ? (
                            <DropdownMenuItem onClick={() => handleSubscriptionAction(subscription.id, 'reactivate')}>
                              Réactiver
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleSubscriptionAction(subscription.id, 'cancel')}>
                              Annuler
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            Modifier le plan
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Voir les paiements
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
