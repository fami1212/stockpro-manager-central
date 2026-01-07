
import { useState } from 'react';
import { Plus, Search, Mail, Phone, CreditCard, Users, UserCheck, ShoppingBag, Eye, MessageCircle, TrendingUp, UserPlus, DollarSign, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ClientModal } from '@/components/ClientModal';
import { PaymentModal } from '@/components/PaymentModal';
import { ClientDetailsModal } from '@/components/ClientDetailsModal';
import { useClientStats } from '@/hooks/useClientStats';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useApp } from '@/contexts/AppContext';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/EmptyState';
import { PaginationControls } from '@/components/PaginationControls';
import { usePagination } from '@/hooks/usePagination';

export const ClientsModule = () => {
  const { loading } = useApp();
  const { clients } = useClientStats();
  const [searchTerm, setSearchTerm] = useState('');
  const [showClientModal, setShowClientModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const {
    currentData: paginatedClients,
    currentPage,
    totalPages,
    totalItems,
    hasNextPage,
    hasPreviousPage,
    goToPage
  } = usePagination({
    data: filteredClients,
    itemsPerPage: 12
  });

  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === 'Actif').length;
  const totalRevenue = clients.reduce((acc, client) => acc + (client.calculatedTotalAmount || 0), 0);
  const averageBasket = clients.length > 0 ? totalRevenue / clients.length : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Chargement des clients..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header moderne */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Gestion des Clients</h2>
            <p className="text-sm text-muted-foreground">Gérez vos relations client efficacement</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button 
            onClick={() => setShowPaymentModal(true)} 
            variant="outline" 
            className="gap-2 rounded-xl border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
          >
            <CreditCard className="w-4 h-4" />
            Paiement
          </Button>
          <Button 
            onClick={() => setShowClientModal(true)} 
            className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <UserPlus className="w-4 h-4" />
            Nouveau client
          </Button>
        </div>
      </div>

      {/* Métriques modernes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 p-5 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-blue-500/20">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 text-xs">Total</Badge>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-foreground">{totalClients}</p>
            <p className="text-xs text-muted-foreground mt-1">Clients enregistrés</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 p-5 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20">
                <UserCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 text-xs">
                {totalClients > 0 ? `${Math.round((activeClients / totalClients) * 100)}%` : '0%'}
              </Badge>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-foreground">{activeClients}</p>
            <p className="text-xs text-muted-foreground mt-1">Clients actifs</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 p-5 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 text-xs">Revenue</Badge>
            </div>
            <p className="text-xl md:text-2xl font-bold text-foreground">{totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">CFA total</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/20 p-5 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-purple-500/20">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <Badge variant="secondary" className="bg-purple-500/10 text-purple-700 text-xs">Moyenne</Badge>
            </div>
            <p className="text-xl md:text-2xl font-bold text-foreground">{Math.round(averageBasket).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">CFA / client</p>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-card/50 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-border/50">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 rounded-xl"
            />
          </div>
        </div>

        {clients.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Aucun client enregistré"
            description="Commencez par ajouter votre premier client pour gérer vos relations commerciales."
            actionText="Nouveau client"
            onAction={() => setShowClientModal(true)}
          />
        ) : paginatedClients.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Aucun résultat"
            description="Aucun client ne correspond à vos critères de recherche."
          />
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedClients.map((client, index) => (
                <div 
                  key={client.id} 
                  className="group relative overflow-hidden bg-card border border-border/50 rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Background gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Users className="w-4 h-4 text-primary" />
                          </div>
                          <h3 className="font-semibold text-lg text-foreground truncate group-hover:text-primary transition-colors">{client.name}</h3>
                        </div>
                      </div>
                      <Badge 
                        variant={client.status === 'Actif' ? 'default' : 'secondary'}
                        className={`${
                          client.status === 'Actif' 
                            ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {client.status}
                      </Badge>
                    </div>
                    
                    {/* Métriques du client */}
                    <div className="grid grid-cols-2 gap-3 mb-4 p-4 bg-gradient-to-br from-muted/50 to-muted/20 rounded-xl border border-border/30">
                      <div className="text-center">
                        <p className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                          {(client.calculatedTotalAmount || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">CFA total</p>
                      </div>
                      <div className="text-center border-l border-border/30">
                        <p className="text-xl font-bold text-emerald-600">{client.calculatedTotalOrders || 0}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Commandes</p>
                      </div>
                    </div>
                    
                    {/* Informations de contact */}
                    <div className="space-y-2 mb-4">
                      {client.email && (
                        <div className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                          <div className="p-1.5 rounded-md bg-muted/50 mr-2">
                            <Mail className="w-3.5 h-3.5" />
                          </div>
                          <span className="truncate">{client.email}</span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                          <div className="p-1.5 rounded-md bg-muted/50 mr-2">
                            <Phone className="w-3.5 h-3.5" />
                          </div>
                          <span>{client.phone}</span>
                        </div>
                      )}
                      {client.address && (
                        <div className="flex items-start text-sm text-muted-foreground hover:text-foreground transition-colors">
                          <div className="p-1.5 rounded-md bg-muted/50 mr-2 mt-0.5">
                            <MapPin className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs leading-relaxed">{client.address}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Footer avec dernier achat et actions */}
                    <div className="border-t border-border/30 pt-4">
                      <div className="flex items-center text-xs text-muted-foreground mb-3">
                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                        <span>
                          Dernier achat: {client.calculatedLastOrder 
                            ? new Date(client.calculatedLastOrder).toLocaleDateString('fr-FR')
                            : 'Aucun'
                          }
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 rounded-xl border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-200"
                          onClick={() => {
                            setSelectedClient(client);
                            setShowDetailsModal(true);
                          }}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1.5" />
                          Voir
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 rounded-xl border-border/50 hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30 transition-all duration-200"
                          onClick={() => {
                            if (client.email) {
                              window.open(`mailto:${client.email}?subject=Contact depuis l'application`);
                            } else if (client.phone) {
                              window.open(`tel:${client.phone}`);
                            } else {
                              alert('Aucune information de contact disponible');
                            }
                          }}
                        >
                          <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                          Contacter
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={12}
                onPageChange={goToPage}
                hasNextPage={hasNextPage}
                hasPreviousPage={hasPreviousPage}
              />
            </div>
          </>
        )}
      </div>

      {showClientModal && (
        <ClientModal onClose={() => setShowClientModal(false)} />
      )}

      {showPaymentModal && (
        <PaymentModal 
          onClose={() => setShowPaymentModal(false)} 
          type="client"
        />
      )}

      <ClientDetailsModal
        client={selectedClient}
        open={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedClient(null);
        }}
      />
    </div>
  );
};
