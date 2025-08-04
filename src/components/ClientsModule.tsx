
import { useState } from 'react';
import { Plus, Search, Mail, Phone, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ClientModal } from '@/components/ClientModal';
import { PaymentModal } from '@/components/PaymentModal';
import { useClientStats } from '@/hooks/useClientStats';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useApp } from '@/contexts/AppContext';

export const ClientsModule = () => {
  const { loading } = useApp();
  const { clients } = useClientStats();
  const [searchTerm, setSearchTerm] = useState('');
  const [showClientModal, setShowClientModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Gestion des Clients</h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button onClick={() => setShowPaymentModal(true)} variant="outline" size="sm" className="w-full sm:w-auto">
            <CreditCard className="w-4 h-4 mr-2" />
            Paiement
          </Button>
          <Button onClick={() => setShowClientModal(true)} className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau client
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">Total clients</h3>
          <p className="text-2xl lg:text-3xl font-bold text-purple-600">{totalClients}</p>
          <p className="text-xs lg:text-sm text-gray-500 mt-1">{totalClients > 0 ? `${activeClients} actifs` : 'Aucun client'}</p>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">Clients actifs</h3>
          <p className="text-2xl lg:text-3xl font-bold text-green-600">{activeClients}</p>
          <p className="text-xs lg:text-sm text-gray-500 mt-1">{totalClients > 0 ? `${Math.round((activeClients / totalClients) * 100)}% du total` : '0%'}</p>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">Panier moyen</h3>
          <p className="text-2xl lg:text-3xl font-bold text-blue-600">{Math.round(averageBasket).toLocaleString()} CFA</p>
          <p className="text-xs lg:text-sm text-gray-500 mt-1">Par client</p>
        </div>
      </div>

      <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">Filtrer</Button>
        </div>

        {clients.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Aucun client enregistré</p>
            <Button onClick={() => setShowClientModal(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter votre premier client
            </Button>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucun client ne correspond à votre recherche</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredClients.map((client) => (
              <div key={client.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 truncate">{client.name}</h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      client.status === 'Actif' 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {client.status}
                    </span>
                   </div>
                   <div className="text-right ml-2">
                     <p className="text-lg font-bold text-purple-600">{(client.calculatedTotalAmount || 0).toLocaleString()} CFA</p>
                     <p className="text-xs text-gray-500">Total achats</p>
                   </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  {client.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                </div>
                
                 <div className="border-t pt-3">
                   <p className="text-xs text-gray-500 mb-3">
                     Dernier achat: {client.calculatedLastOrder 
                       ? new Date(client.calculatedLastOrder).toLocaleDateString('fr-FR')
                       : 'Aucun'}
                   </p>
                   <div className="flex flex-col sm:flex-row gap-2">
                     <Button 
                       variant="outline" 
                       size="sm" 
                       className="flex-1 text-xs"
                       onClick={() => {
                         const clientModal = document.createElement('div');
                         clientModal.innerHTML = `
                           <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                             <div class="bg-white p-6 rounded-lg max-w-md w-full m-4">
                               <h3 class="text-lg font-semibold mb-4">Détails du client</h3>
                               <div class="space-y-3">
                                 <p><strong>Nom:</strong> ${client.name}</p>
                                 <p><strong>Email:</strong> ${client.email || 'Non renseigné'}</p>
                                 <p><strong>Téléphone:</strong> ${client.phone || 'Non renseigné'}</p>
                                 <p><strong>Adresse:</strong> ${client.address || 'Non renseignée'}</p>
                                 <p><strong>Statut:</strong> ${client.status}</p>
                                 <p><strong>Total achats:</strong> ${(client.calculatedTotalAmount || 0).toLocaleString()} CFA</p>
                                 <p><strong>Nombre de commandes:</strong> ${client.calculatedTotalOrders || 0}</p>
                                 <p><strong>Dernier achat:</strong> ${client.calculatedLastOrder 
                                   ? new Date(client.calculatedLastOrder).toLocaleDateString('fr-FR') 
                                   : 'Aucun'}</p>
                               </div>
                               <button onclick="this.closest('.fixed').remove()" class="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">Fermer</button>
                             </div>
                           </div>
                         `;
                         document.body.appendChild(clientModal);
                       }}
                     >
                       Voir
                     </Button>
                     <Button 
                       variant="outline" 
                       size="sm" 
                       className="flex-1 text-xs"
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
    </div>
  );
};
