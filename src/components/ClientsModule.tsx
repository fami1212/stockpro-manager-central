
import { useState } from 'react';
import { Plus, Search, Mail, Phone, CreditCard, Users, UserCheck, ShoppingBag, Eye, MessageCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ClientModal } from '@/components/ClientModal';
import { PaymentModal } from '@/components/PaymentModal';
import { ClientDetailsModal } from '@/components/ClientDetailsModal';
import { useClientStats } from '@/hooks/useClientStats';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useApp } from '@/contexts/AppContext';
import { Badge } from '@/components/ui/badge';

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

  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === 'Actif').length;
  const averageBasket = clients.length > 0 
    ? clients.reduce((acc, client) => acc + (client.calculatedTotalAmount || 0), 0) / clients.length 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Chargement des clients..." />
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-foreground">Gestion des Clients</h2>
          <p className="text-sm text-muted-foreground mt-1">Gérez vos relations client efficacement</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button onClick={() => setShowPaymentModal(true)} variant="outline" size="sm" className="w-full sm:w-auto gap-2">
            <CreditCard className="w-4 h-4" />
            Paiement
          </Button>
          <Button onClick={() => setShowClientModal(true)} className="w-full sm:w-auto gap-2" size="sm">
            <Plus className="w-4 h-4" />
            Nouveau client
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <div className="dashboard-card p-4 lg:p-6 group hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <Badge variant="secondary" className="text-xs">Total</Badge>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-foreground">{totalClients}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {totalClients > 0 ? `${activeClients} actifs` : 'Aucun client'}
          </p>
        </div>

        <div className="dashboard-card p-4 lg:p-6 group hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserCheck className="w-6 h-6 text-success" />
            </div>
            <Badge className="bg-success/10 text-success hover:bg-success/20 text-xs">Actifs</Badge>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-foreground">{activeClients}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {totalClients > 0 ? `${Math.round((activeClients / totalClients) * 100)}% du total` : '0%'}
          </p>
        </div>

        <div className="dashboard-card p-4 lg:p-6 group hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-info" />
            </div>
            <Badge className="bg-info/10 text-info hover:bg-info/20 text-xs">Moyenne</Badge>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-foreground">{Math.round(averageBasket).toLocaleString()} <span className="text-lg font-medium text-muted-foreground">CFA</span></p>
          <p className="text-sm text-muted-foreground mt-1">Panier moyen par client</p>
        </div>
      </div>

      {/* Search and List */}
      <div className="dashboard-card p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">Filtrer</Button>
        </div>

        {clients.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">Aucun client enregistré</p>
            <Button onClick={() => setShowClientModal(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Ajouter votre premier client
            </Button>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Aucun client ne correspond à votre recherche</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredClients.map((client, index) => (
              <div 
                key={client.id} 
                className="group bg-card border border-border/50 rounded-xl p-4 hover:shadow-lg hover:border-primary/30 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">{client.name}</h3>
                    <Badge 
                      variant="secondary"
                      className={`mt-2 text-xs ${
                        client.status === 'Actif' 
                          ? 'bg-success/10 text-success'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {client.status}
                    </Badge>
                   </div>
                   <div className="text-right ml-2">
                     <p className="text-lg font-bold text-primary">{(client.calculatedTotalAmount || 0).toLocaleString()}</p>
                     <p className="text-xs text-muted-foreground">CFA</p>
                   </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  {client.email && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="w-4 h-4 mr-2 flex-shrink-0 text-primary/60" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 mr-2 flex-shrink-0 text-primary/60" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                </div>
                
                 <div className="border-t border-border/50 pt-3">
                   <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                     <ShoppingBag className="w-3.5 h-3.5" />
                     <span>
                       Dernier achat: {client.calculatedLastOrder 
                         ? new Date(client.calculatedLastOrder).toLocaleDateString('fr-FR')
                         : 'Aucun'}
                     </span>
                   </div>
                   <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-xs gap-1.5 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                        onClick={() => {
                          setSelectedClient(client);
                          setShowDetailsModal(true);
                        }}
                      >
                        <Eye className="w-3.5 h-3.5" />
                       Voir
                     </Button>
                     <Button 
                       variant="outline" 
                       size="sm" 
                       className="flex-1 text-xs gap-1.5 hover:bg-info hover:text-info-foreground hover:border-info"
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
                       <MessageCircle className="w-3.5 h-3.5" />
                       Contacter
                     </Button>
                   </div>
                </div>
              </div>
            ))}
          </div>
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
