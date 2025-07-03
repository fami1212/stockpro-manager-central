import { useState } from 'react';
import { Plus, Search, Calendar, FileText, CreditCard, Receipt, Eye, Printer, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { SaleModal } from '@/components/SaleModal';

export const SalesModule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('sales');
  const [showNewSale, setShowNewSale] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  const sales = [
    { 
      id: 'V-001', 
      date: '2024-01-15', 
      time: '14:30',
      client: 'Marie Dupont', 
      total: 1299, 
      paid: 1299,
      remaining: 0,
      status: 'Payée', 
      items: 2,
      paymentMethod: 'Carte bancaire',
      discount: 0,
      tax: 259.80,
      type: 'Facture'
    },
    { 
      id: 'V-002', 
      date: '2024-01-15', 
      time: '16:45',
      client: 'Pierre Martin', 
      total: 799, 
      paid: 400,
      remaining: 399,
      status: 'Partiellement payée', 
      items: 1,
      paymentMethod: 'Espèces + Crédit',
      discount: 50,
      tax: 159.80,
      type: 'Facture'
    },
    { 
      id: 'D-003', 
      date: '2024-01-14', 
      time: '10:15',
      client: 'Sophie Bernard', 
      total: 2400, 
      paid: 0,
      remaining: 2400,
      status: 'Devis', 
      items: 3,
      paymentMethod: '-',
      discount: 100,
      tax: 480,
      type: 'Devis'
    },
    { 
      id: 'V-004', 
      date: '2024-01-14', 
      time: '11:30',
      client: 'Lucas Moreau', 
      total: 450, 
      paid: 450,
      remaining: 0,
      status: 'Payée', 
      items: 1,
      paymentMethod: 'Virement',
      discount: 0,
      tax: 90,
      type: 'Facture'
    },
  ];

  const quotes = sales.filter(s => s.type === 'Devis');
  const invoices = sales.filter(s => s.type === 'Facture');
  const pendingPayments = sales.filter(s => s.remaining > 0 && s.type === 'Facture');

  const periods = [
    { value: 'today', label: 'Aujourd\'hui' },
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'quarter', label: 'Ce trimestre' },
    { value: 'year', label: 'Cette année' },
  ];

  const getTotalSales = () => sales.filter(s => s.type === 'Facture').reduce((acc, sale) => acc + sale.total, 0);
  const getTotalPaid = () => sales.filter(s => s.type === 'Facture').reduce((acc, sale) => acc + sale.paid, 0);
  const getTotalPending = () => sales.filter(s => s.type === 'Facture').reduce((acc, sale) => acc + sale.remaining, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Payée': return 'bg-green-100 text-green-700';
      case 'Partiellement payée': return 'bg-yellow-100 text-yellow-700';
      case 'En attente': return 'bg-orange-100 text-orange-700';
      case 'Devis': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Ventes</h2>
        <div className="flex space-x-2">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Nouveau devis
          </Button>
          <Button onClick={() => setShowNewSale(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle vente
          </Button>
        </div>
      </div>

      {/* Indicateurs clés */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">CA Total</h3>
          <p className="text-3xl font-bold text-green-600">€{getTotalSales().toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">{invoices.length} factures</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Encaissé</h3>
          <p className="text-3xl font-bold text-blue-600">€{getTotalPaid().toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">Paiements reçus</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">En attente</h3>
          <p className="text-3xl font-bold text-orange-600">€{getTotalPending().toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">{pendingPayments.length} impayées</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Devis en cours</h3>
          <p className="text-3xl font-bold text-purple-600">{quotes.length}</p>
          <p className="text-sm text-gray-500 mt-1">À convertir</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">Toutes les ventes</TabsTrigger>
          <TabsTrigger value="invoices">Factures</TabsTrigger>
          <TabsTrigger value="quotes">Devis</TabsTrigger>
          <TabsTrigger value="payments">Paiements</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex space-x-4 mb-6">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Rechercher une vente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Filtrer par date
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">N° Document</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Date/Heure</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Client</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Articles</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Total HT</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Payé</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Restant</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Statut</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-blue-600">{sale.id}</div>
                        <div className="text-xs text-gray-500">{sale.type}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        <div>{sale.date}</div>
                        <div className="text-xs text-gray-500">{sale.time}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-900">{sale.client}</td>
                      <td className="py-3 px-4 text-gray-600">{sale.items} article(s)</td>
                      <td className="py-3 px-4 font-medium text-gray-900">€{(sale.total - sale.tax).toFixed(2)}</td>
                      <td className="py-3 px-4 font-medium text-green-600">€{sale.paid.toFixed(2)}</td>
                      <td className="py-3 px-4 font-medium text-orange-600">€{sale.remaining.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(sale.status)}>
                          {sale.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Printer className="w-4 h-4" />
                          </Button>
                          {sale.remaining > 0 && (
                            <Button variant="outline" size="sm">
                              <CreditCard className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="outline" size="sm" className="text-red-600">
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex space-x-4 mb-6">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Rechercher une facture..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Filtrer par date
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">N° Facture</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Date/Heure</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Client</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Articles</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Total HT</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Payé</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Restant</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Statut</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((sale) => (
                    <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-blue-600">{sale.id}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        <div>{sale.date}</div>
                        <div className="text-xs text-gray-500">{sale.time}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-900">{sale.client}</td>
                      <td className="py-3 px-4 text-gray-600">{sale.items} article(s)</td>
                      <td className="py-3 px-4 font-medium text-gray-900">€{(sale.total - sale.tax).toFixed(2)}</td>
                      <td className="py-3 px-4 font-medium text-green-600">€{sale.paid.toFixed(2)}</td>
                      <td className="py-3 px-4 font-medium text-orange-600">€{sale.remaining.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(sale.status)}>
                          {sale.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Printer className="w-4 h-4" />
                          </Button>
                          {sale.remaining > 0 && (
                            <Button variant="outline" size="sm">
                              <CreditCard className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="outline" size="sm" className="text-red-600">
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="quotes" className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex space-x-4 mb-6">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Rechercher un devis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Filtrer par date
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">N° Devis</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Date/Heure</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Client</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Articles</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Total HT</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Statut</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quotes.map((sale) => (
                    <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-blue-600">{sale.id}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        <div>{sale.date}</div>
                        <div className="text-xs text-gray-500">{sale.time}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-900">{sale.client}</td>
                      <td className="py-3 px-4 text-gray-600">{sale.items} article(s)</td>
                      <td className="py-3 px-4 font-medium text-gray-900">€{(sale.total - sale.tax).toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(sale.status)}>
                          {sale.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Printer className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileText className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex space-x-4 mb-6">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Rechercher un paiement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Filtrer par date
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">N° Facture</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Date/Heure</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Client</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Montant payé</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Méthode</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.filter(s => s.paid > 0).map((sale) => (
                    <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-blue-600">{sale.id}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        <div>{sale.date}</div>
                        <div className="text-xs text-gray-500">{sale.time}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-900">{sale.client}</td>
                      <td className="py-3 px-4 font-medium text-green-600">€{sale.paid.toFixed(2)}</td>
                      <td className="py-3 px-4 text-gray-600">{sale.paymentMethod}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Printer className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {showNewSale && (
        <SaleModal onClose={() => setShowNewSale(false)} />
      )}
    </div>
  );
};
