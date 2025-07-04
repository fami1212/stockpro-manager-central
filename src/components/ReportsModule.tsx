
import { useState } from 'react';
import { Download, FileText, BarChart3, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const ReportsModule = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('sales');

  const reportTypes = [
    { id: 'sales', name: 'Rapport de ventes', icon: TrendingUp },
    { id: 'stock', name: 'Rapport de stock', icon: BarChart3 },
    { id: 'purchases', name: 'Rapport d\'achats', icon: FileText },
    { id: 'clients', name: 'Rapport clients', icon: FileText },
  ];

  const periods = [
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'quarter', label: 'Ce trimestre' },
    { value: 'year', label: 'Cette année' },
    { value: 'custom', label: 'Période personnalisée' },
  ];

  const quickStats = [
    { title: 'Ventes totales', value: '€45,231', period: 'Ce mois', color: 'text-green-600' },
    { title: 'Produits vendus', value: '1,234', period: 'Ce mois', color: 'text-blue-600' },
    { title: 'Clients actifs', value: '342', period: 'Ce mois', color: 'text-purple-600' },
    { title: 'Marge brute', value: '32%', period: 'Ce mois', color: 'text-orange-600' },
  ];

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Rapports & Analyses</h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Calendar className="w-4 h-4 mr-2" />
            Programmer
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xs lg:text-sm font-medium text-gray-600 mb-2">{stat.title}</h3>
            <p className={`text-2xl lg:text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.period}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-6">Générateur de rapports</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de rapport</label>
            <Select value={selectedReport} onValueChange={setSelectedReport}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Période</label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger>
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
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button size="sm" className="w-full sm:w-auto">Générer le rapport</Button>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">Aperçu</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Rapports récents</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">Ventes - Janvier 2024</p>
                  <p className="text-xs text-gray-500">Généré le 15/01/2024</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="ml-2 flex-shrink-0">
                <Download className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <BarChart3 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">Stock - Janvier 2024</p>
                  <p className="text-xs text-gray-500">Généré le 14/01/2024</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="ml-2 flex-shrink-0">
                <Download className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <FileText className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">Clients - Décembre 2023</p>
                  <p className="text-xs text-gray-500">Généré le 31/12/2023</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="ml-2 flex-shrink-0">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Analyses automatiques</h3>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2 text-sm">📈 Croissance des ventes</h4>
              <p className="text-sm text-green-700">
                Vos ventes ont augmenté de 12% ce mois-ci par rapport au mois dernier.
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2 text-sm">⚠️ Stock faible</h4>
              <p className="text-sm text-yellow-700">
                4 produits nécessitent un réapprovisionnement urgent.
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2 text-sm">👥 Nouveaux clients</h4>
              <p className="text-sm text-blue-700">
                15 nouveaux clients ont été ajoutés cette semaine.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
